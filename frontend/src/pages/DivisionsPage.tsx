import React from 'react';
import { Box } from '@mui/material';
import MainLayout from '../layouts/MainLayout';
import DivisionList from '../components/divisions/DivisionList';

const DivisionsPage: React.FC = () => {
  return (
    <MainLayout>
      <Box sx={{ p: 3 }}>
        <DivisionList />
      </Box>
    </MainLayout>
  );
};

export default DivisionsPage; 