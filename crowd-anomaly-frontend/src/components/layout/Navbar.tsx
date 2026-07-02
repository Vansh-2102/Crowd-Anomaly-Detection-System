import React from 'react';
import { Layout, Button, Badge, Avatar, Dropdown, Space, Tooltip, Tag } from 'antd';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  BellOutlined,
  SunOutlined,
  MoonOutlined,
  UserOutlined,
  LogoutOutlined,
  SettingOutlined,
  WifiOutlined,
  DisconnectOutlined,
} from '@ant-design/icons';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';
import { useAppSelector } from '@/hooks/useAppSelector';
import { markAllRead } from '@/store/slices/alertSlice';
import { useAppDispatch } from '@/hooks/useAppDispatch';
import { useNavigate } from 'react-router-dom';
import { formatDateTime } from '@/utils/formatters';
import { getAlertColor } from '@/utils/helpers';

const { Header } = Layout;

interface NavbarProps {
  collapsed: boolean;
  onCollapse: (val: boolean) => void;
}

const Navbar: React.FC<NavbarProps> = ({ collapsed, onCollapse }) => {
  const { user, logout } = useAuth();
  const { mode, toggle } = useTheme();
  const { alerts, unreadCount, connected } = useAppSelector((state) => state.alerts);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const alertMenuItems = [
    {
      key: 'header',
      label: (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 0' }}>
          <span style={{ fontWeight: 700, fontSize: 14 }}>Alerts ({unreadCount} unread)</span>
          <Button type="link" size="small" onClick={() => dispatch(markAllRead())}>Mark all read</Button>
        </div>
      ),
      disabled: true,
    },
    ...alerts.slice(0, 6).map((alert) => ({
      key: alert.id,
      label: (
        <div style={{ width: 280, padding: '4px 0', borderLeft: `3px solid ${getAlertColor(alert.alertLevel)}`, paddingLeft: 8 }}>
          <div style={{ fontWeight: 600, fontSize: 12, color: getAlertColor(alert.alertLevel) }}>
            [{alert.alertLevel}] {alert.cameraName}
          </div>
          <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>{alert.message}</div>
          <div style={{ fontSize: 10, color: '#64748b', marginTop: 2 }}>{formatDateTime(alert.timestamp)}</div>
        </div>
      ),
    })),
    ...(alerts.length === 0
      ? [{ key: 'empty', label: <div style={{ textAlign: 'center', padding: '12px 0', color: '#64748b' }}>No alerts yet</div>, disabled: true }]
      : []),
  ];

  const userMenuItems = [
    { key: 'profile', icon: <UserOutlined />, label: 'Profile' },
    { key: 'settings', icon: <SettingOutlined />, label: 'Settings' },
    { type: 'divider' as const },
    { key: 'logout', icon: <LogoutOutlined />, label: 'Logout', danger: true },
  ];

  const handleUserMenu = ({ key }: { key: string }) => {
    if (key === 'logout') logout();
    else if (key === 'settings') navigate('/settings');
  };

  return (
    <Header
      className="app-navbar"
      style={{
        position: 'fixed',
        top: 0,
        right: 0,
        left: collapsed ? 80 : 240,
        zIndex: 99,
        height: 64,
        padding: '0 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        transition: 'left 0.25s cubic-bezier(0.4,0,0.2,1)',
        background: 'rgba(10,14,26,0.92)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(0,212,255,0.1)',
      }}
    >
      {/* Left: Collapse Toggle */}
      <Button
        type="text"
        icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
        onClick={() => onCollapse(!collapsed)}
        style={{ fontSize: 18, color: '#94a3b8', width: 36, height: 36 }}
      />

      {/* Right: Actions */}
      <Space size={8} align="center">
        {/* WS Status */}
        <Tooltip title={connected ? 'WebSocket Connected' : 'WebSocket Disconnected'}>
          <Tag
            icon={connected ? <WifiOutlined /> : <DisconnectOutlined />}
            color={connected ? 'green' : 'red'}
            style={{ borderRadius: 20, cursor: 'default', fontSize: 11 }}
          >
            {connected ? 'LIVE' : 'OFFLINE'}
          </Tag>
        </Tooltip>

        {/* Theme Toggle */}
        <Tooltip title={mode === 'dark' ? 'Switch to Light' : 'Switch to Dark'}>
          <Button
            type="text"
            icon={mode === 'dark' ? <SunOutlined /> : <MoonOutlined />}
            onClick={toggle}
            style={{ color: '#94a3b8', width: 36, height: 36 }}
          />
        </Tooltip>

        {/* Alerts Bell */}
        <Dropdown
          menu={{ items: alertMenuItems }}
          trigger={['click']}
          overlayInnerStyle={{ width: 320 }}
        >
          <Badge count={unreadCount} overflowCount={99} size="small">
            <Button
              type="text"
              icon={<BellOutlined />}
              style={{ color: '#94a3b8', width: 36, height: 36 }}
            />
          </Badge>
        </Dropdown>

        {/* User Avatar */}
        <Dropdown menu={{ items: userMenuItems, onClick: handleUserMenu }} trigger={['click']}>
          <Space style={{ cursor: 'pointer', gap: 8 }}>
            <Avatar
              style={{
                background: 'linear-gradient(135deg, #00d4ff, #7c3aed)',
                fontWeight: 700,
                fontSize: 13,
              }}
            >
              {user?.firstName?.[0]?.toUpperCase()}{user?.lastName?.[0]?.toUpperCase()}
            </Avatar>
            <div style={{ lineHeight: 1.3, display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: '#e2e8f0' }}>
                {user?.firstName} {user?.lastName}
              </span>
              <span style={{ fontSize: 10, color: '#64748b' }}>{user?.role}</span>
            </div>
          </Space>
        </Dropdown>
      </Space>
    </Header>
  );
};

export default Navbar;
