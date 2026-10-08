import React from 'react';
import { BrowserRouter, Routes, Route, Link, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import PublicOnlyRoute from './components/PublicOnlyRoute';
import ResidentLayout from './components/ResidentLayout';
import Home from './pages/Home';
import About from './pages/About';
import Blog from './pages/Blog';
import Contact from './pages/Contact';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import EmailPage from './pages/EmailPage';
import NotificationsPage from './pages/NotificationsPage';
import ChatPage from './pages/ChatPage';
import ReunionsPage from './pages/ReunionsPage';
import MeetingRoomPage from './pages/MeetingRoomPage';
import NotFound from './pages/NotFound';

function MainLayout() {
  const { t } = useLanguage();
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  const isMeetingPage = location.pathname.startsWith('/meeting');

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {!isMeetingPage && <Navbar />}
      
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Routes>
          {/* Public Home: if user is authenticated in a session, redirect straight to dashboard */}
          <Route
            path="/"
            element={
              isAuthenticated ? <Navigate to="/dashboard" replace /> : <Home />
            }
          />
          <Route
            path="/a-propos"
            element={
              isAuthenticated ? <Navigate to="/dashboard" replace /> : <About />
            }
          />
          <Route
            path="/blog"
            element={
              isAuthenticated ? <Navigate to="/dashboard" replace /> : <Blog />
            }
          />
          <Route
            path="/contact"
            element={
              isAuthenticated ? <Navigate to="/dashboard" replace /> : <Contact />
            }
          />

          {/* Login & Register: accessible only when not logged in */}
          <Route
            path="/login"
            element={
              <PublicOnlyRoute>
                <Login />
              </PublicOnlyRoute>
            }
          />
          <Route
            path="/register"
            element={
              <PublicOnlyRoute>
                <Register />
              </PublicOnlyRoute>
            }
          />

          {/* Protected Resident Session with Persistent S2T Sidebar */}
          <Route
            element={
              <ProtectedRoute>
                <ResidentLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/email" element={<EmailPage />} />
            <Route path="/notifications" element={<NotificationsPage />} />
            <Route path="/chat" element={<ChatPage />} />
            <Route path="/reunions" element={<ReunionsPage />} />
          </Route>

          {/* Dedicated Fullscreen Online Meeting Room */}
          <Route
            path="/meeting/:id"
            element={
              <ProtectedRoute>
                <MeetingRoomPage />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>

      {/* S2T Footer (Clean minimal footer in session, full footer in public, hidden in meeting room) */}
      {!isMeetingPage && (
        <footer style={{
          borderTop: '1px solid var(--border-color)',
          padding: isAuthenticated ? '1.25rem 0' : '3.5rem 0 2rem',
          background: 'var(--bg-secondary)',
          color: 'var(--text-secondary)',
          fontSize: '0.85rem',
          marginTop: 'auto',
        }}>
        {!isAuthenticated ? (
          <div className="container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '2.5rem', marginBottom: '2.5rem' }}>
            {/* Col 1: S2T Info */}
            <div>
              <img
                src="/s2t-logo.svg"
                alt="Logo S2T"
                style={{ height: '42px', marginBottom: '1rem' }}
              />
              <p style={{ fontSize: '0.85rem', lineHeight: 1.6, color: 'var(--text-secondary)' }}>
                Société de Gestion du Pôle Technologique El Ghazala. Aménagement, hébergement d'entreprises et gestion des contrats d'hébergement.
              </p>
            </div>

            {/* Col 2: Navigation */}
            <div>
              <h4 style={{ fontSize: '1rem', color: 'var(--text-primary)', marginBottom: '1rem' }}>Navigation</h4>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.875rem' }}>
                <li><Link to="/" style={{ color: 'inherit' }}>{t('nav_home')}</Link></li>
                <li><Link to="/a-propos" style={{ color: 'inherit' }}>{t('nav_about')}</Link></li>
                <li><Link to="/blog" style={{ color: 'inherit' }}>{t('nav_blog')}</Link></li>
                <li><Link to="/contact" style={{ color: 'inherit' }}>{t('nav_contact')}</Link></li>
              </ul>
            </div>

            {/* Col 3: Portails & Sessions */}
            <div>
              <h4 style={{ fontSize: '1rem', color: 'var(--text-primary)', marginBottom: '1rem' }}>Espaces Dédiés</h4>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.875rem' }}>
                <li><Link to="/login" style={{ color: 'var(--s2t-blue)', fontWeight: 600 }}>Espace Entreprise Hébergée</Link></li>
                <li><Link to="/login" style={{ color: 'var(--s2t-red)', fontWeight: 600 }}>Espace Juridique & Finance</Link></li>
                <li><Link to="/register" style={{ color: 'inherit' }}>Candidature Hébergement</Link></li>
              </ul>
            </div>

            {/* Col 4: Contact rapide */}
            <div>
              <h4 style={{ fontSize: '1rem', color: 'var(--text-primary)', marginBottom: '1rem' }}>Contact</h4>
              <p style={{ fontSize: '0.85rem', lineHeight: 1.6, color: 'var(--text-secondary)' }}>
                Pôle Technologique El Ghazala, Ariana<br />
                Tél : +216 71 857 000<br />
                Email : contact@s2t.tn
              </p>
            </div>
          </div>
        ) : null}

        <div className="container flex-between" style={{
          paddingTop: isAuthenticated ? '0' : '1.5rem',
          borderTop: isAuthenticated ? 'none' : '1px solid var(--border-color)',
          fontSize: '0.8rem',
          color: 'var(--text-muted)',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <div>
            © {new Date().getFullYear()} Smart Tunisian Technoparks (S2T). Tous droits réservés.
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <img src="/tunisia-flag.svg" alt="Drapeau Tunisie" style={{ width: '18px', height: '12px', borderRadius: '2px', objectFit: 'cover' }} />
            <span>Sous tutelle du Ministère des Technologies de la Communication — République Tunisienne</span>
          </div>
        </div>
      </footer>
      )}
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <LanguageProvider>
          <BrowserRouter>
            <MainLayout />
          </BrowserRouter>
        </LanguageProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
