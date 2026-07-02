import React, { useEffect, useState, useCallback } from 'react';
import {
  Typography, Button, Input, Select, Table, Space, Tag, Badge,
  Popconfirm, Tooltip, message, Alert,
} from 'antd';
import {
  PlusOutlined, SearchOutlined, EditOutlined, DeleteOutlined,
  VideoCameraOutlined, SyncOutlined, ReloadOutlined,
} from '@ant-design/icons';
import { useAppDispatch } from '@/hooks/useAppDispatch';
import { useAppSelector } from '@/hooks/useAppSelector';
import { fetchCameras, createCamera, updateCamera, deleteCamera, setSelectedCamera } from '@/store/slices/cameraSlice';
import CameraFormModal from '@/components/cameras/CameraFormModal';
import { Camera, CameraFormData } from '@/types';
import { getCameraStatusColor } from '@/utils/helpers';
import { formatDateTime } from '@/utils/formatters';
import type { ColumnsType } from 'antd/es/table';
import type { TablePaginationConfig } from 'antd/es/table';

const { Title, Text } = Typography;
const { Option } = Select;

const CameraManagementPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { cameras, selectedCamera, total, isLoading, error } = useAppSelector((state) => state.cameras);
  const { user } = useAppSelector((state) => state.auth);
  const isAdmin = user?.role === 'ADMIN';

  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });

  const load = useCallback(() => {
    dispatch(fetchCameras({
      page: pagination.current - 1,
      size: pagination.pageSize,
      search: search || undefined,
    }));
  }, [dispatch, pagination, search]);

  useEffect(() => { load(); }, [load]);

  const handleAdd = () => { dispatch(setSelectedCamera(null)); setModalOpen(true); };
  const handleEdit = (camera: Camera) => { dispatch(setSelectedCamera(camera)); setModalOpen(true); };
  const handleClose = () => { setModalOpen(false); dispatch(setSelectedCamera(null)); };

  const handleSubmit = async (data: CameraFormData) => {
    setSubmitting(true);
    try {
      if (selectedCamera) {
        await dispatch(updateCamera({ id: selectedCamera.id, data })).unwrap();
        message.success('Camera updated successfully');
      } else {
        await dispatch(createCamera(data)).unwrap();
        message.success('Camera added successfully');
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
      await dispatch(deleteCamera(id)).unwrap();
      message.success('Camera deleted');
    } catch {
      message.error('Failed to delete camera');
    }
  };

  const handleTableChange = (pag: TablePaginationConfig) => {
    setPagination({ current: pag.current || 1, pageSize: pag.pageSize || 10 });
  };

  const filtered = cameras.filter((cam) => {
    const matchSearch = cam.name.toLowerCase().includes(search.toLowerCase()) ||
      cam.location.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'ALL' || cam.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const columns: ColumnsType<Camera> = [
    {
      title: '#',
      dataIndex: 'id',
      width: 60,
      render: (id) => <Text style={{ color: '#64748b', fontFamily: 'monospace' }}>#{id}</Text>,
    },
    {
      title: 'Camera',
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 700, fontSize: 13 }}>{record.name}</div>
          <div style={{ color: '#64748b', fontSize: 11 }}>{record.location}</div>
        </div>
      ),
    },
    {
      title: 'RTSP URL',
      dataIndex: 'rtspUrl',
      ellipsis: true,
      render: (url) => (
        <Tooltip title={url}>
          <Text style={{ fontFamily: 'monospace', fontSize: 11, color: '#64748b' }}>
            {url.length > 35 ? url.slice(0, 35) + '…' : url}
          </Text>
        </Tooltip>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      width: 120,
      render: (status) => (
        <Badge
          color={getCameraStatusColor(status)}
          text={<Tag color={getCameraStatusColor(status)} style={{ borderRadius: 20, fontSize: 11, border: 'none', background: `${getCameraStatusColor(status)}18` }}>
            {status}
          </Tag>}
        />
      ),
    },
    {
      title: 'Created',
      dataIndex: 'createdAt',
      width: 150,
      render: (ts) => <Text style={{ fontSize: 12, color: '#64748b' }}>{ts ? formatDateTime(ts) : '—'}</Text>,
    },
    {
      title: 'Actions',
      width: 100,
      render: (_, record) => (
        <Space>
          {isAdmin && (
            <>
              <Tooltip title="Edit">
                <Button type="text" size="small" icon={<EditOutlined />} onClick={() => handleEdit(record)} style={{ color: '#00d4ff' }} />
              </Tooltip>
              <Popconfirm
                title="Delete Camera"
                description="Are you sure? This action cannot be undone."
                onConfirm={() => handleDelete(record.id)}
                okText="Delete"
                okType="danger"
              >
                <Tooltip title="Delete">
                  <Button type="text" size="small" icon={<DeleteOutlined />} danger />
                </Tooltip>
              </Popconfirm>
            </>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div className="page-container">
      <div className="section-header">
        <div>
          <Title level={3} style={{ margin: 0, fontWeight: 800 }}>
            <span className="gradient-text">Camera Management</span>
          </Title>
          <Text style={{ color: '#64748b', fontSize: 13 }}>{total} cameras registered</Text>
        </div>
        <Space>
          <Tooltip title="Refresh"><Button icon={isLoading ? <SyncOutlined spin /> : <ReloadOutlined />} onClick={load} type="text" style={{ color: '#00d4ff', border: '1px solid rgba(0,212,255,0.2)', borderRadius: 10 }} /></Tooltip>
          {isAdmin && (
            <Button
              type="primary" icon={<PlusOutlined />} onClick={handleAdd}
              style={{ background: 'linear-gradient(135deg, #00d4ff, #7c3aed)', border: 'none', borderRadius: 10, fontWeight: 600 }}
            >
              Add Camera
            </Button>
          )}
        </Space>
      </div>

      {/* Filters */}
      <Space style={{ marginBottom: 16, flexWrap: 'wrap' }}>
        <Input
          prefix={<SearchOutlined style={{ color: '#64748b' }} />}
          placeholder="Search cameras..."
          value={search} onChange={(e) => setSearch(e.target.value)}
          allowClear style={{ width: 260, borderRadius: 10 }}
        />
        <Select value={statusFilter} onChange={setStatusFilter} style={{ width: 160 }}>
          <Option value="ALL">All Statuses</Option>
          <Option value="ACTIVE">Active</Option>
          <Option value="INACTIVE">Inactive</Option>
          <Option value="ERROR">Error</Option>
          <Option value="MAINTENANCE">Maintenance</Option>
        </Select>
      </Space>

      {error && <Alert type="error" title={error} showIcon style={{ marginBottom: 16, borderRadius: 10 }} />}

      <div className="glass-card" style={{ borderRadius: 16, overflow: 'hidden' }}>
        <Table
          dataSource={filtered}
          columns={columns}
          rowKey="id"
          loading={isLoading}
          pagination={{ current: pagination.current, pageSize: pagination.pageSize, total, showSizeChanger: true, showTotal: (t) => `${t} cameras` }}
          onChange={handleTableChange}
          locale={{ emptyText: <div style={{ textAlign: 'center', padding: '48px 0', color: '#64748b' }}><VideoCameraOutlined style={{ fontSize: 40, display: 'block', margin: '0 auto 8px' }} />No cameras found</div> }}
          scroll={{ x: true }}
        />
      </div>

      <CameraFormModal
        open={modalOpen}
        camera={selectedCamera}
        onClose={handleClose}
        onSubmit={handleSubmit}
        isLoading={submitting}
      />
    </div>
  );
};

export default CameraManagementPage;
