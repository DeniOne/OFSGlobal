import React from 'react';
import { Routes, Route, BrowserRouter, Navigate, Outlet } from 'react-router-dom';
import { Box } from '@mui/material';
import './styles/App.css';

import MainLayout from './components/layout/MainLayout';
import LandingPage from './pages/LandingPage';
import OrganizationStructurePage from './pages/OrganizationStructurePage';
import FunctionalRelationsPage from './pages/FunctionalRelationsPage';
import DivisionsPage from './pages/divisions/DivisionsPage';
import PositionsPage from './pages/positions/PositionsPage';
import StaffList from './components/staff/StaffList';
import StaffForm from './components/staff/StaffForm';
import ProtectedRoute from './components/auth/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

// Новые страницы для новой структуры ОФС
import DashboardPage from './pages/DashboardPage';
import TelegramBotPage from './pages/TelegramBotPage';
import NotFoundPage from './pages/NotFoundPage';

// Новые страницы администрирования с использованием роутера
import AdminOrganizationsPage from './pages/AdminOrganizationsPage';
import AdminStaffPage from './pages/AdminStaffPage';
import AdminDivisionsPage from './pages/AdminDivisionsPage';
import AdminPositionsPage from './pages/AdminPositionsPage';
import AdminFunctionalRelationsPage from './pages/AdminFunctionalRelationsPage';

// Placeholder компоненты для других страниц
function Reports() { return <div>Reports Page</div>; }
function Profile() { return <div>Profile Page</div>; }
function Settings() { return <div>Settings Page</div>; }

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/landing" element={<LandingPage />} />
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          <Route path="telegram-bot" element={<ProtectedRoute><TelegramBotPage /></ProtectedRoute>} />
          <Route path="organization-structure">
            <Route index element={<Navigate to="/organization-structure/business" replace />} />
            <Route path="business" element={<ProtectedRoute><OrganizationStructurePage /></ProtectedRoute>} />
            <Route path="legal" element={<ProtectedRoute><OrganizationStructurePage /></ProtectedRoute>} />
            <Route path="territorial" element={<ProtectedRoute><OrganizationStructurePage /></ProtectedRoute>} />
          </Route>
          <Route path="functional-relations" element={<ProtectedRoute><FunctionalRelationsPage /></ProtectedRoute>} />
          
          {/* Новая структура роутов для администрирования */}
          <Route path="admin">
            {/* Редирект с корневого пути admin на страницу организаций */}
            <Route index element={<Navigate to="/admin/organizations" replace />} />
            <Route path="organizations" element={<ProtectedRoute><AdminOrganizationsPage /></ProtectedRoute>} />
            <Route path="divisions" element={<ProtectedRoute><AdminDivisionsPage /></ProtectedRoute>} />
            <Route path="positions" element={<ProtectedRoute><AdminPositionsPage /></ProtectedRoute>} />
            <Route path="staff" element={<ProtectedRoute><AdminStaffPage /></ProtectedRoute>} />
            <Route path="functional-relations" element={<ProtectedRoute><AdminFunctionalRelationsPage /></ProtectedRoute>} />
          </Route>
          
          {/* Старый роут - оставляем для обратной совместимости, но редиректим на новую страницу */}
          <Route path="admin-database" element={<Navigate to="/admin/organizations" replace />} />
          
          <Route path="profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
          <Route path="staff">
            <Route index element={<ProtectedRoute><StaffList /></ProtectedRoute>} />
            <Route path="new" element={<ProtectedRoute><StaffForm /></ProtectedRoute>} />
            <Route path=":id" element={<ProtectedRoute><StaffForm /></ProtectedRoute>} />
            <Route path="profiles" element={<ProtectedRoute><StaffList /></ProtectedRoute>} />
            <Route path="competencies" element={<ProtectedRoute><div>Компетенции сотрудников</div></ProtectedRoute>} />
            <Route path="training" element={<ProtectedRoute><div>Обучение сотрудников</div></ProtectedRoute>} />
            <Route path="achievements" element={<ProtectedRoute><div>Достижения сотрудников</div></ProtectedRoute>} />
          </Route>
          <Route path="reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
          <Route path="divisions" element={<ProtectedRoute><DivisionsPage /></ProtectedRoute>} />
          <Route path="positions" element={<ProtectedRoute><PositionsPage /></ProtectedRoute>} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App; 