import React from 'react';
import { Layout } from 'antd';
import { RadarChartOutlined } from '@ant-design/icons';

const { Footer } = Layout;

const AppFooter: React.FC = () => (
  <Footer
    style={{
      height: 48,
      padding: '0 24px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      background: 'rgba(10,14,26,0.6)',
      borderTop: '1px solid rgba(0,212,255,0.08)',
      fontSize: 12,
      color: '#334155',
    }}
  >
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <RadarChartOutlined style={{ color: '#00d4ff', fontSize: 13 }} />
      <span>Crowd Anomaly Detection System</span>
    </div>
    <span>© {new Date().getFullYear()} — All rights reserved</span>
  </Footer>
);

export default AppFooter;
