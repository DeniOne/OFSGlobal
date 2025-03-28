import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './styles/App.css';

import MainLayout from './components/layout/MainLayout';
import LandingPage from './pages/LandingPage';
import OrganizationStructurePage from './pages/OrganizationStructurePage';
import FunctionalRelationsPage from './pages/FunctionalRelationsPage';

// Placeholder компоненты для других страниц
const Dashboard = () => <div className="placeholder-page">Dashboard Page</div>;
const Login = () => <div className="placeholder-page">Login Page</div>;
const Register = () => <div className="placeholder-page">Register Page</div>;
const Demo = () => <div className="placeholder-page">Demo Page</div>;
const About = () => <div className="placeholder-page">About Page</div>;
const Contact = () => <div className="placeholder-page">Contact Page</div>;
const Terms = () => <div className="placeholder-page">Terms Page</div>;
const NotFound = () => <div className="placeholder-page">404 Not Found</div>;
const Locations = () => <div className="placeholder-page">Locations Page</div>;
const Employees = () => <div className="placeholder-page">Employees Page</div>;
const Reports = () => <div className="placeholder-page">Reports Page</div>;
const Divisions = () => <div className="placeholder-page">Divisions Page</div>;

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<LandingPage />} />
          <Route path="organization-structure" element={<OrganizationStructurePage />} />
          <Route path="functional-relations" element={<FunctionalRelationsPage />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route path="demo" element={<Demo />} />
          <Route path="about" element={<About />} />
          <Route path="contact" element={<Contact />} />
          <Route path="terms" element={<Terms />} />
          <Route path="locations" element={<Locations />} />
          <Route path="employees" element={<Employees />} />
          <Route path="reports" element={<Reports />} />
          <Route path="divisions" element={<Divisions />} />
          <Route path="departments" element={<Navigate to="/divisions" replace />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </Router>
  );
};

export default App; 