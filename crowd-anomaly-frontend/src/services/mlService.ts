import api from './api';
import { AnalysisRequest, AnalysisResult, AlertLevel } from '@/types';

interface CameraAnalysisResponse {
  incident: any;
  mlResponse: {
    camera_id: string;
    timestamp: string;
    people_count: number;
    density_score: number;
    risk_level: string;
    fight_detected: boolean;
    fight_confidence: number;
    stampede: boolean;
    speed: number;
    alert_level: AlertLevel;
    message?: string;
    severity?: string;
    frame?: string;
  };
}

const mlService = {
  analyze: async (payload: AnalysisRequest): Promise<AnalysisResult> => {
    const { data } = await api.post<AnalysisResult>('/api/ml/analyze', payload);
    return data;
  },

  analyzeCamera: async (cameraId: number): Promise<AnalysisResult> => {
    const { data } = await api.post<CameraAnalysisResponse>('/api/ml/analyze-camera', { cameraId });
    return {
      cameraId,
      peopleCount: data.mlResponse.people_count,
      densityScore: data.mlResponse.density_score,
      fightDetected: data.mlResponse.fight_detected,
      stampedeDetected: data.mlResponse.stampede,
      alertLevel: data.mlResponse.alert_level,
      confidence: data.mlResponse.fight_confidence,
      analysisTime: 0,
      timestamp: data.mlResponse.timestamp,
      frame: data.mlResponse.frame,
    };
  },
};

export default mlService;
