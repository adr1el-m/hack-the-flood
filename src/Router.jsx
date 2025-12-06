import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LanguageProvider } from './LanguageContext';
import DashboardLayout from './components/DashboardLayout';
import VisualsPage from './pages/VisualsPage';
import TablePage from './pages/TablePage';
import ContractorsPage from './pages/ContractorsPage';
import MapPage from './pages/MapPage';
import CommunityFeed from './pages/CommunityFeed';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import App from './App';

export default function Router() {
  return (
    <LanguageProvider>
      <BrowserRouter>
        <Routes>
          {/* Home & Report Flow */}
          <Route path="/" element={<App />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          
          {/* Dashboard Routes */}
          <Route path="/dashboard" element={<DashboardLayout><VisualsPage /></DashboardLayout>} />
          <Route path="/dashboard/visual" element={<DashboardLayout><VisualsPage /></DashboardLayout>} />
          <Route path="/dashboard/table" element={<DashboardLayout><TablePage /></DashboardLayout>} />
          <Route path="/dashboard/contractors" element={<DashboardLayout><ContractorsPage /></DashboardLayout>} />
          <Route path="/dashboard/map" element={<DashboardLayout><MapPage /></DashboardLayout>} />
          <Route path="/community" element={<CommunityFeed />} />
          
          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </LanguageProvider>
  );
}
