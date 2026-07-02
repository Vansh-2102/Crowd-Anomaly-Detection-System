import React, { useEffect, useCallback } from 'react';
import { Row, Col, Card, Button, Tooltip, Typography, Skeleton, Empty } from 'antd';
import {
  VideoCameraOutlined, CheckCircleOutlined, AlertOutlined,
  FireOutlined, FileTextOutlined, CalendarOutlined,
  ReloadOutlined, SyncOutlined,
} from '@ant-design/icons';
import { useAppDispatch } from '@/hooks/useAppDispatch';
import { useAppSelector } from '@/hooks/useAppSelector';
import { fetchDashboard } from '@/store/slices/dashboardSlice';
import StatCard from '@/components/dashboard/StatCard';
import RecentIncidentsTable from '@/components/dashboard/RecentIncidentsTable';
import RecentAlerts from '@/components/dashboard/RecentAlerts';
import IncidentTrendsChart from '@/components/charts/IncidentTrendsChart';
import AlertDistributionChart from '@/components/charts/AlertDistributionChart';
import CrowdDensityChart from '@/components/charts/CrowdDensityChart';
import CameraStatusChart from '@/components/charts/CameraStatusChart';
import { fromNow } from '@/utils/formatters';

const { Title, Text } = Typography;

// ---- Mock Data (used when backend isn't ready) ----
const MOCK_DASHBOARD = {
  stats: { totalCameras: 24, activeCameras: 18, activeAlerts: 7, criticalAlerts: 2, totalIncidents: 1248, todayIncidents: 14 },
  incidentTrends: Array.from({ length: 7 }, (_, i) => ({
    date: `Jun ${22 + i}`, count: Math.floor(Math.random() * 30 + 5),
    critical: Math.floor(Math.random() * 5), high: Math.floor(Math.random() * 8),
    medium: Math.floor(Math.random() * 10), low: Math.floor(Math.random() * 10),
  })),
  alertDistribution: [
    { level: 'LOW' as const, count: 45 }, { level: 'MEDIUM' as const, count: 28 },
    { level: 'HIGH' as const, count: 16 }, { level: 'CRITICAL' as const, count: 11 },
  ],
  crowdDensity: Array.from({ length: 12 }, (_, i) => ({
    hour: `${(i * 2).toString().padStart(2, '0')}:00`,
    avgDensity: Math.random() * 0.6 + 0.1,
    maxDensity: Math.random() * 0.4 + 0.5,
  })),
  cameraStatus: [
    { status: 'ACTIVE' as const, count: 18 }, { status: 'INACTIVE' as const, count: 4 },
    { status: 'ERROR' as const, count: 1 }, { status: 'MAINTENANCE' as const, count: 1 },
  ],
  recentIncidents: [],
  recentAlerts: [],
};

const DashboardPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { data, isLoading, lastUpdated } = useAppSelector((state) => state.dashboard);

  const load = useCallback(() => { dispatch(fetchDashboard()); }, [dispatch]);

  useEffect(() => { load(); }, [load]);

  // Use real data if available, else mock
  const dashboard = data || MOCK_DASHBOARD;
  const { stats } = dashboard;

  const statCards = [
    { title: 'Total Cameras', value: stats.totalCameras, icon: <VideoCameraOutlined />, color: '#00d4ff' },
    { title: 'Active Cameras', value: stats.activeCameras, icon: <CheckCircleOutlined />, color: '#10b981' },
    { title: 'Active Alerts', value: stats.activeAlerts, icon: <AlertOutlined />, color: '#f59e0b' },
    { title: 'Critical Alerts', value: stats.criticalAlerts, icon: <FireOutlined />, color: '#ef4444' },
    { title: 'Total Incidents', value: stats.totalIncidents, icon: <FileTextOutlined />, color: '#7c3aed' },
    { title: "Today's Incidents", value: stats.todayIncidents, icon: <CalendarOutlined />, color: '#3b82f6' },
  ];

  return (
    <div className="page-container">
      {/* Header */}
      <div className="section-header" style={{ marginBottom: 24 }}>
        <div>
          <Title level={3} style={{ margin: 0, fontWeight: 800 }}>
            <span className="gradient-text">Dashboard</span>
          </Title>
          <Text style={{ color: '#64748b', fontSize: 13 }}>
            {lastUpdated ? `Last updated ${fromNow(lastUpdated)}` : 'Real-time surveillance overview'}
          </Text>
        </div>
        <Tooltip title="Refresh">
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

      {/* Stat Cards */}
      <div className="stat-grid" style={{ marginBottom: 24 }}>
        {isLoading
          ? Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="glass-card" style={{ padding: 20, borderRadius: 16 }}>
                <Skeleton active paragraph={{ rows: 1 }} />
              </div>
            ))
          : statCards.map((card, i) => (
              <StatCard key={card.title} {...card} index={i} isLoading={false} />
            ))}
      </div>

      {/* Charts Row 1 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} xl={14}>
          <div className="glass-card animate-fadeInUp delay-2" style={{ padding: 20, borderRadius: 16 }}>
            <div style={{ marginBottom: 12, display: 'flex', justifyContent: 'space-between' }}>
              <Text style={{ fontWeight: 700, fontSize: 14 }}>Incident Trends (7 Days)</Text>
            </div>
            {isLoading
              ? <Skeleton active paragraph={{ rows: 5 }} />
              : dashboard.incidentTrends.length > 0
                ? <IncidentTrendsChart data={dashboard.incidentTrends} />
                : <Empty description="No data" style={{ padding: '40px 0' }} />
            }
          </div>
        </Col>
        <Col xs={24} xl={10}>
          <div className="glass-card animate-fadeInUp delay-3" style={{ padding: 20, borderRadius: 16 }}>
            <div style={{ marginBottom: 12 }}>
              <Text style={{ fontWeight: 700, fontSize: 14 }}>Alert Distribution</Text>
            </div>
            {isLoading
              ? <Skeleton active paragraph={{ rows: 5 }} />
              : <AlertDistributionChart data={dashboard.alertDistribution} />
            }
          </div>
        </Col>
      </Row>

      {/* Charts Row 2 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} xl={14}>
          <div className="glass-card animate-fadeInUp delay-3" style={{ padding: 20, borderRadius: 16 }}>
            <div style={{ marginBottom: 12 }}>
              <Text style={{ fontWeight: 700, fontSize: 14 }}>Crowd Density Statistics</Text>
            </div>
            {isLoading
              ? <Skeleton active paragraph={{ rows: 5 }} />
              : <CrowdDensityChart data={dashboard.crowdDensity} />
            }
          </div>
        </Col>
        <Col xs={24} xl={10}>
          <div className="glass-card animate-fadeInUp delay-4" style={{ padding: 20, borderRadius: 16 }}>
            <div style={{ marginBottom: 12 }}>
              <Text style={{ fontWeight: 700, fontSize: 14 }}>Camera Status</Text>
            </div>
            {isLoading
              ? <Skeleton active paragraph={{ rows: 5 }} />
              : <CameraStatusChart data={dashboard.cameraStatus} />
            }
          </div>
        </Col>
      </Row>

      {/* Bottom: Recent Incidents + Recent Alerts */}
      <Row gutter={[16, 16]}>
        <Col xs={24} xl={14}>
          <div className="glass-card animate-fadeInUp delay-4" style={{ padding: 20, borderRadius: 16 }}>
            <div style={{ marginBottom: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={{ fontWeight: 700, fontSize: 14 }}>Recent Incidents</Text>
            </div>
            {isLoading
              ? <Skeleton active paragraph={{ rows: 4 }} />
              : <RecentIncidentsTable data={dashboard.recentIncidents} isLoading={false} />
            }
          </div>
        </Col>
        <Col xs={24} xl={10}>
          <div className="glass-card animate-fadeInUp delay-5" style={{ padding: 20, borderRadius: 16 }}>
            <div style={{ marginBottom: 12 }}>
              <Text style={{ fontWeight: 700, fontSize: 14 }}>Recent Alerts</Text>
            </div>
            {isLoading
              ? <Skeleton active paragraph={{ rows: 4 }} />
              : <RecentAlerts data={dashboard.recentAlerts} />
            }
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default DashboardPage;
