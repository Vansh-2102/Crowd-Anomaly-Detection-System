import React from 'react';
import { Button, Typography } from 'antd';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftOutlined, LockOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const ForbiddenPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0a0e1a 0%, #0f1629 50%, #1a0e35 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 20,
      textAlign: 'center', padding: 24,
    }}>
      <div style={{ width: 100, height: 100, borderRadius: 24, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <LockOutlined style={{ fontSize: 44, color: '#ef4444' }} />
      </div>
      <div style={{ fontSize: 80, fontWeight: 900, lineHeight: 1, color: '#ef4444', textShadow: '0 0 40px rgba(239,68,68,0.4)' }}>403</div>
      <Title level={2} style={{ color: '#e2e8f0', margin: 0 }}>Access Forbidden</Title>
      <Text style={{ color: '#64748b', fontSize: 15, maxWidth: 400, display: 'block' }}>
        You don't have permission to access this page. Contact your administrator.
      </Text>
      <Button
        type="primary" icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)} size="large"
        style={{ background: 'rgba(239,68,68,0.2)', border: '1px solid rgba(239,68,68,0.4)', borderRadius: 12, fontWeight: 700, height: 48, paddingInline: 32, color: '#ef4444' }}
      >
        Go Back
      </Button>
    </div>
  );
};

export default ForbiddenPage;
