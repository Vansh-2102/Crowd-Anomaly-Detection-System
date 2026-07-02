import React, { useEffect, useRef, useState } from 'react';
import { Card, Alert as AntAlert, Button, Space, Typography, notification } from 'antd';
import { VideoCameraOutlined, StopOutlined, PlayCircleOutlined } from '@ant-design/icons';
import { useAppDispatch } from '@/hooks/useAppDispatch';
import { addAlert } from '@/store/slices/alertSlice';
import { getAlertColor } from '@/utils/helpers';
import { Alert } from '@/types';

const { Title, Text } = Typography;

interface AlertData {
  alert_level: string;
  people_count: number;
  density_score: number;
  stampede: boolean;
  fight_detected: boolean;
  frame: string;
  timestamp: string;
  camera_id: string;
}

const LiveCameraPreview: React.FC = () => {
  const dispatch = useAppDispatch();
  const [isStreaming, setIsStreaming] = useState(false);
  const [alertData, setAlertData] = useState<AlertData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);
  const lastAlertTime = useRef<number>(0); // To prevent duplicate alerts

  const startStream = () => {
    setError(null);
    setIsStreaming(true);

    try {
      const eventSource = new EventSource('http://localhost:8000/stream-camera');
      eventSourceRef.current = eventSource;

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.error) {
            setError(data.error);
            setIsStreaming(false);
            return;
          }
          setAlertData(data);

          // Create alert object and dispatch to store
          const now = Date.now();
          const alertLevel = data.alert_level as Alert['alertLevel'];
          
          // Dispatch alert every 5 seconds to avoid spamming
          if (now - lastAlertTime.current > 5000) {
            const newAlert: Alert = {
              id: `${data.camera_id}-${now}`,
              incidentId: 0, // We can generate an incident ID later if needed
              cameraName: data.camera_id,
              cameraLocation: 'Live Camera',
              alertLevel: alertLevel,
              message: `People: ${data.people_count} | Density: ${data.density_score} | Fight: ${data.fight_detected ? 'Yes' : 'No'} | Stampede: ${data.stampede ? 'Yes' : 'No'}`,
              fightDetected: data.fight_detected,
              stampedeDetected: data.stampede,
              peopleCount: data.people_count,
              timestamp: data.timestamp,
              read: false,
            };
            dispatch(addAlert(newAlert));

            // Show notification for critical/danger/warning
            if (alertLevel === 'CRITICAL' || alertLevel === 'DANGER' || alertLevel === 'WARNING') {
              const notifyType = alertLevel === 'CRITICAL' ? 'error' : alertLevel === 'DANGER' ? 'warning' : 'info';
              notification[notifyType]({
                message: `🚨 ${alertLevel} Alert`,
                description: newAlert.message,
                duration: alertLevel === 'CRITICAL' ? 8 : 5,
                style: { borderLeft: `4px solid ${getAlertColor(alertLevel)}` },
              });
            }

            lastAlertTime.current = now;
          }
        } catch (e) {
          console.error('Failed to parse SSE data:', e);
        }
      };

      eventSource.onerror = () => {
        console.error('SSE connection error');
        setError('Connection to ML service lost.');
        setIsStreaming(false);
        eventSource.close();
      };
    } catch (e) {
      console.error('Failed to start SSE:', e);
      setError('Failed to start camera stream.');
      setIsStreaming(false);
    }
  };

  const stopStream = () => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    setIsStreaming(false);
  };

  useEffect(() => {
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, []);

  return (
    <Card
      className="glass-card"
      style={{ borderRadius: 16, marginBottom: 24 }}
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <VideoCameraOutlined style={{ fontSize: 24, color: '#00d4ff' }} />
          <Title level={4} style={{ margin: 0 }}>Live Camera Preview</Title>
          {isStreaming && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginLeft: 'auto' }}>
              <div className="live-dot" />
              <Text style={{ fontSize: 12, fontWeight: 600, color: '#52c41a' }}>LIVE</Text>
            </div>
          )}
        </div>
      }
    >
      {error && <AntAlert type="error" message={error} showIcon style={{ marginBottom: 16 }} />}

      <Space style={{ marginBottom: 16 }}>
        <Button
          type="primary"
          icon={isStreaming ? <StopOutlined /> : <PlayCircleOutlined />}
          onClick={isStreaming ? stopStream : startStream}
          style={{ background: 'linear-gradient(135deg, #00d4ff, #7c3aed)', border: 'none', borderRadius: 10, fontWeight: 600 }}
        >
          {isStreaming ? 'Stop Stream' : 'Start Stream'}
        </Button>
      </Space>

      {alertData && (
        <div style={{ marginTop: 16 }}>
          <div style={{ position: 'relative', background: '#0a0e1a', borderRadius: 12, overflow: 'hidden', aspectRatio: '16/9' }}>
            <img
              src={alertData.frame}
              alt="Live Camera"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
            <div style={{ position: 'absolute', top: 12, right: 12, background: 'rgba(0,0,0,0.7)', padding: '8px 16px', borderRadius: 20 }}>
              <Text strong style={{ color: getAlertColor(alertData.alert_level as Alert['alertLevel']) }}>
                {alertData.alert_level}
              </Text>
            </div>
          </div>

          <div style={{ marginTop: 16, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
            <div style={{ background: 'rgba(0,212,255,0.05)', padding: 12, borderRadius: 10, textAlign: 'center' }}>
              <Text style={{ color: '#64748b', fontSize: 12 }}>People Count</Text>
              <div style={{ fontSize: 24, fontWeight: 700, color: '#00d4ff', marginTop: 4 }}>
                {alertData.people_count}
              </div>
            </div>

            <div style={{ background: 'rgba(124,58,237,0.05)', padding: 12, borderRadius: 10, textAlign: 'center' }}>
              <Text style={{ color: '#64748b', fontSize: 12 }}>Density Score</Text>
              <div style={{ fontSize: 24, fontWeight: 700, color: '#7c3aed', marginTop: 4 }}>
                {alertData.density_score}
              </div>
            </div>

            <div style={{ background: 'rgba(255,77,79,0.05)', padding: 12, borderRadius: 10, textAlign: 'center' }}>
              <Text style={{ color: '#64748b', fontSize: 12 }}>Fight</Text>
              <div style={{ fontSize: 24, fontWeight: 700, color: alertData.fight_detected ? '#ff4d4f' : '#52c41a', marginTop: 4 }}>
                {alertData.fight_detected ? 'Yes' : 'No'}
              </div>
            </div>

            <div style={{ background: 'rgba(255,193,7,0.05)', padding: 12, borderRadius: 10, textAlign: 'center' }}>
              <Text style={{ color: '#64748b', fontSize: 12 }}>Stampede</Text>
              <div style={{ fontSize: 24, fontWeight: 700, color: alertData.stampede ? '#ffc107' : '#52c41a', marginTop: 4 }}>
                {alertData.stampede ? 'Yes' : 'No'}
              </div>
            </div>
          </div>
        </div>
      )}

      {!alertData && !error && (
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <VideoCameraOutlined style={{ fontSize: 64, color: '#334155', marginBottom: 16 }} />
          <Text style={{ color: '#64748b' }}>
            Click "Start Stream" to see the live camera feed from your laptop!
          </Text>
        </div>
      )}
    </Card>
  );
};

export default LiveCameraPreview;
