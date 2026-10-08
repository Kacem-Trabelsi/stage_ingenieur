import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { 
  Building2, 
  Target, 
  Compass, 
  Award, 
  MapPin, 
  Users, 
  CheckCircle2, 
  Globe2, 
  ShieldCheck, 
  ArrowRight 
} from 'lucide-react';

const About = () => {
  const { t, language } = useLanguage();

  const technoparks = [
    { 
      name: t('about_park_1_name'), 
      city: t('about_park_1_city'), 
      focus: t('about_park_1_focus'), 
      size: t('about_park_1_size') 
    },
    { 
      name: t('about_park_2_name'), 
      city: t('about_park_2_city'), 
      focus: t('about_park_2_focus'), 
      size: t('about_park_2_size') 
    },
    { 
      name: t('about_park_3_name'), 
      city: t('about_park_3_city'), 
      focus: t('about_park_3_focus'), 
      size: t('about_park_3_size') 
    },
    { 
      name: t('about_park_4_name'), 
      city: t('about_park_4_city'), 
      focus: t('about_park_4_focus'), 
      size: t('about_park_4_size') 
    },
    { 
      name: t('about_park_5_name'), 
      city: t('about_park_5_city'), 
      focus: t('about_park_5_focus'), 
      size: t('about_park_5_size') 
    },
    { 
      name: t('about_park_6_name'), 
      city: t('about_park_6_city'), 
      focus: t('about_park_6_focus'), 
      size: t('about_park_6_size') 
    },
  ];

  const missions = [
    {
      title: t('about_mission_1_title'),
      desc: t('about_mission_1_desc'),
      icon: Building2,
    },
    {
      title: t('about_mission_2_title'),
      desc: t('about_mission_2_desc'),
      icon: Target,
    },
    {
      title: t('about_mission_3_title'),
      desc: t('about_mission_3_desc'),
      icon: Users,
    },
    {
      title: t('about_mission_4_title'),
      desc: t('about_mission_4_desc'),
      icon: ShieldCheck,
    },
  ];

  return (
    <div style={{ paddingBottom: '6rem' }}>
      {/* Header Banner */}
      <section style={{
        padding: '5rem 0 3.5rem',
        textAlign: 'center',
        background: 'var(--grad-hero)',
        borderBottom: '1px solid var(--border-color)',
      }}>
        <div className="container" style={{ maxWidth: '850px' }}>
          <span className="badge" style={{ background: 'var(--secondary-light)', color: 'var(--s2t-blue)', marginBottom: '1.25rem' }}>
            {t('about_badge')}
          </span>
          <h1 style={{ fontSize: 'clamp(2.2rem, 5vw, 3.5rem)', marginBottom: '1.25rem' }}>
            {t('about_title')} <span className="gradient-text">{t('about_title_sub')}</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', lineHeight: 1.6 }}>
            {t('about_desc')}
          </p>
        </div>
      </section>

      {/* Presentation & Story */}
      <section className="container" style={{ padding: '4.5rem 1.5rem 3rem' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '3rem',
          alignItems: 'center',
        }}>
          <div>
            <span style={{ color: 'var(--s2t-red)', fontWeight: 700, textTransform: 'uppercase', fontSize: '0.85rem' }}>
              {t('about_vocation_tag')}
            </span>
            <h2 style={{ fontSize: '2.1rem', margin: '0.5rem 0 1.25rem' }}>
              {t('about_vocation_title')}
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.7, marginBottom: '1.25rem' }}>
              {t('about_vocation_p1')}
            </p>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.7, marginBottom: '1.75rem' }}>
              {t('about_vocation_p2')}
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <CheckCircle2 size={18} color="var(--s2t-teal)" style={{ flexShrink: 0 }} />
                <span style={{ fontSize: '0.925rem' }}>{t('about_bullet_1')}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <CheckCircle2 size={18} color="var(--s2t-teal)" style={{ flexShrink: 0 }} />
                <span style={{ fontSize: '0.925rem' }}>{t('about_bullet_2')}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <CheckCircle2 size={18} color="var(--s2t-teal)" style={{ flexShrink: 0 }} />
                <span style={{ fontSize: '0.925rem' }}>{t('about_bullet_3')}</span>
              </div>
            </div>
          </div>

          <div className="glass-card" style={{ padding: '2.5rem', background: 'var(--bg-secondary)', border: '1px solid var(--border-focus)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                background: 'var(--primary-light)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--s2t-red)',
                flexShrink: 0,
              }}>
                <Award size={24} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.25rem' }}>{t('about_stats_card_title')}</h3>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{t('about_stats_card_sub')}</span>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
              <div style={{ background: 'var(--bg-tertiary)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
                <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--s2t-red)' }}>65 Ha</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{t('about_stat_1_label')}</div>
              </div>
              <div style={{ background: 'var(--bg-tertiary)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
                <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--s2t-blue)' }}>250+</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{t('about_stat_2_label')}</div>
              </div>
              <div style={{ background: 'var(--bg-tertiary)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
                <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--s2t-teal)' }}>98%</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{t('about_stat_3_label')}</div>
              </div>
              <div style={{ background: 'var(--bg-tertiary)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
                <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#8B5CF6' }}>1999</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{t('about_stat_4_label')}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Missions Grid */}
      <section className="container" style={{ padding: '3rem 1.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{t('about_missions_title')}</h2>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto' }}>
            {t('about_missions_desc')}
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '1.5rem',
        }}>
          {missions.map((m, idx) => {
            const Icon = m.icon;
            return (
              <div key={idx} className="glass-card glass-card-hover" style={{ padding: '1.75rem' }}>
                <div style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '12px',
                  background: 'var(--bg-tertiary)',
                  color: 'var(--s2t-blue)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1.25rem',
                  flexShrink: 0,
                }}>
                  <Icon size={24} />
                </div>
                <h3 style={{ fontSize: '1.15rem', marginBottom: '0.5rem' }}>{m.title}</h3>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                  {m.desc}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Technopark Network in Tunisia */}
      <section className="container" style={{ padding: '3rem 1.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{t('about_parks_title')}</h2>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '650px', margin: '0 auto' }}>
            {t('about_parks_desc')}
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '1.25rem',
        }}>
          {technoparks.map((p, idx) => (
            <div key={idx} className="glass-card" style={{ padding: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
              <div style={{
                padding: '0.6rem',
                borderRadius: '10px',
                background: 'var(--secondary-light)',
                color: 'var(--s2t-blue)',
                flexShrink: 0,
              }}>
                <MapPin size={20} />
              </div>
              <div>
                <h4 style={{ fontSize: '1.05rem', marginBottom: '0.2rem' }}>{p.name}</h4>
                <div style={{ fontSize: '0.8rem', color: 'var(--s2t-red)', fontWeight: 600, marginBottom: '0.35rem' }}>
                  {p.city} • {p.size}
                </div>
                <div style={{ fontSize: '0.825rem', color: 'var(--text-secondary)' }}>
                  {t('about_park_specialization')} {p.focus}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default About;

