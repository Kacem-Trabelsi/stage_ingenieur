import React, { createContext, useContext, useState, useEffect } from 'react';

const translations = {
  fr: {
    nav_home: 'Accueil',
    nav_about: 'À Propos',
    nav_blog: 'Blog & Actualités',
    nav_contact: 'Contact',
    nav_login: 'Connexion',
    nav_register: 'Inscription',
    nav_admin_space: 'Espace Admin',
    nav_client_space: 'Mon Espace',
    nav_logout: 'Déconnexion',
    tunisia_label: 'Tunisie',
    lang_fr: 'Français',
    lang_en: 'English',
    lang_ar: 'العربية',
    tag_hero: 'Smart Tunisian Technoparks — Pôle El Ghazala',
    title_hero: 'Plateforme de Gestion des Contrats',
    title_hero_sub: '& de Facturation S2T',
    desc_hero: 'Le système centralisé dédié aux affaires juridiques, au suivi des contrats d\'hébergement, aux modifications de superficie et à la gestion financière des redevances locatives du Pôle Technologique El Ghazala.',
  },
  en: {
    nav_home: 'Home',
    nav_about: 'About Us',
    nav_blog: 'Blog & News',
    nav_contact: 'Contact Us',
    nav_login: 'Sign In',
    nav_register: 'Sign Up',
    nav_admin_space: 'Admin Space',
    nav_client_space: 'My Space',
    nav_logout: 'Logout',
    tunisia_label: 'Tunisia',
    lang_fr: 'Français',
    lang_en: 'English',
    lang_ar: 'العربية',
    tag_hero: 'Smart Tunisian Technoparks — El Ghazala Park',
    title_hero: 'Contracts & Billing Management',
    title_hero_sub: 'Platform for S2T',
    desc_hero: 'The centralized system dedicated to legal affairs, hosting contracts monitoring, area adjustments, and financial management of rental fees for El Ghazala Technopark.',
  },
  ar: {
    nav_home: 'الرئيسية',
    nav_about: 'من نحن',
    nav_blog: 'الأخبار والمستجدات',
    nav_contact: 'اتصل بنا',
    nav_login: 'تسجيل الدخول',
    nav_register: 'إنشاء حساب',
    nav_admin_space: 'فضاء الإدارة',
    nav_client_space: 'فضاء المقيم',
    nav_logout: 'تسجيل الخروج',
    tunisia_label: 'تونس',
    lang_fr: 'Français',
    lang_en: 'English',
    lang_ar: 'العربية',
    tag_hero: 'تونس للأقطاب التكنولوجية الذكية — قطب الغزالة',
    title_hero: 'منصة إدارة العقود',
    title_hero_sub: 'والفوترة S2T',
    desc_hero: 'المنظومة المركزية المخصصة للشؤون القانونية، ومتابعة عقود الإيواء وتعديلات المساحة والإدارة المالية للمستحقات الإيجارية بالقطب التكنولوجي الغزالة.',
  },
};

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('s2t_language') || 'fr';
  });

  useEffect(() => {
    localStorage.setItem('s2t_language', language);
    if (language === 'ar') {
      document.documentElement.setAttribute('dir', 'rtl');
      document.documentElement.setAttribute('lang', 'ar');
    } else {
      document.documentElement.setAttribute('dir', 'ltr');
      document.documentElement.setAttribute('lang', language);
    }
  }, [language]);

  const t = (key) => {
    return translations[language]?.[key] || translations['fr']?.[key] || key;
  };

  const languages = [
    { code: 'fr', label: 'Français', flagImg: '/france-flag.svg', native: 'Français' },
    { code: 'en', label: 'English', flagImg: '/us-flag.svg', native: 'English (US)' },
    { code: 'ar', label: 'العربية', flagImg: '/tunisia-flag.svg', native: 'العربية (تونس)' },
  ];

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, languages }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
