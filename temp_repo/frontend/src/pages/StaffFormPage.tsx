import React from 'react';
import { Box } from '@mui/material';
import StaffForm from '../components/staff/StaffForm';
import MainLayout from '../layouts/MainLayout';

const StaffFormPage: React.FC = () => {
  return (
    <MainLayout>
      <Box sx={{ p: 3 }}>
        <StaffForm />
      </Box>
    </MainLayout>
  );
};

export default StaffFormPage; 