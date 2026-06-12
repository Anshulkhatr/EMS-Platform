import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from '../components/guards/ProtectedRoute';
import DashboardLayout from '../components/layout/DashboardLayout';
import LoginPage from '../features/auth/LoginPage';
import ForgotPasswordPage from '../features/auth/ForgotPasswordPage';
import ResetPasswordPage from '../features/auth/ResetPasswordPage';
import Dashboard from '../features/dashboard/Dashboard';
import EmployeeList from '../features/employee/EmployeeList';
import PunchInOut from '../features/attendance/PunchInOut';
import LeaveRequestForm from '../features/leave/LeaveRequestForm';
import RolesManagement from '../features/settings/RolesManagement';
import DocumentVault from '../features/documents/DocumentVault';
import ReportsDashboard from '../features/reports/ReportsDashboard';
import JobBoard from '../features/jobs/JobBoard';
import DirectEmail from '../features/email/DirectEmail';
import LandingPage from '../features/landing/LandingPage';
import UnauthorizedPage from '../pages/UnauthorizedPage';
import AIAnalytics from '../features/dashboard/AIAnalytics';
import PayrollDashboard from '../features/payroll/PayrollDashboard';
import OrgChartPage from '../features/org-chart/OrgChartPage';
import ExpenseDashboard from '../features/expenses/ExpenseDashboard';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password/:resetToken" element={<ResetPasswordPage />} />
      <Route path="/unauthorized" element={<UnauthorizedPage />} />

      {/* Protected Routes */}
      <Route
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<Dashboard />} />
        
        <Route
          path="employees"
          element={
            <ProtectedRoute allowedRoles={['Admin', 'HR', 'Manager', 'Leadership', 'Employee']}>
              <EmployeeList />
            </ProtectedRoute>
          }
        />
        
        <Route path="attendance" element={<PunchInOut />} />
        <Route path="leaves" element={<LeaveRequestForm />} />
        <Route path="documents" element={<DocumentVault />} />
        <Route path="jobs" element={<JobBoard />} />
        <Route
          path="emails"
          element={
            <ProtectedRoute allowedRoles={['Admin', 'HR']}>
              <DirectEmail />
            </ProtectedRoute>
          }
        />
        <Route
          path="reports"
          element={
            <ProtectedRoute allowedRoles={['Admin', 'HR', 'Leadership', 'Manager']}>
              <ReportsDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="ai-analytics"
          element={
            <ProtectedRoute allowedRoles={['Admin', 'HR', 'Leadership', 'Manager']}>
              <AIAnalytics />
            </ProtectedRoute>
          }
        />
        <Route
          path="payroll"
          element={
            <ProtectedRoute allowedRoles={['Admin', 'HR', 'Employee', 'Manager', 'Leadership']}>
              <PayrollDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="org-chart"
          element={
            <ProtectedRoute allowedRoles={['Admin', 'HR', 'Manager', 'Leadership', 'Employee']}>
              <OrgChartPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="expenses"
          element={
            <ProtectedRoute allowedRoles={['Admin', 'HR', 'Manager', 'Leadership', 'Employee']}>
              <ExpenseDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="settings"
          element={
            <ProtectedRoute allowedRoles={['Admin', 'HR']}>
              <RolesManagement />
            </ProtectedRoute>
          }
        />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

export default AppRoutes;
