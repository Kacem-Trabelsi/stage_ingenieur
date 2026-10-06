import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import ProfileSettingsModal from './ProfileSettingsModal';
import {
  Sun,
  Moon,
  LogOut,
  LayoutDashboard,
  ShieldCheck,
  Building2,
  LogIn,
  UserPlus,
  Menu,
  X,
  ChevronDown,
  Check,
  ChevronRight,
  Settings,
  User
} from 'lucide-react';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { language, setLanguage, t, languages } = useLanguage();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [profileModalTab, setProfileModalTab] = useState('profile');
  const langMenuRef = useRef(null);
  const userMenuRef = useRef(null);

  const location = useLocation();
  const navigate = useNavigate();

  // Close dropdowns on outside click / touch
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (langMenuRef.current && !langMenuRef.current.contains(event.target)) {
        setLangMenuOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, []);

  const openProfileTab = (tab = 'profile') => {
    setProfileModalTab(tab);
    setProfileModalOpen(true);
    setUserMenuOpen(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
    setMobileMenuOpen(false);
    setUserMenuOpen(false);
  };

  const isActive = (path) => location.pathname === path;

  const currentLangObj = languages.find((l) => l.code === language) || languages[0];

  const publicNavLinks = [
    { name: t('nav_home'), path: '/' },
    { name: t('nav_about'), path: '/a-propos' },
    { name: t('nav_blog'), path: '/blog' },
    { name: t('nav_contact'), path: '/contact' },
  ];

  return (
    <header className="s2t-navbar">
      <div className="container s2t-navbar-container">
        {/* Brand Logo & Tunisian Flag Badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexShrink: 0 }}>
          <Link
            to={isAuthenticated ? "/dashboard" : "/"}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}
            onClick={() => setMobileMenuOpen(false)}
          >
            <img
              src={theme === 'dark' ? '/s2t-logo-dark.svg' : '/s2t-logo.svg'}
              alt="S2T Smart Tunisian Technoparks"
              style={{ height: '36px', width: 'auto', transition: 'var(--transition)' }}
            />
          </Link>

          {/* Official Tunisian Flag Badge */}
          <div className="navbar-tunisia-badge" title="Pôle Technologique Sous Tutelle du Ministère des TIC — République Tunisienne">
            <img
              src="/tunisia-flag.svg"
              alt="Drapeau de la Tunisie"
              style={{
                width: '22px',
                height: '15px',
                borderRadius: '3px',
                objectFit: 'cover',
                boxShadow: '0 1px 5px rgba(225, 29, 72, 0.4)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                flexShrink: 0
              }}
            />
            <span className="navbar-tunisia-text" style={{ letterSpacing: '0.02em' }}>
              {language === 'ar' ? 'تونس' : 'Tunisie'}
            </span>
          </div>
        </div>

        {/* Center: Public Links OR Active Session Context Pill */}
        {!isAuthenticated ? (
          /* Public Navigation Links */
          <nav className="nav-links-list">
            {publicNavLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`nav-link-item ${isActive(link.path) ? 'active' : ''}`}
              >
                <span>{link.name}</span>
              </Link>
            ))}
          </nav>
        ) : (
          /* Session Active Context Pill */
          <div className="navbar-session-pill">
            {user?.role === 'admin' ? (
              <>
                <ShieldCheck size={16} color="var(--s2t-red)" style={{ flexShrink: 0 }} />
                <span className="navbar-session-text">
                  {language === 'ar' ? 'فضاء الإدارة المالية والقانونية S2T' : 'Session Administration — Juridique & Finance S2T'}
                </span>
              </>
            ) : (
              <>
                <Building2 size={16} color="var(--s2t-blue)" style={{ flexShrink: 0 }} />
                <span className="navbar-session-text">
                  {language === 'ar' ? `فضاء المؤسسة المقيمة — ${user?.companyName || user?.name}` : `Espace Entreprise Hébergée — ${user?.companyName || user?.name}`}
                </span>
              </>
            )}
          </div>
        )}

        {/* Right Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flexShrink: 0 }}>
          {/* Language Selector Dropdown */}
          <div style={{ position: 'relative' }} ref={langMenuRef}>
            <button
              type="button"
              onClick={() => setLangMenuOpen(!langMenuOpen)}
              className="navbar-lang-btn"
              title="Changer de langue / Change language / تغيير اللغة"
            >
              <img
                src={currentLangObj.flagImg}
                alt={currentLangObj.label}
                style={{
                  width: '18px',
                  height: '13px',
                  borderRadius: '2px',
                  objectFit: 'cover',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
                  flexShrink: 0
                }}
              />
              <span className="navbar-lang-code" style={{ textTransform: 'uppercase', fontSize: '0.8rem' }}>{currentLangObj.code}</span>
              <ChevronDown
                size={13}
                className="navbar-lang-chevron"
                style={{
                  transform: langMenuOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 0.2s ease',
                  opacity: 0.7
                }}
              />
            </button>

            {/* Language Dropdown List */}
            {langMenuOpen && (
              <div style={{
                position: 'absolute',
                top: 'calc(100% + 8px)',
                right: language === 'ar' ? 'auto' : 0,
                left: language === 'ar' ? 0 : 'auto',
                minWidth: '180px',
                background: 'var(--bg-secondary)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
                boxShadow: 'var(--shadow-lg)',
                padding: '0.45rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.25rem',
                zIndex: 200,
                animation: 'fadeIn 0.15s ease-out',
              }}>
                {languages.map((l) => (
                  <button
                    key={l.code}
                    type="button"
                    onClick={() => {
                      setLanguage(l.code);
                      setLangMenuOpen(false);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.6rem 0.85rem',
                      borderRadius: 'var(--radius-sm)',
                      background: language === l.code ? 'var(--primary-light)' : 'transparent',
                      border: 'none',
                      color: language === l.code ? 'var(--s2t-red)' : 'var(--text-primary)',
                      fontSize: '0.875rem',
                      fontWeight: language === l.code ? 700 : 500,
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'var(--transition)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      <img
                        src={l.flagImg}
                        alt={l.label}
                        style={{
                          width: '22px',
                          height: '15px',
                          borderRadius: '2px',
                          objectFit: 'cover',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                          border: '1px solid rgba(255,255,255,0.15)'
                        }}
                      />
                      <span>{l.native}</span>
                    </div>
                    {language === l.code && <Check size={15} color="var(--s2t-red)" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Theme Switcher */}
          <button
            type="button"
            onClick={toggleTheme}
            className="theme-switch-btn"
            aria-label="Changer de thème"
            title={theme === 'dark' ? 'Passer en mode clair' : 'Passer en mode sombre'}
          >
            {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
          </button>

          {/* Authenticated Session Actions */}
          {isAuthenticated ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              {/* User Profile Pill & Dropdown Anchor */}
              <div style={{ position: 'relative' }} ref={userMenuRef}>
                <button
                  type="button"
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="nav-user-pill"
                  style={{
                    borderLeft: user?.role === 'admin' ? '3px solid var(--s2t-red)' : '3px solid var(--s2t-blue)',
                  }}
                  title="Mon compte et paramètres"
                >
                  <div className="nav-user-avatar" style={{ background: user?.role === 'admin' ? 'var(--s2t-red)' : 'var(--s2t-blue)' }}>
                    {user?.avatar ? (
                      <img src={user.avatar} alt={user.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      user?.name ? user.name.charAt(0).toUpperCase() : 'U'
                    )}
                  </div>
                  <span className="nav-user-name">
                    {user?.name}
                  </span>
                  <ChevronDown 
                    size={13} 
                    style={{ 
                      opacity: 0.7, 
                      transform: userMenuOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                      transition: 'transform 0.2s ease',
                      flexShrink: 0
                    }} 
                  />
                </button>

                {/* Floating User Popover Dropdown */}
                {userMenuOpen && (
                  <div className="user-popover-dropdown">
                    {/* User Identity Header */}
                    <div className="user-popover-header">
                      <div style={{
                        width: '38px',
                        height: '38px',
                        borderRadius: '50%',
                        background: user?.role === 'admin' ? 'var(--s2t-red)' : 'var(--s2t-blue)',
                        color: '#fff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1rem',
                        fontWeight: 800,
                        flexShrink: 0,
                        overflow: 'hidden',
                        boxShadow: user?.role === 'admin' ? '0 0 10px var(--s2t-red-glow)' : '0 0 10px var(--s2t-blue-glow)'
                      }}>
                        {user?.avatar ? (
                          <img src={user.avatar} alt={user.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          user?.name ? user.name.charAt(0).toUpperCase() : 'U'
                        )}
                      </div>
                      <div style={{ overflow: 'hidden', flex: 1 }}>
                        <div style={{
                          fontWeight: 700,
                          fontSize: '0.875rem',
                          color: 'var(--text-primary)',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}>
                          {user?.name}
                        </div>
                        <div style={{
                          fontSize: '0.75rem',
                          color: user?.role === 'admin' ? 'var(--s2t-red)' : 'var(--s2t-blue)',
                          fontWeight: 600
                        }}>
                          {user?.role === 'admin' ? 'Admin S2T Juridique & Finance' : (user?.companyName || 'Entreprise Hébergée')}
                        </div>
                        <div style={{
                          fontSize: '0.7rem',
                          color: 'var(--text-muted)',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}>
                          {user?.email}
                        </div>
                      </div>
                    </div>

                    {/* 1. Bouton Profil */}
                    <button
                      type="button"
                      className="user-popover-item"
                      onClick={() => openProfileTab('profile')}
                    >
                      <User size={16} color="var(--s2t-red)" />
                      <span>Mon Profil</span>
                    </button>

                    {/* 2. Bouton Settings / Paramètres */}
                    <button
                      type="button"
                      className="user-popover-item"
                      onClick={() => openProfileTab('preferences')}
                    >
                      <Settings size={16} color="var(--s2t-teal)" />
                      <span>Paramètres & Sécurité</span>
                    </button>

                    <div className="user-popover-divider" />

                    {/* 3. Bouton Déconnexion */}
                    <button
                      type="button"
                      className="user-popover-item danger"
                      onClick={handleLogout}
                    >
                      <LogOut size={16} />
                      <span>Déconnexion</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* Guest Public Actions */
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Link to="/login" className="btn btn-secondary btn-sm" style={{ gap: '0.4rem', padding: '0.45rem 0.85rem' }}>
                <LogIn size={14} />
                <span>{t('nav_login')}</span>
              </Link>
              <Link to="/register" className="btn btn-primary btn-sm" style={{ gap: '0.4rem', padding: '0.45rem 0.95rem' }}>
                <UserPlus size={14} />
                <span>{t('nav_register')}</span>
              </Link>
            </div>
          )}

          {/* Mobile Menu Button (Guest only) */}
          {!isAuthenticated && (
            <button
              type="button"
              className="mobile-menu-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Menu"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          )}
        </div>
      </div>

      {/* Guest Mobile Drawer */}
      {!isAuthenticated && mobileMenuOpen && (
        <div className="guest-mobile-menu-drawer">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', padding: '1rem 0' }}>
            {publicNavLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`nav-link-item ${isActive(link.path) ? 'active' : ''}`}
                onClick={() => setMobileMenuOpen(false)}
                style={{ padding: '0.75rem 1rem', borderRadius: 'var(--radius-sm)' }}
              >
                <span>{link.name}</span>
              </Link>
            ))}
            <div style={{ height: '1px', background: 'var(--border-color)', margin: '0.5rem 0' }} />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
              <Link
                to="/login"
                className="btn btn-secondary btn-sm"
                onClick={() => setMobileMenuOpen(false)}
                style={{ justifyContent: 'center' }}
              >
                <LogIn size={15} />
                <span>{t('nav_login')}</span>
              </Link>
              <Link
                to="/register"
                className="btn btn-primary btn-sm"
                onClick={() => setMobileMenuOpen(false)}
                style={{ justifyContent: 'center' }}
              >
                <UserPlus size={15} />
                <span>{t('nav_register')}</span>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Profile & Settings Modal */}
      {isAuthenticated && (
        <ProfileSettingsModal
          isOpen={profileModalOpen}
          initialTab={profileModalTab}
          onClose={() => setProfileModalOpen(false)}
        />
      )}
    </header>
  );
};

export default Navbar;
