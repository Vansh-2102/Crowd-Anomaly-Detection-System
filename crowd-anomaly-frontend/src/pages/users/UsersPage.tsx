import React, { useEffect, useCallback, useState } from 'react';
import {
  Typography, Button, Input, Select, Table, Space, Tag, Avatar,
  Popconfirm, Tooltip, message, Alert, Badge,
} from 'antd';
import {
  PlusOutlined, SearchOutlined, EditOutlined, DeleteOutlined,
  UserOutlined, SyncOutlined, ReloadOutlined, CrownOutlined,
} from '@ant-design/icons';
import { useAppDispatch } from '@/hooks/useAppDispatch';
import { useAppSelector } from '@/hooks/useAppSelector';
import { fetchUsers, createUser, updateUser, deleteUser, setSelectedUser } from '@/store/slices/userSlice';
import UserFormModal from '@/components/users/UserFormModal';
import { User, UserStatus } from '@/types';
import { formatDateTime, fromNow } from '@/utils/formatters';
import { CreateUserPayload, UpdateUserPayload } from '@/services/userService';
import type { ColumnsType } from 'antd/es/table';
import type { TablePaginationConfig } from 'antd/es/table';

const { Title, Text } = Typography;
const { Option } = Select;

const statusColors: Record<UserStatus, string> = { ACTIVE: '#52c41a', INACTIVE: '#8c8c8c', SUSPENDED: '#ff4d4f' };

const UsersPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const userState = useAppSelector((state) => state.users || { users: [], selectedUser: null, total: 0, isLoading: false, error: null });
  const { users, selectedUser, total, isLoading, error } = userState;

  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });

  const load = useCallback(() => {
    dispatch(fetchUsers({ page: pagination.current - 1, size: pagination.pageSize, search: search || undefined }));
  }, [dispatch, pagination, search]);

  useEffect(() => { load(); }, [load]);

  const handleAdd = () => { dispatch(setSelectedUser(null)); setModalOpen(true); };
  const handleEdit = (user: User) => { dispatch(setSelectedUser(user)); setModalOpen(true); };
  const handleClose = () => { setModalOpen(false); dispatch(setSelectedUser(null)); };

  const handleSubmit = async (data: CreateUserPayload | UpdateUserPayload) => {
    setSubmitting(true);
    try {
      if (selectedUser) {
        await dispatch(updateUser({ id: selectedUser.id, data: data as UpdateUserPayload })).unwrap();
        message.success('User updated successfully');
      } else {
        await dispatch(createUser(data as CreateUserPayload)).unwrap();
        message.success('User created successfully');
      }
      handleClose();
    } catch (err: unknown) {
      message.error((err as string) || 'Operation failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await dispatch(deleteUser(id)).unwrap();
      message.success('User deleted');
    } catch { message.error('Failed to delete user'); }
  };

  const handleTableChange = (pag: TablePaginationConfig) => {
    setPagination({ current: pag.current || 1, pageSize: pag.pageSize || 10 });
  };

  const filtered = users.filter((u) => {
    const matchRole = roleFilter === 'ALL' || u.role === roleFilter;
    const matchStatus = statusFilter === 'ALL' || u.status === statusFilter;
    return matchRole && matchStatus;
  });

  const columns: ColumnsType<User> = [
    {
      title: 'User',
      render: (_, r) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Avatar style={{ background: 'linear-gradient(135deg, #00d4ff, #7c3aed)', fontWeight: 700, fontSize: 13 }}>
            {r.firstName[0]}{r.lastName[0]}
          </Avatar>
          <div>
            <div style={{ fontWeight: 700, fontSize: 13 }}>{r.firstName} {r.lastName}</div>
            <div style={{ color: '#64748b', fontSize: 11 }}>@{r.username}</div>
          </div>
        </div>
      ),
    },
    { title: 'Email', dataIndex: 'email', ellipsis: true, render: (v) => <Text style={{ fontSize: 12, color: '#94a3b8' }}>{v}</Text> },
    {
      title: 'Role', dataIndex: 'role', width: 110,
      render: (role) => (
        <Tag
          icon={role === 'ADMIN' ? <CrownOutlined /> : <UserOutlined />}
          color={role === 'ADMIN' ? 'purple' : 'blue'}
          style={{ borderRadius: 20, fontSize: 11 }}
        >
          {role}
        </Tag>
      ),
    },
    {
      title: 'Status', dataIndex: 'status', width: 110,
      render: (status: UserStatus) => (
        <Badge color={statusColors[status]} text={
          <span style={{ color: statusColors[status], fontSize: 11, fontWeight: 600 }}>{status}</span>
        } />
      ),
    },
    { title: 'Last Login', dataIndex: 'lastLogin', width: 140, render: (ts) => <Text style={{ fontSize: 11, color: '#64748b' }}>{ts ? fromNow(ts) : 'Never'}</Text> },
    { title: 'Created', dataIndex: 'createdAt', width: 140, render: (ts) => <Text style={{ fontSize: 11, color: '#64748b' }}>{ts ? formatDateTime(ts) : '—'}</Text> },
    {
      title: 'Actions', width: 80,
      render: (_, record) => (
        <Space>
          <Tooltip title="Edit"><Button type="text" size="small" icon={<EditOutlined />} onClick={() => handleEdit(record)} style={{ color: '#00d4ff' }} /></Tooltip>
          <Popconfirm title="Delete this user?" onConfirm={() => handleDelete(record.id)} okText="Delete" okType="danger">
            <Tooltip title="Delete"><Button type="text" size="small" icon={<DeleteOutlined />} danger /></Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="page-container">
      <div className="section-header">
        <div>
          <Title level={3} style={{ margin: 0, fontWeight: 800 }}><span className="gradient-text">User Management</span></Title>
          <Text style={{ color: '#64748b', fontSize: 13 }}>{total} users registered</Text>
        </div>
        <Space>
          <Tooltip title="Refresh"><Button icon={isLoading ? <SyncOutlined spin /> : <ReloadOutlined />} onClick={load} type="text" style={{ color: '#00d4ff', border: '1px solid rgba(0,212,255,0.2)', borderRadius: 10 }} /></Tooltip>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}
            style={{ background: 'linear-gradient(135deg, #00d4ff, #7c3aed)', border: 'none', borderRadius: 10, fontWeight: 600 }}>
            Add User
          </Button>
        </Space>
      </div>

      <Space style={{ marginBottom: 16, flexWrap: 'wrap' }}>
        <Input prefix={<SearchOutlined style={{ color: '#64748b' }} />} placeholder="Search users..." value={search}
          onChange={(e) => setSearch(e.target.value)} allowClear style={{ width: 240, borderRadius: 10 }} />
        <Select value={roleFilter} onChange={setRoleFilter} style={{ width: 140 }}>
          <Option value="ALL">All Roles</Option>
          <Option value="ADMIN">Admin</Option>
          <Option value="OPERATOR">Operator</Option>
        </Select>
        <Select value={statusFilter} onChange={setStatusFilter} style={{ width: 150 }}>
          <Option value="ALL">All Statuses</Option>
          <Option value="ACTIVE">Active</Option>
          <Option value="INACTIVE">Inactive</Option>
          <Option value="SUSPENDED">Suspended</Option>
        </Select>
      </Space>

      {error && <Alert type="error" title={error} showIcon style={{ marginBottom: 16, borderRadius: 10 }} />}

      <div className="glass-card" style={{ borderRadius: 16, overflow: 'hidden' }}>
        <Table
          dataSource={filtered} columns={columns} rowKey="id" loading={isLoading}
          pagination={{ current: pagination.current, pageSize: pagination.pageSize, total, showSizeChanger: true, showTotal: (t) => `${t} users` }}
          onChange={handleTableChange}
          locale={{ emptyText: <div style={{ textAlign: 'center', padding: '48px 0', color: '#64748b' }}><UserOutlined style={{ fontSize: 40, display: 'block', margin: '0 auto 8px' }} />No users found</div> }}
          scroll={{ x: true }}
        />
      </div>

      <UserFormModal open={modalOpen} user={selectedUser} onClose={handleClose} onSubmit={handleSubmit} isLoading={submitting} />
    </div>
  );
};

export default UsersPage;
