import React, { lazy } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ApolloProvider } from '@apollo/client';
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
                path="/dashboard/analytics" 
                element={
                  <LazyWrapper>
                    <Analytics />
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
