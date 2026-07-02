import React, { useEffect } from 'react';
import { Modal, Form, Input, Select, Button } from 'antd';
import { User } from '@/types';
import { CreateUserPayload, UpdateUserPayload } from '@/services/userService';

interface UserFormModalProps {
  open: boolean;
  user?: User | null;
  onClose: () => void;
  onSubmit: (data: CreateUserPayload | UpdateUserPayload) => Promise<void>;
  isLoading?: boolean;
}

const UserFormModal: React.FC<UserFormModalProps> = ({ open, user, onClose, onSubmit, isLoading }) => {
  const [form] = Form.useForm();
  const isEdit = !!user;

  useEffect(() => {
    if (open) {
      if (user) {
        form.setFieldsValue({ email: user.email, firstName: user.firstName, lastName: user.lastName, role: user.role, status: user.status });
      } else {
        form.resetFields();
        form.setFieldsValue({ role: 'OPERATOR', status: 'ACTIVE' });
      }
    }
  }, [open, user, form]);

  const handleFinish = async (values: CreateUserPayload) => {
    await onSubmit(values);
  };

  return (
    <Modal
      open={open}
      title={<span style={{ fontWeight: 700 }}>{isEdit ? 'Edit User' : 'Add User'}</span>}
      onCancel={onClose}
      footer={null}
      width={520}
      destroyOnHidden
    >
      <Form form={form} layout="vertical" onFinish={handleFinish} size="large" style={{ marginTop: 16 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
          <Form.Item name="firstName" label={<span style={{ fontSize: 12, color: '#94a3b8' }}>First Name</span>} rules={[{ required: true }]}>
            <Input placeholder="First name" style={{ borderRadius: 10 }} />
          </Form.Item>
          <Form.Item name="lastName" label={<span style={{ fontSize: 12, color: '#94a3b8' }}>Last Name</span>} rules={[{ required: true }]}>
            <Input placeholder="Last name" style={{ borderRadius: 10 }} />
          </Form.Item>
        </div>

        {!isEdit && (
          <Form.Item name="username" label={<span style={{ fontSize: 12, color: '#94a3b8' }}>Username</span>} rules={[{ required: true }]}>
            <Input placeholder="username" style={{ borderRadius: 10 }} />
          </Form.Item>
        )}

        <Form.Item name="email" label={<span style={{ fontSize: 12, color: '#94a3b8' }}>Email</span>} rules={[{ required: true, type: 'email' }]}>
          <Input placeholder="user@example.com" style={{ borderRadius: 10 }} />
        </Form.Item>

        {!isEdit && (
          <Form.Item name="password" label={<span style={{ fontSize: 12, color: '#94a3b8' }}>Password</span>} rules={[{ required: true, min: 6 }]}>
            <Input.Password placeholder="••••••••" style={{ borderRadius: 10 }} />
          </Form.Item>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
          <Form.Item name="role" label={<span style={{ fontSize: 12, color: '#94a3b8' }}>Role</span>} rules={[{ required: true }]}>
            <Select style={{ borderRadius: 10 }}>
              <Select.Option value="ADMIN">Admin</Select.Option>
              <Select.Option value="OPERATOR">Operator</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="status" label={<span style={{ fontSize: 12, color: '#94a3b8' }}>Status</span>}>
            <Select style={{ borderRadius: 10 }}>
              <Select.Option value="ACTIVE">Active</Select.Option>
              <Select.Option value="INACTIVE">Inactive</Select.Option>
              <Select.Option value="SUSPENDED">Suspended</Select.Option>
            </Select>
          </Form.Item>
        </div>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 8 }}>
          <Button onClick={onClose} style={{ borderRadius: 10 }}>Cancel</Button>
          <Button type="primary" htmlType="submit" loading={isLoading}
            style={{ background: 'linear-gradient(135deg, #00d4ff, #7c3aed)', border: 'none', borderRadius: 10, fontWeight: 600 }}>
            {isEdit ? 'Update User' : 'Create User'}
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

export default UserFormModal;
