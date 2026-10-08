import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
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
  const { t, language } = useLanguage();

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
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                {isAuthenticated ? (
                  <Link to="/dashboard" className="btn btn-primary btn-lg" style={{ gap: '0.6rem' }}>
                    <span>
                      {t('home_btn_my_space')} ({user?.role === 'admin' ? t('home_role_admin') : t('home_role_client')})
                    </span>
                    <ArrowRight size={18} style={{ transform: language === 'ar' ? 'rotate(180deg)' : 'none' }} />
                  </Link>
                ) : (
                  <>
                    <Link to="/login" className="btn btn-primary btn-lg" style={{ gap: '0.6rem' }}>
                      <Building2 size={18} />
                      <span>{t('home_btn_resident')}</span>
                    </Link>
                    <Link to="/login" className="btn btn-blue btn-lg" style={{ gap: '0.6rem' }}>
                      <ShieldCheck size={18} />
                      <span>{t('home_btn_legal')}</span>
                    </Link>
                  </>
                )}
              </div>

              {/* Trust badges */}
              <div className="hero-trust-list">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <span style={{ color: 'var(--s2t-teal)' }}>✓</span>
                  <span>{t('home_trust_law')}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <span style={{ color: 'var(--s2t-teal)' }}>✓</span>
                  <span>{t('home_trust_rates')}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <span style={{ color: 'var(--s2t-teal)' }}>✓</span>
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
                    <MapPin size={16} />
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
                    <Building2 size={16} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.8rem', fontWeight: 800 }}>{t('home_floating_companies_title')}</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 500 }}>{t('home_floating_companies_sub')}</div>
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
            <div key={idx} style={{ 
              textAlign: 'center', 
              borderRight: language === 'ar' ? 'none' : (idx < stats.length - 1 ? '1px solid var(--border-color)' : 'none'),
              borderLeft: language === 'ar' ? (idx < stats.length - 1 ? '1px solid var(--border-color)' : 'none') : 'none'
            }}>
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
            {t('home_services_title')}
          </h2>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '650px', margin: '0 auto', fontSize: '1rem' }}>
            {t('home_services_desc')}
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
            {t('home_pricing_tag')}
          </div>
          <h2 style={{ fontSize: '2.2rem', marginBottom: '0.5rem' }}>
            {t('home_pricing_title')}
          </h2>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto' }}>
            {t('home_pricing_desc')}
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
                  [language === 'ar' ? 'left' : 'right']: '24px',
                  background: 'var(--s2t-red)',
                  color: '#fff',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  padding: '0.25rem 0.75rem',
                  borderRadius: 'var(--radius-full)',
                }}>
                  {t('home_badge_recommended')}
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
                <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', [language === 'ar' ? 'marginRight' : 'marginLeft']: '0.5rem' }}>
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
                {t('home_pricing_note')}
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
                {t('home_cta_title')}
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.6 }}>
                {t('home_cta_desc')}
              </p>
            </div>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
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

