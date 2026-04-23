import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { SiteSettingsProvider } from './contexts/SiteSettingsContext';
import { usePageTracking, useClickTracking } from './hooks/useAnalytics';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import PostPage from './pages/PostPage';
import CategoryPage from './pages/CategoryPage';
import SearchPage from './pages/SearchPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import PrivacyPage from './pages/PrivacyPage';
import LoginPage from './pages/admin/LoginPage';
import DashboardPage from './pages/admin/DashboardPage';
import PostEditorPage from './pages/admin/PostEditorPage';
import ChangePasswordPage from './pages/admin/ChangePasswordPage';
import AnalyticsPage from './pages/admin/AnalyticsPage';
import SiteSettingsPage from './pages/admin/SiteSettingsPage';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => window.scrollTo(0, 0), [pathname]);
  return null;
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full" />
      </div>
    );
  }
  if (!user) return <Navigate to="/admin/login" replace />;
  return <>{children}</>;
}

function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 pt-16">
        {children}
      </main>
      <Footer />
    </div>
  );
}

function AppRoutes() {
  usePageTracking();
  useClickTracking();

  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<PublicLayout><HomePage /></PublicLayout>} />
        <Route path="/biography/:slug" element={<PublicLayout><PostPage /></PublicLayout>} />
        <Route path="/category/:slug" element={<PublicLayout><CategoryPage /></PublicLayout>} />
        <Route path="/search" element={<PublicLayout><SearchPage /></PublicLayout>} />
        <Route path="/about" element={<PublicLayout><AboutPage /></PublicLayout>} />
        <Route path="/contact" element={<PublicLayout><ContactPage /></PublicLayout>} />
        <Route path="/privacy-policy" element={<PublicLayout><PrivacyPage /></PublicLayout>} />
        <Route path="/admin/login" element={<LoginPage />} />
        <Route path="/admin/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
        <Route path="/admin/posts/:id/edit" element={<ProtectedRoute><PostEditorPage /></ProtectedRoute>} />
        <Route path="/admin/posts/new" element={<ProtectedRoute><PostEditorPage /></ProtectedRoute>} />
        <Route path="/admin/change-password" element={<ProtectedRoute><ChangePasswordPage /></ProtectedRoute>} />
        <Route path="/admin/analytics" element={<ProtectedRoute><AnalyticsPage /></ProtectedRoute>} />
        <Route path="/admin/settings" element={<ProtectedRoute><SiteSettingsPage /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SiteSettingsProvider>
          <AppRoutes />
        </SiteSettingsProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
