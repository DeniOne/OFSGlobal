import React from 'react';
import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  styled,
} from '@mui/material';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import ListIcon from '@mui/icons-material/List';

// Стили точно скопированы из MenuListItems.tsx
const NeomorphicButton = styled(ListItemButton)(({ theme }) => ({
  padding: theme.spacing(1.5, 2),
  marginBottom: theme.spacing(0.8),
  borderRadius: 12,
  backgroundColor: 'rgba(32, 32, 36, 0.9)',
  transition: 'all 0.25s ease',
  position: 'relative',
  boxShadow: '0 4px 8px rgba(0, 0, 0, 0.3)',
  border: '1px solid rgba(45, 45, 55, 0.9)',
  '&.Mui-selected': {
    backgroundColor: 'rgba(42, 42, 48, 0.95)',
    boxShadow: '0 6px 12px rgba(0, 0, 0, 0.4), 0 0 20px rgba(157, 106, 245, 0.3), inset 0 0 8px rgba(157, 106, 245, 0.2)',
    border: '1px solid rgba(157, 106, 245, 0.4)',
    transform: 'translateY(-2px)',
    '&::before': {
      content: '""',
      position: 'absolute',
      left: 0,
      top: 0,
      bottom: 0,
      width: '5px',
      background: 'linear-gradient(180deg, #9D6AF5, #b350ff)',
      borderRadius: '3px 0 0 3px',
      boxShadow: '0 0 15px 2px rgba(157, 106, 245, 0.7)',
      animation: 'pulse 2s infinite',
    },
    '&::after': {
      content: '""',
      position: 'absolute',
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
      borderRadius: 12,
      border: '1px solid rgba(157, 106, 245, 0.5)',
      opacity: 0.5,
      pointerEvents: 'none',
    },
  },
  '&:hover': {
    transform: 'translateY(-2px)',
    backgroundColor: 'rgba(38, 38, 44, 0.95)',
    boxShadow: '0 8px 16px rgba(0, 0, 0, 0.4), 0 0 10px rgba(157, 106, 245, 0.2)',
  },
  '@keyframes pulse': {
    '0%': {
      opacity: 0.7,
      boxShadow: '0 0 5px 2px rgba(157, 106, 245, 0.4)',
    },
    '50%': {
      opacity: 1,
      boxShadow: '0 0 15px 2px rgba(157, 106, 245, 0.7)',
    },
    '100%': {
      opacity: 0.7,
      boxShadow: '0 0 5px 2px rgba(157, 106, 245, 0.4)',
    },
  },
}));

const StyledListItemIcon = styled(ListItemIcon)(({ theme }) => ({
  minWidth: 40,
  '& .MuiSvgIcon-root': {
    fontSize: '1.3rem',
    color: '#9D6AF5',
    transition: 'all 0.25s ease',
  },
  '.Mui-selected & .MuiSvgIcon-root': {
    filter: 'drop-shadow(0 0 8px rgba(157, 106, 245, 0.7))',
    transform: 'scale(1.2)',
    color: '#b350ff',
  },
}));

const StyledListItemText = styled(ListItemText)(({ theme }) => ({
  '& .MuiListItemText-primary': {
    fontSize: '0.95rem',
    fontWeight: 400,
    color: '#fff',
    opacity: 0.85,
    transition: 'all 0.25s ease',
  },
  '.Mui-selected & .MuiListItemText-primary': {
    fontWeight: 500,
    opacity: 1,
    textShadow: '0 0 8px rgba(157, 106, 245, 0.6)',
  },
}));

interface OrgTreeControlsProps {
  displayMode: 'tree' | 'list';
  onDisplayModeChange: (mode: 'tree' | 'list') => void;
}

const OrgTreeControls: React.FC<OrgTreeControlsProps> = ({
  displayMode,
  onDisplayModeChange
}) => {
  return (
    <List sx={{ 
      display: 'flex', 
      flexDirection: 'row', 
      gap: '8px',
      marginBottom: 2,
      padding: 0,
      marginLeft: 1
    }}>
      <ListItem disablePadding sx={{ width: 'auto' }}>
        <NeomorphicButton 
          selected={displayMode === 'tree'} 
          onClick={() => onDisplayModeChange('tree')}
        >
          <StyledListItemIcon>
            <AccountTreeIcon />
          </StyledListItemIcon>
          <StyledListItemText primary="Дерево" />
        </NeomorphicButton>
      </ListItem>
      
      <ListItem disablePadding sx={{ width: 'auto' }}>
        <NeomorphicButton 
          selected={displayMode === 'list'} 
          onClick={() => onDisplayModeChange('list')}
        >
          <StyledListItemIcon>
            <ListIcon />
          </StyledListItemIcon>
          <StyledListItemText primary="Список" />
        </NeomorphicButton>
      </ListItem>
    </List>
  );
};

export default OrgTreeControls; 