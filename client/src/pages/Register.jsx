import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import LegalArticlesModal from '../components/LegalArticlesModal';
import { 
  Building2, 
  ShieldCheck, 
  User, 
  Mail, 
  Lock, 
  Phone, 
  FileSpreadsheet, 
  AlertCircle, 
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowRight,
  Home as HomeIcon,
  HelpCircle,
  FileCheck,
  Scale,
  BookOpen
} from 'lucide-react';

const Register = () => {
  const { t, language } = useLanguage();
  const isRtl = language === 'ar';

  const [accountType, setAccountType] = useState('client'); // 'client' | 'admin'
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    companyName: '',
    fiscalId: '',
    phone: '',
    activityType: 'Édition Logiciels & IA',
    surfaceArea: 35,
  });

  const [acceptedArticles, setAcceptedArticles] = useState(false);
  const [showArticlesModal, setShowArticlesModal] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [submittedCandidate, setSubmittedCandidate] = useState(null);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.password) {
      setError(t('reg_err_required'));
      return;
    }

    if (accountType === 'client' && !formData.companyName) {
      setError(t('reg_err_company'));
      return;
    }

    if (accountType === 'client' && !acceptedArticles) {
      setError(t('reg_err_articles'));
      return;
    }

    if (formData.password.length < 6) {
      setError(t('reg_err_pwd_length'));
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError(t('reg_err_pwd_match'));
      return;
    }

    try {
      setLoading(true);
      setError('');

      const res = await register(formData.name, formData.email, formData.password, {
        role: accountType,
        companyName: accountType === 'client' ? formData.companyName : 'S2T Direction',
        fiscalId: formData.fiscalId,
        phone: formData.phone,
        activityType: formData.activityType,
        surfaceArea: Number(formData.surfaceArea),
      });

      if (res?.status === 'pending' || res?.isPendingApproval) {
        setSubmittedCandidate({
          companyName: formData.companyName,
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          activityType: formData.activityType,
          surfaceArea: formData.surfaceArea,
        });
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
        t('reg_err_default')
      );
    } finally {
      setLoading(false);
    }
  };

  // --------------------------------------------------------------------------
  // SUCCESS / PENDING APPROVAL CONFIRMATION SCREEN
  // --------------------------------------------------------------------------
  if (submittedCandidate) {
    return (
      <div 
        dir={isRtl ? 'rtl' : 'ltr'}
        style={{
          minHeight: 'calc(100vh - 120px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '3rem 1rem',
        }}
      >
        <div className="glass-card" style={{
          width: '100%',
          maxWidth: '620px',
          padding: '2.5rem',
          boxShadow: 'var(--shadow-lg)',
          animation: 'fadeIn 0.3s ease-out',
        }}>
          {/* Header Icon */}
          <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: 'rgba(245, 158, 11, 0.12)',
              border: '2px solid rgba(245, 158, 11, 0.4)',
              color: '#F59E0B',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem',
              boxShadow: '0 0 20px rgba(245, 158, 11, 0.25)',
            }}>
              <Clock size={32} />
            </div>

            <span style={{
              fontSize: '0.75rem',
              fontWeight: 700,
              padding: '0.2rem 0.65rem',
              borderRadius: 'var(--radius-full)',
              background: 'rgba(245, 158, 11, 0.12)',
              color: '#F59E0B',
              border: '1px solid rgba(245, 158, 11, 0.3)',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              display: 'inline-block',
              marginBottom: '0.75rem'
            }}>
              {t('reg_success_badge')}
            </span>

            <h2 style={{ fontSize: '1.6rem', fontWeight: 800, margin: '0 0 0.5rem', color: 'var(--text-primary)' }}>
              {t('reg_success_title')}
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.5 }}>
              {t('reg_success_desc_prefix')} <strong style={{ color: 'var(--text-primary)' }}>{submittedCandidate.companyName}</strong> {t('reg_success_desc_suffix')}
            </p>
          </div>

          {/* Candidate Recap Card */}
          <div style={{
            background: 'var(--bg-secondary)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-color)',
            padding: '1.25rem',
            marginBottom: '1.5rem',
          }}>
            <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--s2t-blue)', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.03em', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <FileCheck size={16} />
              <span>{t('reg_recap_title')}</span>
            </h4>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', fontSize: '0.85rem' }}>
              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem' }}>{t('reg_recap_company')}</span>
                <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{submittedCandidate.companyName}</span>
              </div>

              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem' }}>{t('reg_recap_rep')}</span>
                <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{submittedCandidate.name}</span>
              </div>

              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem' }}>{t('reg_recap_email')}</span>
                <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>{submittedCandidate.email}</span>
              </div>

              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem' }}>{t('reg_recap_activity')}</span>
                <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>{submittedCandidate.activityType}</span>
              </div>
            </div>
          </div>

          {/* Legal / Workflow Explanatory Notice */}
          <div style={{
            background: 'rgba(37, 99, 235, 0.08)',
            border: '1px solid rgba(37, 99, 235, 0.2)',
            borderRadius: 'var(--radius-md)',
            padding: '1rem',
            fontSize: '0.825rem',
            color: 'var(--text-secondary)',
            lineHeight: 1.6,
            marginBottom: '1.25rem',
            display: 'flex',
            gap: '0.75rem',
            alignItems: 'flex-start',
          }}>
            <ShieldCheck size={20} color="var(--s2t-blue)" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <strong style={{ color: 'var(--text-primary)', display: 'block', marginBottom: '0.25rem' }}>
                {t('reg_procedure_title')}
              </strong>
              {t('reg_procedure_desc_1')} <strong>{t('reg_procedure_desc_bold')}</strong> {t('reg_procedure_desc_2')}
            </div>
          </div>

          {/* Convention Acceptance Badge in Recap */}
          <div style={{
            background: 'rgba(16, 185, 129, 0.08)',
            border: '1px solid rgba(16, 185, 129, 0.25)',
            borderRadius: 'var(--radius-md)',
            padding: '0.85rem 1rem',
            fontSize: '0.82rem',
            color: '#065F46',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '1.75rem',
            flexWrap: 'wrap',
            gap: '0.5rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <CheckCircle2 size={16} color="#10B981" />
              <span><strong>{t('reg_convention_accepted_bold')}</strong> {t('reg_convention_accepted_suffix')}</span>
            </div>
            <button
              type="button"
              onClick={() => setShowArticlesModal(true)}
              className="btn btn-ghost btn-sm"
              style={{ fontSize: '0.76rem', color: 'var(--s2t-blue)', padding: '0.2rem 0.5rem', fontWeight: 700 }}
            >
              {t('reg_btn_reread_articles')}
            </button>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <Link
              to="/login"
              className="btn btn-primary"
              style={{ flex: 1, justifyContent: 'center', gap: '0.5rem', padding: '0.75rem' }}
            >
              <span>{t('reg_btn_to_login')}</span>
              <ArrowRight size={16} style={{ transform: isRtl ? 'rotate(180deg)' : 'none' }} />
            </Link>

            <Link
              to="/"
              className="btn btn-secondary"
              style={{ justifyContent: 'center', gap: '0.4rem', padding: '0.75rem 1.25rem' }}
            >
              <HomeIcon size={16} />
              <span>{t('reg_btn_to_home')}</span>
            </Link>
          </div>

          {/* Modal Articles if triggered from recap */}
          <LegalArticlesModal
            isOpen={showArticlesModal}
            onClose={() => setShowArticlesModal(false)}
            title={t('reg_modal_title')}
          />
        </div>
      </div>
    );
  }

  // --------------------------------------------------------------------------
  // REGISTRATION FORM SCREEN
  // --------------------------------------------------------------------------
  return (
    <div 
      dir={isRtl ? 'rtl' : 'ltr'}
      style={{
        minHeight: 'calc(100vh - 120px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '3rem 1rem',
      }}
    >
      <div className="glass-card" style={{
        width: '100%',
        maxWidth: '580px',
        padding: '2.5rem',
        boxShadow: 'var(--shadow-lg)',
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <img
            src="/s2t-logo.svg"
            alt={t('reg_logo_alt')}
            style={{ height: '38px', margin: '0 auto 1rem', display: 'block' }}
          />
          <h2 style={{ fontSize: '1.6rem', marginBottom: '0.35rem' }}>{t('reg_title')}</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            {t('reg_subtitle')}
          </p>
        </div>

        {/* Account Type Selector */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '0.5rem',
          background: 'var(--bg-tertiary)',
          padding: '4px',
          borderRadius: 'var(--radius-md)',
          marginBottom: '1.75rem',
          border: '1px solid var(--border-color)',
        }}>
          <button
            type="button"
            onClick={() => { setAccountType('client'); setError(''); }}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.4rem',
              padding: '0.65rem 0.5rem',
              fontSize: '0.85rem',
              fontWeight: 600,
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              cursor: 'pointer',
              background: accountType === 'client' ? 'var(--s2t-blue)' : 'transparent',
              color: accountType === 'client' ? '#ffffff' : 'var(--text-secondary)',
              transition: 'var(--transition)',
            }}
          >
            <Building2 size={16} />
            <span>{t('reg_tab_client')}</span>
          </button>

          <button
            type="button"
            onClick={() => { setAccountType('admin'); setError(''); }}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.4rem',
              padding: '0.65rem 0.5rem',
              fontSize: '0.85rem',
              fontWeight: 600,
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              cursor: 'pointer',
              background: accountType === 'admin' ? 'var(--s2t-red)' : 'transparent',
              color: accountType === 'admin' ? '#ffffff' : 'var(--text-secondary)',
              transition: 'var(--transition)',
            }}
          >
            <ShieldCheck size={16} />
            <span>{t('reg_tab_admin')}</span>
          </button>
        </div>

        {accountType === 'client' && (
          <div style={{
            padding: '0.85rem 1rem',
            borderRadius: 'var(--radius-md)',
            background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.08) 0%, rgba(225, 29, 72, 0.04) 100%)',
            border: '1px solid rgba(37, 99, 235, 0.25)',
            marginBottom: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '0.65rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Scale size={18} color="var(--s2t-blue)" style={{ flexShrink: 0 }} />
              <div>
                <strong style={{ fontSize: '0.82rem', color: 'var(--text-primary)', display: 'block' }}>
                  {t('reg_convention_banner_title')}
                </strong>
                <span style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>
                  {t('reg_convention_banner_desc')}
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowArticlesModal(true)}
              className="btn btn-secondary btn-sm"
              style={{
                fontSize: '0.76rem',
                padding: '0.35rem 0.75rem',
                borderRadius: '8px',
                color: 'var(--s2t-blue)',
                borderColor: 'rgba(37, 99, 235, 0.3)',
                background: 'rgba(37, 99, 235, 0.08)',
                gap: '0.35rem',
                fontWeight: 700
              }}
            >
              <BookOpen size={13} />
              <span>{t('reg_btn_read_articles')}</span>
            </button>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div style={{
            background: 'rgba(244, 63, 94, 0.12)',
            border: '1px solid rgba(244, 63, 94, 0.3)',
            color: 'var(--s2t-red)',
            padding: '0.75rem 1rem',
            borderRadius: 'var(--radius-md)',
            marginBottom: '1.5rem',
            fontSize: '0.875rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}>
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        {/* Registration Form */}
        <form onSubmit={handleSubmit}>
          {accountType === 'client' ? (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">{t('reg_label_company')}</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder={t('reg_ph_company')}
                    value={formData.companyName}
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">{t('reg_label_fiscal_id')}</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder={t('reg_ph_fiscal_id')}
                    value={formData.fiscalId}
                    onChange={(e) => setFormData({ ...formData, fiscalId: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">{t('reg_label_activity')}</label>
                  <select
                    className="form-select"
                    value={formData.activityType}
                    onChange={(e) => setFormData({ ...formData, activityType: e.target.value })}
                  >
                    <option value="Édition Logiciels & IA">{t('reg_act_software')}</option>
                    <option value="Télécoms & Réseaux">{t('reg_act_telecom')}</option>
                    <option value="Cybersécurité & Cloud">{t('reg_act_cyber')}</option>
                    <option value="IoT & Systèmes Embarqués">{t('reg_act_iot')}</option>
                    <option value="FinTech & Services Numériques">{t('reg_act_fintech')}</option>
                    <option value="R&D et Innovation">{t('reg_act_rd')}</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">{t('reg_label_surface')}</label>
                  <input
                    type="number"
                    min="15"
                    max="500"
                    className="form-input"
                    value={formData.surfaceArea}
                    onChange={(e) => setFormData({ ...formData, surfaceArea: e.target.value })}
                  />
                </div>
              </div>
            </>
          ) : (
            <div className="form-group">
              <label className="form-label">{t('reg_label_dept')}</label>
              <select
                className="form-select"
                value={formData.activityType}
                onChange={(e) => setFormData({ ...formData, activityType: e.target.value })}
              >
                <option value="Service Affaires Juridiques">{t('reg_dept_legal')}</option>
                <option value="Direction Financière & Facturation">{t('reg_dept_finance')}</option>
                <option value="Direction Générale S2T">{t('reg_dept_dg')}</option>
              </select>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">{t('reg_label_rep_name')}</label>
              <input
                type="text"
                className="form-input"
                placeholder={t('reg_ph_rep_name')}
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">{t('reg_label_phone')}</label>
              <input
                type="tel"
                className="form-input"
                placeholder={t('reg_ph_phone')}
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">{t('reg_label_email')}</label>
            <input
              type="email"
              className="form-input"
              placeholder={t('reg_ph_email')}
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">{t('reg_label_password')}</label>
              <input
                type="password"
                className="form-input"
                placeholder={t('reg_ph_password')}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                minLength={6}
              />
            </div>

            <div className="form-group">
              <label className="form-label">{t('reg_label_confirm_pwd')}</label>
              <input
                type="password"
                className="form-input"
                placeholder={t('reg_ph_password')}
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                required
              />
            </div>
          </div>

          {/* Mandatory Articles Acceptance Checkbox for Resident Applicants */}
          {accountType === 'client' && (
            <div style={{
              marginTop: '0.85rem',
              marginBottom: '1rem',
              padding: '0.85rem 1rem',
              borderRadius: 'var(--radius-md)',
              background: acceptedArticles ? 'rgba(16, 185, 129, 0.08)' : 'rgba(37, 99, 235, 0.06)',
              border: acceptedArticles ? '1px solid rgba(16, 185, 129, 0.35)' : '1px solid rgba(37, 99, 235, 0.25)',
              transition: 'all 0.2s ease'
            }}>
              <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.65rem', cursor: 'pointer', fontSize: '0.82rem', lineHeight: 1.5, color: 'var(--text-primary)' }}>
                <input
                  type="checkbox"
                  checked={acceptedArticles}
                  onChange={(e) => setAcceptedArticles(e.target.checked)}
                  style={{ marginTop: '3px', accentColor: 'var(--s2t-blue)', width: '16px', height: '16px', cursor: 'pointer', flexShrink: 0 }}
                />
                <span>
                  {t('reg_checkbox_prefix')} <strong>{t('reg_checkbox_articles_bold')}</strong> {t('reg_checkbox_and')} <strong>{t('reg_checkbox_rules_bold')}</strong>{t('reg_checkbox_suffix')}{' '}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setShowArticlesModal(true);
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--s2t-blue)',
                      textDecoration: 'underline',
                      fontWeight: 700,
                      cursor: 'pointer',
                      padding: 0,
                      fontSize: '0.82rem',
                      display: 'inline'
                    }}
                  >
                    {t('reg_checkbox_consult_link')}
                  </button>
                </span>
              </label>
            </div>
          )}

          <button
            type="submit"
            className={accountType === 'client' ? 'btn btn-blue' : 'btn btn-primary'}
            style={{ width: '100%', marginTop: '0.5rem', padding: '0.85rem' }}
            disabled={loading}
          >
            {loading ? t('reg_btn_loading') : (accountType === 'client' ? t('reg_btn_submit_client') : t('reg_btn_submit_admin'))}
          </button>
        </form>

        <p style={{
          textAlign: 'center',
          marginTop: '1.75rem',
          fontSize: '0.875rem',
          color: 'var(--text-secondary)'
        }}>
          {t('reg_already_account')}{' '}
          <Link to="/login" style={{ color: 'var(--s2t-blue)', fontWeight: 600 }}>
            {t('reg_link_login')}
          </Link>
        </p>

        {/* Modal Articles for candidate */}
        <LegalArticlesModal
          isOpen={showArticlesModal}
          onClose={() => setShowArticlesModal(false)}
          onAccept={() => setAcceptedArticles(true)}
          hasAccepted={acceptedArticles}
          title={t('reg_modal_title')}
        />
      </div>
    </div>
  );
};

export default Register;
