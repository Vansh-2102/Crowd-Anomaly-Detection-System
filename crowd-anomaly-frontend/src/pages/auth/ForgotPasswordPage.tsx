import React, { useState } from 'react';
import { Form, Input, Button, Alert, Typography, Space, Result } from 'antd';
import { MailOutlined, RadarChartOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import authService from '@/services/authService';

const { Title, Text } = Typography;

const ForgotPasswordPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const onFinish = async ({ email }: { email: string }) => {
    setIsLoading(true);
    setError(null);
    try {
      await authService.forgotPassword(email);
      setSent(true);
    } catch {
      setError('Failed to send reset email. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const authBg: React.CSSProperties = {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #0a0e1a 0%, #0f1629 50%, #1a0e35 100%)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    position: 'relative', overflow: 'hidden',
  };

  return (
    <div style={authBg}>
      <div className="glass-card animate-fadeInScale" style={{ width: '100%', maxWidth: 420, padding: '48px 40px', position: 'relative', zIndex: 1 }}>
        {sent ? (
          <Result
            status="success"
            title={<span style={{ color: '#00d4ff' }}>Email Sent!</span>}
            subTitle="Check your inbox for the password reset link."
            extra={<Link to="/login"><Button type="primary">Back to Login</Button></Link>}
          />
        ) : (
          <>
            <div style={{ textAlign: 'center', marginBottom: 32 }}>
              <div style={{ width: 56, height: 56, borderRadius: 16, background: 'linear-gradient(135deg, #00d4ff, #7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px', boxShadow: '0 0 24px rgba(0,212,255,0.4)' }}>
                <RadarChartOutlined style={{ color: '#fff', fontSize: 26 }} />
              </div>
              <Title level={2} style={{ margin: 0, background: 'linear-gradient(135deg, #00d4ff, #7c3aed)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                Forgot Password
              </Title>
              <Text style={{ color: '#64748b', fontSize: 13 }}>Enter your email to receive a reset link</Text>
            </div>

            {error && <Alert type="error" title={error} showIcon closable style={{ marginBottom: 18, borderRadius: 8 }} />}

            <Form name="forgot-password" onFinish={onFinish} layout="vertical" size="large">
              <Form.Item name="email" rules={[{ required: true, type: 'email', message: 'Valid email required' }]}>
                <Input prefix={<MailOutlined style={{ color: '#64748b' }} />} placeholder="your@email.com" style={{ borderRadius: 10, height: 48 }} />
              </Form.Item>
              <Form.Item style={{ marginBottom: 16 }}>
                <Button type="primary" htmlType="submit" loading={isLoading} block
                  style={{ height: 48, borderRadius: 10, background: 'linear-gradient(135deg, #00d4ff, #7c3aed)', border: 'none', fontWeight: 700 }}>
                  {isLoading ? 'Sending...' : 'Send Reset Link'}
                </Button>
              </Form.Item>
            </Form>

            <div style={{ textAlign: 'center' }}>
              <Space>
                <ArrowLeftOutlined style={{ color: '#64748b' }} />
                <Link to="/login" style={{ color: '#00d4ff' }}>Back to Login</Link>
              </Space>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
