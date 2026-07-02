import React from 'react';
import { Drawer, Descriptions, Tag, Badge, Image, Divider, Button, Space, Typography } from 'antd';
import {
  AlertOutlined, UserOutlined, CameraOutlined,
  ClockCircleOutlined, CheckCircleOutlined, EnvironmentOutlined,
} from '@ant-design/icons';
import { Incident } from '@/types';
import { getAlertColor, generateMockSnapshotUrl } from '@/utils/helpers';
import { formatDateTime, formatDensity } from '@/utils/formatters';

const { Title, Text } = Typography;

interface IncidentDrawerProps {
  incident: Incident | null;
  open: boolean;
  onClose: () => void;
}

const IncidentDrawer: React.FC<IncidentDrawerProps> = ({ incident, open, onClose }) => {
  if (!incident) return null;
  const alertColor = getAlertColor(incident.alertLevel);
  const snapshotUrl = incident.snapshotUrl || generateMockSnapshotUrl(incident.cameraId);

  return (
    <Drawer
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <AlertOutlined style={{ color: alertColor }} />
          <span>Incident #{incident.id}</span>
          <Tag color={alertColor} style={{ borderRadius: 20, fontSize: 11, border: `1px solid ${alertColor}50` }}>
            {incident.alertLevel}
          </Tag>
        </div>
      }
      placement="right"
      width={480}
      open={open}
      onClose={onClose}
      footer={
        <div style={{ textAlign: 'right' }}>
          <Button onClick={onClose} style={{ borderRadius: 10 }}>Close</Button>
        </div>
      }
    >
      {/* Snapshot */}
      <div style={{ marginBottom: 20, borderRadius: 12, overflow: 'hidden', border: '1px solid rgba(0,212,255,0.12)' }}>
        <Image
          src={snapshotUrl}
          alt="Incident snapshot"
          style={{ width: '100%', maxHeight: 220, objectFit: 'cover' }}
          preview={{ mask: 'View Full' }}
        />
      </div>

      {/* Camera Info */}
      <div style={{ marginBottom: 16 }}>
        <Text style={{ color: '#64748b', fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.5 }}>Camera</Text>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6 }}>
          <CameraOutlined style={{ color: '#00d4ff' }} />
          <div>
            <div style={{ fontWeight: 700, fontSize: 14 }}>{incident.cameraName}</div>
            <div style={{ color: '#64748b', fontSize: 12 }}><EnvironmentOutlined /> {incident.cameraLocation}</div>
          </div>
        </div>
      </div>

      <Divider style={{ borderColor: 'rgba(0,212,255,0.08)', margin: '12px 0' }} />

      {/* Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
        <div style={{ background: 'rgba(0,212,255,0.05)', borderRadius: 10, padding: 12 }}>
          <div style={{ fontSize: 11, color: '#64748b', marginBottom: 4 }}><UserOutlined /> People Count</div>
          <div style={{ fontSize: 24, fontWeight: 800, color: '#00d4ff' }}>{incident.peopleCount}</div>
        </div>
        <div style={{ background: 'rgba(124,58,237,0.05)', borderRadius: 10, padding: 12 }}>
          <div style={{ fontSize: 11, color: '#64748b', marginBottom: 4 }}>Density Score</div>
          <div style={{ fontSize: 24, fontWeight: 800, color: '#7c3aed' }}>{formatDensity(incident.densityScore)}</div>
        </div>
      </div>

      {/* Detections */}
      <Descriptions column={1} size="small" style={{ marginBottom: 16 }}
        labelStyle={{ color: '#64748b', fontSize: 12 }}
        contentStyle={{ fontSize: 12 }}
      >
        <Descriptions.Item label="Fight Detected">
          <Badge status={incident.fightDetected ? 'error' : 'success'} text={incident.fightDetected ? 'YES' : 'NO'} />
        </Descriptions.Item>
        <Descriptions.Item label="Stampede Detected">
          <Badge status={incident.stampedeDetected ? 'error' : 'success'} text={incident.stampedeDetected ? 'YES' : 'NO'} />
        </Descriptions.Item>
        <Descriptions.Item label="Alert Level">
          <Tag color={alertColor} style={{ borderRadius: 20 }}>{incident.alertLevel}</Tag>
        </Descriptions.Item>
        <Descriptions.Item label="Status">
          {incident.isResolved
            ? <Space><CheckCircleOutlined style={{ color: '#10b981' }} /><span style={{ color: '#10b981' }}>Resolved</span></Space>
            : <Badge status="processing" text="Active" />
          }
        </Descriptions.Item>
      </Descriptions>

      <Divider style={{ borderColor: 'rgba(0,212,255,0.08)', margin: '12px 0' }} />

      {/* Timestamps */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
          <span style={{ color: '#64748b' }}><ClockCircleOutlined /> Detected</span>
          <span>{formatDateTime(incident.timestamp)}</span>
        </div>
        {incident.resolvedAt && (
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
            <span style={{ color: '#64748b' }}><CheckCircleOutlined /> Resolved</span>
            <span>{formatDateTime(incident.resolvedAt)}</span>
          </div>
        )}
      </div>

      {incident.description && (
        <>
          <Divider style={{ borderColor: 'rgba(0,212,255,0.08)', margin: '12px 0' }} />
          <div>
            <Text style={{ fontSize: 12, color: '#64748b', display: 'block', marginBottom: 6 }}>Notes</Text>
            <Text style={{ fontSize: 13 }}>{incident.description}</Text>
          </div>
        </>
      )}
    </Drawer>
  );
};

export default IncidentDrawer;
