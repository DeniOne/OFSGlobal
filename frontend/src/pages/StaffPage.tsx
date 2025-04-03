import React from 'react';
import { Box } from '@mui/material';
import StaffList from '../components/staff/StaffList';
import MainLayout from '../layouts/MainLayout';

const StaffPage: React.FC = () => {
  return (
    <MainLayout>
      <Box sx={{ p: 3 }}>
        <StaffList />
      </Box>
    </MainLayout>
  );
};

export default StaffPage; 