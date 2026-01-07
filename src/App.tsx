// ============================================
// Enterprise Frontend Application
// Main App Component with Routing
// ============================================

import { lazy, Suspense } from 'react';
import { Provider } from 'react-redux';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { store } from '@/app/store';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { MainLayout, ProtectedRoute } from '@/components/layout';
import { ErrorBoundary, LoadingSpinner } from '@/components/common';

// Lazy loaded pages for code splitting
const LoginPage = lazy(() => import('@/pages/LoginPage'));
const DashboardPage = lazy(() => import('@/pages/DashboardPage'));
const UsersPage = lazy(() => import('@/pages/UsersPage'));
const ProductsPage = lazy(() => import('@/pages/ProductsPage'));
const ReportsPage = lazy(() => import('@/pages/ReportsPage'));
const SettingsPage = lazy(() => import('@/pages/SettingsPage'));
const NotFound = lazy(() => import('@/pages/NotFound'));

const App = () => (
  <Provider store={store}>
    <TooltipProvider>
      <ErrorBoundary>
        <BrowserRouter>
          <Suspense fallback={<LoadingSpinner fullScreen text="Loading..." />}>
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<LoginPage />} />
              
              {/* Protected Routes with Layout */}
              <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/users" element={
                  <ProtectedRoute allowedRoles={['admin', 'manager']}>
                    <UsersPage />
                  </ProtectedRoute>
                } />
                <Route path="/products" element={<ProductsPage />} />
                <Route path="/reports" element={
                  <ProtectedRoute allowedRoles={['admin', 'manager']}>
                    <ReportsPage />
                  </ProtectedRoute>
                } />
                <Route path="/settings" element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <SettingsPage />
                  </ProtectedRoute>
                } />
              </Route>
              
              {/* Redirects */}
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
        <Toaster />
      </ErrorBoundary>
    </TooltipProvider>
  </Provider>
);

export default App;
