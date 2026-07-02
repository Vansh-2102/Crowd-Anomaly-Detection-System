import React, { useState } from 'react';
import { Button, Tag, Tooltip, Progress, Badge, Spin, Image } from 'antd';
import {
  VideoCameraOutlined, EnvironmentOutlined, RadarChartOutlined,
  ExclamationCircleOutlined, UserOutlined,
} from '@ant-design/icons';
import { Camera } from '@/types';
import { getAlertColor, getCameraStatusColor, getDensityColor, generateMockSnapshotUrl } from '@/utils/helpers';
import { formatDensity, fromNow } from '@/utils/formatters';

interface CameraCardProps {
  camera: Camera;
  onAnalyze: (cameraId: number) => Promise<void>;
  isAnalyzing: boolean;
}

const CameraCard: React.FC<CameraCardProps> = ({ camera, onAnalyze, isAnalyzing }) => {
  const [imgError, setImgError] = useState(false);
  const statusColor = getCameraStatusColor(camera.status);
  const alertColor = camera.alertLevel ? getAlertColor(camera.alertLevel) : '#52c41a';
  const densityColor = camera.densityScore !== undefined ? getDensityColor(camera.densityScore) : '#52c41a';
  const snapshotUrl = camera.liveFrame || camera.snapshotUrl || generateMockSnapshotUrl(camera.id);

  return (
    <div
      className="glass-card camera-card animate-fadeInUp"
      style={{
        borderRadius: 16, overflow: 'hidden',
        border: `1px solid ${camera.alertLevel === 'CRITICAL' ? 'rgba(255,77,79,0.4)' : 'rgba(0,212,255,0.12)'}`,
        transition: 'all 0.25s ease',
      }}
    >
      {/* Snapshot */}
      <div style={{ position: 'relative', background: '#0a0e1a', aspectRatio: '16/9' }}>
        {!imgError ? (
          <Image
            src={snapshotUrl}
            alt={camera.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            preview={false}
            onError={() => setImgError(true)}
            placeholder={<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 180, background: '#0f1629' }}><VideoCameraOutlined style={{ fontSize: 40, color: '#334155' }} /></div>}
          />
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 180, background: '#0f1629' }}>
            <VideoCameraOutlined style={{ fontSize: 40, color: '#334155' }} />
          </div>
        )}

        {/* Status Badge */}
        <div style={{ position: 'absolute', top: 10, left: 10 }}>
          <Badge
            color={statusColor}
            text={<span style={{ color: statusColor, fontSize: 11, fontWeight: 600, background: 'rgba(0,0,0,0.7)', padding: '2px 8px', borderRadius: 20, backdropFilter: 'blur(8px)' }}>{camera.status}</span>}
          />
        </div>

        {/* Alert Level */}
        {camera.alertLevel && (
          <div style={{ position: 'absolute', top: 10, right: 10 }}>
            <Tag color={alertColor} style={{ border: `1px solid ${alertColor}50`, fontSize: 10, fontWeight: 700, borderRadius: 20 }}>
              {camera.alertLevel}
            </Tag>
          </div>
        )}

        {/* Live indicator for active cameras */}
        {camera.status === 'ACTIVE' && (
          <div style={{ position: 'absolute', bottom: 10, right: 10 }}>
            <div className="live-badge">
              <div className="live-dot" />
              LIVE
            </div>
          </div>
        )}
      </div>

      {/* Info */}
      <div style={{ padding: '14px 16px' }}>
        <div style={{ marginBottom: 10 }}>
          <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 2 }}>{camera.name}</div>
          <div style={{ color: '#64748b', fontSize: 12, display: 'flex', alignItems: 'center', gap: 4 }}>
            <EnvironmentOutlined />
            {camera.location}
          </div>
        </div>

        {/* Metrics */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12 }}>
          <div style={{ background: 'rgba(0,212,255,0.05)', borderRadius: 10, padding: '8px 10px' }}>
            <div style={{ fontSize: 10, color: '#64748b', marginBottom: 3 }}><UserOutlined /> People Count</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: '#00d4ff' }}>{camera.peopleCount ?? '—'}</div>
          </div>
          <div style={{ background: 'rgba(124,58,237,0.05)', borderRadius: 10, padding: '8px 10px' }}>
            <div style={{ fontSize: 10, color: '#64748b', marginBottom: 3 }}>Density</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: densityColor }}>
              {camera.densityScore !== undefined ? formatDensity(camera.densityScore) : '—'}
            </div>
          </div>
        </div>

        {/* Density Progress */}
        {camera.densityScore !== undefined && (
          <div style={{ marginBottom: 10 }}>
            <Progress
              percent={Math.round(camera.densityScore * 100)}
              showInfo={false}
              strokeColor={densityColor}
              railColor="rgba(255,255,255,0.06)"
              size="small"
              strokeLinecap="round"
            />
          </div>
        )}

        {/* Detection Tags */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
          <Tag
            icon={<ExclamationCircleOutlined />}
            color={camera.fightDetected ? 'red' : 'default'}
            style={{ fontSize: 10, borderRadius: 20 }}
          >
            {camera.fightDetected ? 'Fight Detected' : 'No Fight'}
          </Tag>
          <Tag
            icon={<ExclamationCircleOutlined />}
            color={camera.stampedeDetected ? 'orange' : 'default'}
            style={{ fontSize: 10, borderRadius: 20 }}
          >
            {camera.stampedeDetected ? 'Stampede!' : 'No Stampede'}
          </Tag>
        </div>

        {/* Last analyzed */}
        {camera.lastAnalyzedAt && (
          <div style={{ fontSize: 11, color: '#334155', marginBottom: 10 }}>
            Last analyzed: {fromNow(camera.lastAnalyzedAt)}
          </div>
        )}

        {/* Analyze Button */}
        <Tooltip title={camera.status !== 'ACTIVE' ? 'Camera is not active' : 'Run AI analysis'}>
          <Button
            type="primary"
            icon={isAnalyzing ? <Spin size="small" /> : <RadarChartOutlined />}
            onClick={() => onAnalyze(camera.id)}
            loading={isAnalyzing}
            disabled={camera.status !== 'ACTIVE'}
            block
            style={{
              background: isAnalyzing ? undefined : 'linear-gradient(135deg, #00d4ff, #7c3aed)',
              border: 'none',
              borderRadius: 10,
              fontWeight: 600,
              height: 38,
            }}
          >
            {isAnalyzing ? 'Analyzing...' : 'Analyze Camera'}
          </Button>
        </Tooltip>
      </div>
    </div>
  );
};

export default CameraCard;
