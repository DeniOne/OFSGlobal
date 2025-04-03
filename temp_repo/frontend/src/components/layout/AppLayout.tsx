import React from 'react';
import { Box } from '@mui/material';
import TopPanel from './TopPanel';

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  return (
    <Box sx={{ 
      minHeight: '100vh',
      display: 'flex',
      backgroundColor: '#0a0a0a',
      backgroundImage: 'radial-gradient(circle at 50% 50%, rgba(33, 150, 243, 0.05) 0%, transparent 100%)',
    }}>
      {/* Левая панель с лого */}
      <Box sx={{
        width: '280px',
        backgroundColor: 'rgba(17, 25, 40, 0.95)',
        borderRight: '1px solid rgba(255, 255, 255, 0.1)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '24px 16px',
      }}>
        <Box sx={{
          width: '100%',
          display: 'flex',
          justifyContent: 'center',
          marginBottom: '24px'
        }}>
          <img src="/images/Logo_NEW2.png" alt="ОФС" style={{ height: '60px' }} />
        </Box>
      </Box>

      {/* Основной контент */}
      <Box sx={{ 
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
      }}>
        <TopPanel />
        <Box sx={{ 
          flex: 1,
          padding: '24px',
        }}>
          {children}
        </Box>
      </Box>
    </Box>
  );
};

export default AppLayout; 