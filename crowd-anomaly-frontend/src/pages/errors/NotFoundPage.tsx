import React from 'react';
import { Button, Typography } from 'antd';
import { useNavigate } from 'react-router-dom';
import { HomeOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0a0e1a 0%, #0f1629 50%, #1a0e35 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 20,
      textAlign: 'center', padding: 24,
    }}>
      <div style={{ fontSize: 120, fontWeight: 900, lineHeight: 1, background: 'linear-gradient(135deg, #00d4ff, #7c3aed)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
        404
      </div>
      <Title level={2} style={{ color: '#e2e8f0', margin: 0 }}>Page Not Found</Title>
      <Text style={{ color: '#64748b', fontSize: 15, maxWidth: 400, display: 'block' }}>
        The page you're looking for doesn't exist or has been moved.
      </Text>
      <Button
        type="primary" icon={<HomeOutlined />} onClick={() => navigate('/dashboard')} size="large"
        style={{ background: 'linear-gradient(135deg, #00d4ff, #7c3aed)', border: 'none', borderRadius: 12, fontWeight: 700, height: 48, paddingInline: 32 }}
      >
        Back to Dashboard
      </Button>
    </div>
  );
};

export default NotFoundPage;
