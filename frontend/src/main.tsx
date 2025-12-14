import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import CVEList from './pages/CVEList';
import CVEDetail from './pages/CVEDetail';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<CVEList />} />
        <Route path="/cves/:id" element={<CVEDetail />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
);
