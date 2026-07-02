// ============================================================
// AUTHENTICATION TYPES
// ============================================================

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role?: UserRole;
}

export interface AuthResponse {
  token: string;
  refreshToken?: string;
  tokenType: string;
  expiresIn: number;
  user: User;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// ============================================================
// USER TYPES
// ============================================================

export type UserRole = 'ADMIN' | 'OPERATOR';
export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';

export interface User {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  status: UserStatus;
  createdAt: string;
  updatedAt: string;
  lastLogin?: string;
  avatarUrl?: string;
}

export interface UserState {
  users: User[];
  selectedUser: User | null;
  total: number;
  isLoading: boolean;
  error: string | null;
}

// ============================================================
// CAMERA TYPES
// ============================================================

export type CameraStatus = 'ACTIVE' | 'INACTIVE' | 'ERROR' | 'MAINTENANCE';

export interface Camera {
  id: number;
  name: string;
  location: string;
  rtspUrl: string;
  status: CameraStatus;
  snapshotUrl?: string;
  liveFrame?: string;
  createdAt: string;
  updatedAt: string;
  lastAnalyzedAt?: string;
  peopleCount?: number;
  densityScore?: number;
  alertLevel?: AlertLevel;
  fightDetected?: boolean;
  stampedeDetected?: boolean;
}

export interface CameraFormData {
  name: string;
  location: string;
  rtspUrl: string;
  status?: CameraStatus;
}

export interface CameraState {
  cameras: Camera[];
  selectedCamera: Camera | null;
  total: number;
  isLoading: boolean;
  isAnalyzing: boolean;
  error: string | null;
}

// ============================================================
// INCIDENT TYPES
// ============================================================

export type AlertLevel = 'SAFE' | 'WARNING' | 'DANGER' | 'CRITICAL' | 'LOW' | 'MEDIUM' | 'HIGH';

export interface Incident {
  id: number;
  cameraId: number;
  cameraName: string;
  cameraLocation: string;
  peopleCount: number;
  densityScore: number;
  fightDetected: boolean;
  stampedeDetected: boolean;
  alertLevel: AlertLevel;
  description?: string;
  snapshotUrl?: string;
  timestamp: string;
  resolvedAt?: string;
  resolvedBy?: string;
  isResolved: boolean;
}

export interface IncidentState {
  incidents: Incident[];
  selectedIncident: Incident | null;
  total: number;
  isLoading: boolean;
  error: string | null;
}

export interface IncidentFilters {
  page?: number;
  size?: number;
  sortBy?: string;
  sortDir?: string;
  cameraId?: number;
  alertLevel?: AlertLevel;
  startDate?: string;
  endDate?: string;
  search?: string;
}

// ============================================================
// ALERT TYPES
// ============================================================

export interface Alert {
  id: string;
  incidentId: number;
  cameraName: string;
  cameraLocation: string;
  alertLevel: AlertLevel;
  message: string;
  fightDetected: boolean;
  stampedeDetected: boolean;
  peopleCount: number;
  timestamp: string;
  read: boolean;
}

export interface AlertState {
  alerts: Alert[];
  unreadCount: number;
  connected: boolean;
}

// ============================================================
// DASHBOARD TYPES
// ============================================================

export interface DashboardStats {
  totalCameras: number;
  activeCameras: number;
  activeAlerts: number;
  criticalAlerts: number;
  totalIncidents: number;
  todayIncidents: number;
}

export interface IncidentTrend {
  date: string;
  count: number;
  critical: number;
  high: number;
  medium: number;
  low: number;
}

export interface AlertDistribution {
  level: AlertLevel;
  count: number;
}

export interface CrowdDensityData {
  hour: string;
  avgDensity: number;
  maxDensity: number;
}

export interface CameraStatusData {
  status: CameraStatus;
  count: number;
}

export interface DashboardData {
  stats: DashboardStats;
  incidentTrends: IncidentTrend[];
  alertDistribution: AlertDistribution[];
  crowdDensity: CrowdDensityData[];
  cameraStatus: CameraStatusData[];
  recentIncidents: Incident[];
  recentAlerts: Alert[];
}

export interface DashboardState {
  data: DashboardData | null;
  isLoading: boolean;
  error: string | null;
  lastUpdated: string | null;
}

// ============================================================
// ANALYTICS TYPES
// ============================================================

export interface MonthlyData {
  month: string;
  incidents: number;
  criticalAlerts: number;
  resolvedIncidents: number;
}

export interface CameraPerformance {
  cameraName: string;
  totalIncidents: number;
  avgResponseTime: number;
  uptime: number;
}

export interface HeatMapData {
  day: string;
  hour: number;
  value: number;
}

// ============================================================
// ML ANALYSIS TYPES
// ============================================================

export interface AnalysisRequest {
  cameraId?: number;
  imageBase64?: string;
}

export interface AnalysisResult {
  cameraId: number;
  peopleCount: number;
  densityScore: number;
  fightDetected: boolean;
  stampedeDetected: boolean;
  alertLevel: AlertLevel;
  confidence: number;
  analysisTime: number;
  timestamp: string;
  frame?: string;
}

// ============================================================
// THEME TYPES
// ============================================================

export type ThemeMode = 'dark' | 'light';

export interface ThemeState {
  mode: ThemeMode;
  primaryColor: string;
}

// ============================================================
// API TYPES
// ============================================================

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  timestamp?: string;
}

export interface PageableResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

export interface QueryParams {
  page?: number;
  size?: number;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
  search?: string;
}

// ============================================================
// NOTIFICATION TYPES
// ============================================================

export interface NotificationSettings {
  emailEnabled: boolean;
  pushEnabled: boolean;
  criticalAlerts: boolean;
  highAlerts: boolean;
  mediumAlerts: boolean;
  soundEnabled: boolean;
}

// ============================================================
// WEBSOCKET TYPES
// ============================================================

export interface WebSocketMessage {
  type: 'INCIDENT' | 'ALERT' | 'CAMERA_UPDATE';
  payload: Incident | Alert | Camera;
  timestamp: string;
}
