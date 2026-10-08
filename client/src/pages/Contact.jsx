import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  Send, 
  CheckCircle2, 
  ChevronDown 
} from 'lucide-react';

const Contact = () => {
  const { t, language } = useLanguage();
  const isRtl = language === 'ar';

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
    <div style={{ paddingBottom: '4rem' }}>
      {/* Header Banner */}
      <section className="contact-header-section">
        <div className="container contact-header-container">
          <span className="badge" style={{ background: 'var(--accent-light)', color: 'var(--s2t-teal)', marginBottom: '1.25rem' }}>
            {t('contact_badge')}
          </span>
          <h1 className="contact-header-title">
            {t('contact_title')} <span className="gradient-text">{t('contact_title_sub')}</span>
          </h1>
          <p className="contact-header-desc">
            {t('contact_desc')}
          </p>
        </div>
      </section>

      {/* Main Grid: Info + Contact Form */}
      <section className="container contact-main-section">
        <div className="contact-main-grid">
          {/* Left Column: Direct Contact Info */}
          <div className="contact-info-col">
            <h2 className="contact-info-title">{t('contact_info_title')}</h2>
            <p className="contact-info-desc">
              {t('contact_info_desc')}
            </p>

            <div className="contact-cards-list">
              <div className="glass-card contact-card">
                <div className="contact-card-icon" style={{ background: 'var(--primary-light)', color: 'var(--s2t-red)' }}>
                  <MapPin size={22} />
                </div>
                <div>
                  <h4 className="contact-card-title">{t('contact_addr_title')}</h4>
                  <p className="contact-card-text">
                    {t('contact_addr_val')}
                  </p>
                </div>
              </div>

              <div className="glass-card contact-card">
                <div className="contact-card-icon" style={{ background: 'var(--secondary-light)', color: 'var(--s2t-blue)' }}>
                  <Phone size={22} />
                </div>
                <div>
                  <h4 className="contact-card-title">{t('contact_phone_title')}</h4>
                  <p className="contact-card-text">
                    {t('contact_phone_standard')} +216 71 857 000 <br />
                    {t('contact_phone_fax')} +216 71 856 000
                  </p>
                </div>
              </div>

              <div className="glass-card contact-card">
                <div className="contact-card-icon" style={{ background: 'var(--accent-light)', color: 'var(--s2t-teal)' }}>
                  <Mail size={22} />
                </div>
                <div>
                  <h4 className="contact-card-title">{t('contact_email_title')}</h4>
                  <p className="contact-card-text">
                    {t('contact_email_billing')} facturation@s2t.tn <br />
                    {t('contact_email_legal')} juridique@s2t.tn
                  </p>
                </div>
              </div>

              <div className="glass-card contact-card">
                <div className="contact-card-icon" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#F59E0B' }}>
                  <Clock size={22} />
                </div>
                <div>
                  <h4 className="contact-card-title">{t('contact_hours_title')}</h4>
                  <p className="contact-card-text">
                    {t('contact_hours_val')}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Contact Form */}
          <div className="glass-card contact-form-card">
            <h3 className="contact-form-title">{t('contact_form_title')}</h3>
            <p className="contact-form-desc">
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
                <div className="contact-form-grid-2">
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

                <div className="contact-form-grid-2">
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
                    rows={4}
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ width: '100%', gap: '0.5rem', padding: '0.85rem' }}
                >
                  <Send size={16} style={{ transform: isRtl ? 'rotate(180deg)' : 'none' }} />
                  <span>{t('contact_btn_send')}</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* FAQ Accordion Section */}
      <section className="container contact-faq-section">
        <div className="contact-faq-header">
          <span className="badge" style={{ background: 'var(--secondary-light)', color: 'var(--s2t-blue)', marginBottom: '0.75rem' }}>
            {t('contact_faq_badge')}
          </span>
          <h2 className="contact-faq-title">{t('contact_faq_title')}</h2>
        </div>

        <div className="contact-faq-list">
          {faqs.map((faq, idx) => (
            <div key={idx} className="glass-card contact-faq-item">
              <button
                type="button"
                className="contact-faq-btn"
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
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
                <div className="contact-faq-answer">
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
