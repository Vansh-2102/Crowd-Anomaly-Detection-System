import React, { useState } from 'react';
import {
  Typography, Row, Col, Switch, Select, Button, Form, Input,
  Divider, message, Avatar, Tag, Space, Slider,
} from 'antd';
import {
  SunOutlined, MoonOutlined, GlobalOutlined, BellOutlined,
  LockOutlined, UserOutlined, SaveOutlined, CheckCircleOutlined,
} from '@ant-design/icons';
import { useTheme } from '@/hooks/useTheme';
import { useAuth } from '@/hooks/useAuth';
import userService from '@/services/userService';

const { Title, Text } = Typography;

const LANGUAGES = [
  { value: 'en', label: 'English' },
  { value: 'hi', label: 'Hindi' },
  { value: 'es', label: 'Spanish' },
  { value: 'fr', label: 'French' },
  { value: 'de', label: 'German' },
];

const COLORS = [
  { label: 'Cyan', value: '#00d4ff' },
  { label: 'Purple', value: '#7c3aed' },
  { label: 'Emerald', value: '#10b981' },
  { label: 'Amber', value: '#f59e0b' },
  { label: 'Rose', value: '#ef4444' },
  { label: 'Blue', value: '#3b82f6' },
];

const SettingsPage: React.FC = () => {
  const { mode, toggle, isDark, setColor, primaryColor } = useTheme();
  const { user } = useAuth();
  const [lang, setLang] = useState('en');
  const [notifications, setNotifications] = useState({ critical: true, high: true, medium: false, sound: true, push: false });
  const [changingPw, setChangingPw] = useState(false);
  const [pwForm] = Form.useForm();

  const handlePasswordChange = async (values: { currentPassword: string; newPassword: string }) => {
    setChangingPw(true);
    try {
      await userService.changePassword(values.currentPassword, values.newPassword);
      message.success('Password changed successfully');
      pwForm.resetFields();
    } catch {
      message.error('Failed to change password');
    } finally {
      setChangingPw(false);
    }
  };

  const sectionCard = (title: string, icon: React.ReactNode, children: React.ReactNode) => (
    <div className="glass-card animate-fadeInUp" style={{ padding: 24, borderRadius: 16, marginBottom: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(0,212,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#00d4ff', fontSize: 16 }}>
          {icon}
        </div>
        <Text style={{ fontWeight: 700, fontSize: 15 }}>{title}</Text>
      </div>
      {children}
    </div>
  );

  return (
    <div className="page-container">
      <div className="section-header" style={{ marginBottom: 24 }}>
        <div>
          <Title level={3} style={{ margin: 0, fontWeight: 800 }}><span className="gradient-text">Settings</span></Title>
          <Text style={{ color: '#64748b', fontSize: 13 }}>Customize your CADS experience</Text>
        </div>
      </div>

      <Row gutter={[16, 16]}>
        {/* Left Column */}
        <Col xs={24} xl={14}>
          {/* Profile */}
          {sectionCard('Profile', <UserOutlined />, (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
                <Avatar size={72} style={{ background: 'linear-gradient(135deg, #00d4ff, #7c3aed)', fontWeight: 700, fontSize: 24 }}>
                  {user?.firstName?.[0]}{user?.lastName?.[0]}
                </Avatar>
                <div>
                  <div style={{ fontSize: 18, fontWeight: 800 }}>{user?.firstName} {user?.lastName}</div>
                  <div style={{ color: '#64748b', fontSize: 13 }}>{user?.email}</div>
                  <Tag color={user?.role === 'ADMIN' ? 'purple' : 'blue'} style={{ borderRadius: 20, marginTop: 4 }}>{user?.role}</Tag>
                </div>
              </div>
              <Row gutter={16}>
                <Col span={12}>
                  <div style={{ fontSize: 12, color: '#64748b', marginBottom: 4 }}>Username</div>
                  <Text style={{ fontFamily: 'monospace' }}>@{user?.username}</Text>
                </Col>
                <Col span={12}>
                  <div style={{ fontSize: 12, color: '#64748b', marginBottom: 4 }}>Status</div>
                  <Space><CheckCircleOutlined style={{ color: '#10b981' }} /><Text style={{ color: '#10b981' }}>Active</Text></Space>
                </Col>
              </Row>
            </div>
          ))}

          {/* Change Password */}
          {sectionCard('Change Password', <LockOutlined />, (
            <Form form={pwForm} layout="vertical" onFinish={handlePasswordChange} size="middle">
              <Form.Item name="currentPassword" label={<span style={{ fontSize: 12, color: '#94a3b8' }}>Current Password</span>} rules={[{ required: true }]}>
                <Input.Password style={{ borderRadius: 10 }} />
              </Form.Item>
              <Form.Item name="newPassword" label={<span style={{ fontSize: 12, color: '#94a3b8' }}>New Password</span>} rules={[{ required: true, min: 6 }]}>
                <Input.Password style={{ borderRadius: 10 }} />
              </Form.Item>
              <Form.Item
                name="confirmPassword"
                dependencies={['newPassword']}
                label={<span style={{ fontSize: 12, color: '#94a3b8' }}>Confirm New Password</span>}
                rules={[{ required: true }, ({ getFieldValue }) => ({ validator(_, v) { return !v || getFieldValue('newPassword') === v ? Promise.resolve() : Promise.reject('Passwords do not match'); } })]}
              >
                <Input.Password style={{ borderRadius: 10 }} />
              </Form.Item>
              <Button type="primary" htmlType="submit" loading={changingPw} icon={<SaveOutlined />}
                style={{ background: 'linear-gradient(135deg, #00d4ff, #7c3aed)', border: 'none', borderRadius: 10, fontWeight: 600 }}>
                Update Password
              </Button>
            </Form>
          ))}
        </Col>

        {/* Right Column */}
        <Col xs={24} xl={10}>
          {/* Appearance */}
          {sectionCard('Appearance', <SunOutlined />, (
            <div>
              {/* Theme Toggle */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 13 }}>Dark Mode</div>
                  <div style={{ color: '#64748b', fontSize: 12 }}>Switch between dark and light theme</div>
                </div>
                <Switch
                  checked={isDark}
                  onChange={toggle}
                  checkedChildren={<MoonOutlined />}
                  unCheckedChildren={<SunOutlined />}
                />
              </div>

              <Divider style={{ borderColor: 'rgba(0,212,255,0.08)', margin: '12px 0' }} />

              {/* Primary Color */}
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 12 }}>Primary Color</div>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  {COLORS.map((c) => (
                    <div
                      key={c.value}
                      onClick={() => setColor(c.value)}
                      style={{
                        width: 32, height: 32, borderRadius: 8, background: c.value, cursor: 'pointer',
                        border: primaryColor === c.value ? '2px solid white' : '2px solid transparent',
                        transition: 'transform 0.2s', transform: primaryColor === c.value ? 'scale(1.15)' : 'scale(1)',
                        boxShadow: primaryColor === c.value ? `0 0 12px ${c.value}80` : 'none',
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
          ))}

          {/* Language */}
          {sectionCard('Language', <GlobalOutlined />, (
            <div>
              <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 8 }}>Display Language</div>
              <Select value={lang} onChange={setLang} style={{ width: '100%' }} options={LANGUAGES} />
              <div style={{ color: '#64748b', fontSize: 11, marginTop: 6 }}>
                Note: Language change requires restart
              </div>
            </div>
          ))}

          {/* Notifications */}
          {sectionCard('Notifications', <BellOutlined />, (
            <div>
              {[
                { key: 'critical', label: 'Critical Alerts', desc: 'Immediate notification for critical events', color: '#ef4444' },
                { key: 'high', label: 'High Alerts', desc: 'Notifications for high-severity events', color: '#f59e0b' },
                { key: 'medium', label: 'Medium Alerts', desc: 'Notifications for medium events', color: '#3b82f6' },
                { key: 'sound', label: 'Alert Sound', desc: 'Play sound on new alerts' },
                { key: 'push', label: 'Push Notifications', desc: 'Browser push notifications' },
              ].map((item, i) => (
                <div key={item.key}>
                  {i > 0 && <Divider style={{ borderColor: 'rgba(0,212,255,0.08)', margin: '10px 0' }} />}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 13 }}>
                        {item.color && <span style={{ color: item.color, marginRight: 4 }}>●</span>}
                        {item.label}
                      </div>
                      <div style={{ color: '#64748b', fontSize: 11 }}>{item.desc}</div>
                    </div>
                    <Switch
                      checked={notifications[item.key as keyof typeof notifications]}
                      onChange={(v) => setNotifications((prev) => ({ ...prev, [item.key]: v }))}
                      size="small"
                    />
                  </div>
                </div>
              ))}
            </div>
          ))}
        </Col>
      </Row>
    </div>
  );
};

export default SettingsPage;
