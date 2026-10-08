import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { 
  Building2, 
  Target, 
  Users, 
  CheckCircle2, 
  ShieldCheck, 
  Award, 
  MapPin 
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
      color: 'var(--s2t-blue)',
    },
    {
      title: t('about_mission_2_title'),
      desc: t('about_mission_2_desc'),
      icon: Target,
      color: 'var(--s2t-red)',
    },
    {
      title: t('about_mission_3_title'),
      desc: t('about_mission_3_desc'),
      icon: Users,
      color: 'var(--s2t-teal)',
    },
    {
      title: t('about_mission_4_title'),
      desc: t('about_mission_4_desc'),
      icon: ShieldCheck,
      color: '#8B5CF6',
    },
  ];

  return (
    <div style={{ paddingBottom: '4rem' }}>
      {/* Header Banner */}
      <section className="about-header-section">
        <div className="container about-header-container">
          <span className="badge about-header-badge">
            {t('about_badge')}
          </span>
          <h1 className="about-header-title">
            {t('about_title')} <span className="gradient-text">{t('about_title_sub')}</span>
          </h1>
          <p className="about-header-desc">
            {t('about_desc')}
          </p>
        </div>
      </section>

      {/* Presentation & Story */}
      <section className="container about-story-section">
        <div className="about-story-grid">
          <div className="about-story-content">
            <span className="about-story-tag">
              {t('about_vocation_tag')}
            </span>
            <h2 className="about-story-title">
              {t('about_vocation_title')}
            </h2>
            <p className="about-story-paragraph">
              {t('about_vocation_p1')}
            </p>
            <p className="about-story-paragraph">
              {t('about_vocation_p2')}
            </p>

            <div className="about-story-bullets">
              <div className="about-story-bullet-item">
                <CheckCircle2 size={18} color="var(--s2t-teal)" style={{ flexShrink: 0 }} />
                <span>{t('about_bullet_1')}</span>
              </div>
              <div className="about-story-bullet-item">
                <CheckCircle2 size={18} color="var(--s2t-teal)" style={{ flexShrink: 0 }} />
                <span>{t('about_bullet_2')}</span>
              </div>
              <div className="about-story-bullet-item">
                <CheckCircle2 size={18} color="var(--s2t-teal)" style={{ flexShrink: 0 }} />
                <span>{t('about_bullet_3')}</span>
              </div>
            </div>
          </div>

          <div className="glass-card about-stats-box">
            <div className="about-stats-header">
              <div className="about-stats-icon-wrapper">
                <Award size={24} />
              </div>
              <div>
                <h3 className="about-stats-heading">{t('about_stats_card_title')}</h3>
                <span className="about-stats-subheading">{t('about_stats_card_sub')}</span>
              </div>
            </div>

            <div className="about-stats-grid">
              <div className="about-stat-item">
                <div className="about-stat-val" style={{ color: 'var(--s2t-red)' }}>65 Ha</div>
                <div className="about-stat-lbl">{t('about_stat_1_label')}</div>
              </div>
              <div className="about-stat-item">
                <div className="about-stat-val" style={{ color: 'var(--s2t-blue)' }}>250+</div>
                <div className="about-stat-lbl">{t('about_stat_2_label')}</div>
              </div>
              <div className="about-stat-item">
                <div className="about-stat-val" style={{ color: 'var(--s2t-teal)' }}>98%</div>
                <div className="about-stat-lbl">{t('about_stat_3_label')}</div>
              </div>
              <div className="about-stat-item">
                <div className="about-stat-val" style={{ color: '#8B5CF6' }}>1999</div>
                <div className="about-stat-lbl">{t('about_stat_4_label')}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Missions Grid */}
      <section className="container about-missions-section">
        <div className="home-section-header">
          <h2 className="home-section-title">{t('about_missions_title')}</h2>
          <p className="home-section-subtitle">
            {t('about_missions_desc')}
          </p>
        </div>

        <div className="about-missions-grid">
          {missions.map((m, idx) => {
            const Icon = m.icon;
            return (
              <div key={idx} className="glass-card glass-card-hover about-mission-card">
                <div 
                  className="about-mission-icon-box"
                  style={{
                    background: `${m.color}15`,
                    color: m.color,
                    border: `1px solid ${m.color}35`,
                  }}
                >
                  <Icon size={24} />
                </div>
                <h3 className="about-mission-title">{m.title}</h3>
                <p className="about-mission-desc">
                  {m.desc}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Technopark Network in Tunisia */}
      <section className="container about-parks-section">
        <div className="home-section-header">
          <h2 className="home-section-title">{t('about_parks_title')}</h2>
          <p className="home-section-subtitle">
            {t('about_parks_desc')}
          </p>
        </div>

        <div className="about-parks-grid">
          {technoparks.map((p, idx) => (
            <div key={idx} className="glass-card about-park-card">
              <div className="about-park-icon-box">
                <MapPin size={20} />
              </div>
              <div className="about-park-info">
                <h4 className="about-park-name">{p.name}</h4>
                <div className="about-park-meta">
                  {p.city} • {p.size}
                </div>
                <div className="about-park-focus">
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
