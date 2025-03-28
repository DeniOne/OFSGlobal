import React from 'react';
import { Container, Box, Typography, Paper } from '@mui/material';
import DivisionList from '../../components/divisions/DivisionList';

const DivisionsPage: React.FC = () => {
  return (
    <Container maxWidth="xl">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Структура организации
        </Typography>
        <Typography variant="subtitle1" gutterBottom color="text.secondary">
          Управление отделами, департаментами и подразделениями
        </Typography>
        
        <Paper sx={{ p: 3, mt: 3 }}>
          <DivisionList />
        </Paper>
      </Box>
    </Container>
  );
};

export default DivisionsPage; 