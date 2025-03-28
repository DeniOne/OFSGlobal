import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  AppBar,
  Box,
  CssBaseline,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  Button,
  Avatar
} from '@mui/material';
import {
  Menu as MenuIcon,
  AccountTree as AccountTreeIcon,
  People as PeopleIcon,
  Business as BusinessIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
  Dashboard as DashboardIcon,
  SwapVert as SwapVertIcon,
  Work as WorkIcon,
  DomainAdd as DomainAddIcon
} from '@mui/icons-material';
import './MainLayout.css';

const drawerWidth = 240;

// Пункты основного меню
const menuItems = [
  {
    text: "Дашборд",
    icon: <DashboardIcon />,
    path: "/",
  },
  {
    text: "Пользователи",
    icon: <PeopleIcon />,
    path: "/users",
  },
  {
    text: "Локации",
    icon: <BusinessIcon />,
    path: "/organizations",
  },
  {
    text: "Отделы",
    icon: <DomainAddIcon />,
    path: "/departments",
  },
  {
    text: "Должности",
    icon: <WorkIcon />,
    path: "/positions",
  },
  {
    text: "Сотрудники",
    icon: <PeopleIcon />,
    path: "/employees",
  },
  {
    text: "Функциональные связи",
    icon: <SwapVertIcon />,
    path: "/functional-relations",
  },
  {
    text: "Организационная структура",
    icon: <AccountTreeIcon />,
    path: "/organization-structure",
  },
];

// Пункты нижнего меню
const bottomMenuItems = [
  { name: 'Настройки', path: '/settings', icon: <SettingsIcon /> },
  { name: 'Выход', path: '/logout', icon: <LogoutIcon /> }
];

interface MenuListItemsProps {
  onItemClick: (path: string) => void;
}

const MenuListItems: React.FC<MenuListItemsProps> = ({ onItemClick }) => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <List>
      {menuItems.map((item) => (
        <ListItem 
          key={item.path} 
          disablePadding
          sx={{ display: 'block' }}
          onClick={() => {
            navigate(item.path);
            if (onItemClick) onItemClick(item.path);
          }}
        >
          <ListItemButton
            selected={location.pathname === item.path}
            sx={{
              minHeight: 48,
              justifyContent: 'initial',
              px: 2.5,
            }}
          >
            <ListItemIcon
              sx={{
                minWidth: 0,
                mr: 2,
                justifyContent: 'center',
              }}
            >
              {item.icon}
            </ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItemButton>
        </ListItem>
      ))}
    </List>
  );
};

const MainLayout: React.FC = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  
  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };
  
  const handleMenuClick = (path: string) => {
    navigate(path);
    setMobileOpen(false);
  };
  
  // Определение активного пункта меню
  const isActiveItem = (path: string) => {
    return location.pathname === path;
  };
  
  // Содержимое бокового меню
  const drawer = (
    <div>
      <Toolbar className="drawer-header">
        <Avatar src="/logo.svg" alt="OFS Global" className="drawer-logo" />
        <Typography variant="h6" noWrap component="div">
          OFS Global
        </Typography>
      </Toolbar>
      <Divider />
      <MenuListItems onItemClick={handleMenuClick} />
      <Divider />
      <List className="bottom-menu">
        {bottomMenuItems.map((item) => (
          <ListItem key={item.name} disablePadding>
            <ListItemButton onClick={() => handleMenuClick(item.path)}>
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.name} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </div>
  );
  
  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            {/* Заголовок текущей страницы */}
            {menuItems.find(item => isActiveItem(item.path))?.text || 'OFS Global'}
          </Typography>
          <Button color="inherit">
            Профиль
          </Button>
        </Toolbar>
      </AppBar>
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
        aria-label="mailbox folders"
      >
        {/* Мобильная версия ящика */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Лучшая производительность на мобильных устройствах
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
        >
          {drawer}
        </Drawer>
        {/* Постоянная версия ящика */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{ flexGrow: 1, p: 0, width: { sm: `calc(100% - ${drawerWidth}px)` } }}
      >
        <Toolbar />
        {/* Содержимое страницы будет отображаться здесь через Outlet */}
        <Outlet />
      </Box>
    </Box>
  );
};

export default MainLayout; 