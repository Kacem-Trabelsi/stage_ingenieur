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

    // About Page Translations
    about_badge: 'Histoire & Vision',
    about_title: 'À Propos de',
    about_title_sub: 'Smart Tunisian Technoparks',
    about_desc: 'Pionnier de l\'économie du savoir et premier pôle technologique en Tunisie, S2T impulse l\'innovation numérique, l\'hébergement d\'entreprises et la valorisation des compétences technologiques.',
    about_vocation_tag: 'Notre Vocation',
    about_vocation_title: 'Un catalyseur d\'innovation technologique au cœur du Maghreb',
    about_vocation_p1: 'Créé dans le cadre de la stratégie nationale de promotion des Technologies de l\'Information et de la Communication, S2T (Smart Tunisian Technoparks) gère notamment le prestigieux Pôle Technologique El Ghazala à l\'Ariana.',
    about_vocation_p2: 'S2T offre un environnement d\'affaires d\'excellence, doté d\'infrastructures de télécommunication de pointe, d\'un guichet unique administratif, juridique et financier pour accompagner les entreprises de l\'incubation jusqu\'au rayonnement international.',
    about_bullet_1: 'Conformité réglementaire aux lois n°2001-50 et n°2006-37',
    about_bullet_2: 'Partenariat étroit avec le Ministère des Technologies de la Communication',
    about_bullet_3: 'Gestion transparente des baux d\'hébergement & des redevances',
    about_stats_card_title: 'Chiffres Clés S2T',
    about_stats_card_sub: 'Impact National & International',
    about_stat_1_label: 'Superficie globale aménagée',
    about_stat_2_label: 'Sociétés résidentes',
    about_stat_3_label: 'Diplômés de l\'enseignement supérieur',
    about_stat_4_label: 'Année de création du pôle',
    about_missions_title: 'Nos Missions Stratégiques',
    about_missions_desc: 'Des engagements forts pour dynamiser l\'économie numérique tunisienne.',
    about_mission_1_title: 'Aménagement & Infrastructures Intelligentes',
    about_mission_1_desc: 'Conception et gestion d\'espaces bureautiques modernes, de pépinières et de centres de données adaptés aux exigences des multinationales et startups TIC.',
    about_mission_2_title: 'Incubation & Pépinière d\'Entreprises',
    about_mission_2_desc: 'Accompagnement juridique, technique et financier des porteurs de projets innovants avec des redevances locatives progressives et bonifiées.',
    about_mission_3_title: 'Animation de l\'Écosystème & Synergies',
    about_mission_3_desc: 'Création de passerelles directes entre les écoles d\'ingénieurs (Sup\'Com, INSAT, ENSI), les laboratoires de recherche et le tissu industriel.',
    about_mission_4_title: 'Cadre Juridique Sécurisé & Réglementaire',
    about_mission_4_desc: 'Application stricte des lois régissant les pôles technologiques (Loi n°2001-50 et Loi n°2006-37) pour garantir la pérennité contractuelle.',
    about_parks_title: 'Le Réseau National des Technoparcs',
    about_parks_desc: 'Un maillage territorial intelligent connecté pour favoriser l\'émergence de champions technologiques.',
    about_park_specialization: 'Spécialisation :',
    about_park_1_name: 'Pôle Technologique El Ghazala',
    about_park_1_city: 'Ariana / Grand Tunis',
    about_park_1_focus: 'Télécoms, Logiciels, IA & IoT',
    about_park_1_size: '65 Hectares',
    about_park_2_name: 'Technopark Manouba (Novation City)',
    about_park_2_city: 'Manouba',
    about_park_2_focus: 'Technologies Médicales & TIC',
    about_park_2_size: '52 Hectares',
    about_park_3_name: 'Technopôle de Sfax',
    about_park_3_city: 'Sfax',
    about_park_3_focus: 'Informatique & Multimédia',
    about_park_3_size: '40 Hectares',
    about_park_4_name: 'Technopôle de Sousse',
    about_park_4_city: 'Sousse',
    about_park_4_focus: 'Mécatronique & Électronique Intelligente',
    about_park_4_size: '56 Hectares',
    about_park_5_name: 'Technoparc de Bizerte',
    about_park_5_city: 'Bizerte',
    about_park_5_focus: 'Agro-alimentaire & Énergies Renouvelables',
    about_park_5_size: '35 Hectares',
    about_park_6_name: 'Technopôle de Médenine',
    about_park_6_city: 'Médenine',
    about_park_6_focus: 'Valorisation des Ressources Sahariennes',
    about_park_6_size: '30 Hectares',

    // Blog Page Translations
    blog_badge: 'Actualités & Publications',
    blog_title: 'Blog du',
    blog_title_sub: 'Pôle Technologique S2T',
    blog_desc: 'Retrouvez les dernières annonces, guides juridiques, appels à projets et actualités de l\'écosystème Smart Tunisian Technoparks.',
    blog_cat_all: 'Toutes les actualités',
    blog_cat_incubation: 'Incubation & Pépinière',
    blog_cat_juridique: 'Juridique & Réglementation',
    blog_cat_evenements: 'Événements & Salons',
    blog_cat_finance: 'Finance & Facturation',
    blog_search_placeholder: 'Rechercher un article...',
    blog_read_more: 'Lire l\'article',
    blog_by_author: 'Par',
    blog_close_modal: 'Fermer',
    blog_art1_title: 'Lancement de la nouvelle session d\'hébergement au Pôle El Ghazala 2026',
    blog_art1_date: '15 Mars 2026',
    blog_art1_read_time: '4 min de lecture',
    blog_art1_author: 'Direction de la Pépinière S2T',
    blog_art1_excerpt: 'S2T ouvre les candidatures pour les startups et PME innovantes souhaitant bénéficier d\'un bureau équipé à tarif bonifié (Article 6 : 30 DT/m² la première année).',
    blog_art1_content: `Le Pôle Technologique El Ghazala annonce l'ouverture officielle de l'appel à candidature pour l'intégration de la pépinière d'entreprises 2026.

Ce programme offre aux jeunes entreprises sélectionnées :
- Un local bureautique privatif avec charges comprises (Art. 2 du contrat d'hébergement).
- Une redevance annuelle bonifiée de 30,000 DT HTVA/m² pour la première année.
- Un accompagnement sur mesure pour la propriété intellectuelle, le financement et la mise en réseau.

Les dossiers de candidature doivent être soumis via le portail en ligne avant le 30 Avril 2026.`,
    blog_art2_title: 'Guide Pratique : Comprendre votre Contrat d\'Hébergement S2T (Articles 1 à 16)',
    blog_art2_date: '02 Mars 2026',
    blog_art2_read_time: '6 min de lecture',
    blog_art2_author: 'Service des Affaires Juridiques',
    blog_art2_excerpt: 'Tout savoir sur les obligations contractuelles, les modalités d\'avenant pour extension de surface et la constitution du dépôt de garantie (Article 7).',
    blog_art2_content: `Afin d'assurer une transparence totale avec les sociétés résidentes, le service juridique publie un guide détaillé expliquant chaque clause clé :

1. Prestations offertes & Charges (Article 2) :
L'accès aux espaces communs, le gardiennage 24/7, la fibre optique et les salles de réunion sont inclus dans le forfait de base.

2. Modalités de paiement (Article 6.3) :
La redevance mensuelle doit être réglée avant le 5 de chaque mois par virement ou ordre permanent.

3. Demandes d'Avenants (Article 11) :
Toute augmentation ou réduction de superficie nécessite la signature d'un avenant formalisé par les deux parties.`,
    blog_art3_title: 'Digitalisation des Factures & Suivi des Relances Automatisées',
    blog_art3_date: '20 Février 2026',
    blog_art3_read_time: '3 min de lecture',
    blog_art3_author: 'Direction Financière',
    blog_art3_excerpt: 'Mise en place de la plateforme de gestion unifiée permettant aux résidents de consulter en temps réel leurs factures, états de paiement et quittances.',
    blog_art3_content: `Dans le cadre de la modernisation de ses services, S2T déploie son portail financier intelligent. 

Les entreprises résidentes peuvent désormais :
- Télécharger leurs avis de paiement et factures certifiées en format PDF.
- Suivre le statut de leurs relances (J+15 et J+30) pour éviter tout intérêt de retard.
- Soumettre des demandes de justificatifs fiscaux en un clic.`,
    blog_art4_title: 'Forum National de l\'IA et de la Cybersécurité à El Ghazala',
    blog_art4_date: '10 Février 2026',
    blog_art4_read_time: '5 min de lecture',
    blog_art4_author: 'Pôle Communication',
    blog_art4_excerpt: 'Plus de 500 experts, chercheurs et dirigeants d\'entreprises réunis à l\'amphithéâtre S2T pour débattre des défis de l\'intelligence artificielle générative.',
    blog_art4_content: `Le Pôle El Ghazala a accueilli la 4ème édition du Forum National de l'IA. Cet événement a permis aux startups hébergées de présenter leurs solutions innovantes aux investisseurs et fonds de capital-risque tunisiens et internationaux.`,

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

    // About Page Translations
    about_badge: 'History & Vision',
    about_title: 'About',
    about_title_sub: 'Smart Tunisian Technoparks',
    about_desc: 'Pioneer of the knowledge economy and first technology park in Tunisia, S2T drives digital innovation, enterprise hosting, and the valorization of technological skills.',
    about_vocation_tag: 'Our Mission',
    about_vocation_title: 'A catalyst for technological innovation at the heart of the Maghreb',
    about_vocation_p1: 'Created within the national strategy for Information and Communication Technologies, S2T (Smart Tunisian Technoparks) notably manages the prestigious El Ghazala Technopark in Ariana.',
    about_vocation_p2: 'S2T offers a world-class business environment with advanced telecommunications infrastructure, a single administrative, legal, and financial desk to guide companies from incubation to international prominence.',
    about_bullet_1: 'Regulatory compliance with Laws No. 2001-50 & 2006-37',
    about_bullet_2: 'Close partnership with the Ministry of Communication Technologies',
    about_bullet_3: 'Transparent management of hosting leases & fee collection',
    about_stats_card_title: 'S2T Key Figures',
    about_stats_card_sub: 'National & International Impact',
    about_stat_1_label: 'Total fitted surface area',
    about_stat_2_label: 'Resident companies',
    about_stat_3_label: 'Higher education graduates',
    about_stat_4_label: 'Technopark foundation year',
    about_missions_title: 'Our Strategic Missions',
    about_missions_desc: 'Firm commitments to invigorate the Tunisian digital economy.',
    about_mission_1_title: 'Development & Smart Infrastructure',
    about_mission_1_desc: 'Design and management of modern office spaces, incubators, and data centers tailored to multinational and ICT startup requirements.',
    about_mission_2_title: 'Incubation & Business Acceleration',
    about_mission_2_desc: 'Legal, technical, and financial support for innovative project holders with progressive preferential rental rates.',
    about_mission_3_title: 'Ecosystem Animation & Synergies',
    about_mission_3_desc: 'Building direct bridges between engineering schools (Sup\'Com, INSAT, ENSI), research laboratories, and industry leaders.',
    about_mission_4_title: 'Secure Legal & Regulatory Framework',
    about_mission_4_desc: 'Strict enforcement of laws governing technology parks (Law No. 2001-50 & Law No. 2006-37) to guarantee contractual durability.',
    about_parks_title: 'National Technopark Network',
    about_parks_desc: 'An intelligent connected regional network to foster the rise of tech champions.',
    about_park_specialization: 'Specialization:',
    about_park_1_name: 'El Ghazala Technopark',
    about_park_1_city: 'Ariana / Greater Tunis',
    about_park_1_focus: 'Telecom, Software, AI & IoT',
    about_park_1_size: '65 Hectares',
    about_park_2_name: 'Manouba Technopark (Novation City)',
    about_park_2_city: 'Manouba',
    about_park_2_focus: 'Medical Technologies & ICT',
    about_park_2_size: '52 Hectares',
    about_park_3_name: 'Sfax Technopole',
    about_park_3_city: 'Sfax',
    about_park_3_focus: 'Computer Science & Multimedia',
    about_park_3_size: '40 Hectares',
    about_park_4_name: 'Sousse Technopole',
    about_park_4_city: 'Sousse',
    about_park_4_focus: 'Mechatronics & Smart Electronics',
    about_park_4_size: '56 Hectares',
    about_park_5_name: 'Bizerte Technopark',
    about_park_5_city: 'Bizerte',
    about_park_5_focus: 'Agri-food & Renewable Energies',
    about_park_5_size: '35 Hectares',
    about_park_6_name: 'Medenine Technopole',
    about_park_6_city: 'Medenine',
    about_park_6_focus: 'Saharan Resources Valorization',
    about_park_6_size: '30 Hectares',

    // Blog Page Translations
    blog_badge: 'News & Publications',
    blog_title: 'Blog of',
    blog_title_sub: 'S2T Technopark',
    blog_desc: 'Explore the latest announcements, legal guides, calls for proposals, and updates from the Smart Tunisian Technoparks ecosystem.',
    blog_cat_all: 'All News',
    blog_cat_incubation: 'Incubation & Hub',
    blog_cat_juridique: 'Legal & Regulation',
    blog_cat_evenements: 'Events & Expos',
    blog_cat_finance: 'Finance & Billing',
    blog_search_placeholder: 'Search an article...',
    blog_read_more: 'Read article',
    blog_by_author: 'By',
    blog_close_modal: 'Close',
    blog_art1_title: 'Launch of the 2026 Incubation Intake at El Ghazala Technopark',
    blog_art1_date: 'March 15, 2026',
    blog_art1_read_time: '4 min read',
    blog_art1_author: 'S2T Incubator Management',
    blog_art1_excerpt: 'S2T opens applications for tech startups and innovative SMEs looking for fitted offices at preferential rates (Art. 6: 30 TND/m² for the 1st year).',
    blog_art1_content: `El Ghazala Technopark officially announces the opening of the 2026 incubation application cycle.

Selected early-stage ventures will benefit from:
- Private fitted office space with utilities included (Art. 2 of Hosting Agreement).
- Preferential annual fee of 30.000 TND Excl. VAT/m² for the first year.
- Tailored advisory in IP protection, fundraising, and industry networking.

Applications must be submitted through the online portal before April 30, 2026.`,
    blog_art2_title: 'Practical Guide: Understanding your S2T Hosting Contract (Articles 1 to 16)',
    blog_art2_date: 'March 02, 2026',
    blog_art2_read_time: '6 min read',
    blog_art2_author: 'Legal Affairs Department',
    blog_art2_excerpt: 'Everything you need to know about contractual terms, surface extension amendments, and security deposit management (Article 7).',
    blog_art2_content: `To ensure full transparency with resident companies, the legal department publishes a detailed overview of key clauses:

1. Services & Utilities (Article 2):
Access to common areas, 24/7 security, high-speed fiber internet, and conference rooms are fully covered in the core agreement.

2. Payment Terms (Article 6.3):
Monthly fees must be settled prior to the 5th of each month via wire transfer or permanent order.

3. Contract Amendment Requests (Article 11):
Any increase or reduction in occupied space requires a formal contract amendment signed by both parties.`,
    blog_art3_title: 'Digital Invoices & Automated Payment Reminders',
    blog_art3_date: 'February 20, 2026',
    blog_art3_read_time: '3 min read',
    blog_art3_author: 'Finance Department',
    blog_art3_excerpt: 'Rollout of the unified portal enabling residents to check invoices, payment status, and tax receipts in real time.',
    blog_art3_content: `As part of its digital transformation, S2T introduces an intelligent financial portal.

Resident enterprises can now:
- Download official payment notices and certified invoices in PDF format.
- Monitor payment reminder timelines (D+15 and D+30) to prevent penalty fees.
- Submit tax clearance documentation requests with one click.`,
    blog_art4_title: 'National AI & Cybersecurity Forum at El Ghazala',
    blog_art4_date: 'February 10, 2026',
    blog_art4_read_time: '5 min read',
    blog_art4_author: 'Communications Division',
    blog_art4_excerpt: 'Over 500 tech leaders, researchers, and venture capitalists gathered at S2T auditorium to discuss generative AI advancements.',
    blog_art4_content: `El Ghazala Technopark hosted the 4th edition of the National AI Forum. This premier event gave hosted tech startups the opportunity to showcase innovations to regional and global venture capital funds.`,

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

    // About Page Translations
    about_badge: 'التاريخ والرؤية',
    about_title: 'حول',
    about_title_sub: 'تونس للأقطاب التكنولوجية الذكية',
    about_desc: 'رائد اقتصاد المعرفة وأول قطب تكنولوجي في تونس، تعمل S2T على دفع عجلة الابتكار الرقمي وإيواء المؤسسات وتثمين الكفاءات التكنولوجية.',
    about_vocation_tag: 'رسالتنا ومهمتنا',
    about_vocation_title: 'محفز للابتكار التكنولوجي في قلب المغرب العربي',
    about_vocation_p1: 'أُنشئت S2T في إطار الاستراتيجية الوطنية للنهوض بتكنولوجيات المعلومات والاتصال، وتشرف بشكل خاص على إدارة القطب التكنولوجي الغزالة العريق بأريانة.',
    about_vocation_p2: 'توفر S2T بيئة أعمال متميزة ومجهزة ببنية تحتية متطورة للاتصالات وشباك موحد إداري وقانوني ومالي لمرافقة المؤسسات من مرحلة الاحتضان إلى الإشعاع الدولي.',
    about_bullet_1: 'مطابقة تشريعية وتنظيمية للقانونين عدد 2001-50 وعدد 2006-37',
    about_bullet_2: 'شراكة وثيقة ومتواصلة مع وزارة تكنولوجيات الاتصال',
    about_bullet_3: 'إدارة شفافة لعقود الإيواء واستخلاص المستحقات الإيجارية',
    about_stats_card_title: 'أرقام ومؤشرات رئيسية S2T',
    about_stats_card_sub: 'إشعاع وأثر وطني ودولي',
    about_stat_1_label: 'إجمالي المساحة المهيأة',
    about_stat_2_label: 'مؤسسة مقيمة ومحتضنة',
    about_stat_3_label: 'خريجو التعليم العالي والجامعات',
    about_stat_4_label: 'سنة تأسيس وانطلاق القطب',
    about_missions_title: 'مهامنا الاستراتيجية',
    about_missions_desc: 'التزامات قوية وراسخة لتنشيط ودفع الاقتصاد الرقمي التونسي.',
    about_mission_1_title: 'التهيئة والبنية التحتية الذكية',
    about_mission_1_desc: 'تصميم وإدارة مساحات مكتبية عصرية ومحاضن مؤسسات ومراكز بيانات متطورة تلبي متطلبات الشركات العالمية والناشئة.',
    about_mission_2_title: 'الاحتضان ومحاضن المؤسسات',
    about_mission_2_desc: 'مرافقة قانونية وفنية ومالية لحاملي المشاريع المبتكرة مع تسعيرات إيجارية تفاضلية وتصاعدية.',
    about_mission_3_title: 'تنشيط المنظومة وخلق التكامل',
    about_mission_3_desc: 'بناء جسور مباشرة بين مدارس المهندسين (Sup\'Com، INSAT، ENSI) ومخابر البحث والنسيج الصناعي.',
    about_mission_4_title: 'إطار قانوني وتشريعي آمن',
    about_mission_4_desc: 'تطبيق صارم للقوانين المنظمة للأقطاب التكنولوجية (القانون عدد 2001-50 و2006-37) لضمان الاستقرار التعاقدي.',
    about_parks_title: 'الشبكة الوطنية للأقطاب التكنولوجية',
    about_parks_desc: 'شبكة وطنية متصلة وذكية لتشجيع بزوغ رواد التكنولوجيا والابتكار.',
    about_park_specialization: 'مجال التخصص :',
    about_park_1_name: 'القطب التكنولوجي الغزالة',
    about_park_1_city: 'أريانة / تونس الكبرى',
    about_park_1_focus: 'الاتصالات، البرمجيات، الذكاء الاصطناعي وإنترنت الأشياء',
    about_park_1_size: '65 هكتار',
    about_park_2_name: 'قطب منوبة التكنولوجي (Novation City)',
    about_park_2_city: 'منوبة',
    about_park_2_focus: 'التكنولوجيات الطبية وتكنولوجيا المعلومات',
    about_park_2_size: '52 هكتار',
    about_park_3_name: 'القطب التكنولوجي بصفاقس',
    about_park_3_city: 'صفاقس',
    about_park_3_focus: 'الإعلامية والوسائط المتعددة',
    about_park_3_size: '40 هكتار',
    about_park_4_name: 'القطب التكنولوجي بسوسة',
    about_park_4_city: 'سوسة',
    about_park_4_focus: 'الميكاترونيك والإلكترونيك الذكي',
    about_park_4_size: '56 هكتار',
    about_park_5_name: 'القطب التكنولوجي ببنزرت',
    about_park_5_city: 'بنزرت',
    about_park_5_focus: 'الصناعات الغذائية والطاقات المتجددة',
    about_park_5_size: '35 هكتار',
    about_park_6_name: 'القطب التكنولوجي بمدنين',
    about_park_6_city: 'مدنين',
    about_park_6_focus: 'تثمين الموارد الصحراوية',
    about_park_6_size: '30 هكتار',

    // Blog Page Translations
    blog_badge: 'الأخبار والمنشورات',
    blog_title: 'مدونة',
    blog_title_sub: 'القطب التكنولوجي S2T',
    blog_desc: 'اطلعوا على أحدث الإعلانات والأدلة القانونية وطلبات الترشح وأخبار منظومة تونس للأقطاب التكنولوجية الذكية.',
    blog_cat_all: 'جميع الأخبار',
    blog_cat_incubation: 'الاحتضان والمحضنة',
    blog_cat_juridique: 'الشؤون القانونية والتشريعية',
    blog_cat_evenements: 'الفعاليات والمعارض',
    blog_cat_finance: 'المالية والفوترة',
    blog_search_placeholder: 'البحث عن مقال...',
    blog_read_more: 'قراءة المقال',
    blog_by_author: 'بقلم',
    blog_close_modal: 'إغلاق',
    blog_art1_title: 'إطلاق دورة الإيواء والاحتضان الجديدة بالقطب التكنولوجي الغزالة 2026',
    blog_art1_date: '15 مارس 2026',
    blog_art1_read_time: '4 دقائق قراءة',
    blog_art1_author: 'إدارة محضنة المؤسسات S2T',
    blog_art1_excerpt: 'تعلن S2T عن فتح باب الترشح للشركات الناشئة والمؤسسات المبتكرة الراغبة في التمتع بمكتب مجهز بتسعيرة تفاضلية (الفصل 6: 30 دينار/م² للسنة الأولى).',
    blog_art1_content: `يعلن القطب التكنولوجي الغزالة عن الافتتاح الرسمي لتقديم ملفات الترشح للاندماج بمحضنة المؤسسات لسنة 2026.

يقدم هذا البرنامج للشركات الشابة المنتقاة:
- فضاء مكتبياً خاصاً مع احتساب كافة الأعباء المشتركة (الفصل 2 من عقد الإيواء).
- تسعيرة إيجارية سنوية تفاضلية قدرها 30.000 د.ت دون أداء/م² للسنة الأولى.
- مرافقة وتأطيراً مخصصاً في مجالات الملكية الفكرية والتمويل وبناء شبكات الشراكة.

يجب تقديم ملفات الترشح عبر المنصة الرقمية قبل تاريخ 30 أفريل 2026.`,
    blog_art2_title: 'دليل تطبيقي: فهم عقد الإيواء بالقطب التكنولوجي S2T (الفصول من 1 إلى 16)',
    blog_art2_date: '02 مارس 2026',
    blog_art2_read_time: '6 دقائق قراءة',
    blog_art2_author: 'مصلحة الشؤون القانونية',
    blog_art2_excerpt: 'كل ما يجب معرفته حول الالتزامات التعاقدية وإجراءات ملاحق توسيع المساحة وتكوين ضمان التأمين (الفصل 7).',
    blog_art2_content: `لضمان الشفافية الكاملة مع الشركات المقيمة، تنشر المصلحة القانونية دليلاً تفصيلياً يوضح البنود الأساسية:

1. الخدمات المقدمة والأعباء المشتركة (الفصل 2):
النفاذ إلى الفضاءات المشتركة، الحراسة على مدار الساعة 24/7، الإنترنت عبر الألياف البصرية وقاعات الاجتماعات مشمولة في العرض الأساسي.

2. إجراءات وشروط الدفع (الفصل 6.3):
يجب سداد المستحقات الإيجارية الشهرية قبل اليوم الخامس من كل شهر بواسطة تحويل بنكي أو إذن اقتطاع دائم.

3. طلبات الملاحق التعاقدية (الفصل 11):
أي زيادة أو تخفيض في المساحة المشغولة تتطلب إبرام ملحق تعاقدي رسمي موقع من الطرفين.`,
    blog_art3_title: 'رقمنة الفواتير والمتابعة الآلية للتذكيرات والإشعارات',
    blog_art3_date: '20 فيفري 2026',
    blog_art3_read_time: '3 دقائق قراءة',
    blog_art3_author: 'الإدارة المالية',
    blog_art3_excerpt: 'إطلاق المنصة الموحدة التي تتيح للمقيمين الاطلاع المباشر على فواتيرهم وحالات الدفع وكشوفات الخلاص في الوقت الحقيقي.',
    blog_art3_content: `في إطار تحديث وتطوير خدماتها، تضع S2T على ذمة المقيمين بوابتها المالية الذكية.

يمكن للشركات المقيمة الآن:
- تحميل إشعارات الدفع والفواتير المعتمدة بصيغة PDF.
- متابعة مراحل التذكيرات المالية (ي+15 وي+30) لتجنب خطايا وغرامات التأخير.
- تقديم طلبات الشهادات والوثائق الجبائية بنقرة واحدة.`,
    blog_art4_title: 'المنتدى الوطني للذكاء الاصطناعي والأمن السيبراني بقطب الغزالة',
    blog_art4_date: '10 فيفري 2026',
    blog_art4_read_time: '5 دقائق قراءة',
    blog_art4_author: 'قطب الاتصال والإعلام',
    blog_art4_excerpt: 'أكثر من 500 خبير وباحث ورائد أعمال اجتمعوا بالمدرج الرئيسي لـ S2T لمناقشة تحديات الذكاء الاصطناعي التوليدي.',
    blog_art4_content: `احتضن القطب التكنولوجي الغزالة فعاليات الدورة الرابعة للمنتدى الوطني للذكاء الاصطناعي. وقد أتاح هذا الحدث للشركات الناشئة المحتضنة فرصة عرض حلولها المبتكرة أمام المستثمرين وصناديق رأس المال الاستثماري التونسية والدولية.`,

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
