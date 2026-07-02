export const APP_NAME = 'Crowd Anomaly Detection System';
export const APP_SHORT_NAME = 'CADS';
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
export const WS_URL = import.meta.env.VITE_WS_URL || 'http://localhost:8080/ws';

export const PAGE_SIZE_OPTIONS = ['10', '20', '50', '100'];
export const DEFAULT_PAGE_SIZE = 10;

export const ALERT_LEVELS = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] as const;
export const CAMERA_STATUSES = ['ACTIVE', 'INACTIVE', 'ERROR', 'MAINTENANCE'] as const;
export const USER_ROLES = ['ADMIN', 'OPERATOR'] as const;
export const USER_STATUSES = ['ACTIVE', 'INACTIVE', 'SUSPENDED'] as const;

export const WS_TOPICS = {
  INCIDENTS: '/topic/incidents',
  ALERTS: '/topic/alerts',
} as const;

export const CHART_COLORS = {
  primary: '#00d4ff',
  secondary: '#7c3aed',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  info: '#3b82f6',
  gradient1: ['#00d4ff', '#0099cc'],
  gradient2: ['#7c3aed', '#5b21b6'],
};

export const DENSITY_THRESHOLDS = {
  LOW: 0.4,
  MEDIUM: 0.6,
  HIGH: 0.8,
};
