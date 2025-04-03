import React from 'react';
import { Box } from '@mui/material';

const TopPanel: React.FC = () => {
  return (
    <Box
      sx={{
        height: '64px',
        backgroundColor: 'transparent',
        display: 'flex',
        alignItems: 'center',
        padding: '0 24px',
        justifyContent: 'flex-end', // Элементы будут справа
      }}
    >
      {/* Здесь будет поиск и другие элементы */}
    </Box>
  );
};

export default TopPanel; 