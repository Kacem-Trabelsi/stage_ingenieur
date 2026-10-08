import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { 
  Building2, 
  ShieldCheck, 
  Receipt, 
  ArrowRight, 
  Wifi, 
  Scale, 
  MapPin
} from 'lucide-react';

const Home = () => {
  const { isAuthenticated, user } = useAuth();
  const { t, language } = useLanguage();
  const isRtl = language === 'ar';

  const stats = [
    { value: '250+', label: t('home_stat_companies'), color: 'var(--s2t-red)' },
    { value: '15 000+', label: t('home_stat_engineers'), color: 'var(--s2t-blue)' },
    { value: '7', label: t('home_stat_parks'), color: 'var(--s2t-teal)' },
    { value: '98%', label: t('home_stat_occupancy'), color: '#8B5CF6' },
  ];

  const prestations = [
    {
      title: t('home_service_1_title'),
      desc: t('home_service_1_desc'),
      icon: Building2,
      color: 'var(--s2t-blue)',
    },
    {
      title: t('home_service_2_title'),
      desc: t('home_service_2_desc'),
      icon: Scale,
      color: 'var(--s2t-red)',
    },
    {
      title: t('home_service_3_title'),
      desc: t('home_service_3_desc'),
      icon: Receipt,
      color: 'var(--s2t-teal)',
    },
    {
      title: t('home_service_4_title'),
      desc: t('home_service_4_desc'),
      icon: Wifi,
      color: '#F59E0B',
    },
  ];

  const contractTiers = [
    {
      period: t('home_tier_1_period'),
      rate: '30,000 DT',
      unit: t('home_pricing_unit'),
      desc: t('home_tier_1_desc'),
      badge: t('home_tier_1_badge'),
    },
    {
      period: t('home_tier_2_period'),
      rate: '55,000 DT',
      unit: t('home_pricing_unit'),
      desc: t('home_tier_2_desc'),
      badge: t('home_tier_2_badge'),
      featured: true,
    },
    {
      period: t('home_tier_3_period'),
      rate: '75,000 DT',
      unit: t('home_pricing_unit'),
      desc: t('home_tier_3_desc'),
      badge: t('home_tier_3_badge'),
    },
  ];

  return (
    <div style={{ paddingBottom: '4rem' }}>
      {/* Executive Hero Section */}
      <section className="hero-executive-section">
        <div className="container">
          <div className="hero-grid-layout">
            {/* Left Column: Text & CTAs */}
            <div className="hero-text-col">
              {/* Badge */}
              <div className="hero-badge-pill">
                <img
                  src="/tunisia-flag.svg"
                  alt={t('tunisia_label') || 'Tunisie'}
                  style={{ width: '18px', height: '12px', borderRadius: '2px', objectFit: 'cover' }}
                />
                <span>{t('home_badge')}</span>
              </div>

              {/* Main Heading */}
              <h1 className="hero-title">
                {t('home_hero_title')} <br />
                <span className="gradient-text">{t('home_hero_title_sub')}</span>
              </h1>

              {/* Description */}
              <p className="hero-description">
                {t('home_hero_desc')}
              </p>

              {/* Dual Action Buttons */}
              <div className="hero-actions-group">
                {isAuthenticated ? (
                  <Link to="/dashboard" className="btn btn-primary btn-lg hero-action-btn">
                    <span>
                      {t('home_btn_my_space')} ({user?.role === 'admin' ? t('home_role_admin') : t('home_role_client')})
                    </span>
                    <ArrowRight size={18} style={{ transform: isRtl ? 'rotate(180deg)' : 'none' }} />
                  </Link>
                ) : (
                  <>
                    <Link to="/login" className="btn btn-primary btn-lg hero-action-btn">
                      <Building2 size={18} />
                      <span>{t('home_btn_resident')}</span>
                    </Link>
                    <Link to="/login" className="btn btn-blue btn-lg hero-action-btn">
                      <ShieldCheck size={18} />
                      <span>{t('home_btn_legal')}</span>
                    </Link>
                  </>
                )}
              </div>

              {/* Trust badges */}
              <div className="hero-trust-list">
                <div className="hero-trust-item">
                  <span style={{ color: 'var(--s2t-teal)', fontWeight: 'bold' }}>✓</span>
                  <span>{t('home_trust_law')}</span>
                </div>
                <div className="hero-trust-item">
                  <span style={{ color: 'var(--s2t-teal)', fontWeight: 'bold' }}>✓</span>
                  <span>{t('home_trust_rates')}</span>
                </div>
                <div className="hero-trust-item">
                  <span style={{ color: 'var(--s2t-teal)', fontWeight: 'bold' }}>✓</span>
                  <span>{t('home_trust_deposit')}</span>
                </div>
              </div>
            </div>

            {/* Right Column: S2T Building Showcase with Floating Badges */}
            <div className="hero-image-col">
              <div className="hero-image-card">
                {/* Top Floating Badge */}
                <div className="floating-chip floating-chip-top">
                  <div className="floating-chip-badge-icon" style={{ background: 'var(--primary-light)', color: 'var(--s2t-red)' }}>
                    <MapPin size={15} />
                  </div>
                  <span>{t('home_floating_address')}</span>
                </div>

                {/* Main Building Photo */}
                <div className="hero-image-inner">
                  <img
                    src="/s2t-building.jpg"
                    alt={t('home_badge')}
                  />
                  <div className="hero-image-gradient-overlay" />
                </div>

                {/* Bottom Floating Badge */}
                <div className="floating-chip floating-chip-bottom">
                  <div className="floating-chip-badge-icon" style={{ background: 'var(--secondary-light)', color: 'var(--s2t-blue)' }}>
                    <Building2 size={15} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.8rem', fontWeight: 800, lineHeight: 1.2 }}>{t('home_floating_companies_title')}</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 500 }}>{t('home_floating_companies_sub')}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Metrics Banner */}
      <section className="container home-metrics-section">
        <div className="glass-card home-metrics-card">
          <div className="home-metrics-grid">
            {stats.map((s, idx) => (
              <div key={idx} className="home-metric-item">
                <div className="home-metric-value" style={{ color: s.color }}>
                  {s.value}
                </div>
                <div className="home-metric-label">
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Prestations & Missions S2T */}
      <section className="container home-section">
        <div className="home-section-header">
          <h2 className="home-section-title">
            {t('home_services_title')}
          </h2>
          <p className="home-section-subtitle">
            {t('home_services_desc')}
          </p>
        </div>

        <div className="home-services-grid">
          {prestations.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div key={idx} className="glass-card glass-card-hover home-service-card">
                <div 
                  className="home-service-icon-box"
                  style={{
                    background: `${item.color}15`,
                    color: item.color,
                    border: `1px solid ${item.color}35`,
                  }}
                >
                  <Icon size={26} />
                </div>
                <h3 className="home-service-title">{item.title}</h3>
                <p className="home-service-desc">
                  {item.desc}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Contract Article 6: Baremes des Redevances */}
      <section className="container home-section">
        <div className="home-section-header">
          <div className="home-pricing-tag-pill">
            {t('home_pricing_tag')}
          </div>
          <h2 className="home-section-title">
            {t('home_pricing_title')}
          </h2>
          <p className="home-section-subtitle">
            {t('home_pricing_desc')}
          </p>
        </div>

        <div className="home-pricing-grid">
          {contractTiers.map((tier, idx) => (
            <div
              key={idx}
              className={`glass-card home-pricing-card ${tier.featured ? 'home-pricing-card-featured' : ''}`}
            >
              {tier.featured && (
                <div className="home-pricing-recommended-badge">
                  {t('home_badge_recommended')}
                </div>
              )}

              <span className="badge" style={{
                background: tier.featured ? 'var(--primary-light)' : 'var(--bg-tertiary)',
                color: tier.featured ? 'var(--s2t-red)' : 'var(--text-secondary)',
                marginBottom: '1.25rem',
                alignSelf: 'flex-start'
              }}>
                {tier.badge}
              </span>

              <h3 style={{ fontSize: '1.35rem', marginBottom: '0.5rem' }}>{tier.period}</h3>
              
              <div style={{ margin: '1.25rem 0', display: 'flex', alignItems: 'baseline', flexWrap: 'wrap', gap: '0.35rem' }}>
                <span className="home-pricing-amount">
                  {tier.rate}
                </span>
                <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                  {tier.unit}
                </span>
              </div>

              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '1.5rem', flex: 1 }}>
                {tier.desc}
              </p>

              <div style={{
                paddingTop: '1.25rem',
                borderTop: '1px solid var(--border-color)',
                fontSize: '0.85rem',
                color: 'var(--text-muted)'
              }}>
                {t('home_pricing_note')}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Dual Portal Box */}
      <section className="container home-section">
        <div className="glass-card home-cta-card">
          <div className="home-cta-content">
            <div className="home-cta-text">
              <h3 className="home-cta-title">
                {t('home_cta_title')}
              </h3>
              <p className="home-cta-desc">
                {t('home_cta_desc')}
              </p>
            </div>
            <div className="home-cta-buttons">
              <Link to="/register" className="btn btn-primary btn-lg">
                {t('home_btn_apply')}
              </Link>
              <Link to="/contact" className="btn btn-secondary btn-lg">
                {t('home_btn_contact')}
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
