import React, { useState } from 'react';
import { Typography, Row, Col, Select, Button, Skeleton } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';
import ReactECharts from 'echarts-for-react';
import { CHART_COLORS } from '@/utils/constants';

const { Title, Text } = Typography;
const { Option } = Select;

// ---- Mock analytics data ----
const generateMonthly = () =>
  ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((m) => ({
    month: m,
    incidents: Math.floor(Math.random() * 120 + 20),
    criticalAlerts: Math.floor(Math.random() * 25 + 5),
    resolvedIncidents: Math.floor(Math.random() * 100 + 10),
  }));

const generateHeatmap = () => {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const hours = Array.from({ length: 24 }, (_, i) => `${i.toString().padStart(2, '0')}:00`);
  return days.flatMap((day, di) =>
    hours.map((_, hi) => [hi, di, Math.floor(Math.random() * 100)])
  );
};

const mockMonthly = generateMonthly();
const mockHeatmap = generateHeatmap();
const cameras = ['Gate 1', 'Gate 2', 'Hall A', 'Hall B', 'Parking', 'Entrance'];

const AnalyticsPage: React.FC = () => {
  const [period, setPeriod] = useState('12M');
  const [loading] = useState(false);

  const monthly = mockMonthly;

  // ---- Monthly Incidents Chart ----
  const monthlyOption = {
    backgroundColor: 'transparent',
    tooltip: { trigger: 'axis', backgroundColor: 'rgba(15,22,41,0.95)', borderColor: 'rgba(0,212,255,0.2)', textStyle: { color: '#e2e8f0' } },
    legend: { data: ['Incidents', 'Critical', 'Resolved'], textStyle: { color: '#94a3b8', fontSize: 11 }, bottom: 0 },
    grid: { top: 20, right: 20, bottom: 44, left: 40, containLabel: true },
    xAxis: { type: 'category', data: monthly.map((d) => d.month), axisLabel: { color: '#64748b', fontSize: 11 }, axisLine: { lineStyle: { color: 'rgba(0,212,255,0.1)' } } },
    yAxis: { type: 'value', splitLine: { lineStyle: { color: 'rgba(0,212,255,0.06)', type: 'dashed' } }, axisLabel: { color: '#64748b' } },
    series: [
      { name: 'Incidents', type: 'bar', data: monthly.map((d) => d.incidents), itemStyle: { color: CHART_COLORS.primary, borderRadius: [6, 6, 0, 0] }, barMaxWidth: 24 },
      { name: 'Critical', type: 'bar', data: monthly.map((d) => d.criticalAlerts), itemStyle: { color: CHART_COLORS.danger, borderRadius: [6, 6, 0, 0] }, barMaxWidth: 24 },
      { name: 'Resolved', type: 'line', data: monthly.map((d) => d.resolvedIncidents), smooth: true, lineStyle: { color: CHART_COLORS.success, width: 2 }, itemStyle: { color: CHART_COLORS.success }, symbol: 'circle', symbolSize: 5 },
    ],
  };

  // ---- Alert Trends ----
  const alertTrendsOption = {
    backgroundColor: 'transparent',
    tooltip: { trigger: 'axis', backgroundColor: 'rgba(15,22,41,0.95)', borderColor: 'rgba(0,212,255,0.2)', textStyle: { color: '#e2e8f0' } },
    legend: { data: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'], textStyle: { color: '#94a3b8', fontSize: 11 }, bottom: 0 },
    grid: { top: 20, right: 20, bottom: 44, left: 40, containLabel: true },
    xAxis: { type: 'category', data: monthly.map((d) => d.month), axisLabel: { color: '#64748b', fontSize: 11 }, axisLine: { lineStyle: { color: 'rgba(0,212,255,0.1)' } } },
    yAxis: { type: 'value', splitLine: { lineStyle: { color: 'rgba(0,212,255,0.06)', type: 'dashed' } }, axisLabel: { color: '#64748b' } },
    series: [
      { name: 'LOW', type: 'line', data: monthly.map(() => Math.floor(Math.random() * 30 + 5)), smooth: true, lineStyle: { color: '#52c41a' }, itemStyle: { color: '#52c41a' }, areaStyle: { color: 'rgba(82,196,26,0.08)' } },
      { name: 'MEDIUM', type: 'line', data: monthly.map(() => Math.floor(Math.random() * 25 + 5)), smooth: true, lineStyle: { color: '#faad14' }, itemStyle: { color: '#faad14' }, areaStyle: { color: 'rgba(250,173,20,0.08)' } },
      { name: 'HIGH', type: 'line', data: monthly.map(() => Math.floor(Math.random() * 15 + 2)), smooth: true, lineStyle: { color: '#fa8c16' }, itemStyle: { color: '#fa8c16' }, areaStyle: { color: 'rgba(250,140,22,0.08)' } },
      { name: 'CRITICAL', type: 'line', data: monthly.map(() => Math.floor(Math.random() * 10 + 1)), smooth: true, lineStyle: { color: '#ff4d4f' }, itemStyle: { color: '#ff4d4f' }, areaStyle: { color: 'rgba(255,77,79,0.08)' } },
    ],
  };

  // ---- Camera Performance ----
  const cameraPerformanceOption = {
    backgroundColor: 'transparent',
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' }, backgroundColor: 'rgba(15,22,41,0.95)', borderColor: 'rgba(0,212,255,0.2)', textStyle: { color: '#e2e8f0' } },
    legend: { data: ['Incidents', 'Uptime %'], textStyle: { color: '#94a3b8', fontSize: 11 }, bottom: 0 },
    grid: { top: 20, right: 60, bottom: 44, left: 40, containLabel: true },
    xAxis: { type: 'category', data: cameras, axisLabel: { color: '#64748b', fontSize: 11 }, axisLine: { lineStyle: { color: 'rgba(0,212,255,0.1)' } } },
    yAxis: [
      { type: 'value', name: 'Incidents', splitLine: { lineStyle: { color: 'rgba(0,212,255,0.06)', type: 'dashed' } }, axisLabel: { color: '#64748b' } },
      { type: 'value', name: 'Uptime %', min: 0, max: 100, axisLabel: { color: '#64748b', formatter: '{value}%' } },
    ],
    series: [
      { name: 'Incidents', type: 'bar', data: cameras.map(() => Math.floor(Math.random() * 80 + 10)), itemStyle: { color: CHART_COLORS.secondary, borderRadius: [6, 6, 0, 0] }, barMaxWidth: 28, yAxisIndex: 0 },
      { name: 'Uptime %', type: 'line', data: cameras.map(() => Math.floor(Math.random() * 15 + 85)), smooth: true, lineStyle: { color: CHART_COLORS.success, width: 2 }, itemStyle: { color: CHART_COLORS.success }, yAxisIndex: 1, symbol: 'diamond', symbolSize: 8 },
    ],
  };

  // ---- Heatmap ----
  const heatmapOption = {
    backgroundColor: 'transparent',
    tooltip: {
      position: 'top',
      backgroundColor: 'rgba(15,22,41,0.95)',
      borderColor: 'rgba(0,212,255,0.2)',
      textStyle: { color: '#e2e8f0' },
      formatter: (p: { data: number[] }) => `${['Mon','Tue','Wed','Thu','Fri','Sat','Sun'][p.data[1]]} ${p.data[0]}:00 — ${p.data[2]} incidents`,
    },
    grid: { top: 10, right: 20, bottom: 60, left: 60 },
    xAxis: {
      type: 'category',
      data: Array.from({ length: 24 }, (_, i) => `${i.toString().padStart(2, '0')}:00`),
      axisLabel: { color: '#64748b', fontSize: 10 },
      axisLine: { lineStyle: { color: 'rgba(0,212,255,0.1)' } },
    },
    yAxis: {
      type: 'category',
      data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      axisLabel: { color: '#64748b', fontSize: 11 },
      axisLine: { lineStyle: { color: 'rgba(0,212,255,0.1)' } },
    },
    visualMap: {
      min: 0, max: 100, calculable: true, orient: 'horizontal', left: 'center', bottom: 0,
      inRange: { color: ['#0a0e1a', '#0099cc', '#00d4ff', '#ff4d4f'] },
      textStyle: { color: '#64748b', fontSize: 10 },
    },
    series: [{
      name: 'Incidents',
      type: 'heatmap',
      data: mockHeatmap,
      label: { show: false },
      emphasis: { itemStyle: { shadowBlur: 10, shadowColor: 'rgba(0,0,0,0.5)' } },
      itemStyle: { borderRadius: 2 },
    }],
  };

  // ---- Fight Detection ----
  const fightOption = {
    backgroundColor: 'transparent',
    tooltip: { trigger: 'axis', backgroundColor: 'rgba(15,22,41,0.95)', borderColor: 'rgba(0,212,255,0.2)', textStyle: { color: '#e2e8f0' } },
    legend: { data: ['Fight Events', 'Stampede Events', 'False Positives'], textStyle: { color: '#94a3b8', fontSize: 11 }, bottom: 0 },
    radar: {
      indicator: cameras.map((c) => ({ name: c, max: 50 })),
      axisName: { color: '#94a3b8', fontSize: 11 },
      splitLine: { lineStyle: { color: 'rgba(0,212,255,0.08)' } },
      splitArea: { areaStyle: { color: ['rgba(0,212,255,0.02)', 'rgba(0,212,255,0.04)'] } },
      axisLine: { lineStyle: { color: 'rgba(0,212,255,0.1)' } },
    },
    series: [{
      type: 'radar',
      data: [
        { value: cameras.map(() => Math.floor(Math.random() * 30 + 5)), name: 'Fight Events', lineStyle: { color: '#ff4d4f' }, areaStyle: { color: 'rgba(255,77,79,0.1)' }, itemStyle: { color: '#ff4d4f' } },
        { value: cameras.map(() => Math.floor(Math.random() * 20 + 3)), name: 'Stampede Events', lineStyle: { color: '#fa8c16' }, areaStyle: { color: 'rgba(250,140,22,0.1)' }, itemStyle: { color: '#fa8c16' } },
        { value: cameras.map(() => Math.floor(Math.random() * 10 + 1)), name: 'False Positives', lineStyle: { color: '#94a3b8', type: 'dashed' }, areaStyle: { color: 'rgba(148,163,184,0.06)' }, itemStyle: { color: '#94a3b8' } },
      ],
    }],
  };

  const chartCard = (title: string, chart: React.ReactNode, height = 300) => (
    <div className="glass-card animate-fadeInUp" style={{ padding: '20px', borderRadius: 16, height: '100%' }}>
      <Text style={{ fontWeight: 700, fontSize: 14, display: 'block', marginBottom: 12 }}>{title}</Text>
      {loading ? <Skeleton active paragraph={{ rows: 6 }} /> : <div style={{ height }}>{chart}</div>}
    </div>
  );

  return (
    <div className="page-container">
      <div className="section-header">
        <div>
          <Title level={3} style={{ margin: 0, fontWeight: 800 }}><span className="gradient-text">Analytics</span></Title>
          <Text style={{ color: '#64748b', fontSize: 13 }}>Comprehensive surveillance analytics & statistics</Text>
        </div>
        <Select value={period} onChange={setPeriod} style={{ width: 120, borderRadius: 10 }}>
          <Option value="1M">Last Month</Option>
          <Option value="3M">3 Months</Option>
          <Option value="6M">6 Months</Option>
          <Option value="12M">12 Months</Option>
        </Select>
      </div>

      <Row gutter={[16, 16]}>
        <Col xs={24}>
          {chartCard('Monthly Incidents Overview',
            <ReactECharts option={monthlyOption} style={{ height: 300 }} opts={{ renderer: 'canvas' }} />
          )}
        </Col>

        <Col xs={24} xl={12}>
          {chartCard('Alert Level Trends',
            <ReactECharts option={alertTrendsOption} style={{ height: 280 }} opts={{ renderer: 'canvas' }} />, 280
          )}
        </Col>

        <Col xs={24} xl={12}>
          {chartCard('Camera Performance',
            <ReactECharts option={cameraPerformanceOption} style={{ height: 280 }} opts={{ renderer: 'canvas' }} />, 280
          )}
        </Col>

        <Col xs={24}>
          {chartCard('Crowd Density Heatmap (Hour × Day)',
            <ReactECharts option={heatmapOption} style={{ height: 260 }} opts={{ renderer: 'canvas' }} />, 260
          )}
        </Col>

        <Col xs={24} xl={12}>
          {chartCard('Fight & Stampede Detection by Camera',
            <ReactECharts option={fightOption} style={{ height: 320 }} opts={{ renderer: 'canvas' }} />, 320
          )}
        </Col>

        <Col xs={24} xl={12}>
          {chartCard('Incident Resolution Rate',
            <ReactECharts
              option={{
                backgroundColor: 'transparent',
                tooltip: { trigger: 'item', backgroundColor: 'rgba(15,22,41,0.95)', borderColor: 'rgba(0,212,255,0.2)', textStyle: { color: '#e2e8f0' } },
                series: [{
                  type: 'pie', radius: ['35%', '65%'], center: ['50%', '50%'],
                  label: { color: '#94a3b8', fontSize: 11 },
                  data: [
                    { name: 'Resolved', value: 78, itemStyle: { color: '#10b981' } },
                    { name: 'Pending', value: 15, itemStyle: { color: '#f59e0b' } },
                    { name: 'Escalated', value: 7, itemStyle: { color: '#ef4444' } },
                  ],
                }],
              }}
              style={{ height: 320 }}
              opts={{ renderer: 'canvas' }}
            />, 320
          )}
        </Col>
      </Row>
    </div>
  );
};

export default AnalyticsPage;
