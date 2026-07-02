import React, { useEffect } from 'react';
import { ConfigProvider, theme as antTheme, App as AntApp } from 'antd';
import { useAppSelector } from '@/hooks/useAppSelector';
import AppRouter from '@/routes/AppRouter';

const AppContent: React.FC = () => {
  const { mode, primaryColor } = useAppSelector((state) => state.theme);

  useEffect(() => {
    document.body.className = mode;
  }, [mode]);

  return (
    <ConfigProvider
      theme={{
        algorithm: mode === 'dark' ? antTheme.darkAlgorithm : antTheme.defaultAlgorithm,
        token: {
          colorPrimary: primaryColor,
          colorBgBase: mode === 'dark' ? '#0a0e1a' : '#ffffff',
          colorBgContainer: mode === 'dark' ? '#0f1629' : '#ffffff',
          colorBgElevated: mode === 'dark' ? '#141c35' : '#ffffff',
          borderRadius: 12,
          fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
          colorBorder: mode === 'dark' ? 'rgba(0,212,255,0.12)' : '#d9d9d9',
          colorText: mode === 'dark' ? '#e2e8f0' : '#1a202c',
          colorTextSecondary: mode === 'dark' ? '#94a3b8' : '#64748b',
          colorBgLayout: mode === 'dark' ? '#0a0e1a' : '#f0f4f8',
          colorBgSpotlight: mode === 'dark' ? '#141c35' : '#f5f5f5',
        },
        components: {
          Layout: {
            siderBg: mode === 'dark' ? '#0a0e1a' : '#001529',
            headerBg: mode === 'dark' ? 'rgba(10,14,26,0.9)' : '#ffffff',
            bodyBg: mode === 'dark' ? '#0a0e1a' : '#f0f4f8',
            footerBg: mode === 'dark' ? '#0a0e1a' : '#f0f4f8',
          },
          Menu: {
            darkItemBg: 'transparent',
            darkSubMenuItemBg: 'transparent',
            darkItemSelectedBg: 'rgba(0,212,255,0.12)',
            darkItemHoverBg: 'rgba(0,212,255,0.06)',
            darkItemColor: '#94a3b8',
            darkItemSelectedColor: '#00d4ff',
            darkItemHoverColor: '#e2e8f0',
            itemBorderRadius: 10,
          },
          Table: {
            headerBg: mode === 'dark' ? '#0f1629' : '#fafafa',
            rowHoverBg: mode === 'dark' ? 'rgba(0,212,255,0.04)' : '#f5f5f5',
            borderColor: mode === 'dark' ? 'rgba(0,212,255,0.08)' : '#f0f0f0',
          },
          Card: {
            colorBgContainer: mode === 'dark' ? 'rgba(15,22,41,0.85)' : '#ffffff',
          },
          Button: {
            borderRadius: 8,
          },
          Input: {
            colorBgContainer: mode === 'dark' ? 'rgba(20,28,53,0.8)' : '#ffffff',
          },
          Modal: {
            contentBg: mode === 'dark' ? '#0f1629' : '#ffffff',
            headerBg: mode === 'dark' ? '#0f1629' : '#ffffff',
          },
          Drawer: {
            colorBgElevated: mode === 'dark' ? '#0f1629' : '#ffffff',
          },
          Notification: {
            colorBgElevated: mode === 'dark' ? '#141c35' : '#ffffff',
          },
          Tooltip: {
            colorBgSpotlight: mode === 'dark' ? '#1e2a4a' : '#404040',
          },
        },
      }}
    >
      <AntApp>
        <AppRouter />
      </AntApp>
    </ConfigProvider>
  );
};

const App: React.FC = () => {
  return <AppContent />;
};

export default App;
