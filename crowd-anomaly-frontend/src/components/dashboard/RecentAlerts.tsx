import React from 'react';
import { Timeline, Tag } from 'antd';
import { AlertOutlined } from '@ant-design/icons';
import { Alert } from '@/types';
import { getAlertColor } from '@/utils/helpers';
import { fromNow } from '@/utils/formatters';

interface Props {
  data: Alert[];
}

const RecentAlerts: React.FC<Props> = ({ data }) => {
  if (!data.length) {
    return (
      <div style={{ textAlign: 'center', color: '#64748b', padding: '24px 0' }}>
        <AlertOutlined style={{ fontSize: 32, marginBottom: 8, display: 'block' }} />
        No recent alerts
      </div>
    );
  }

  return (
    <Timeline
      style={{ padding: '8px 0' }}
      items={data.slice(0, 8).map((alert) => ({
        color: getAlertColor(alert.alertLevel),
        dot: <AlertOutlined style={{ color: getAlertColor(alert.alertLevel), fontSize: 12 }} />,
        children: (
          <div style={{ marginBottom: 4 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
              <Tag
                color={getAlertColor(alert.alertLevel)}
                style={{ fontSize: 10, padding: '0 5px', margin: 0, borderRadius: 4 }}
              >
                {alert.alertLevel}
              </Tag>
              <span style={{ fontSize: 13, fontWeight: 600 }}>{alert.cameraName}</span>
            </div>
            <div style={{ fontSize: 12, color: '#94a3b8', lineHeight: 1.4 }}>{alert.message}</div>
            <div style={{ fontSize: 11, color: '#64748b', marginTop: 3 }}>{fromNow(alert.timestamp)}</div>
          </div>
        ),
      }))}
    />
  );
};

export default RecentAlerts;
