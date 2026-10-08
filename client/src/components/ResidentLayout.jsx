import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { useLanguage } from '../context/LanguageContext';
import { Menu } from 'lucide-react';

const ResidentLayout = () => {
  const { t } = useLanguage();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="resident-session-layout">
      {/* Sidebar Navigation */}
      <Sidebar
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      {/* Main Content Area */}
      <div className={`resident-main-wrapper ${isCollapsed ? 'sidebar-collapsed' : ''}`}>
        {/* Mobile Top Sub-Bar to toggle Sidebar on small screens */}
        <div className="mobile-sidebar-toggle-bar">
          <button
            type="button"
            className="mobile-menu-open-btn"
            onClick={() => setMobileOpen(true)}
            aria-label={t('layout_mobile_menu_aria')}
          >
            <Menu size={20} />
            <span>{t('layout_mobile_menu')}</span>
          </button>
        </div>

        <div className="resident-content-body">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default ResidentLayout;
