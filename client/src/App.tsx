import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { RootLayout } from './components/Layout';
import { AuthContext, AuthProvider } from './context/AuthContext';
import { ThemeProvider, ThemeContext } from './context/ThemeContext';
import { WifiOff } from 'lucide-react';

// Pages
import { HomePage } from './pages/HomePage';
import { AuthPage } from './pages/AuthPage';
import { SeekerSignupPage } from './pages/SeekerSignupPage';
import { VolunteerApplyPage } from './pages/VolunteerApplyPage';
import { SeekerDashboard } from './pages/SeekerDashboard';
import { VolunteerDashboard } from './pages/VolunteerDashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import { DeveloperDashboard } from './pages/DeveloperDashboard';
import { ChatPage } from './pages/ChatPage';
import { VolunteerNetworkPage } from './pages/VolunteerNetworkPage';
import { CommunityPage } from './pages/CommunityPage';
import { ResourcesPage } from './pages/ResourcesPage';
import { ForumPage } from './pages/ForumPage';
import { PrivacyPolicyPage } from './pages/PrivacyPolicyPage';
import { TermsPage } from './pages/TermsPage';
import { SecurityWhitepaperPage } from './pages/SecurityWhitepaperPage';
import { ToolsPage } from './pages/ToolsPage';
import { SecurityCenterPage } from './pages/SecurityCenterPage';

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
        <div className="fixed bottom-0 left-0 right-0 bg-gray-900 text-white p-2 text-center text-sm z-50 flex items-center justify-center gap-2">
            <WifiOff className="w-4 h-4" />
            <span>You are offline. Journal & Safety Plan are available locally.</span>
        </div>
    );
};

const AppRoutes = () => {
  const { user } = useContext(AuthContext);
  const { isDark, toggleTheme } = useContext(ThemeContext);

  return (
    <Router>
        <OfflineBanner />
        <RootLayout toggleTheme={toggleTheme} isDark={isDark}>
          <Routes>
              {/* Public Routes */}
              <Route path="/" element={<HomePage />} />
              <Route path="/auth" element={<AuthPage />} />
              <Route path="/auth/signup" element={<SeekerSignupPage />} />
              <Route path="/auth/volunteer/apply" element={<VolunteerApplyPage />} />
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
              <Route path="/volunteer/dashboard" element={user?.role === 'VOLUNTEER_APPROVED' ? <VolunteerDashboard /> : <Navigate to="/auth" />} />
              <Route path="/admin" element={user?.role === 'ADMIN' ? <AdminDashboard /> : <Navigate to="/auth" />} />
              <Route path="/developer" element={user?.role === 'ADMIN' ? <DeveloperDashboard /> : <Navigate to="/auth" />} />
              
              <Route path="*" element={<Navigate to="/" />} />
          </Routes>
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