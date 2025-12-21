import React, { lazy } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ApolloProvider } from '@apollo/client/react';
import { ThemeProvider } from './components/theme-provider';
import { ErrorBoundary } from './components/error-boundary';
import { SkipLinks } from './components/accessibility/skip-links';
import { FocusIndicator } from './components/accessibility/focus-indicator';
import { LazyWrapper } from './components/lazy-loading/lazy-wrapper';
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

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <ApolloProvider client={apolloClient}>
        <ThemeProvider defaultTheme="dark" storageKey="reconx-ui-theme">
          <BrowserRouter>
            <SkipLinks />
            <FocusIndicator />
            <ErrorBoundary>
              <Routes>
                {/* Redirect root to dashboard */}
                <Route path="/" element={<Navigate to="/dashboard" replace />} />

                {/* Dashboard routes with lazy loading */}
                <Route
                  path="/dashboard"
                  element={
                    <LazyWrapper>
                      <Dashboard />
                    </LazyWrapper>
                  }
                />
                <Route
                  path="/dashboard/graphql"
                  element={
                    <LazyWrapper>
                      <DashboardGraphQL />
                    </LazyWrapper>
                  }
                />
                <Route
                  path="/dashboard/cves"
                  element={
                    <LazyWrapper>
                      <CVEList />
                    </LazyWrapper>
                  }
                />
                <Route
                  path="/dashboard/cves-graphql"
                  element={
                    <LazyWrapper>
                      <CVEListGraphQL />
                    </LazyWrapper>
                  }
                />
                <Route
                  path="/dashboard/cves/:id"
                  element={
                    <LazyWrapper>
                      <CVEDetail />
                    </LazyWrapper>
                  }
                />
                <Route
                  path="/dashboard/pocs"
                  element={
                    <LazyWrapper>
                      <POCs />
                    </LazyWrapper>
                  }
                />
                <Route
                  path="/dashboard/pocs/new"
                  element={
                    <LazyWrapper>
                      <CreatePOC />
                    </LazyWrapper>
                  }
                />
                <Route
                  path="/dashboard/scans"
                  element={
                    <LazyWrapper>
                      <Scans />
                    </LazyWrapper>
                  }
                />
                <Route
                  path="/dashboard/quick-scan"
                  element={
                    <LazyWrapper>
                      <QuickScan />
                    </LazyWrapper>
                  }
                />
                <Route
                  path="/dashboard/reports"
                  element={
                    <LazyWrapper>
                      <Reports />
                    </LazyWrapper>
                  }
                />
                <Route
                  path="/dashboard/processes"
                  element={
                    <LazyWrapper>
                      <Processes />
                    </LazyWrapper>
                  }
                />
                <Route
                  path="/dashboard/projects"
                  element={
                    <LazyWrapper>
                      <Projects />
                    </LazyWrapper>
                  }
                />
                <Route
                  path="/dashboard/activity"
                  element={
                    <LazyWrapper>
                      <Activity />
                    </LazyWrapper>
                  }
                />
                <Route
                  path="/dashboard/analytics"
                  element={
                    <LazyWrapper>
                      <Analytics />
                    </LazyWrapper>
                  }
                />
                <Route
                  path="/dashboard/settings"
                  element={
                    <LazyWrapper>
                      <Settings />
                    </LazyWrapper>
                  }
                />
                <Route
                  path="/dashboard/team"
                  element={
                    <LazyWrapper>
                      <Team />
                    </LazyWrapper>
                  }
                />
                <Route
                  path="/dashboard/help"
                  element={
                    <LazyWrapper>
                      <Help />
                    </LazyWrapper>
                  }
                />

                {/* Legacy routes for backward compatibility */}
                <Route path="/cves" element={<Navigate to="/dashboard/cves" replace />} />
                <Route path="/cves/:id" element={<Navigate to="/dashboard/cves/:id" replace />} />
              </Routes>
            </ErrorBoundary>
          </BrowserRouter>
        </ThemeProvider>
      </ApolloProvider>
    </ErrorBoundary>
  </React.StrictMode>,
);
