import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { notificationAPI, emailAPI } from '../services/api';
import { 
  LayoutDashboard, 
  Mail, 
  Bell, 
  MessageSquare, 
  CalendarDays, 
  ChevronLeft, 
  ChevronRight,
  Building2,
  ShieldCheck,
  Sparkles,
  ExternalLink,
  Settings,
  Circle
} from 'lucide-react';
import ProfileSettingsModal from './ProfileSettingsModal';

const Sidebar = ({ isCollapsed, setIsCollapsed, mobileOpen, setMobileOpen }) => {
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const location = useLocation();
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [unreadNotifs, setUnreadNotifs] = useState(0);
  const [unreadEmails, setUnreadEmails] = useState(0);

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const [nRes, eRes] = await Promise.allSettled([
          notificationAPI.getUnreadCount(),
          emailAPI.getCounts(),
        ]);
        if (nRes.status === 'fulfilled') setUnreadNotifs(nRes.value.data?.unreadCount || 0);
        if (eRes.status === 'fulfilled') setUnreadEmails(eRes.value.data?.unreadInbox || 0);
      } catch (err) {
        // silent fallback
      }
    };
    fetchCounts();
    const interval = setInterval(fetchCounts, 25000);
    return () => clearInterval(interval);
  }, [location.pathname]);

  const navigationItems = [
    {
      name: language === 'ar' ? 'لوحة القيادة' : 'Dashboard',
      subtitle: language === 'ar' ? 'الاستقبال الرئيسي' : 'Accueil & Synthèse',
      path: '/dashboard',
      icon: LayoutDashboard,
      badge: null,
      color: 'var(--s2t-blue)',
    },
    {
      name: language === 'ar' ? 'البريد الإلكتروني' : 'Email',
      subtitle: language === 'ar' ? 'المراسلات الرسمية' : 'Messagerie officielle',
      path: '/email',
      icon: Mail,
      badge: unreadEmails > 0 ? String(unreadEmails) : null,
      badgeColor: 'var(--s2t-red)',
      color: 'var(--s2t-red)',
    },
    {
      name: language === 'ar' ? 'الإشعارات' : 'Notification',
      subtitle: language === 'ar' ? 'التنبيهات القانونية' : 'Alertes & Relances',
      path: '/notifications',
      icon: Bell,
      badge: unreadNotifs > 0 ? String(unreadNotifs) : null,
      badgeColor: '#F59E0B',
      color: '#F59E0B',
    },
    {
      name: language === 'ar' ? 'المحادثة المباشرة' : 'Chat',
      subtitle: language === 'ar' ? 'الدعم القانوني والمالي' : 'Support direct S2T',
      path: '/chat',
      icon: MessageSquare,
      badge: 'En ligne',
      badgeColor: '#10B981',
      color: '#10B981',
    },
    {
      name: language === 'ar' ? 'الاجتماعات' : 'Réunion',
      subtitle: language === 'ar' ? 'حجز القاعات واللقاءات' : 'Salles & Entretiens',
      path: '/reunions',
      icon: CalendarDays,
      badge: null,
      badgeColor: 'var(--s2t-cyan)',
      color: 'var(--s2t-cyan)',
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div 
          className="sidebar-mobile-backdrop"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside 
        className={`s2t-sidebar ${isCollapsed ? 'collapsed' : ''} ${mobileOpen ? 'mobile-open' : ''}`}
        aria-label="Menu latéral de session résident"
      >
        {/* Sidebar Header: Brand & Collapse Toggle */}
        <div className="sidebar-header">
          {!isCollapsed && (
            <div className="sidebar-brand">
              <div className="sidebar-brand-icon">
                <Building2 size={20} color="#ffffff" />
              </div>
              <div className="sidebar-brand-text">
                <span className="sidebar-brand-title">Espace Résident</span>
                <span className="sidebar-brand-subtitle">Pôle El Ghazala — S2T</span>
              </div>
            </div>
          )}

          {isCollapsed && (
            <div className="sidebar-brand-collapsed" title="Pôle El Ghazala S2T">
              <Building2 size={22} color="var(--s2t-blue)" />
            </div>
          )}

          {/* Toggle Button */}
          <button
            type="button"
            className="sidebar-toggle-btn"
            onClick={() => setIsCollapsed(!isCollapsed)}
            title={isCollapsed ? "Agrandir le menu" : "Réduire le menu"}
          >
            {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>

        {/* Resident Company Badge Card */}
        {!isCollapsed && (
          <div className="sidebar-company-card">
            <div className="company-card-header">
              <div className="status-indicator-dot" />
              <span className="company-status-label">Session Active Résident</span>
            </div>
            <div className="company-name-text">
              {user?.companyName || 'InnovTech Solutions SARL'}
            </div>
            <div className="company-meta-text">
              {user?.fiscalId ? `MF: ${user.fiscalId}` : 'Matricule Fiscal Enregistré'}
            </div>
          </div>
        )}

        {/* Navigation Section */}
        <div className="sidebar-nav-container">
          <div className="sidebar-section-title">
            {!isCollapsed ? 'NAVIGATION PRINCIPALE' : 'MENU'}
          </div>

          <nav className="sidebar-nav-list">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileOpen(false)}
                  className={`sidebar-nav-item ${isActive ? 'active' : ''}`}
                  title={isCollapsed ? `${item.name} — ${item.subtitle}` : undefined}
                >
                  <div className="nav-item-icon-wrapper" style={{ color: isActive ? 'var(--primary)' : item.color }}>
                    <Icon size={20} />
                  </div>

                  {!isCollapsed && (
                    <div className="nav-item-content">
                      <span className="nav-item-title">{item.name}</span>
                      <span className="nav-item-subtitle">{item.subtitle}</span>
                    </div>
                  )}

                  {!isCollapsed && item.badge && (
                    <span 
                      className={`nav-item-badge ${item.badge === 'En ligne' ? 'badge-online' : ''}`}
                      style={{ 
                        backgroundColor: item.badge === 'En ligne' ? 'rgba(16, 185, 129, 0.15)' : item.badgeColor,
                        color: item.badge === 'En ligne' ? '#10B981' : '#ffffff',
                        borderColor: item.badge === 'En ligne' ? 'rgba(16, 185, 129, 0.3)' : 'transparent'
                      }}
                    >
                      {item.badge === 'En ligne' && <Circle size={6} fill="#10B981" />}
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Quick S2T Direct Assistance Box (if expanded) */}
        {!isCollapsed && (
          <div className="sidebar-support-widget">
            <div className="support-widget-icon">
              <Sparkles size={18} />
            </div>
            <div className="support-widget-body">
              <div className="support-widget-title">Assistance Juridique S2T</div>
              <div className="support-widget-text">
                Besoin d'un avenant ou d'une quittance certifiée ?
              </div>
              <button 
                type="button"
                onClick={() => setProfileModalOpen(true)}
                className="support-widget-btn"
              >
                <span>Paramètres & Profil</span>
                <Settings size={13} />
              </button>
            </div>
          </div>
        )}

        {/* Sidebar Footer: Resident User Identity Quick Pill */}
        <div className="sidebar-footer">
          <div 
            className="sidebar-user-pill"
            onClick={() => setProfileModalOpen(true)}
            title="Ouvrir mon profil & paramètres de sécurité"
          >
            <div className="sidebar-user-avatar">
              {user?.avatar ? (
                <img src={user.avatar} alt={user.name} />
              ) : (
                user?.name ? user.name.charAt(0).toUpperCase() : 'R'
              )}
            </div>

            {!isCollapsed && (
              <div className="sidebar-user-info">
                <span className="sidebar-user-name">{user?.name || 'Résident S2T'}</span>
                <span className="sidebar-user-role">
                  {user?.role === 'admin' ? 'Admin S2T' : 'Entreprise Hébergée'}
                </span>
              </div>
            )}

            {!isCollapsed && (
              <Settings size={16} className="sidebar-user-settings-icon" />
            )}
          </div>
        </div>
      </aside>

      {/* Profile & Security Modal */}
      <ProfileSettingsModal
        isOpen={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
        initialTab="profile"
      />
    </>
  );
};

export default Sidebar;
