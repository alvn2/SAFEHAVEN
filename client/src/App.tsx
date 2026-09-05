import React, { useContext, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { RootLayout } from './components/Layout';
import { AuthContext, AuthProvider } from './context/AuthContext';
import { ThemeProvider, ThemeContext } from './context/ThemeContext';
import { WifiOff } from 'lucide-react';

import { HomePage } from './pages/HomePage';
import { AuthPage } from './pages/AuthPage';
import { InstallPrompt } from './components/InstallPrompt';

// Lazy-loaded routes for code splitting & bundle reduction
const SeekerSignupPage = lazy(() => import('./pages/SeekerSignupPage').then(m => ({ default: m.SeekerSignupPage })));
const VolunteerApplyPage = lazy(() => import('./pages/VolunteerApplyPage').then(m => ({ default: m.VolunteerApplyPage })));
const SeekerDashboard = lazy(() => import('./pages/SeekerDashboard').then(m => ({ default: m.SeekerDashboard })));
const VolunteerDashboard = lazy(() => import('./pages/VolunteerDashboard').then(m => ({ default: m.VolunteerDashboard })));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard').then(m => ({ default: m.AdminDashboard })));
const DeveloperDashboard = lazy(() => import('./pages/DeveloperDashboard').then(m => ({ default: m.DeveloperDashboard })));
const ChatPage = lazy(() => import('./pages/ChatPage').then(m => ({ default: m.ChatPage })));
const VolunteerNetworkPage = lazy(() => import('./pages/VolunteerNetworkPage').then(m => ({ default: m.VolunteerNetworkPage })));
const CommunityPage = lazy(() => import('./pages/CommunityPage').then(m => ({ default: m.CommunityPage })));
const ResourcesPage = lazy(() => import('./pages/ResourcesPage').then(m => ({ default: m.ResourcesPage })));
const ForumPage = lazy(() => import('./pages/ForumPage').then(m => ({ default: m.ForumPage })));
const PrivacyPolicyPage = lazy(() => import('./pages/PrivacyPolicyPage').then(m => ({ default: m.PrivacyPolicyPage })));
const TermsPage = lazy(() => import('./pages/TermsPage').then(m => ({ default: m.TermsPage })));
const SecurityWhitepaperPage = lazy(() => import('./pages/SecurityWhitepaperPage').then(m => ({ default: m.SecurityWhitepaperPage })));
const ToolsPage = lazy(() => import('./pages/ToolsPage').then(m => ({ default: m.ToolsPage })));
const SecurityCenterPage = lazy(() => import('./pages/SecurityCenterPage').then(m => ({ default: m.SecurityCenterPage })));

const PageFallback = () => (
  <div className="flex flex-col items-center justify-center min-h-[300px] space-y-3" role="status" aria-label="Loading page content">
    <div className="w-8 h-8 border-3 border-primary-500 border-t-transparent rounded-full animate-spin" aria-hidden="true" />
    <span className="text-sm text-gray-500 dark:text-gray-400 font-medium animate-pulse">Loading content securely...</span>
  </div>
);

const OfflineBanner = () => {
    const [isOnline, setIsOnline] = React.useState(navigator.onLine);
    React.useEffect(() => {
        const setStatus = () => setIsOnline(navigator.onLine);
        window.addEventListener('online', setStatus);
        window.addEventListener('offline', setStatus);
        return () => {
            window.removeEventListener('online', setStatus);
            window.removeEventListener('offline', setStatus);
        };
    }, []);

    if (isOnline) return null;
    return (
        <div
            role="status"
            aria-live="polite"
            className="fixed bottom-0 left-0 right-0 bg-gray-900 text-white p-2.5 text-center text-sm z-[70] flex items-center justify-center gap-2 shadow-lg"
        >
            <WifiOff className="w-4 h-4 text-amber-400" />
            <span>You are offline. Your reflections and safety plan remain safe in your Device Vault.</span>
        </div>
    );
};

const AppRoutes = () => {
  const { user } = useContext(AuthContext);
  const { isDark, toggleTheme } = useContext(ThemeContext);

  return (
    <Router>
        <OfflineBanner />
        <InstallPrompt />
        <RootLayout toggleTheme={toggleTheme} isDark={isDark}>
          <Suspense fallback={<PageFallback />}>
            <Routes>
                {/* Public Routes */}
                <Route path="/" element={<HomePage />} />
                <Route path="/auth" element={<AuthPage />} />
                <Route path="/auth/signup" element={<SeekerSignupPage />} />
                <Route path="/volunteer/apply" element={<VolunteerApplyPage />} />
                <Route path="/volunteers" element={<VolunteerNetworkPage />} />
                <Route path="/resources" element={<ResourcesPage />} />
                <Route path="/community" element={<CommunityPage />} />
                <Route path="/forum" element={<ForumPage />} />
                <Route path="/tools" element={<ToolsPage />} />
                
                {/* Legal Routes */}
                <Route path="/legal/privacy" element={<PrivacyPolicyPage />} />
                <Route path="/legal/terms" element={<TermsPage />} />
                <Route path="/legal/whitepaper" element={<SecurityWhitepaperPage />} />

                {/* Protected Routes */}
                <Route path="/security" element={user ? <SecurityCenterPage /> : <Navigate to="/auth" />} />
                <Route path="/seeker/dashboard" element={user ? <SeekerDashboard /> : <Navigate to="/auth" />} />
                <Route path="/chat" element={user ? <ChatPage /> : <Navigate to="/auth" />} />
                <Route path="/volunteer/dashboard" element={(user?.role === 'VOLUNTEER_APPROVED' || user?.role === 'ADMIN') ? <VolunteerDashboard /> : <Navigate to="/auth" />} />
                <Route path="/admin" element={user?.role === 'ADMIN' ? <AdminDashboard /> : <Navigate to="/auth" />} />
                <Route path="/developer" element={user?.role === 'ADMIN' ? <DeveloperDashboard /> : <Navigate to="/auth" />} />
                
                <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </Suspense>
        </RootLayout>
    </Router>
  );
};

const App = () => (
    <AuthProvider>
      <ThemeProvider>
        <AppRoutes />
      </ThemeProvider>
    </AuthProvider>
);

export default App;