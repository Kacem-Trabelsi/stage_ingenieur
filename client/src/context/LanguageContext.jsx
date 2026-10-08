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

    // Home Page Translations
    home_badge: 'Pôle Technologique El Ghazala — S2T',
    home_hero_title: 'Gestion des Contrats',
    home_hero_title_sub: '& Facturation S2T',
    home_hero_desc: 'La plateforme officielle dédiée aux affaires juridiques, au suivi des conventions d\'hébergement (Articles 1 à 16), aux modifications de superficie et au recouvrement financier des redevances locatives.',
    home_btn_my_space: 'Accéder à votre Espace',
    home_role_admin: 'Administration',
    home_role_client: 'Entreprise',
    home_btn_resident: 'Espace Entreprise Hébergée',
    home_btn_legal: 'Portail Juridique & Finance',
    home_trust_law: 'Conforme Loi n°2001-50 & 2006-37',
    home_trust_rates: 'Tarifs réglementés (Art. 6)',
    home_trust_deposit: 'Dépôt de garantie sécurisé (Art. 7)',
    home_floating_address: 'Route de Raoued Km 3.5, Ariana',
    home_floating_companies_title: '250+ Sociétés Hébergées',
    home_floating_companies_sub: 'Pépinière & Pôle d\'Excellence TIC',

    // Stats
    home_stat_companies: 'Entreprises & Startups Hébergées',
    home_stat_engineers: 'Cadres & Ingénieurs TIC',
    home_stat_parks: 'Technoparcs Connectés en Tunisie',
    home_stat_occupancy: 'Taux d\'Occupation des Espaces',

    // Services / Prestations
    home_services_title: 'Services & Dispositif Contractuel',
    home_services_desc: 'Une offre complète encadrée par le contrat d\'hébergement au Pôle Technologique S2T (Articles 1 à 16).',
    home_service_1_title: 'Hébergement & Espaces Aménagés',
    home_service_1_desc: 'Bureaux équipés, pépinières d\'entreprises et plateaux modulables selon la superficie demandée (Art. 2 du contrat).',
    home_service_2_title: 'Gestion Juridique & Avenants',
    home_service_2_desc: 'Établissement des contrats d\'hébergement, renouvellements, résiliations et suivi des modifications de superficie (Art. 11).',
    home_service_3_title: 'Facturation & Suivi Financier',
    home_service_3_desc: 'Facturation automatisée des redevances, alertes d\'échéance au 5 du mois et suivi rigoureux des relances (J+15, J+30).',
    home_service_4_title: 'Prestations Complémentaires',
    home_service_4_desc: 'Connexion Internet très haut débit, salles de réunion et de formation, secrétariat mutualisé et gardiennage 24/7.',

    // Pricing / Bareme Art 6
    home_pricing_tag: 'Article 6 du Contrat d\'Hébergement',
    home_pricing_title: 'Grille Tarifaire des Redevances Locatives',
    home_pricing_desc: 'Tarification officielle par m² calculée selon l\'ancienneté en pépinière d\'entreprises.',
    home_badge_recommended: 'RECOMMANDÉ',
    home_tier_1_period: '1ère Année d\'Hébergement',
    home_tier_1_badge: 'Tarif Pépinière Phase 1',
    home_tier_1_desc: 'Tarif préférentiel d\'incubation pour les jeunes pousses et startups innovantes en phase d\'amorçage.',
    home_tier_2_period: '2ème Année d\'Hébergement',
    home_tier_2_badge: 'Tarif Pépinière Phase 2',
    home_tier_2_desc: 'Accompagnement dans la croissance avec accès élargi aux prestations mutualisées du pôle.',
    home_tier_3_period: '3ème Année & Plus',
    home_tier_3_badge: 'Tarif Consolidation',
    home_tier_3_desc: 'Tarif consolidé pour entreprises en phase d\'expansion technologique et partenariats industriels.',
    home_pricing_unit: 'HTVA / m² / an',
    home_pricing_note: '✓ Payable avant le 5 de chaque mois (Art. 6.3)',

    // Dual Portal CTA Box
    home_cta_title: 'Rejoignez le 1er Écosystème TIC en Tunisie',
    home_cta_desc: 'Que vous soyez une startup en quête d\'hébergement ou une entreprise résidente souhaitant consulter ses factures et conventions, accédez dès maintenant à votre espace.',
    home_btn_apply: 'Candidater à l\'Hébergement',
    home_btn_contact: 'Contacter la Direction',

    // Footer
    footer_s2t_desc: 'Société de Gestion du Pôle Technologique El Ghazala. Aménagement, hébergement d\'entreprises et gestion des contrats d\'hébergement.',
    footer_nav: 'Navigation',
    footer_spaces: 'Espaces Dédiés',
    footer_contact_title: 'Contact',
    footer_contact_address: 'Pôle Technologique El Ghazala, Ariana',
    footer_copyright: 'Smart Tunisian Technoparks (S2T). Tous droits réservés.',
    footer_ministry: 'Sous tutelle du Ministère des Technologies de la Communication — République Tunisienne',
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

    // Home Page Translations
    home_badge: 'El Ghazala Technopark — S2T',
    home_hero_title: 'Contracts Management',
    home_hero_title_sub: '& S2T Billing',
    home_hero_desc: 'The official platform dedicated to legal affairs, hosting agreements monitoring (Articles 1 to 16), space adjustments, and financial collection of rental fees.',
    home_btn_my_space: 'Access your Portal',
    home_role_admin: 'Administration',
    home_role_client: 'Company',
    home_btn_resident: 'Resident Company Portal',
    home_btn_legal: 'Legal & Finance Portal',
    home_trust_law: 'Compliant with Law No. 2001-50 & 2006-37',
    home_trust_rates: 'Regulated Rates (Art. 6)',
    home_trust_deposit: 'Secured Guarantee Deposit (Art. 7)',
    home_floating_address: 'Raoued Road Km 3.5, Ariana',
    home_floating_companies_title: '250+ Hosted Companies',
    home_floating_companies_sub: 'Incubator & ICT Center of Excellence',

    // Stats
    home_stat_companies: 'Hosted Companies & Startups',
    home_stat_engineers: 'ICT Executives & Engineers',
    home_stat_parks: 'Connected Technoparks in Tunisia',
    home_stat_occupancy: 'Space Occupancy Rate',

    // Services / Prestations
    home_services_title: 'Services & Contractual Framework',
    home_services_desc: 'A comprehensive offering framed by the hosting agreement at S2T Technopark (Articles 1 to 16).',
    home_service_1_title: 'Hosting & Fitted Workspaces',
    home_service_1_desc: 'Equipped offices, business incubators, and modular workspaces tailored to requested areas (Art. 2 of contract).',
    home_service_2_title: 'Legal Management & Amendments',
    home_service_2_desc: 'Drafting hosting contracts, renewals, terminations, and monitoring surface area adjustments (Art. 11).',
    home_service_3_title: 'Invoicing & Financial Tracking',
    home_service_3_desc: 'Automated fee invoicing, due date alerts by the 5th of each month, and structured payment follow-ups (D+15, D+30).',
    home_service_4_title: 'Complementary Amenities',
    home_service_4_desc: 'High-speed fiber Internet, conference and training rooms, shared reception, and 24/7 security.',

    // Pricing / Bareme Art 6
    home_pricing_tag: 'Article 6 of Hosting Agreement',
    home_pricing_title: 'Official Rental Fees Schedule',
    home_pricing_desc: 'Official pricing per m² calculated according to incubation seniority in the technopark.',
    home_badge_recommended: 'RECOMMENDED',
    home_tier_1_period: '1st Year of Incubation',
    home_tier_1_badge: 'Incubator Rate Phase 1',
    home_tier_1_desc: 'Preferential incubation rate for early-stage startups and innovative tech ventures in seed phase.',
    home_tier_2_period: '2nd Year of Incubation',
    home_tier_2_badge: 'Incubator Rate Phase 2',
    home_tier_2_desc: 'Growth support with expanded access to shared technopark infrastructure and amenities.',
    home_tier_3_period: '3rd Year & Beyond',
    home_tier_3_badge: 'Consolidation Rate',
    home_tier_3_desc: 'Consolidated scale for established tech enterprises entering scaling and industrial partnerships.',
    home_pricing_unit: 'Excl. VAT / m² / yr',
    home_pricing_note: '✓ Due before the 5th of each month (Art. 6.3)',

    // Dual Portal CTA Box
    home_cta_title: 'Join the #1 ICT Tech Ecosystem in Tunisia',
    home_cta_desc: 'Whether you are a startup seeking office incubation or a resident company managing agreements and invoices, access your portal now.',
    home_btn_apply: 'Apply for Hosting',
    home_btn_contact: 'Contact Management',

    // Footer
    footer_s2t_desc: 'Management Company of El Ghazala Technopark. Urban development, enterprise hosting, and contractual lease administration.',
    footer_nav: 'Navigation',
    footer_spaces: 'Dedicated Portals',
    footer_contact_title: 'Contact',
    footer_contact_address: 'El Ghazala Technopark, Ariana',
    footer_copyright: 'Smart Tunisian Technoparks (S2T). All rights reserved.',
    footer_ministry: 'Under the supervision of the Ministry of Communication Technologies — Republic of Tunisia',
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

    // Home Page Translations
    home_badge: 'القطب التكنولوجي الغزالة — S2T',
    home_hero_title: 'إدارة العقود',
    home_hero_title_sub: 'والفوترة S2T',
    home_hero_desc: 'المنصة الرسمية المخصصة للشؤون القانونية، ومتابعة اتفاقيات الإيواء (الفصول من 1 إلى 16)، وتعديلات المساحة، واستخلاص المستحقات الإيجارية.',
    home_btn_my_space: 'الدخول إلى فضائكم',
    home_role_admin: 'الإدارة',
    home_role_client: 'المؤسسة',
    home_btn_resident: 'فضاء المؤسسة المقيمة',
    home_btn_legal: 'بوابة الشؤون القانونية والمالية',
    home_trust_law: 'مطابق للقانون عدد 2001-50 و 2006-37',
    home_trust_rates: 'تسعيرات مقننة (الفصل 6)',
    home_trust_deposit: 'ضمان تأمين محمي (الفصل 7)',
    home_floating_address: 'طريق رواد كلم 3.5، أريانة',
    home_floating_companies_title: '+250 شركة مقيمة',
    home_floating_companies_sub: 'محضنة وقطب تميز في تكنولوجيا المعلومات',

    // Stats
    home_stat_companies: 'شركات ومؤسسات ناشئة مقيمة',
    home_stat_engineers: 'إطارات ومهندسو تكنولوجيا المعلومات',
    home_stat_parks: 'أقطاب تكنولوجية متصلة بتونس',
    home_stat_occupancy: 'نسبة إشغال المساحات',

    // Services / Prestations
    home_services_title: 'الخدمات والمنظومة التعاقدية',
    home_services_desc: 'عرض متكامل ومؤطر بعقد الإيواء بالقطب التكنولوجي S2T (الفصول من 1 إلى 16).',
    home_service_1_title: 'الإيواء والمساحات المهيأة',
    home_service_1_desc: 'مكاتب مجهزة، محاضن مؤسسات ومساحات قابلة للتقسيم والتعديل حسب المساحة المطلوبة (الفصل 2 من العقد).',
    home_service_2_title: 'الإدارة القانونية والملاحق',
    home_service_2_desc: 'إبرام عقود الإيواء، التجديدات، إنهاء العقود ومتابعة تعديلات المساحة والملاحق التعاقدية (الفصل 11).',
    home_service_3_title: 'الفوترة والمتابعة المالية',
    home_service_3_desc: 'فوترة آلية للمستحقات، تنبيهات الاستحقاق قبل اليوم الخامس من كل شهر ومتابعة التذكيرات (ي+15، ي+30).',
    home_service_4_title: 'الخدمات التكميلية والمشتركة',
    home_service_4_desc: 'إنترنت فائق السرعة عبر الألياف البصرية، قاعات اجتماعات وتدريب، أمانة عامة مشتركة وحراسة أمنية 24/7.',

    // Pricing / Bareme Art 6
    home_pricing_tag: 'الفصل 6 من عقد الإيواء',
    home_pricing_title: 'جدول التسعيرات الرسمية للمستحقات الإيجارية',
    home_pricing_desc: 'تسعيرة رسمية للمتر المربع محتسبة بدقة وفقاً لأقدمية المؤسسة في المحضنة التكنولوجية.',
    home_badge_recommended: 'موصى به',
    home_tier_1_period: 'السنة الأولى للإيواء',
    home_tier_1_badge: 'تسعيرة المحضنة المرحلة 1',
    home_tier_1_desc: 'تسعيرة تفاضلية لاحتضان الشركات الناشئة والمبتكرة في مرحلة الانطلاق والنمو الأولي.',
    home_tier_2_period: 'السنة الثانية للإيواء',
    home_tier_2_badge: 'تسعيرة المحضنة المرحلة 2',
    home_tier_2_desc: 'مرافقة في مرحلة تسريع النمو مع نفاذ موسع إلى كافة المرافق والخدمات المشتركة بالقطب.',
    home_tier_3_period: 'السنة الثالثة فما فوق',
    home_tier_3_badge: 'تسعيرة التثبيت',
    home_tier_3_desc: 'تسعيرة موحدة للمؤسسات في مرحلة التوسع التكنولوجي وإبرام الشراكات الصناعية.',
    home_pricing_unit: 'دون أداء / م² / سنوياً',
    home_pricing_note: '✓ تدفع قبل اليوم الخامس من كل شهر (الفصل 6.3)',

    // Dual Portal CTA Box
    home_cta_title: 'انضموا إلى المنظومة التكنولوجية الأولى في تونس',
    home_cta_desc: 'سواء كنتم مؤسسة ناشئة تبحث عن فضاء إيواء أو شركة مقيمة ترغب في الإطلاع على فواتيرها وعقودها، تفضلوا بالدخول إلى فضائكم الآن.',
    home_btn_apply: 'الترشح للإيواء بالقطب',
    home_btn_contact: 'الاتصال بالإدارة العامة',

    // Footer
    footer_s2t_desc: 'شركة التصرف في القطب التكنولوجي الغزالة. تهيئة، إيواء المؤسسات وإدارة عقود الإيواء.',
    footer_nav: 'التصفح',
    footer_spaces: 'الفضاءات المخصصة',
    footer_contact_title: 'الاتصال',
    footer_contact_address: 'القطب التكنولوجي الغزالة، أريانة',
    footer_copyright: 'تونس للأقطاب التكنولوجية الذكية (S2T). جميع الحقوق محفوظة.',
    footer_ministry: 'تحت إشراف وزارة تكنولوجيات الاتصال — الجمهورية التونسية',
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
