import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAdminAuth } from '../lib/adminAuth';
import { AdminLogin } from '../components/admin/AdminLogin';
import { AdminDashboard } from '../components/admin/AdminDashboard';
import { SeoHead } from '../components/SeoHead';
import { PAGE_SEO } from '../data/seoConfig';
import { ShieldCheck } from 'lucide-react';

interface AdminRouteHandlerProps {
  mode: 'login' | 'dashboard';
}

export function AdminRouteHandler({ mode }: AdminRouteHandlerProps) {
  const { adminUser, loading, refresh } = useAdminAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const adminBase = location.pathname.startsWith('/mhb-admin') ? '/mhb-admin' : '/mbh-admin';
  const adminSeo = (
    <SeoHead
      meta={{
        ...PAGE_SEO.home,
        path: location.pathname,
        title: 'Admin Portal | Mumbai Beatbox Hub',
        description: 'Authorized administration portal for Mumbai Beatbox Hub.',
        noindex: true,
      }}
    />
  );

  useEffect(() => {
    if (!loading) {
      if (mode === 'login' && adminUser) {
        // If already logged in with admin privileges, send to dashboard
        navigate(adminBase, { replace: true });
      } else if (mode === 'dashboard' && !adminUser) {
        // If not logged in as admin, send to login page
        navigate(`${adminBase}/login`, { replace: true });
      }
    }
  }, [loading, adminUser, mode, navigate, adminBase]);

  // Loading indicator with MBH styling
  if (loading) {
    return (
      <>
        {adminSeo}
        <div className="min-h-screen bg-[#14120F] text-[#F4EFE4] flex flex-col items-center justify-center font-mono">
          <div className="p-6 bg-[#1A1713] border border-[#FFC93C]/40 text-center space-y-4 max-w-sm">
            <div className="w-10 h-10 border-2 border-[#FFC93C] border-t-transparent animate-spin mx-auto" />
            <div className="inline-flex items-center gap-2 text-xs text-[#FFC93C] uppercase tracking-wider font-bold">
              <ShieldCheck className="w-4 h-4" />
              <span>Verifying Admin Authorization</span>
            </div>
            <p className="text-[11px] text-[#F4EFE4]/50">
              Validating Supabase Auth session token and admin role attributes...
            </p>
          </div>
        </div>
      </>
    );
  }

  // Render Login Screen
  if (mode === 'login') {
    if (adminUser) {
      return adminSeo; // Redirect will fire in useEffect
    }
    return (
      <>
        {adminSeo}
        <AdminLogin
          onLoginSuccess={async () => {
            await refresh();
            navigate(adminBase, { replace: true });
          }}
          onGoHome={() => navigate('/')}
        />
      </>
    );
  }

  // Render Dashboard Screen
  if (mode === 'dashboard') {
    if (!adminUser) {
      return adminSeo; // Redirect will fire in useEffect
    }
    return (
      <>
        {adminSeo}
        <AdminDashboard
          adminUser={adminUser}
          onLogout={async () => {
            await refresh();
            navigate(`${adminBase}/login`, { replace: true });
          }}
          onGoHome={() => navigate('/')}
        />
      </>
    );
  }

  return adminSeo;
}
