import React from 'react';
import { Container, Box, Typography, Paper } from '@mui/material';
import PositionList from '../../components/positions/PositionList';

const PositionsPage: React.FC = () => {
  return (
    <Container maxWidth="xl">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Должности
        </Typography>
        <Typography variant="subtitle1" gutterBottom color="text.secondary">
          Управление должностями и карьерными треками
        </Typography>
        
        <Paper sx={{ p: 3, mt: 3 }}>
          <PositionList />
        </Paper>
      </Box>
    </Container>
  );
};

export default PositionsPage; 