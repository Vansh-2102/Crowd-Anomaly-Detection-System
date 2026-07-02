import React from 'react';
import { Layout, Menu } from 'antd';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  DashboardOutlined,
  VideoCameraOutlined,
  AlertOutlined,
  LineChartOutlined,
  UserOutlined,
  SettingOutlined,
  EyeOutlined,
  PoweroffOutlined,
  RadarChartOutlined,
} from '@ant-design/icons';
import { useAuth } from '@/hooks/useAuth';

const { Sider } = Layout;

interface SidebarProps {
  collapsed: boolean;
  onCollapse: (val: boolean) => void;
}

const menuItems = [
  { key: '/dashboard', icon: <DashboardOutlined />, label: 'Dashboard' },
  { key: '/monitoring', icon: <EyeOutlined />, label: 'Live Monitoring' },
  { key: '/cameras', icon: <VideoCameraOutlined />, label: 'Cameras' },
  { key: '/incidents', icon: <AlertOutlined />, label: 'Incidents' },
  { key: '/analytics', icon: <LineChartOutlined />, label: 'Analytics' },
];

const adminItems = [
  { key: '/users', icon: <UserOutlined />, label: 'Users' },
];

const bottomItems = [
  { key: '/settings', icon: <SettingOutlined />, label: 'Settings' },
];

const Sidebar: React.FC<SidebarProps> = ({ collapsed, onCollapse }) => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { logout, isAdmin } = useAuth();

  const allItems = [
    ...menuItems,
    ...(isAdmin ? adminItems : []),
    ...bottomItems,
    { key: '__logout__', icon: <PoweroffOutlined />, label: 'Logout', danger: true },
  ];

  const handleMenuClick = ({ key }: { key: string }) => {
    if (key === '__logout__') {
      logout();
    } else {
      navigate(key);
    }
  };

  return (
    <Sider
      collapsible
      collapsed={collapsed}
      onCollapse={onCollapse}
      trigger={null}
      width={240}
      className="app-sidebar"
      style={{
        height: '100vh',
        position: 'fixed',
        left: 0,
        top: 0,
        bottom: 0,
        zIndex: 100,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        background: 'linear-gradient(180deg, #0a0e1a 0%, #0f1629 100%)',
        borderRight: '1px solid rgba(0,212,255,0.12)',
      }}
    >
      {/* Logo */}
      <div
        style={{
          height: 64,
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'flex-start',
          padding: collapsed ? '0' : '0 20px',
          borderBottom: '1px solid rgba(0,212,255,0.12)',
          gap: 10,
          flexShrink: 0,
          transition: 'all 0.25s ease',
        }}
      >
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            background: 'linear-gradient(135deg, #00d4ff, #7c3aed)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            boxShadow: '0 0 20px rgba(0,212,255,0.4)',
          }}
        >
          <RadarChartOutlined style={{ color: '#fff', fontSize: 18 }} />
        </div>
        {!collapsed && (
          <div style={{ lineHeight: 1.2, overflow: 'hidden' }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#00d4ff', whiteSpace: 'nowrap', letterSpacing: 0.5 }}>
              CADS
            </div>
            <div style={{ fontSize: 10, color: '#64748b', whiteSpace: 'nowrap' }}>
              Anomaly Detection
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div style={{ flex: 1, overflow: 'hidden auto', paddingTop: 8 }}>
        <Menu
          mode="inline"
          theme="dark"
          selectedKeys={[pathname]}
          onClick={handleMenuClick}
          items={allItems}
          inlineCollapsed={collapsed}
          style={{
            background: 'transparent',
            border: 'none',
            padding: '0 8px',
          }}
        />
      </div>

      {/* Version badge */}
      {!collapsed && (
        <div
          style={{
            padding: '12px 20px',
            borderTop: '1px solid rgba(0,212,255,0.08)',
            fontSize: 11,
            color: '#334155',
            textAlign: 'center',
          }}
        >
          v1.0.0 — AI Surveillance
        </div>
      )}
    </Sider>
  );
};

export default Sidebar;
