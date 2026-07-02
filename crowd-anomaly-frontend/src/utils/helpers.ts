import { AlertLevel, CameraStatus } from '@/types';

export const getAlertColor = (level: AlertLevel): string => {
  const colors: Record<AlertLevel, string> = {
    SAFE: '#52c41a',
    WARNING: '#faad14',
    DANGER: '#fa8c16',
    CRITICAL: '#ff4d4f',
    LOW: '#52c41a',
    MEDIUM: '#faad14',
    HIGH: '#fa8c16',
  };
  return colors[level] || '#52c41a';
};

export const getAlertBadgeStatus = (level: AlertLevel): 'success' | 'warning' | 'error' | 'processing' => {
  const map: Record<AlertLevel, 'success' | 'warning' | 'error' | 'processing'> = {
    SAFE: 'success',
    WARNING: 'warning',
    DANGER: 'processing',
    CRITICAL: 'error',
    LOW: 'success',
    MEDIUM: 'warning',
    HIGH: 'processing',
  };
  return map[level] || 'success';
};

export const getCameraStatusColor = (status: CameraStatus): string => {
  const colors: Record<CameraStatus, string> = {
    ACTIVE: '#52c41a',
    INACTIVE: '#8c8c8c',
    ERROR: '#ff4d4f',
    MAINTENANCE: '#faad14',
  };
  return colors[status] || '#8c8c8c';
};

export const getDensityColor = (score: number): string => {
  if (score >= 0.8) return '#ff4d4f';
  if (score >= 0.6) return '#fa8c16';
  if (score >= 0.4) return '#faad14';
  return '#52c41a';
};

export const truncate = (str: string, maxLen: number): string =>
  str.length > maxLen ? `${str.slice(0, maxLen)}…` : str;

export const generateMockSnapshotUrl = (cameraId: number): string =>
  `https://picsum.photos/seed/cam${cameraId}/400/225`;

export const downloadCSV = (data: Record<string, unknown>[], filename: string): void => {
  if (!data.length) return;
  const keys = Object.keys(data[0]);
  const csv = [keys.join(','), ...data.map((row) => keys.map((k) => `"${row[k] ?? ''}"`).join(','))].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename}.csv`;
  a.click();
  URL.revokeObjectURL(url);
};

export const debounce = <T extends (...args: unknown[]) => void>(fn: T, delay: number): ((...args: Parameters<T>) => void) => {
  let timer: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
};
