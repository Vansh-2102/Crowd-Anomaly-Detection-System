import React from 'react';
import { Table, Tag, Badge, Tooltip, Button } from 'antd';
import { EyeOutlined } from '@ant-design/icons';
import { Incident } from '@/types';
import { getAlertColor } from '@/utils/helpers';
import { formatDateTime } from '@/utils/formatters';
import type { ColumnsType } from 'antd/es/table';

interface Props {
  data: Incident[];
  isLoading?: boolean;
  onView?: (incident: Incident) => void;
}

const RecentIncidentsTable: React.FC<Props> = ({ data, isLoading, onView }) => {
  const columns: ColumnsType<Incident> = [
    {
      title: 'Camera',
      dataIndex: 'cameraName',
      ellipsis: true,
      render: (name, record) => (
        <div>
          <div style={{ fontWeight: 600, fontSize: 13 }}>{name}</div>
          <div style={{ color: '#64748b', fontSize: 11 }}>{record.cameraLocation}</div>
        </div>
      ),
    },
    {
      title: 'Alert',
      dataIndex: 'alertLevel',
      width: 90,
      render: (level) => (
        <Badge
          color={getAlertColor(level)}
          text={<span style={{ color: getAlertColor(level), fontSize: 11, fontWeight: 600 }}>{level}</span>}
        />
      ),
    },
    {
      title: 'Detections',
      width: 120,
      render: (_, record) => (
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          {record.fightDetected && <Tag color="red" style={{ fontSize: 10, padding: '0 6px', margin: 0 }}>Fight</Tag>}
          {record.stampedeDetected && <Tag color="orange" style={{ fontSize: 10, padding: '0 6px', margin: 0 }}>Stampede</Tag>}
          {!record.fightDetected && !record.stampedeDetected && <Tag style={{ fontSize: 10, padding: '0 6px', margin: 0 }}>—</Tag>}
        </div>
      ),
    },
    {
      title: 'Time',
      dataIndex: 'timestamp',
      width: 130,
      render: (ts) => <span style={{ fontSize: 12, color: '#64748b' }}>{formatDateTime(ts)}</span>,
    },
    {
      title: '',
      width: 40,
      render: (_, record) => (
        <Tooltip title="View Details">
          <Button type="text" size="small" icon={<EyeOutlined />} onClick={() => onView?.(record)} />
        </Tooltip>
      ),
    },
  ];

  return (
    <Table
      dataSource={data}
      columns={columns}
      rowKey="id"
      loading={isLoading}
      pagination={false}
      size="small"
      style={{ background: 'transparent' }}
      scroll={{ x: true }}
    />
  );
};

export default RecentIncidentsTable;
