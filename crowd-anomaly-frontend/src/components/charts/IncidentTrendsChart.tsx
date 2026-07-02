import React from 'react';
import ReactECharts from 'echarts-for-react';
import { IncidentTrend } from '@/types';
import { CHART_COLORS } from '@/utils/constants';

interface Props {
  data: IncidentTrend[];
  height?: number;
}

const IncidentTrendsChart: React.FC<Props> = ({ data, height = 280 }) => {
  const option = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(15,22,41,0.95)',
      borderColor: 'rgba(0,212,255,0.2)',
      textStyle: { color: '#e2e8f0' },
    },
    legend: {
      data: ['Total', 'Critical', 'High', 'Medium'],
      textStyle: { color: '#94a3b8', fontSize: 11 },
      bottom: 0,
    },
    grid: { top: 20, right: 20, bottom: 40, left: 40, containLabel: true },
    xAxis: {
      type: 'category',
      data: data.map((d) => d.date),
      axisLine: { lineStyle: { color: 'rgba(0,212,255,0.1)' } },
      axisLabel: { color: '#64748b', fontSize: 11 },
    },
    yAxis: {
      type: 'value',
      splitLine: { lineStyle: { color: 'rgba(0,212,255,0.06)', type: 'dashed' } },
      axisLabel: { color: '#64748b', fontSize: 11 },
    },
    series: [
      {
        name: 'Total',
        type: 'line',
        data: data.map((d) => d.count),
        smooth: true,
        lineStyle: { color: CHART_COLORS.primary, width: 2 },
        itemStyle: { color: CHART_COLORS.primary },
        areaStyle: { color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: 'rgba(0,212,255,0.3)' }, { offset: 1, color: 'rgba(0,212,255,0)' }] } },
        symbol: 'circle', symbolSize: 6,
      },
      {
        name: 'Critical',
        type: 'bar',
        data: data.map((d) => d.critical),
        itemStyle: { color: CHART_COLORS.danger, borderRadius: [4, 4, 0, 0] },
        barMaxWidth: 16,
      },
      {
        name: 'High',
        type: 'bar',
        data: data.map((d) => d.high),
        itemStyle: { color: CHART_COLORS.warning, borderRadius: [4, 4, 0, 0] },
        barMaxWidth: 16,
      },
      {
        name: 'Medium',
        type: 'bar',
        data: data.map((d) => d.medium),
        itemStyle: { color: CHART_COLORS.success, borderRadius: [4, 4, 0, 0] },
        barMaxWidth: 16,
      },
    ],
  };

  return <ReactECharts option={option} style={{ height }} opts={{ renderer: 'canvas' }} />;
};

export default IncidentTrendsChart;
