import React from 'react';
import ReactECharts from 'echarts-for-react';
import { AlertDistribution } from '@/types';
import { getAlertColor } from '@/utils/helpers';

interface Props {
  data: AlertDistribution[];
  height?: number;
}

const AlertDistributionChart: React.FC<Props> = ({ data, height = 280 }) => {
  const option = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'item',
      backgroundColor: 'rgba(15,22,41,0.95)',
      borderColor: 'rgba(0,212,255,0.2)',
      textStyle: { color: '#e2e8f0' },
      formatter: '{b}: {c} ({d}%)',
    },
    legend: {
      orient: 'vertical',
      right: 10,
      top: 'center',
      textStyle: { color: '#94a3b8', fontSize: 12 },
    },
    series: [
      {
        name: 'Alerts',
        type: 'pie',
        radius: ['45%', '75%'],
        center: ['40%', '50%'],
        avoidLabelOverlap: false,
        itemStyle: { borderColor: 'transparent', borderWidth: 2 },
        label: { show: false },
        emphasis: {
          label: { show: true, fontSize: 14, fontWeight: 700, color: '#e2e8f0' },
          itemStyle: { shadowBlur: 20, shadowColor: 'rgba(0,0,0,0.5)' },
        },
        data: data.map((d) => ({
          name: d.level,
          value: d.count,
          itemStyle: { color: getAlertColor(d.level) },
        })),
      },
    ],
  };

  return <ReactECharts option={option} style={{ height }} opts={{ renderer: 'canvas' }} />;
};

export default AlertDistributionChart;
