import React from "react";
import { Route, Routes } from "react-router-dom";
import ProtectedRoute from "../components/auth/ProtectedRoute";
import DashboardPage from "../pages/DashboardPage";
import LoginPage from "../pages/LoginPage";
import UsersPage from "../pages/UsersPage";
import OrganizationsPage from "../pages/OrganizationsPage";
import OrganizationDetailsPage from "../pages/OrganizationDetailsPage";
import EmployeesPage from "../pages/EmployeesPage";
import EmployeeFormPage from "../pages/EmployeeFormPage";
import FunctionalRelationsPage from "../pages/FunctionalRelationsPage";
import OrganizationStructurePage from "../pages/OrganizationStructurePage";
import PositionsPage from "../pages/PositionsPage";
import DepartmentsPage from "../pages/DepartmentsPage";

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
            <EmployeesPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/staff/new"
        element={
          <ProtectedRoute>
            <EmployeeFormPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/staff/:id/edit"
        element={
          <ProtectedRoute>
            <EmployeeFormPage />
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
            <DepartmentsPage />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
};

export default AppRoutes; 