import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Building2, 
  ShieldCheck, 
  FileText, 
  Receipt, 
  ArrowRight, 
  Sparkles, 
  Zap, 
  Wifi, 
  Users, 
  Scale, 
  Clock, 
  Award,
  ChevronRight,
  TrendingUp,
  MapPin
} from 'lucide-react';

const Home = () => {
  const { isAuthenticated, user } = useAuth();

  const stats = [
    { value: '250+', label: 'Entreprises & Startups Hébergées', color: 'var(--s2t-red)' },
    { value: '15 000+', label: 'Cadres & Ingénieurs TIC', color: 'var(--s2t-blue)' },
    { value: '7', label: 'Technoparcs Connectés en Tunisie', color: 'var(--s2t-teal)' },
    { value: '98%', label: 'Taux d\'Occupation des Espaces', color: '#8B5CF6' },
  ];

  const prestations = [
    {
      title: 'Hébergement & Espaces Aménagés',
      desc: 'Bureaux équipés, pépinières d\'entreprises et plateaux modulables selon la superficie demandée (Art. 2 du contrat).',
      icon: Building2,
      color: 'var(--s2t-blue)',
    },
    {
      title: 'Gestion Juridique & Avenants',
      desc: 'Établissement des contrats d\'hébergement, renouvellements, résiliations et suivi des modifications de superficie (Art. 11).',
      icon: Scale,
      color: 'var(--s2t-red)',
    },
    {
      title: 'Facturation & Suivi Financier',
      desc: 'Facturation automatisée des redevances, alertes d\'échéance au 5 du mois et suivi rigoureux des relances (J+15, J+30).',
      icon: Receipt,
      color: 'var(--s2t-teal)',
    },
    {
      title: 'Prestations Complémentaires',
      desc: 'Connexion Internet très haut débit, salles de réunion et de formation, secrétariat mutualisé et gardiennage 24/7.',
      icon: Wifi,
      color: '#F59E0B',
    },
  ];

  const contractTiers = [
    {
      period: '1ère Année d\'Hébergement',
      rate: '30,000 DT',
      unit: 'HTVA / m² / an',
      desc: 'Tarif préférentiel d\'incubation pour les jeunes pousses et startups innovantes en phase d\'amorçage.',
      badge: 'Tarif Pépinière Phase 1',
    },
    {
      period: '2ème Année d\'Hébergement',
      rate: '55,000 DT',
      unit: 'HTVA / m² / an',
      desc: 'Accompagnement dans la croissance avec accès élargi aux prestations mutualisées du pôle.',
      badge: 'Tarif Pépinière Phase 2',
      featured: true,
    },
    {
      period: '3ème Année & Plus',
      rate: '75,000 DT',
      unit: 'HTVA / m² / an',
      desc: 'Tarif consolidé pour entreprises en phase d\'expansion technologique et partenariats industriels.',
      badge: 'Tarif Consolidation',
    },
  ];

  return (
    <div style={{ paddingBottom: '6rem' }}>
      {/* Executive Hero Section */}
      <section className="hero-executive-section">
        <div className="container">
          <div className="hero-grid-layout">
            {/* Left Column: Text & CTAs */}
            <div className="hero-text-col">
              {/* Badge */}
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.6rem',
                padding: '0.45rem 1.1rem',
                borderRadius: 'var(--radius-full)',
                background: 'var(--primary-light)',
                border: '1px solid var(--border-focus)',
                fontSize: '0.85rem',
                fontWeight: 700,
                color: 'var(--s2t-red)',
                boxShadow: 'var(--shadow-sm)',
              }}>
                <img
                  src="/tunisia-flag.svg"
                  alt="Tunisie"
                  style={{ width: '18px', height: '12px', borderRadius: '2px', objectFit: 'cover' }}
                />
                <span>Pôle Technologique El Ghazala — S2T</span>
              </div>

              {/* Main Heading */}
              <h1 className="hero-title">
                Gestion des Contrats <br />
                <span className="gradient-text">& Facturation S2T</span>
              </h1>

              {/* Description */}
              <p className="hero-description">
                La plateforme officielle dédiée aux affaires juridiques, au suivi des conventions d'hébergement (Articles 1 à 16), aux modifications de superficie et au recouvrement financier des redevances locatives.
              </p>

              {/* Dual Action Buttons */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                {isAuthenticated ? (
                  <Link to="/dashboard" className="btn btn-primary btn-lg" style={{ gap: '0.6rem' }}>
                    <span>Accéder à votre Espace ({user?.role === 'admin' ? 'Administration' : 'Entreprise'})</span>
                    <ArrowRight size={18} />
                  </Link>
                ) : (
                  <>
                    <Link to="/login" className="btn btn-primary btn-lg" style={{ gap: '0.6rem' }}>
                      <Building2 size={18} />
                      <span>Espace Entreprise Hébergée</span>
                    </Link>
                    <Link to="/login" className="btn btn-blue btn-lg" style={{ gap: '0.6rem' }}>
                      <ShieldCheck size={18} />
                      <span>Portail Juridique & Finance</span>
                    </Link>
                  </>
                )}
              </div>

              {/* Trust badges */}
              <div className="hero-trust-list">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <span style={{ color: 'var(--s2t-teal)' }}>✓</span>
                  <span>Conforme Loi n°2001-50 & 2006-37</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <span style={{ color: 'var(--s2t-teal)' }}>✓</span>
                  <span>Tarifs réglementés (Art. 6)</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <span style={{ color: 'var(--s2t-teal)' }}>✓</span>
                  <span>Dépôt de garantie sécurisé (Art. 7)</span>
                </div>
              </div>
            </div>

            {/* Right Column: S2T Building Showcase with Floating Badges */}
            <div className="hero-image-col">
              <div className="hero-image-card">
                {/* Top Floating Badge */}
                <div className="floating-chip floating-chip-top">
                  <div className="floating-chip-badge-icon" style={{ background: 'var(--primary-light)', color: 'var(--s2t-red)' }}>
                    <MapPin size={16} />
                  </div>
                  <span>Route de Raoued Km 3.5, Ariana</span>
                </div>

                {/* Main Building Photo */}
                <div className="hero-image-inner">
                  <img
                    src="/s2t-building.jpg"
                    alt="Siège officiel du Pôle Technologique El Ghazala S2T"
                  />
                  <div className="hero-image-gradient-overlay" />
                </div>

                {/* Bottom Floating Badge */}
                <div className="floating-chip floating-chip-bottom">
                  <div className="floating-chip-badge-icon" style={{ background: 'var(--secondary-light)', color: 'var(--s2t-blue)' }}>
                    <Building2 size={16} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.8rem', fontWeight: 800 }}>250+ Sociétés Hébergées</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Pépinière & Pôle d'Excellence TIC</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Metrics Banner */}
      <section className="container" style={{ marginTop: '-2rem', marginBottom: '5rem', position: 'relative', zIndex: 10 }}>
        <div className="glass-card" style={{
          padding: '2rem 1.5rem',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1.5rem',
          boxShadow: 'var(--shadow-lg)',
        }}>
          {stats.map((s, idx) => (
            <div key={idx} style={{ textAlign: 'center', borderRight: idx < stats.length - 1 ? '1px solid var(--border-color)' : 'none' }}>
              <div style={{ fontSize: '2.2rem', fontWeight: 800, color: s.color, lineHeight: 1.1, marginBottom: '0.35rem' }}>
                {s.value}
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Prestations & Missions S2T */}
      <section className="container" style={{ marginBottom: '5.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
          <h2 style={{ fontSize: '2.2rem', marginBottom: '0.75rem' }}>
            Services & Dispositif Contractuel
          </h2>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '650px', margin: '0 auto', fontSize: '1rem' }}>
            Une offre complète encadrée par le contrat d'hébergement au Pôle Technologique S2T (Articles 1 à 16).
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '1.5rem',
        }}>
          {prestations.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div key={idx} className="glass-card glass-card-hover" style={{ padding: '2rem' }}>
                <div style={{
                  width: '52px',
                  height: '52px',
                  borderRadius: '14px',
                  background: `${item.color}15`,
                  color: item.color,
                  border: `1px solid ${item.color}35`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1.5rem',
                }}>
                  <Icon size={26} />
                </div>
                <h3 style={{ fontSize: '1.25rem', marginBottom: '0.6rem' }}>{item.title}</h3>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                  {item.desc}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Contract Article 6: Baremes des Redevances */}
      <section className="container" style={{ marginBottom: '5.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <div style={{
            display: 'inline-block',
            padding: '0.3rem 0.9rem',
            borderRadius: 'var(--radius-full)',
            background: 'var(--accent-light)',
            color: 'var(--s2t-teal)',
            fontSize: '0.8rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            marginBottom: '0.75rem',
          }}>
            Article 6 du Contrat d'Hébergement
          </div>
          <h2 style={{ fontSize: '2.2rem', marginBottom: '0.5rem' }}>
            Grille Tarifaire des Redevances Locatives
          </h2>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto' }}>
            Tarification officielle par m² calculée selon l'ancienneté en pépinière d'entreprises.
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '1.75rem',
        }}>
          {contractTiers.map((tier, idx) => (
            <div
              key={idx}
              className="glass-card"
              style={{
                padding: '2.25rem',
                position: 'relative',
                border: tier.featured ? '2px solid var(--s2t-red)' : '1px solid var(--border-color)',
                transform: tier.featured ? 'scale(1.02)' : 'none',
                boxShadow: tier.featured ? 'var(--shadow-glow)' : 'var(--shadow-md)',
              }}
            >
              {tier.featured && (
                <div style={{
                  position: 'absolute',
                  top: '-12px',
                  right: '24px',
                  background: 'var(--s2t-red)',
                  color: '#fff',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  padding: '0.25rem 0.75rem',
                  borderRadius: 'var(--radius-full)',
                }}>
                  RECOMMANDÉ
                </div>
              )}

              <span className="badge" style={{
                background: tier.featured ? 'var(--primary-light)' : 'var(--bg-tertiary)',
                color: tier.featured ? 'var(--s2t-red)' : 'var(--text-secondary)',
                marginBottom: '1.25rem',
              }}>
                {tier.badge}
              </span>

              <h3 style={{ fontSize: '1.35rem', marginBottom: '0.5rem' }}>{tier.period}</h3>
              
              <div style={{ margin: '1.25rem 0' }}>
                <span style={{ fontSize: '2.3rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  {tier.rate}
                </span>
                <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginLeft: '0.5rem' }}>
                  {tier.unit}
                </span>
              </div>

              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '1.5rem' }}>
                {tier.desc}
              </p>

              <div style={{
                paddingTop: '1.25rem',
                borderTop: '1px solid var(--border-color)',
                fontSize: '0.85rem',
                color: 'var(--text-muted)'
              }}>
                ✓ Payable avant le 5 de chaque mois (Art. 6.3)
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Dual Portal Box */}
      <section className="container">
        <div className="glass-card" style={{
          padding: '3rem',
          background: 'linear-gradient(135deg, rgba(225, 29, 72, 0.08) 0%, rgba(37, 99, 235, 0.08) 50%, rgba(13, 148, 136, 0.08) 100%)',
          border: '1px solid var(--border-focus)',
        }}>
          <div className="flex-between" style={{ flexWrap: 'wrap', gap: '2rem' }}>
            <div style={{ maxWidth: '600px' }}>
              <h3 style={{ fontSize: '1.8rem', marginBottom: '0.75rem' }}>
                Rejoignez le 1er Écosystème TIC en Tunisie
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.6 }}>
                Que vous soyez une startup en quête d'hébergement ou une entreprise résidente souhaitant consulter ses factures et conventions, accédez dès maintenant à votre espace.
              </p>
            </div>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <Link to="/register" className="btn btn-primary btn-lg">
                Candidater à l'Hébergement
              </Link>
              <Link to="/contact" className="btn btn-secondary btn-lg">
                Contacter la Direction
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
