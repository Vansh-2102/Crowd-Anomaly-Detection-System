import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

export const formatDateTime = (iso: string): string =>
  dayjs(iso).format('MMM D, YYYY HH:mm');

export const formatDate = (iso: string): string =>
  dayjs(iso).format('MMM D, YYYY');

export const formatTime = (iso: string): string =>
  dayjs(iso).format('HH:mm:ss');

export const fromNow = (iso: string): string =>
  dayjs(iso).fromNow();

export const formatDensity = (score: number): string =>
  `${(score * 100).toFixed(1)}%`;

export const formatConfidence = (score: number): string =>
  `${(score * 100).toFixed(0)}%`;

export const formatBytes = (bytes: number, decimals = 2): string => {
  if (!bytes) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
};

export const formatUptime = (percent: number): string =>
  `${percent.toFixed(1)}%`;
