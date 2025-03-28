import React from 'react';
import { Box } from '@mui/material';
import MainLayout from '../layouts/MainLayout';
import DepartmentList from '../components/departments/DepartmentList';

const DepartmentsPage: React.FC = () => {
  return (
    <MainLayout>
      <Box sx={{ p: 3 }}>
        <DepartmentList />
      </Box>
    </MainLayout>
  );
};

export default DepartmentsPage; 