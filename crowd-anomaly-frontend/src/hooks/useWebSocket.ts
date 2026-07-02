import { useEffect, useRef } from 'react';
import { notification } from 'antd';
import { useAppDispatch } from './useAppDispatch';
import { useAppSelector } from './useAppSelector';
import { addAlert, setConnected } from '@/store/slices/alertSlice';
import { addIncomingIncident } from '@/store/slices/incidentSlice';
import { fetchDashboard } from '@/store/slices/dashboardSlice';
import websocketService from '@/services/websocketService';
import { Alert, Incident } from '@/types';
import { getAlertColor } from '@/utils/helpers';

export const useWebSocket = () => {
  const dispatch = useAppDispatch();
  const { token, isAuthenticated } = useAppSelector((state) => state.auth);
  const { connected } = useAppSelector((state) => state.alerts);
  const initialized = useRef(false);

  useEffect(() => {
    if (!isAuthenticated || initialized.current) return;
    initialized.current = true;

    websocketService.onConnect(() => {
      dispatch(setConnected(true));

      // Subscribe to incidents
      websocketService.subscribe('/topic/incidents', (body) => {
        const incident = body as Incident;
        dispatch(addIncomingIncident(incident));
        dispatch(fetchDashboard());
        notification.warning({
          message: `New Incident — ${incident.alertLevel}`,
          description: `Camera: ${incident.cameraName} | People: ${incident.peopleCount}`,
          duration: 6,
          style: { borderLeft: `4px solid ${getAlertColor(incident.alertLevel)}` },
        });
      });

      // Subscribe to alerts
      websocketService.subscribe('/topic/alerts', (body) => {
        const alert = body as Alert;
        dispatch(addAlert(alert));
        if (alert.alertLevel === 'CRITICAL' || alert.alertLevel === 'HIGH' || alert.alertLevel === 'DANGER') {
          const notifyType = alert.alertLevel === 'CRITICAL' ? 'error' : 'warning';
          notification[notifyType]({
            message: `🚨 ${alert.alertLevel} Alert`,
            description: alert.message,
            duration: 8,
            style: { borderLeft: `4px solid ${getAlertColor(alert.alertLevel)}` },
          });
        }
      });
    });

    websocketService.onDisconnect(() => {
      dispatch(setConnected(false));
    });

    websocketService.connect(token || undefined);

    return () => {
      websocketService.disconnect();
      initialized.current = false;
    };
  }, [isAuthenticated, token, dispatch]);

  return { connected };
};
