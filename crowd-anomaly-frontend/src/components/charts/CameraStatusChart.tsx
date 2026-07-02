import React from 'react';
import ReactECharts from 'echarts-for-react';
import { CameraStatusData } from '@/types';
import { getCameraStatusColor } from '@/utils/helpers';

interface Props {
  data: CameraStatusData[];
  height?: number;
}

const CameraStatusChart: React.FC<Props> = ({ data, height = 280 }) => {
  const option = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'item',
      backgroundColor: 'rgba(15,22,41,0.95)',
      borderColor: 'rgba(0,212,255,0.2)',
      textStyle: { color: '#e2e8f0' },
      formatter: '{b}: {c} cameras',
    },
    series: [
      {
        type: 'pie',
        radius: ['30%', '65%'],
        center: ['50%', '50%'],
        roseType: 'area',
        itemStyle: { borderRadius: 6, borderColor: 'transparent', borderWidth: 2 },
        label: { color: '#94a3b8', fontSize: 11 },
        labelLine: { lineStyle: { color: 'rgba(0,212,255,0.2)' } },
        emphasis: { itemStyle: { shadowBlur: 20, shadowColor: 'rgba(0,0,0,0.5)' } },
        data: data.map((d) => ({
          name: d.status,
          value: d.count,
          itemStyle: { color: getCameraStatusColor(d.status) },
        })),
      },
    ],
  };

  return <ReactECharts option={option} style={{ height }} opts={{ renderer: 'canvas' }} />;
};

export default CameraStatusChart;
