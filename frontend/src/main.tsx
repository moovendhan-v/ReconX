import React, { lazy } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ApolloProvider } from '@apollo/client/react';
import { ThemeProvider } from './components/theme-provider';
import { ErrorBoundary } from './components/error-boundary';
import { SkipLinks } from './components/accessibility/skip-links';
import { FocusIndicator } from './components/accessibility/focus-indicator';
import { LazyWrapper } from './components/lazy-loading/lazy-wrapper';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { DashboardLayoutWrapper } from './components/dashboard/dashboard-layout-wrapper';
import { apolloClient } from './lib/apollo-client';
import './index.css';

// Lazy load pages for better performance
const Dashboard = lazy(() => import('./pages/Dashboard'));
const DashboardGraphQL = lazy(() => import('./pages/DashboardGraphQL'));
const CVEList = lazy(() => import('./pages/CVEList'));
const CVEListGraphQL = lazy(() => import('./pages/CVEListGraphQL'));
const CVEDetail = lazy(() => import('./pages/CVEDetail'));
const Analytics = lazy(() => import('./pages/Analytics'));
const POCs = lazy(() => import('./pages/POCs'));
const CreatePOC = lazy(() => import('./pages/CreatePOC'));
const Scans = lazy(() => import('./pages/Scans'));
const ScanDetail = lazy(() => import('./pages/ScanDetail'));
const QuickScan = lazy(() => import('./pages/QuickScan'));
const Reports = lazy(() => import('./pages/Reports'));
const Processes = lazy(() => import('./pages/Processes'));
const Projects = lazy(() => import('./pages/Projects'));
const Activity = lazy(() => import('./pages/Activity'));
const Settings = lazy(() => import('./pages/Settings'));
const Team = lazy(() => import('./pages/Team'));
const Help = lazy(() => import('./pages/Help'));

// Auth pages
const LoginPage = lazy(() => import('./pages/auth/LoginPage'));
const SignupPage = lazy(() => import('./pages/auth/SignupPage'));

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <ApolloProvider client={apolloClient}>
        <AuthProvider>
          <ThemeProvider defaultTheme="dark" storageKey="reconx-ui-theme">
            <BrowserRouter>
              <SkipLinks />
              <FocusIndicator />
              <ErrorBoundary>
                <Routes>
                  {/* Auth routes */}
                  <Route
                    path="/login"
                    element={
                      <LazyWrapper>
                        <LoginPage />
                      </LazyWrapper>
                    }
                  />
                  <Route
                    path="/signup"
                    element={
                      <LazyWrapper>
                        <SignupPage />
                      </LazyWrapper>
                    }
                  />

                  {/* Redirect root to dashboard or login */}
                  <Route path="/" element={<Navigate to="/dashboard" replace />} />

                  {/* Protected dashboard routes with persistent layout */}
                  <Route
                    path="/dashboard"
                    element={
                      <ProtectedRoute>
                        <DashboardLayoutWrapper />
                      </ProtectedRoute>
                    }
                  >
                    {/* Nested routes - content will render in <Outlet /> */}
                    <Route index element={<LazyWrapper><Dashboard /></LazyWrapper>} />
                    <Route path="graphql" element={<LazyWrapper><DashboardGraphQL /></LazyWrapper>} />
                    <Route path="cves" element={<LazyWrapper><CVEListGraphQL /></LazyWrapper>} />
                    <Route path="cves/:id" element={<LazyWrapper><CVEDetail /></LazyWrapper>} />
                    <Route path="pocs" element={<LazyWrapper><POCs /></LazyWrapper>} />
                    <Route path="pocs/new" element={<LazyWrapper><CreatePOC /></LazyWrapper>} />
                    <Route path="scans" element={<LazyWrapper><Scans /></LazyWrapper>} />
                    <Route path="scans/:id" element={<LazyWrapper><ScanDetail /></LazyWrapper>} />
                    <Route path="quick-scan" element={<LazyWrapper><QuickScan /></LazyWrapper>} />
                    <Route path="reports" element={<LazyWrapper><Reports /></LazyWrapper>} />
                    <Route path="processes" element={<LazyWrapper><Processes /></LazyWrapper>} />
                    <Route path="projects" element={<LazyWrapper><Projects /></LazyWrapper>} />
                    <Route path="activity" element={<LazyWrapper><Activity /></LazyWrapper>} />
                    <Route path="analytics" element={<LazyWrapper><Analytics /></LazyWrapper>} />
                    <Route path="settings" element={<LazyWrapper><Settings /></LazyWrapper>} />
                    <Route path="team" element={<LazyWrapper><Team /></LazyWrapper>} />
                    <Route path="help" element={<LazyWrapper><Help /></LazyWrapper>} />
                  </Route>

                  {/* Legacy routes for backward compatibility */}
                  <Route path="/cves" element={<Navigate to="/dashboard/cves" replace />} />
                  <Route path="/cves/:id" element={<Navigate to="/dashboard/cves/:id" replace />} />
                </Routes>
              </ErrorBoundary>
            </BrowserRouter>
          </ThemeProvider>
        </AuthProvider>
      </ApolloProvider>
    </ErrorBoundary>
  </React.StrictMode>,
);
