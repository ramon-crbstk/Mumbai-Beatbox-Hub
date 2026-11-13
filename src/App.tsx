import React, { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { PublicHomePage } from './pages/PublicHomePage';
import { initAnalytics } from './lib/analytics';

// Lazy-load secondary routes & admin dashboard to minimize initial homepage JS bundle (LCP / INP)
const AdminRouteHandler = lazy(() =>
  import('./pages/AdminRouteHandler').then((m) => ({ default: m.AdminRouteHandler }))
);
const AboutPage = lazy(() =>
  import('./pages/SectionPages').then((m) => ({ default: m.AboutPage }))
);
const EventsPage = lazy(() =>
  import('./pages/SectionPages').then((m) => ({ default: m.EventsPage }))
);
const Championship2026Page = lazy(() =>
  import('./pages/SectionPages').then((m) => ({ default: m.Championship2026Page }))
);
const GalleryPage = lazy(() =>
  import('./pages/SectionPages').then((m) => ({ default: m.GalleryPage }))
);
const VideosPage = lazy(() =>
  import('./pages/SectionPages').then((m) => ({ default: m.VideosPage }))
);
const MembersPage = lazy(() =>
  import('./pages/SectionPages').then((m) => ({ default: m.MembersPage }))
);
const ContactPage = lazy(() =>
  import('./pages/SectionPages').then((m) => ({ default: m.ContactPage }))
);
const NotFoundPage = lazy(() =>
  import('./pages/SectionPages').then((m) => ({ default: m.NotFoundPage }))
);
const BlogIndexPage = lazy(() =>
  import('./pages/BlogPage').then((m) => ({ default: m.BlogIndexPage }))
);
const BlogPostPage = lazy(() =>
  import('./pages/BlogPage').then((m) => ({ default: m.BlogPostPage }))
);

function RouteLoadingFallback() {
  return (
    <div className="min-h-screen bg-[#14120F] text-[#F4EFE4] flex items-center justify-center font-mono text-xs uppercase tracking-widest">
      Loading Mumbai Beatbox Hub...
    </div>
  );
}

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
  useEffect(() => {
    initAnalytics();
  }, []);

  return (
    <BrowserRouter>
      <HashRouteSync />
      <Suspense fallback={<RouteLoadingFallback />}>
        <Routes>
          {/* Public Homepage */}
          <Route path="/" element={<PublicHomePage />} />

          {/* Dedicated Crawl-Ready SEO Pages */}
          <Route path="/about" element={<AboutPage />} />
          <Route path="/events" element={<EventsPage />} />
          <Route path="/mumbai-beatbox-championship-2026" element={<Championship2026Page />} />
          <Route
            path="/events/mumbai-beatbox-championship-2026"
            element={<Navigate to="/mumbai-beatbox-championship-2026" replace />}
          />
          <Route path="/gallery" element={<GalleryPage />} />
          <Route path="/videos" element={<VideosPage />} />
          <Route path="/members" element={<MembersPage />} />
          <Route path="/contact" element={<ContactPage />} />

          {/* Content SEO Editorial Guides & Blog */}
          <Route path="/blog" element={<BlogIndexPage />} />
          <Route path="/blog/:slug" element={<BlogPostPage />} />

          {/* MBH Admin Routes (noindex, nofollow enforced) */}
          <Route path="/mbh-admin/login" element={<AdminRouteHandler mode="login" />} />
          <Route path="/mbh-admin" element={<AdminRouteHandler mode="dashboard" />} />
          <Route path="/mbh-admin/*" element={<AdminRouteHandler mode="dashboard" />} />

          {/* Backward Compatibility for /mhb-admin */}
          <Route path="/mhb-admin/login" element={<AdminRouteHandler mode="login" />} />
          <Route path="/mhb-admin" element={<AdminRouteHandler mode="dashboard" />} />
          <Route path="/mhb-admin/*" element={<AdminRouteHandler mode="dashboard" />} />

          {/* Clean 404 Page (noindex) */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
