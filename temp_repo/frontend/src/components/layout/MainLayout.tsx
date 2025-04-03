import React, { useState } from 'react';
import { useNavigate, Outlet } from 'react-router-dom';
import { Layout, Button, Tooltip, Flex } from 'antd';
import { MenuFoldOutlined, MenuUnfoldOutlined } from '@ant-design/icons';
import TopBar from './TopBar';
import MenuListItems from './MenuListItems';

const { Sider, Content, Header } = Layout;

// Стили для логотипа (можно вынести в CSS)
const logoStyleBase: React.CSSProperties = {
  display: 'block',
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  filter: 'drop-shadow(0 0 5px rgba(157, 106, 245, 0.3))',
};

const logoStyleCollapsed: React.CSSProperties = {
  ...logoStyleBase,
  height: '35px',
  width: '35px',
  margin: '25px auto 20px',
  objectFit: 'contain',
};

const logoStyleExpanded: React.CSSProperties = {
  ...logoStyleBase,
  height: '40px',
  width: 'auto',
  margin: '25px auto 30px',
  objectFit: 'unset',
};

const logoHoverStyle: React.CSSProperties = {
  transform: 'scale(1.05)',
  filter: 'drop-shadow(0 0 8px rgba(157, 106, 245, 0.5))',
};

// Стили для основного контента (можно вынести в CSS)
const contentStyle: React.CSSProperties = {
  margin: '24px 16px',
  padding: 24,
  minHeight: 280, // Оставляем как есть или сделаем динамическим?
  background: '#121215', // Темный фон контента
  overflow: 'auto',
  position: 'relative', // Для псевдоэлементов, если они нужны
  // Добавим стили скроллбара, похожие на MUI
  scrollbarWidth: 'thin', /* Firefox */
  scrollbarColor: 'rgba(157, 106, 245, 0.5) rgba(0,0,0,0.2)', /* Firefox */
};

// Псевдоэлементы и стили скроллбара для Webkit лучше добавить через CSS-файл или styled-components
// Примерно так в CSS:
// .main-content::-webkit-scrollbar { width: 6px; }
// .main-content::-webkit-scrollbar-track { background: rgba(0,0,0,0.2); }
// .main-content::-webkit-scrollbar-thumb { background: rgba(157, 106, 245, 0.5); border-radius: 3px; }
// .main-content::-webkit-scrollbar-thumb:hover { background: rgba(157, 106, 245, 0.7); box-shadow: 0 0 6px rgba(157, 106, 245, 0.5); }

const MainLayout: React.FC = () => {
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isLogoHovered, setIsLogoHovered] = useState(false);

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const finalLogoStyle = isLogoHovered ? logoHoverStyle : {};

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        collapsible
        collapsed={isCollapsed}
        onCollapse={setIsCollapsed} // Упрощенный обработчик
        trigger={null} // Убираем стандартный триггер AntD
        width={280}
        collapsedWidth={80}
        theme="dark" // Используем темную тему AntD
        style={{
          background: '#1A1A20', // Фон сайдбара
          position: 'relative', // Для кастомной кнопки и разделителя
          overflow: 'auto', // Добавляем overflow для скролла меню
           // Добавим стили скроллбара, похожие на MUI
          scrollbarWidth: 'thin', /* Firefox */
          scrollbarColor: 'rgba(157, 106, 245, 0.5) rgba(0,0,0,0.2)', /* Firefox */
          // Для webkit лучше через CSS
          // '::-webkit-scrollbar': { width: '4px' },
          // '::-webkit-scrollbar-track': { background: 'rgba(0,0,0,0.2)' },
          // '::-webkit-scrollbar-thumb': { background: 'rgba(157, 106, 245, 0.5)', borderRadius: '2px' },
          // '::-webkit-scrollbar-thumb:hover': { background: 'rgba(157, 106, 245, 0.7)' },
        }}
      >
        {/* Кастомная кнопка для сворачивания */}
         <Tooltip title={isCollapsed ? "Развернуть" : "Свернуть"} placement="right">
            <Button
              type="primary"
              shape="circle"
              icon={isCollapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={toggleSidebar}
              style={{
                position: 'absolute',
                right: -12,
                top: '50%',
                transform: 'translateY(-50%)',
                zIndex: 1000,
                background: 'rgba(32, 32, 36, 0.95)',
                borderColor: 'rgba(157, 106, 245, 0.6)',
                color: '#9D6AF5',
                boxShadow: '0 0 5px rgba(157, 106, 245, 0.5)',
                width: 24,
                height: 24,
                minWidth: 24,
                padding: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                // Добавим hover эффект
                transition: 'all 0.3s ease',
              }}
              // Не совсем как в MUI, но близко
              onMouseEnter={(e) => {
                  const target = e.currentTarget as HTMLButtonElement;
                  target.style.background = 'rgba(40, 40, 48, 0.95)';
                  target.style.transform = 'translateY(-50%) scale(1.1)';
                  target.style.boxShadow = '0 0 10px rgba(157, 106, 245, 0.7)';
              }}
              onMouseLeave={(e) => {
                  const target = e.currentTarget as HTMLButtonElement;
                  target.style.background = 'rgba(32, 32, 36, 0.95)';
                  target.style.transform = 'translateY(-50%)';
                  target.style.boxShadow = '0 0 5px rgba(157, 106, 245, 0.5)';
              }}
            />
         </Tooltip>
         
         {/* Разделитель справа (псевдоэлемент лучше через CSS) */}
         <div style={{
            position: 'absolute',
            right: 0,
            top: 0,
            bottom: 0,
            width: '1px',
            background: 'linear-gradient(to bottom, transparent, rgba(157, 106, 245, 0.3), transparent)',
            opacity: 0.8,
            zIndex: 1, // Ниже кнопки
         }}></div>

        <Flex justify="center" align="middle" style={{ padding: '0 10px' }}>
          <img
            style={{
              ...(isCollapsed ? logoStyleCollapsed : logoStyleExpanded),
              ...finalLogoStyle
            }}
            src={isCollapsed ? "/images/logo-icon.png" : "/images/Logo_NEW2.png"}
            alt="Photomatrix Logo"
            onClick={() => navigate('/')}
            onMouseEnter={() => setIsLogoHovered(true)}
            onMouseLeave={() => setIsLogoHovered(false)}
          />
        </Flex>

        <MenuListItems isCollapsed={isCollapsed} />
      </Sider>

      <Layout>
        <Header
          style={{
            padding: 0,
            background: 'transparent',
            position: 'relative',
            height: 'auto',
          }}
        >
          <TopBar />
        </Header>
        <Content style={contentStyle} className="main-content">
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default MainLayout;