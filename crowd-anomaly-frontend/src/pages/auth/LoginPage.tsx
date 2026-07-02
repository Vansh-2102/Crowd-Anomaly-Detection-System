import React, { useEffect } from 'react';
import { Form, Input, Button, Checkbox, Alert, Typography, Space } from 'antd';
import { UserOutlined, LockOutlined, RadarChartOutlined, EyeInvisibleOutlined, EyeTwoTone } from '@ant-design/icons';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

const { Title, Text } = Typography;

const LoginPage: React.FC = () => {
  const { login, isLoading, error, isAuthenticated, clearAuthError } = useAuth();

  useEffect(() => {
    clearAuthError();
  }, [clearAuthError]);

  if (isAuthenticated) return <Navigate to="/dashboard" replace />;

  const onFinish = (values: { username: string; password: string }) => {
    login({ username: values.username, password: values.password });
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0a0e1a 0%, #0f1629 50%, #1a0e35 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background orbs */}
      <div style={{ position: 'absolute', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,212,255,0.06) 0%, transparent 70%)', top: '-100px', left: '-100px', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(124,58,237,0.06) 0%, transparent 70%)', bottom: '-80px', right: '-80px', pointerEvents: 'none' }} />

      {/* Grid pattern */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        backgroundImage: 'linear-gradient(rgba(0,212,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,212,255,0.03) 1px, transparent 1px)',
        backgroundSize: '40px 40px',
      }} />

      <div
        className="glass-card animate-fadeInScale"
        style={{
          width: '100%',
          maxWidth: 440,
          padding: '48px 40px',
          position: 'relative',
          zIndex: 1,
        }}
      >
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{
            width: 64, height: 64, borderRadius: 18,
            background: 'linear-gradient(135deg, #00d4ff, #7c3aed)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px',
            boxShadow: '0 0 30px rgba(0,212,255,0.4)',
          }}>
            <RadarChartOutlined style={{ color: '#fff', fontSize: 30 }} />
          </div>
          <Title level={2} style={{ margin: 0, background: 'linear-gradient(135deg, #00d4ff, #7c3aed)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Welcome Back
          </Title>
          <Text style={{ color: '#64748b', fontSize: 14, marginTop: 6, display: 'block' }}>
            Crowd Anomaly Detection System
          </Text>
        </div>

        {error && (
          <Alert
            type="error"
            title={error}
            showIcon
            closable
            style={{ marginBottom: 20, borderRadius: 8 }}
          />
        )}

        <Form
          name="login"
          onFinish={onFinish}
          layout="vertical"
          size="large"
          autoComplete="off"
        >
          <Form.Item
            name="username"
            rules={[{ required: true, message: 'Please enter your username' }]}
          >
            <Input
              prefix={<UserOutlined style={{ color: '#64748b' }} />}
              placeholder="Username"
              style={{ borderRadius: 10, height: 48 }}
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: 'Please enter your password' }]}
          >
            <Input.Password
              prefix={<LockOutlined style={{ color: '#64748b' }} />}
              placeholder="Password"
              style={{ borderRadius: 10, height: 48 }}
              iconRender={(visible) => visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />}
            />
          </Form.Item>

          <Form.Item>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Form.Item name="remember" valuePropName="checked" noStyle>
                <Checkbox style={{ color: '#94a3b8' }}>Remember me</Checkbox>
              </Form.Item>
              <Link to="/forgot-password" style={{ color: '#00d4ff', fontSize: 13 }}>
                Forgot password?
              </Link>
            </div>
          </Form.Item>

          <Form.Item style={{ marginBottom: 16 }}>
            <Button
              type="primary"
              htmlType="submit"
              loading={isLoading}
              block
              style={{
                height: 48,
                borderRadius: 10,
                background: 'linear-gradient(135deg, #00d4ff, #7c3aed)',
                border: 'none',
                fontWeight: 700,
                fontSize: 15,
                letterSpacing: 0.5,
              }}
            >
              {isLoading ? 'Signing In...' : 'Sign In'}
            </Button>
          </Form.Item>
        </Form>

        <div style={{ textAlign: 'center' }}>
          <Space>
            <Text style={{ color: '#64748b' }}>Don't have an account?</Text>
            <Link to="/register" style={{ color: '#00d4ff', fontWeight: 600 }}>Register</Link>
          </Space>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
