import React from 'react';
import { Button, Typography } from 'antd';
import { useNavigate } from 'react-router-dom';
import { ReloadOutlined, HomeOutlined, WarningOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const ServerErrorPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0a0e1a 0%, #0f1629 50%, #1a0e35 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 20,
      textAlign: 'center', padding: 24,
    }}>
      <div style={{ width: 100, height: 100, borderRadius: 24, background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <WarningOutlined style={{ fontSize: 44, color: '#f59e0b' }} />
      </div>
      <div style={{ fontSize: 80, fontWeight: 900, lineHeight: 1, color: '#f59e0b', textShadow: '0 0 40px rgba(245,158,11,0.4)' }}>500</div>
      <Title level={2} style={{ color: '#e2e8f0', margin: 0 }}>Internal Server Error</Title>
      <Text style={{ color: '#64748b', fontSize: 15, maxWidth: 420, display: 'block' }}>
        Something went wrong on our end. Please try again or contact support if the issue persists.
      </Text>
      <div style={{ display: 'flex', gap: 12 }}>
        <Button
          icon={<ReloadOutlined />} onClick={() => window.location.reload()} size="large"
          style={{ borderRadius: 12, fontWeight: 700, height: 48, paddingInline: 28 }}
        >
          Retry
        </Button>
        <Button
          type="primary" icon={<HomeOutlined />} onClick={() => navigate('/dashboard')} size="large"
          style={{ background: 'linear-gradient(135deg, #00d4ff, #7c3aed)', border: 'none', borderRadius: 12, fontWeight: 700, height: 48, paddingInline: 28 }}
        >
          Dashboard
        </Button>
      </div>
    </div>
  );
};

export default ServerErrorPage;
