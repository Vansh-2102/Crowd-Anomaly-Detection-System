import React, { useEffect, useState, useCallback } from 'react';
import { Typography, Input, Select, Button, Skeleton, Empty, Alert, Space, Tag, Tooltip } from 'antd';
import { SearchOutlined, ReloadOutlined, VideoCameraOutlined, SyncOutlined } from '@ant-design/icons';
import { useAppDispatch } from '@/hooks/useAppDispatch';
import { useAppSelector } from '@/hooks/useAppSelector';
import { fetchCameras, updateCameraAnalysis } from '@/store/slices/cameraSlice';
import CameraCard from '@/components/monitoring/CameraCard';
import LiveCameraPreview from '@/components/monitoring/LiveCameraPreview';
import mlService from '@/services/mlService';
import { message } from 'antd';
import { Camera } from '@/types';

const { Title, Text } = Typography;
const { Option } = Select;

const LiveMonitoringPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { cameras, isLoading, error, total } = useAppSelector((state) => state.cameras);
  const [analyzingIds, setAnalyzingIds] = useState<Set<number>>(new Set());
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const load = useCallback(() => {
    dispatch(fetchCameras({ size: 100 }));
  }, [dispatch]);

  useEffect(() => { load(); }, [load]);

  const handleAnalyze = async (cameraId: number) => {
    setAnalyzingIds((prev) => new Set(prev).add(cameraId));
    try {
      const result = await mlService.analyzeCamera(cameraId);
      dispatch(updateCameraAnalysis({
        id: cameraId,
        data: {
          peopleCount: result.peopleCount,
          densityScore: result.densityScore,
          fightDetected: result.fightDetected,
          stampedeDetected: result.stampedeDetected,
          alertLevel: result.alertLevel,
          lastAnalyzedAt: result.timestamp,
          liveFrame: result.frame,
        },
      }));
      message.success(`Camera analyzed — Alert: ${result.alertLevel}`);
    } catch {
      message.error('Analysis failed. Check ML service connection.');
    } finally {
      setAnalyzingIds((prev) => {
        const next = new Set(prev);
        next.delete(cameraId);
        return next;
      });
    }
  };

  const filtered = (cameras || []).filter((cam: Camera) => {
    const matchesSearch = cam.name.toLowerCase().includes(search.toLowerCase()) ||
      cam.location.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || cam.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const activeCameras = (cameras || []).filter((c) => c.status === 'ACTIVE').length;

  return (
    <div className="page-container">
      {/* Live Camera Preview */}
      <LiveCameraPreview />

      {/* Header */}
      <div className="section-header">
        <div>
          <Title level={3} style={{ margin: 0, fontWeight: 800 }}>
            <span className="gradient-text">Live Monitoring</span>
          </Title>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 4 }}>
            <Text style={{ color: '#64748b', fontSize: 13 }}>{total} cameras total</Text>
            <Tag color="green" style={{ borderRadius: 20, fontSize: 11 }}>{activeCameras} Active</Tag>
            <div className="live-badge">
              <div className="live-dot" />
              LIVE
            </div>
          </div>
        </div>
        <Tooltip title="Refresh cameras">
          <Button
            icon={isLoading ? <SyncOutlined spin /> : <ReloadOutlined />}
            onClick={load}
            type="text"
            style={{ color: '#00d4ff', border: '1px solid rgba(0,212,255,0.2)', borderRadius: 10 }}
          >
            Refresh
          </Button>
        </Tooltip>
      </div>

      {/* Filters */}
      <Space style={{ marginBottom: 20, flexWrap: 'wrap' }}>
        <Input
          prefix={<SearchOutlined style={{ color: '#64748b' }} />}
          placeholder="Search cameras..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          allowClear
          style={{ width: 260, borderRadius: 10 }}
        />
        <Select
          value={statusFilter}
          onChange={setStatusFilter}
          style={{ width: 160, borderRadius: 10 }}
        >
          <Option value="ALL">All Statuses</Option>
          <Option value="ACTIVE">Active</Option>
          <Option value="INACTIVE">Inactive</Option>
          <Option value="ERROR">Error</Option>
          <Option value="MAINTENANCE">Maintenance</Option>
        </Select>
      </Space>

      {/* Error */}
      {error && <Alert type="error" title={error} showIcon style={{ marginBottom: 16, borderRadius: 10 }} />}

      {/* Camera Grid */}
      {isLoading ? (
        <div className="camera-grid">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="glass-card" style={{ borderRadius: 16, overflow: 'hidden' }}>
              <Skeleton.Image style={{ width: '100%', height: 180 }} active />
              <div style={{ padding: 16 }}>
                <Skeleton active paragraph={{ rows: 3 }} />
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <Empty
            image={<VideoCameraOutlined style={{ fontSize: 64, color: '#334155' }} />}
            description={
              <Text style={{ color: '#64748b' }}>
                {search || statusFilter !== 'ALL' ? 'No cameras match your filters' : 'No cameras configured yet'}
              </Text>
            }
          />
        </div>
      ) : (
        <div className="camera-grid">
          {filtered.map((camera) => (
            <CameraCard
              key={camera.id}
              camera={camera}
              onAnalyze={handleAnalyze}
              isAnalyzing={analyzingIds.has(camera.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default LiveMonitoringPage;
