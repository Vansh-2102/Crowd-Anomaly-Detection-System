import React, { useEffect, useCallback, useState } from 'react';
import {
  Typography, Input, Select, Space, Table, Tag, Badge, Button,
  Popconfirm, Tooltip, Alert, DatePicker, message,
} from 'antd';
import {
  SearchOutlined, EyeOutlined, DeleteOutlined,
  ReloadOutlined, SyncOutlined, AlertOutlined,
} from '@ant-design/icons';
import { useAppDispatch } from '@/hooks/useAppDispatch';
import { useAppSelector } from '@/hooks/useAppSelector';
import { fetchIncidents, deleteIncident, setSelectedIncident } from '@/store/slices/incidentSlice';
import IncidentDrawer from '@/components/incidents/IncidentDrawer';
import { Incident, AlertLevel, IncidentFilters } from '@/types';
import { getAlertColor } from '@/utils/helpers';
import { formatDateTime, formatDensity } from '@/utils/formatters';
import type { ColumnsType } from 'antd/es/table';
import type { TablePaginationConfig } from 'antd/es/table';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

const IncidentPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { incidents, selectedIncident, total, isLoading, error } = useAppSelector((state) => state.incidents);
  const { cameras } = useAppSelector((state) => state.cameras);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [filters, setFilters] = useState<IncidentFilters>({ page: 0, size: 10 });
  const [search, setSearch] = useState('');
  const [alertLevel, setAlertLevel] = useState<string>('ALL');
  const [cameraId, setCameraId] = useState<string>('ALL');
  const [dateRange, setDateRange] = useState<[string, string] | null>(null);

  const load = useCallback(() => {
    dispatch(fetchIncidents({
      ...filters,
      search: search || undefined,
      alertLevel: alertLevel !== 'ALL' ? alertLevel as AlertLevel : undefined,
      cameraId: cameraId !== 'ALL' ? Number(cameraId) : undefined,
      startDate: dateRange?.[0],
      endDate: dateRange?.[1],
    }));
  }, [dispatch, filters, search, alertLevel, cameraId, dateRange]);

  useEffect(() => { load(); }, [load]);

  const handleView = (incident: Incident) => {
    dispatch(setSelectedIncident(incident));
    setDrawerOpen(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await dispatch(deleteIncident(id)).unwrap();
      message.success('Incident deleted');
    } catch {
      message.error('Failed to delete incident');
    }
  };

  const handleTableChange = (pag: TablePaginationConfig) => {
    setFilters((prev) => ({ ...prev, page: (pag.current || 1) - 1, size: pag.pageSize || 10 }));
  };

  const columns: ColumnsType<Incident> = [
    { title: '#', dataIndex: 'id', width: 70, render: (id) => <Text style={{ color: '#64748b', fontSize: 12, fontFamily: 'monospace' }}>#{id}</Text> },
    {
      title: 'Camera',
      render: (_, r) => (
        <div>
          <div style={{ fontWeight: 600, fontSize: 13 }}>{r.cameraName}</div>
          <div style={{ color: '#64748b', fontSize: 11 }}>{r.cameraLocation}</div>
        </div>
      ),
    },
    { title: 'People', dataIndex: 'peopleCount', width: 80, render: (v) => <span style={{ fontWeight: 700, color: '#00d4ff' }}>{v}</span> },
    { title: 'Density', dataIndex: 'densityScore', width: 90, render: (v) => <span style={{ color: '#7c3aed' }}>{formatDensity(v)}</span> },
    {
      title: 'Detections', width: 140, render: (_, r) => (
        <Space size={4}>
          {r.fightDetected && <Tag color="red" style={{ fontSize: 10, borderRadius: 20, margin: 0 }}>Fight</Tag>}
          {r.stampedeDetected && <Tag color="orange" style={{ fontSize: 10, borderRadius: 20, margin: 0 }}>Stampede</Tag>}
          {!r.fightDetected && !r.stampedeDetected && <Tag style={{ fontSize: 10, borderRadius: 20, margin: 0, color: '#52c41a', borderColor: '#52c41a', background: 'rgba(82,196,26,0.1)' }}>Normal</Tag>}
        </Space>
      ),
    },
    {
      title: 'Alert', dataIndex: 'alertLevel', width: 100,
      render: (level: AlertLevel) => (
        <Badge color={getAlertColor(level)} text={
          <span style={{ color: getAlertColor(level), fontWeight: 700, fontSize: 11 }}>{level}</span>
        } />
      ),
    },
    { title: 'Time', dataIndex: 'timestamp', width: 140, render: (ts) => <Text style={{ fontSize: 11, color: '#64748b' }}>{formatDateTime(ts)}</Text> },
    {
      title: 'Actions', width: 80,
      render: (_, record) => (
        <Space>
          <Tooltip title="View Details">
            <Button type="text" size="small" icon={<EyeOutlined />} onClick={() => handleView(record)} style={{ color: '#00d4ff' }} />
          </Tooltip>
          <Popconfirm title="Delete this incident?" onConfirm={() => handleDelete(record.id)} okText="Delete" okType="danger">
            <Tooltip title="Delete">
              <Button type="text" size="small" icon={<DeleteOutlined />} danger />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="page-container">
      <div className="section-header">
        <div>
          <Title level={3} style={{ margin: 0, fontWeight: 800 }}>
            <span className="gradient-text">Incidents</span>
          </Title>
          <Text style={{ color: '#64748b', fontSize: 13 }}>{total} total incidents recorded</Text>
        </div>
        <Tooltip title="Refresh">
          <Button icon={isLoading ? <SyncOutlined spin /> : <ReloadOutlined />} onClick={load} type="text"
            style={{ color: '#00d4ff', border: '1px solid rgba(0,212,255,0.2)', borderRadius: 10 }} />
        </Tooltip>
      </div>

      {/* Filters */}
      <Space style={{ marginBottom: 16, flexWrap: 'wrap' }}>
        <Input prefix={<SearchOutlined style={{ color: '#64748b' }} />} placeholder="Search incidents..."
          value={search} onChange={(e) => setSearch(e.target.value)} allowClear style={{ width: 220, borderRadius: 10 }} />
        <Select value={alertLevel} onChange={setAlertLevel} style={{ width: 140 }}>
          <Option value="ALL">All Levels</Option>
          <Option value="LOW">Low</Option>
          <Option value="MEDIUM">Medium</Option>
          <Option value="HIGH">High</Option>
          <Option value="CRITICAL">Critical</Option>
        </Select>
        <Select value={cameraId} onChange={setCameraId} style={{ width: 180 }}>
          <Option value="ALL">All Cameras</Option>
          {cameras.map((c) => <Option key={c.id} value={String(c.id)}>{c.name}</Option>)}
        </Select>
        <RangePicker
          onChange={(_, strings) => setDateRange(strings[0] ? strings as [string, string] : null)}
          style={{ borderRadius: 10 }}
          presets={[
            { label: 'Today', value: [dayjs().startOf('day'), dayjs()] },
            { label: 'Last 7 Days', value: [dayjs().subtract(7, 'day'), dayjs()] },
            { label: 'Last 30 Days', value: [dayjs().subtract(30, 'day'), dayjs()] },
          ]}
        />
      </Space>

      {error && <Alert type="error" title={error} showIcon style={{ marginBottom: 16, borderRadius: 10 }} />}

      <div className="glass-card" style={{ borderRadius: 16, overflow: 'hidden' }}>
        <Table
          dataSource={incidents}
          columns={columns}
          rowKey="id"
          loading={isLoading}
          pagination={{ current: (filters.page || 0) + 1, pageSize: filters.size, total, showSizeChanger: true, showTotal: (t) => `${t} incidents` }}
          onChange={handleTableChange}
          locale={{ emptyText: <div style={{ textAlign: 'center', padding: '48px 0', color: '#64748b' }}><AlertOutlined style={{ fontSize: 40, display: 'block', margin: '0 auto 8px' }} />No incidents found</div> }}
          scroll={{ x: true }}
          rowClassName={() => 'table-row'}
        />
      </div>

      <IncidentDrawer incident={selectedIncident} open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </div>
  );
};

export default IncidentPage;
