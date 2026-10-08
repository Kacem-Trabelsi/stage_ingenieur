import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  Send, 
  CheckCircle2, 
  HelpCircle, 
  ChevronDown, 
  Building2,
  Scale,
  Receipt
} from 'lucide-react';

const Contact = () => {
  const { t, language } = useLanguage();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    subject: "Demande d'hébergement & Superficie",
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  const faqs = [
    {
      q: t('contact_faq1_q'),
      a: t('contact_faq1_a'),
    },
    {
      q: t('contact_faq2_q'),
      a: t('contact_faq2_a'),
    },
    {
      q: t('contact_faq3_q'),
      a: t('contact_faq3_a'),
    },
    {
      q: t('contact_faq4_q'),
      a: t('contact_faq4_a'),
    },
    {
      q: t('contact_faq5_q'),
      a: t('contact_faq5_a'),
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
          <span className="badge" style={{ background: 'var(--accent-light)', color: 'var(--s2t-teal)', marginBottom: '1.25rem' }}>
            {t('contact_badge')}
          </span>
          <h1 style={{ fontSize: 'clamp(2.2rem, 5vw, 3.5rem)', marginBottom: '1.25rem' }}>
            {t('contact_title')} <span className="gradient-text">{t('contact_title_sub')}</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', lineHeight: 1.6 }}>
            {t('contact_desc')}
          </p>
        </div>
      </section>

      {/* Main Grid: Info + Contact Form */}
      <section className="container" style={{ padding: '4.5rem 1.5rem 3rem' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '2.5rem',
        }}>
          {/* Left Column: Direct Contact Info */}
          <div>
            <h2 style={{ fontSize: '1.8rem', marginBottom: '1rem' }}>{t('contact_info_title')}</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', lineHeight: 1.6 }}>
              {t('contact_info_desc')}
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div className="glass-card" style={{ padding: '1.25rem', display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                <div style={{ padding: '0.6rem', borderRadius: '10px', background: 'var(--primary-light)', color: 'var(--s2t-red)', flexShrink: 0 }}>
                  <MapPin size={22} />
                </div>
                <div>
                  <h4 style={{ fontSize: '1rem', marginBottom: '0.2rem' }}>{t('contact_addr_title')}</h4>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                    {t('contact_addr_val')}
                  </p>
                </div>
              </div>

              <div className="glass-card" style={{ padding: '1.25rem', display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                <div style={{ padding: '0.6rem', borderRadius: '10px', background: 'var(--secondary-light)', color: 'var(--s2t-blue)', flexShrink: 0 }}>
                  <Phone size={22} />
                </div>
                <div>
                  <h4 style={{ fontSize: '1rem', marginBottom: '0.2rem' }}>{t('contact_phone_title')}</h4>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                    {t('contact_phone_standard')} +216 71 857 000 <br />
                    {t('contact_phone_fax')} +216 71 856 000
                  </p>
                </div>
              </div>

              <div className="glass-card" style={{ padding: '1.25rem', display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                <div style={{ padding: '0.6rem', borderRadius: '10px', background: 'var(--accent-light)', color: 'var(--s2t-teal)', flexShrink: 0 }}>
                  <Mail size={22} />
                </div>
                <div>
                  <h4 style={{ fontSize: '1rem', marginBottom: '0.2rem' }}>{t('contact_email_title')}</h4>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                    {t('contact_email_billing')} facturation@s2t.tn <br />
                    {t('contact_email_legal')} juridique@s2t.tn
                  </p>
                </div>
              </div>

              <div className="glass-card" style={{ padding: '1.25rem', display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                <div style={{ padding: '0.6rem', borderRadius: '10px', background: 'rgba(245, 158, 11, 0.15)', color: '#F59E0B', flexShrink: 0 }}>
                  <Clock size={22} />
                </div>
                <div>
                  <h4 style={{ fontSize: '1rem', marginBottom: '0.2rem' }}>{t('contact_hours_title')}</h4>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                    {t('contact_hours_val')}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Contact Form */}
          <div className="glass-card" style={{ padding: '2.5rem' }}>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{t('contact_form_title')}</h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1.75rem' }}>
              {t('contact_form_desc')}
            </p>

            {submitted ? (
              <div style={{
                background: 'rgba(16, 185, 129, 0.12)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                color: '#10B981',
                padding: '1.5rem',
                borderRadius: 'var(--radius-md)',
                textAlign: 'center',
              }}>
                <CheckCircle2 size={42} style={{ margin: '0 auto 0.75rem' }} />
                <h4 style={{ fontSize: '1.2rem', marginBottom: '0.35rem' }}>{t('contact_success_title')}</h4>
                <p style={{ fontSize: '0.875rem' }}>
                  {t('contact_success_sub')}
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">{t('contact_field_name')}</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder={t('contact_ph_name')}
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">{t('contact_field_company')}</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder={t('contact_ph_company')}
                      value={formData.company}
                      onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">{t('contact_field_email')}</label>
                    <input
                      type="email"
                      className="form-input"
                      placeholder={t('contact_ph_email')}
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">{t('contact_field_phone')}</label>
                    <input
                      type="tel"
                      className="form-input"
                      placeholder={t('contact_ph_phone')}
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">{t('contact_field_subject')}</label>
                  <select
                    className="form-select"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  >
                    <option value="Demande d'hébergement & Superficie">{t('contact_opt_hosting')}</option>
                    <option value="Affaires Juridiques & Contrat">{t('contact_opt_legal')}</option>
                    <option value="Facturation & Paiement de Redevance">{t('contact_opt_billing')}</option>
                    <option value="Demande d'Avenant / Modification">{t('contact_opt_amendment')}</option>
                    <option value="Autre demande">{t('contact_opt_other')}</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">{t('contact_field_message')}</label>
                  <textarea
                    className="form-textarea"
                    placeholder={t('contact_ph_message')}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ width: '100%', gap: '0.5rem', padding: '0.85rem' }}
                >
                  <Send size={16} style={{ transform: language === 'ar' ? 'rotate(180deg)' : 'none' }} />
                  <span>{t('contact_btn_send')}</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* FAQ Accordion Section */}
      <section className="container" style={{ padding: '3rem 1.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <span className="badge" style={{ background: 'var(--secondary-light)', color: 'var(--s2t-blue)', marginBottom: '0.75rem' }}>
            {t('contact_faq_badge')}
          </span>
          <h2 style={{ fontSize: '2rem' }}>{t('contact_faq_title')}</h2>
        </div>

        <div style={{ maxWidth: '850px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {faqs.map((faq, idx) => (
            <div key={idx} className="glass-card" style={{ overflow: 'hidden' }}>
              <button
                type="button"
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                style={{
                  width: '100%',
                  padding: '1.25rem 1.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-primary)',
                  fontSize: '1rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  textAlign: language === 'ar' ? 'right' : 'left',
                }}
              >
                <span>{faq.q}</span>
                <ChevronDown
                  size={18}
                  style={{
                    transform: openFaq === idx ? 'rotate(180deg)' : 'rotate(0)',
                    transition: 'transform 0.2s ease',
                    flexShrink: 0,
                    color: 'var(--s2t-red)'
                  }}
                />
              </button>

              {openFaq === idx && (
                <div style={{
                  padding: '0 1.5rem 1.25rem',
                  color: 'var(--text-secondary)',
                  fontSize: '0.925rem',
                  lineHeight: 1.6,
                  borderTop: '1px solid var(--border-color)',
                  paddingTop: '1rem',
                  textAlign: language === 'ar' ? 'right' : 'left',
                }}>
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Contact;

