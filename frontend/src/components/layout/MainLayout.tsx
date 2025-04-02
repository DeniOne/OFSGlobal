import React, { useState } from 'react';
import { useNavigate, Outlet } from 'react-router-dom';
import {
  Box,
  CssBaseline,
  IconButton,
  Tooltip,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import TopBar from './TopBar';
import MenuListItems from './MenuListItems';

// Стилизованные компоненты в стиле Cryptonite
const SidebarContainer = styled(Box)<{ isCollapsed: boolean }>(({ theme, isCollapsed }) => ({
  width: isCollapsed ? 80 : 280,
  backgroundColor: '#1A1A20', // Темный фон как на скриншоте Cryptonite
  position: 'relative',
  overflowY: 'auto',
  display: 'flex',
  flexDirection: 'column',
  transition: 'width 0.3s ease-in-out',
  zIndex: 10, // Добавлено: обеспечивает, что сайдбар всегда будет поверх контента
  '&::after': {
    content: '""',
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: '1px',
    background: 'linear-gradient(to bottom, transparent, rgba(157, 106, 245, 0.3), transparent)',
    opacity: 0.8,
  },
  '&::-webkit-scrollbar': {
    width: '4px',
  },
  '&::-webkit-scrollbar-track': {
    background: 'rgba(0,0,0,0.2)',
  },
  '&::-webkit-scrollbar-thumb': {
    background: 'rgba(157, 106, 245, 0.5)',
    borderRadius: '2px',
  },
  '&::-webkit-scrollbar-thumb:hover': {
    background: 'rgba(157, 106, 245, 0.7)',
    boxShadow: '0 0 6px rgba(157, 106, 245, 0.5)',
  },
}));

const Logo = styled('img')<{ isCollapsed?: boolean }>(({ isCollapsed }) => ({
  height: isCollapsed ? '35px' : '40px',
  width: isCollapsed ? '35px' : 'auto',
  margin: isCollapsed ? '25px auto 20px' : '25px auto 30px',
  display: 'block',
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  objectFit: isCollapsed ? 'contain' : 'unset',
  filter: 'drop-shadow(0 0 5px rgba(157, 106, 245, 0.3))',
  '&:hover': {
    transform: 'scale(1.05)',
    filter: 'drop-shadow(0 0 8px rgba(157, 106, 245, 0.5))',
  },
}));

const MainContainer = styled(Box)(({ theme }) => ({
  flex: 1,
  padding: theme.spacing(3),
  backgroundColor: '#121215',
  overflow: 'auto',
  position: 'relative',
  marginTop: 0, // Нет необходимости в отступе, так как верхняя панель не занимает места
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'radial-gradient(circle at 10% 10%, rgba(20, 20, 35, 0.9) 0%, rgba(10, 10, 18, 0.95) 100%)',
    zIndex: -2,
  },
  '&::-webkit-scrollbar': {
    width: '6px',
  },
  '&::-webkit-scrollbar-track': {
    background: 'rgba(0,0,0,0.2)',
  },
  '&::-webkit-scrollbar-thumb': {
    background: 'rgba(157, 106, 245, 0.5)',
    borderRadius: '3px',
  },
  '&::-webkit-scrollbar-thumb:hover': {
    background: 'rgba(157, 106, 245, 0.7)',
    boxShadow: '0 0 6px rgba(157, 106, 245, 0.5)',
  },
}));

const ToggleButton = styled(IconButton)(({ theme }) => ({
  position: 'absolute',
  right: -12,
  top: '50%',
  transform: 'translateY(-50%)',
  zIndex: 1000, // Большое значение z-index, чтобы кнопка была всегда поверх
  backgroundColor: 'rgba(32, 32, 36, 0.95)',
  border: '1px solid rgba(157, 106, 245, 0.6)',
  color: '#9D6AF5',
  width: 24,
  height: 24,
  padding: 0,
  transition: 'all 0.3s ease',
  boxShadow: '0 0 5px rgba(157, 106, 245, 0.5)',
  '&:hover': {
    backgroundColor: 'rgba(40, 40, 48, 0.95)',
    transform: 'translateY(-50%) scale(1.1)',
    boxShadow: '0 0 10px rgba(157, 106, 245, 0.7)',
  },
  '& .MuiSvgIcon-root': {
    fontSize: '1rem',
    filter: 'drop-shadow(0 0 3px rgba(157, 106, 245, 0.9))',
  },
}));

interface MainLayoutProps {
  children?: React.ReactNode;
}

interface LogoProps {
  isCollapsed?: boolean;
  src: string;
  alt: string;
  onClick: () => void;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <Box sx={{ display: 'flex', height: '100vh' }}>
      <CssBaseline />
      
      {/* Боковое меню */}
      <SidebarContainer isCollapsed={isCollapsed}>
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <Logo
            isCollapsed={isCollapsed}
            src={isCollapsed ? "/images/logo-icon.png" : "/images/Logo_NEW2.png"}
            alt="Photomatrix"
            onClick={() => navigate('/')}
          />
        </Box>
        
        {/* Используем компонент MenuListItems */}
        <MenuListItems isCollapsed={isCollapsed} />
        
        {/* Кнопка переключения вынесена за пределы Box, чтобы не мешать логотипу */}
        <Tooltip title={isCollapsed ? "Развернуть меню" : "Свернуть меню"} placement="right">
          <ToggleButton onClick={toggleSidebar} aria-label="toggle sidebar">
            {isCollapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
          </ToggleButton>
        </Tooltip>
      </SidebarContainer>
      
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative' }}>
        {/* Верхняя панель теперь абсолютно позиционирована и не занимает места в потоке */}
        <TopBar />
        
        {/* Основной контент занимает все доступное пространство */}
        <MainContainer>
          {/* Используем Outlet из react-router для рендеринга вложенных маршрутов */}
          <Outlet />
        </MainContainer>
      </Box>
    </Box>
  );
};

export default MainLayout;