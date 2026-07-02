import React from 'react';
import { Card, Skeleton } from 'antd';
import CountUp from 'react-countup';
import { ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: string;
  suffix?: string;
  trend?: { value: number; isUp: boolean };
  isLoading?: boolean;
  index?: number;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color, suffix, trend, isLoading, index = 0 }) => {
  if (isLoading) {
    return (
      <Card className="glass-card" style={{ borderRadius: 16 }}>
        <Skeleton active paragraph={{ rows: 2 }} />
      </Card>
    );
  }

  return (
    <div
      className={`glass-card stat-card animate-fadeInUp delay-${index + 1}`}
      style={{ padding: '20px 24px', borderRadius: 16, position: 'relative', overflow: 'hidden' }}
    >
      {/* Glow Orb */}
      <div style={{ position: 'absolute', top: -20, right: -20, width: 100, height: 100, borderRadius: '50%', background: `radial-gradient(circle, ${color}18 0%, transparent 70%)`, pointerEvents: 'none' }} />

      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 12, color: '#64748b', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>
            {title}
          </div>
          <div style={{ fontSize: 32, fontWeight: 800, color, lineHeight: 1, fontFamily: 'JetBrains Mono, monospace' }}>
                {value}
            </div>
          {trend && (
            <div style={{ fontSize: 12, color: trend.isUp ? '#10b981' : '#ef4444', marginTop: 8, display: 'flex', alignItems: 'center', gap: 4 }}>
              {trend.isUp ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
              {Math.abs(trend.value)}% from yesterday
            </div>
          )}
        </div>
        <div style={{
          width: 48, height: 48, borderRadius: 14,
          background: `linear-gradient(135deg, ${color}22, ${color}11)`,
          border: `1px solid ${color}30`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 22, color,
          flexShrink: 0,
        }}>
          {icon}
        </div>
      </div>
    </div>
  );
};

export default StatCard;
