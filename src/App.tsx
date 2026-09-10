import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { PublicHomePage } from './pages/PublicHomePage';
import { AdminRouteHandler } from './pages/AdminRouteHandler';

/**
 * Route Sync Helper:
 * If user accesses hash-based URL (e.g. /#/mbh-admin or /#/mhb-admin in an iframe or preview tab),
 * smoothly syncs to standard browser path.
 */
function HashRouteSync() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (window.location.hash.startsWith('#/mbh-admin') || window.location.hash.startsWith('#/mhb-admin')) {
      const targetPath = window.location.hash.slice(1);
      navigate(targetPath, { replace: true });
    }
  }, [navigate, location]);

  return null;
}

export default function App() {
  return (
    <BrowserRouter>
      <HashRouteSync />
      <Routes>
        {/* Public Homepage:
            Strictly NO admin buttons, NO admin links in footer/navbar, NO mentions anywhere. */}
        <Route path="/" element={<PublicHomePage />} />

        {/* MBH Admin Routes (Primary) */}
        <Route path="/mbh-admin/login" element={<AdminRouteHandler mode="login" />} />
        <Route path="/mbh-admin" element={<AdminRouteHandler mode="dashboard" />} />
        <Route path="/mbh-admin/*" element={<AdminRouteHandler mode="dashboard" />} />

        {/* Backward Compatibility for /mhb-admin */}
        <Route path="/mhb-admin/login" element={<AdminRouteHandler mode="login" />} />
        <Route path="/mhb-admin" element={<AdminRouteHandler mode="dashboard" />} />
        <Route path="/mhb-admin/*" element={<AdminRouteHandler mode="dashboard" />} />

        {/* Fallback to Public Homepage */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
