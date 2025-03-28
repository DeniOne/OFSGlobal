import React from 'react';
import { Box, Typography, Paper, Breadcrumbs, Link } from '@mui/material';
import { Home as HomeIcon, AccountTree as AccountTreeIcon } from '@mui/icons-material';
import FunctionalRelationList from '../components/functional_relations/FunctionalRelationList';
import './FunctionalRelationsPage.css';

const FunctionalRelationsPage: React.FC = () => {
  return (
    <Box className="functional-relations-page">
      <Paper className="page-header">
        <Typography variant="h4" component="h1">
          Управление функциональными связями
        </Typography>
        
        <Breadcrumbs aria-label="breadcrumb">
          <Link 
            underline="hover"
            color="inherit" 
            href="/"
            sx={{ display: 'flex', alignItems: 'center' }}
          >
            <HomeIcon sx={{ mr: 0.5 }} fontSize="inherit" />
            Главная
          </Link>
          <Typography
            sx={{ display: 'flex', alignItems: 'center' }}
            color="text.primary"
          >
            <AccountTreeIcon sx={{ mr: 0.5 }} fontSize="inherit" />
            Управление функциональными связями
          </Typography>
        </Breadcrumbs>
      </Paper>
      
      <Paper className="page-content">
        <FunctionalRelationList />
      </Paper>
    </Box>
  );
};

export default FunctionalRelationsPage; 