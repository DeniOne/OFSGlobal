import React from "react";
import { Route, Routes } from "react-router-dom";
import ProtectedRoute from "../components/auth/ProtectedRoute";
import DashboardPage from "../pages/DashboardPage";
import LoginPage from "../pages/LoginPage";
import UsersPage from "../pages/UsersPage";
import OrganizationsPage from "../pages/OrganizationsPage";
import OrganizationDetailsPage from "../pages/OrganizationDetailsPage";
import StaffPage from "../pages/StaffPage";
import StaffFormPage from "../pages/StaffFormPage";
import FunctionalRelationsPage from "../pages/FunctionalRelationsPage";
import OrganizationStructurePage from "../pages/OrganizationStructurePage";
import PositionsPage from "../pages/PositionsPage";
import DivisionsPage from "../pages/DivisionsPage";

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/users"
        element={
          <ProtectedRoute>
            <UsersPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/organizations"
        element={
          <ProtectedRoute>
            <OrganizationsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/organizations/:id"
        element={
          <ProtectedRoute>
            <OrganizationDetailsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/staff"
        element={
          <ProtectedRoute>
            <StaffPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/staff/new"
        element={
          <ProtectedRoute>
            <StaffFormPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/staff/:id/edit"
        element={
          <ProtectedRoute>
            <StaffFormPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/functional-relations"
        element={
          <ProtectedRoute>
            <FunctionalRelationsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/organization-structure"
        element={
          <ProtectedRoute>
            <OrganizationStructurePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/positions"
        element={
          <ProtectedRoute>
            <PositionsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/divisions"
        element={
          <ProtectedRoute>
            <DivisionsPage />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
};

export default AppRoutes; 