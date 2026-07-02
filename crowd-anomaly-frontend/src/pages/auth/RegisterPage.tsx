import React, { useEffect } from 'react';
import { Form, Input, Button, Alert, Typography, Space, Select } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined, RadarChartOutlined } from '@ant-design/icons';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

const { Title, Text } = Typography;

const RegisterPage: React.FC = () => {
  const { register, isLoading, error, isAuthenticated, clearAuthError } = useAuth();

  useEffect(() => { clearAuthError(); }, [clearAuthError]);

  if (isAuthenticated) return <Navigate to="/dashboard" replace />;

  const onFinish = (values: {
    username: string; email: string; password: string;
    firstName: string; lastName: string; role: 'ADMIN' | 'OPERATOR';
  }) => {
    register(values);
  };

  const authBg: React.CSSProperties = {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #0a0e1a 0%, #0f1629 50%, #1a0e35 100%)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    position: 'relative', overflow: 'hidden',
  };

  return (
    <div style={authBg}>
      <div style={{ position: 'absolute', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,212,255,0.06) 0%, transparent 70%)', top: '-100px', right: '-100px', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(124,58,237,0.06) 0%, transparent 70%)', bottom: '-80px', left: '-80px', pointerEvents: 'none' }} />

      <div className="glass-card animate-fadeInScale" style={{ width: '100%', maxWidth: 480, padding: '48px 40px', position: 'relative', zIndex: 1 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ width: 56, height: 56, borderRadius: 16, background: 'linear-gradient(135deg, #00d4ff, #7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px', boxShadow: '0 0 24px rgba(0,212,255,0.4)' }}>
            <RadarChartOutlined style={{ color: '#fff', fontSize: 26 }} />
          </div>
          <Title level={2} style={{ margin: 0, background: 'linear-gradient(135deg, #00d4ff, #7c3aed)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Create Account
          </Title>
          <Text style={{ color: '#64748b', fontSize: 13 }}>Join the CADS Platform</Text>
        </div>

        {error && <Alert type="error" title={error} showIcon closable style={{ marginBottom: 18, borderRadius: 8 }} />}

        <Form name="register" onFinish={onFinish} layout="vertical" size="large">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
            <Form.Item name="firstName" rules={[{ required: true, message: 'Required' }]} label={<span style={{ color: '#94a3b8', fontSize: 12 }}>First Name</span>}>
              <Input placeholder="First name" style={{ borderRadius: 10, height: 44 }} />
            </Form.Item>
            <Form.Item name="lastName" rules={[{ required: true, message: 'Required' }]} label={<span style={{ color: '#94a3b8', fontSize: 12 }}>Last Name</span>}>
              <Input placeholder="Last name" style={{ borderRadius: 10, height: 44 }} />
            </Form.Item>
          </div>

          <Form.Item name="username" rules={[{ required: true, message: 'Please enter username' }, { min: 3, message: 'Min 3 characters' }]} label={<span style={{ color: '#94a3b8', fontSize: 12 }}>Username</span>}>
            <Input prefix={<UserOutlined style={{ color: '#64748b' }} />} placeholder="Username" style={{ borderRadius: 10, height: 44 }} />
          </Form.Item>

          <Form.Item name="email" rules={[{ required: true, type: 'email', message: 'Valid email required' }]} label={<span style={{ color: '#94a3b8', fontSize: 12 }}>Email</span>}>
            <Input prefix={<MailOutlined style={{ color: '#64748b' }} />} placeholder="email@example.com" style={{ borderRadius: 10, height: 44 }} />
          </Form.Item>

          <Form.Item name="role" label={<span style={{ color: '#94a3b8', fontSize: 12 }}>Role</span>} initialValue="OPERATOR">
            <Select style={{ borderRadius: 10, height: 44 }} options={[{ value: 'OPERATOR', label: 'Operator' }, { value: 'ADMIN', label: 'Admin' }]} />
          </Form.Item>

          <Form.Item name="password" rules={[{ required: true, message: 'Password required' }, { min: 6, message: 'Min 6 characters' }]} label={<span style={{ color: '#94a3b8', fontSize: 12 }}>Password</span>}>
            <Input.Password prefix={<LockOutlined style={{ color: '#64748b' }} />} placeholder="••••••••" style={{ borderRadius: 10, height: 44 }} />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            dependencies={['password']}
            rules={[
              { required: true, message: 'Please confirm password' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) return Promise.resolve();
                  return Promise.reject(new Error('Passwords do not match'));
                },
              }),
            ]}
            label={<span style={{ color: '#94a3b8', fontSize: 12 }}>Confirm Password</span>}
          >
            <Input.Password prefix={<LockOutlined style={{ color: '#64748b' }} />} placeholder="••••••••" style={{ borderRadius: 10, height: 44 }} />
          </Form.Item>

          <Form.Item style={{ marginBottom: 16 }}>
            <Button
              type="primary" htmlType="submit" loading={isLoading} block
              style={{ height: 48, borderRadius: 10, background: 'linear-gradient(135deg, #00d4ff, #7c3aed)', border: 'none', fontWeight: 700, fontSize: 15 }}
            >
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </Button>
          </Form.Item>
        </Form>

        <div style={{ textAlign: 'center' }}>
          <Space>
            <Text style={{ color: '#64748b' }}>Already have an account?</Text>
            <Link to="/login" style={{ color: '#00d4ff', fontWeight: 600 }}>Sign In</Link>
          </Space>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
