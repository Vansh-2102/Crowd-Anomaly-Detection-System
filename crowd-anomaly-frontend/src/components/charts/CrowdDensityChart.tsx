import React from 'react';
import ReactECharts from 'echarts-for-react';
import { CrowdDensityData } from '@/types';
import { CHART_COLORS } from '@/utils/constants';

interface Props {
  data: CrowdDensityData[];
  height?: number;
}

const CrowdDensityChart: React.FC<Props> = ({ data, height = 280 }) => {
  const option = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(15,22,41,0.95)',
      borderColor: 'rgba(0,212,255,0.2)',
      textStyle: { color: '#e2e8f0' },
    },
    legend: {
      data: ['Avg Density', 'Max Density'],
      textStyle: { color: '#94a3b8', fontSize: 11 },
      bottom: 0,
    },
    grid: { top: 20, right: 20, bottom: 40, left: 40, containLabel: true },
    xAxis: {
      type: 'category',
      data: data.map((d) => d.hour),
      axisLine: { lineStyle: { color: 'rgba(0,212,255,0.1)' } },
      axisLabel: { color: '#64748b', fontSize: 10 },
    },
    yAxis: {
      type: 'value',
      max: 1,
      axisLabel: { color: '#64748b', fontSize: 11, formatter: (v: number) => `${(v * 100).toFixed(0)}%` },
      splitLine: { lineStyle: { color: 'rgba(0,212,255,0.06)', type: 'dashed' } },
    },
    series: [
      {
        name: 'Avg Density',
        type: 'line',
        data: data.map((d) => d.avgDensity),
        smooth: true,
        lineStyle: { color: CHART_COLORS.secondary, width: 2 },
        itemStyle: { color: CHART_COLORS.secondary },
        areaStyle: { color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: 'rgba(124,58,237,0.3)' }, { offset: 1, color: 'rgba(124,58,237,0)' }] } },
        symbol: 'circle', symbolSize: 5,
      },
      {
        name: 'Max Density',
        type: 'line',
        data: data.map((d) => d.maxDensity),
        smooth: true,
        lineStyle: { color: CHART_COLORS.danger, width: 2, type: 'dashed' },
        itemStyle: { color: CHART_COLORS.danger },
        symbol: 'triangle', symbolSize: 6,
      },
    ],
  };

  return <ReactECharts option={option} style={{ height }} opts={{ renderer: 'canvas' }} />;
};

export default CrowdDensityChart;
