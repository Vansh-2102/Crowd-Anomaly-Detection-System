import React, { useEffect, useRef, useState } from 'react';
import { Card, Alert as AntAlert, Button, Space, Typography, notification, Radio } from 'antd';
import { VideoCameraOutlined, StopOutlined, PlayCircleOutlined, CameraOutlined, DesktopOutlined } from '@ant-design/icons';
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
  const [streamSource, setStreamSource] = useState<'webcam' | 'server'>('webcam');
  const [alertData, setAlertData] = useState<AlertData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const eventSourceRef = useRef<EventSource | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastAlertTime = useRef<number>(0);
  const isProcessingFrame = useRef<boolean>(false);

  const handleAlertDispatch = (data: AlertData) => {
    const now = Date.now();
    const alertLevel = data.alert_level as Alert['alertLevel'];

    if (now - lastAlertTime.current > 5000) {
      const newAlert: Alert = {
        id: `${data.camera_id}-${now}`,
        incidentId: 0,
        cameraName: data.camera_id,
        cameraLocation: streamSource === 'webcam' ? 'Laptop Camera' : 'Simulation Feed',
        alertLevel: alertLevel,
        message: `People: ${data.people_count} | Density: ${data.density_score} | Fight: ${data.fight_detected ? 'Yes' : 'No'} | Stampede: ${data.stampede ? 'Yes' : 'No'}`,
        fightDetected: data.fight_detected,
        stampedeDetected: data.stampede,
        peopleCount: data.people_count,
        timestamp: data.timestamp,
        read: false,
      };
      dispatch(addAlert(newAlert));

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
  };

  const startWebcamStream = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 480 } },
      });
      mediaStreamRef.current = stream;

      if (!videoRef.current) {
        const video = document.createElement('video');
        video.srcObject = stream;
        video.playsInline = true;
        video.muted = true;
        await video.play();
        videoRef.current = video;
      } else {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      const canvas = document.createElement('canvas');
      canvas.width = 640;
      canvas.height = 480;
      const ctx = canvas.getContext('2d');

      intervalRef.current = setInterval(async () => {
        if (!videoRef.current || isProcessingFrame.current || videoRef.current.readyState < 2) {
          return;
        }

        try {
          isProcessingFrame.current = true;
          ctx?.drawImage(videoRef.current, 0, 0, 640, 480);
          const base64Data = canvas.toDataURL('image/jpeg', 0.7);

          const response = await fetch('http://localhost:8000/analyze-frame', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              frame: base64Data,
              camera_id: 'laptop_webcam_01',
            }),
          });

          if (!response.ok) {
            throw new Error(`ML server returned ${response.status}`);
          }

          const data: AlertData = await response.json();
          setAlertData(data);
          handleAlertDispatch(data);
        } catch (err: any) {
          console.error('Frame analysis error:', err);
          setError('Failed to analyze frame: ' + (err.message || 'Network error'));
        } finally {
          isProcessingFrame.current = false;
        }
      }, 300);
    } catch (err: any) {
      console.error('Webcam access error:', err);
      setError('Cannot access laptop webcam. Please grant browser camera permissions or switch to ML Server Feed.');
      stopStream();
    }
  };

  const startServerStream = () => {
    try {
      const eventSource = new EventSource('http://localhost:8000/stream-camera');
      eventSourceRef.current = eventSource;

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.error) {
            setError(data.error);
            stopStream();
            return;
          }
          setAlertData(data);
          handleAlertDispatch(data);
        } catch (e) {
          console.error('Failed to parse SSE data:', e);
        }
      };

      eventSource.onerror = () => {
        console.error('SSE connection error');
        setError('Connection to ML server stream lost.');
        stopStream();
      };
    } catch (e: any) {
      console.error('Failed to start SSE:', e);
      setError('Failed to start camera stream: ' + e.message);
      stopStream();
    }
  };

  const startStream = () => {
    setError(null);
    setIsStreaming(true);

    if (streamSource === 'webcam') {
      startWebcamStream();
    } else {
      startServerStream();
    }
  };

  const stopStream = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
      videoRef.current = null;
    }

    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }

    setIsStreaming(false);
  };

  useEffect(() => {
    return () => {
      stopStream();
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

      <Space style={{ marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
        <Button
          type="primary"
          icon={isStreaming ? <StopOutlined /> : <PlayCircleOutlined />}
          onClick={isStreaming ? stopStream : startStream}
          style={{ background: 'linear-gradient(135deg, #00d4ff, #7c3aed)', border: 'none', borderRadius: 10, fontWeight: 600 }}
        >
          {isStreaming ? 'Stop Stream' : 'Start Stream'}
        </Button>

        <Radio.Group
          value={streamSource}
          onChange={(e) => {
            if (isStreaming) stopStream();
            setStreamSource(e.target.value);
          }}
          disabled={isStreaming}
          buttonStyle="solid"
        >
          <Radio.Button value="webcam">
            <CameraOutlined style={{ marginRight: 6 }} /> My Laptop Webcam
          </Radio.Button>
          <Radio.Button value="server">
            <DesktopOutlined style={{ marginRight: 6 }} /> ML Server Feed
          </Radio.Button>
        </Radio.Group>
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
