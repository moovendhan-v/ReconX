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

                  {/* Protected dashboard routes with lazy loading */}
                  <Route
                    path="/dashboard"
                    element={
                      <ProtectedRoute>
                        <LazyWrapper>
                          <Dashboard />
                        </LazyWrapper>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/dashboard/graphql"
                    element={
                      <ProtectedRoute>
                        <LazyWrapper>
                          <DashboardGraphQL />
                        </LazyWrapper>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/dashboard/cves"
                    element={
                      <ProtectedRoute>
                        <LazyWrapper>
                          <CVEList />
                        </LazyWrapper>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/dashboard/cves-graphql"
                    element={
                      <ProtectedRoute>
                        <LazyWrapper>
                          <CVEListGraphQL />
                        </LazyWrapper>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/dashboard/cves/:id"
                    element={
                      <ProtectedRoute>
                        <LazyWrapper>
                          <CVEDetail />
                        </LazyWrapper>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/dashboard/pocs"
                    element={
                      <ProtectedRoute>
                        <LazyWrapper>
                          <POCs />
                        </LazyWrapper>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/dashboard/pocs/new"
                    element={
                      <ProtectedRoute>
                        <LazyWrapper>
                          <CreatePOC />
                        </LazyWrapper>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/dashboard/scans"
                    element={
                      <ProtectedRoute>
                        <LazyWrapper>
                          <Scans />
                        </LazyWrapper>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/dashboard/quick-scan"
                    element={
                      <ProtectedRoute>
                        <LazyWrapper>
                          <QuickScan />
                        </LazyWrapper>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/dashboard/reports"
                    element={
                      <ProtectedRoute>
                        <LazyWrapper>
                          <Reports />
                        </LazyWrapper>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/dashboard/processes"
                    element={
                      <ProtectedRoute>
                        <LazyWrapper>
                          <Processes />
                        </LazyWrapper>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/dashboard/projects"
                    element={
                      <ProtectedRoute>
                        <LazyWrapper>
                          <Projects />
                        </LazyWrapper>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/dashboard/activity"
                    element={
                      <ProtectedRoute>
                        <LazyWrapper>
                          <Activity />
                        </LazyWrapper>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/dashboard/analytics"
                    element={
                      <ProtectedRoute>
                        <LazyWrapper>
                          <Analytics />
                        </LazyWrapper>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/dashboard/settings"
                    element={
                      <ProtectedRoute>
                        <LazyWrapper>
                          <Settings />
                        </LazyWrapper>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/dashboard/team"
                    element={
                      <ProtectedRoute>
                        <LazyWrapper>
                          <Team />
                        </LazyWrapper>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/dashboard/help"
                    element={
                      <ProtectedRoute>
                        <LazyWrapper>
                          <Help />
                        </LazyWrapper>
                      </ProtectedRoute>
                    }
                  />

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
