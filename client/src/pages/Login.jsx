import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { 
  Building2, 
  ShieldCheck, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  LogIn, 
  AlertCircle, 
  Sparkles,
  ArrowRight
} from 'lucide-react';

const Login = () => {
  const { t, language } = useLanguage();
  const isRtl = language === 'ar';
  const [activeTab, setActiveTab] = useState('client'); // 'client' | 'admin'
  const [email, setEmail] = useState('client@s2t.tn');
  const [password, setPassword] = useState('client123456');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleTabSwitch = (tab) => {
    setActiveTab(tab);
    setError('');
    if (tab === 'client') {
      setEmail('client@s2t.tn');
      setPassword('client123456');
    } else {
      setEmail('admin@s2t.tn');
      setPassword('admin123456');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError(t('login_error_empty'));
      return;
    }

    try {
      setLoading(true);
      setError('');
      await login(email, password);
      const from = location.state?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    } catch (err) {
      setError(
        err.response?.data?.message ||
        t('login_error_invalid')
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-wrapper">
      <div className="glass-card auth-card">
        {/* Logo & Header */}
        <div className="auth-header">
          <img
            src="/s2t-logo.svg"
            alt="Logo S2T"
            className="auth-logo"
          />
          <h2 className="auth-title">{t('login_title')}</h2>
          <p className="auth-subtitle">
            {t('login_subtitle')}
          </p>
        </div>

        {/* Dual Role Selector Tabs */}
        <div className="auth-role-tabs">
          <button
            type="button"
            onClick={() => handleTabSwitch('client')}
            className={`auth-role-btn client ${activeTab === 'client' ? 'active' : ''}`}
          >
            <Building2 size={16} />
            <span>{t('login_tab_client')}</span>
          </button>

          <button
            type="button"
            onClick={() => handleTabSwitch('admin')}
            className={`auth-role-btn admin ${activeTab === 'admin' ? 'active' : ''}`}
          >
            <ShieldCheck size={16} />
            <span>{t('login_tab_admin')}</span>
          </button>
        </div>

        {/* Pending Approval Alert Banner */}
        {error && (error.includes('attente') || error.includes('pending') || error.includes('انتظار')) ? (
          <div className="auth-alert-pending">
            <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <strong style={{ display: 'block', marginBottom: '0.2rem' }}>{t('login_pending_title')}</strong>
              <span>{error}</span>
            </div>
          </div>
        ) : error ? (
          <div className="auth-alert-error">
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        ) : null}

        {/* Login Form */}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">
              {activeTab === 'client' ? t('login_label_email_client') : t('login_label_email_admin')}
            </label>
            <div className="auth-input-wrapper">
              <Mail size={18} className="auth-input-icon" />
              <input
                type="email"
                className="form-input auth-input"
                placeholder={t('login_ph_email')}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">{t('login_label_password')}</label>
            <div className="auth-input-wrapper">
              <Lock size={18} className="auth-input-icon" />
              <input
                type={showPassword ? 'text' : 'password'}
                className="form-input auth-input with-toggle"
                placeholder={t('login_ph_password')}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="auth-password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className={`btn auth-submit-btn ${activeTab === 'client' ? 'btn-blue' : 'btn-primary'}`}
            disabled={loading}
          >
            {loading 
              ? t('login_btn_loading') 
              : (activeTab === 'client' ? t('login_btn_submit_client') : t('login_btn_submit_admin'))}
          </button>
        </form>

        {/* Quick Demo Pre-fill helper */}
        <div className="auth-demo-box">
          <span className="auth-demo-label">{t('login_demo_label')}</span>
          <span className="auth-demo-val">
            {activeTab === 'client' ? t('login_demo_client') : t('login_demo_admin')}
          </span>
        </div>

        {/* Register link */}
        <p className="auth-footer-prompt">
          {t('login_register_prompt')}{' '}
          <Link to="/register" className="auth-footer-link">
            {t('login_register_link')}
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
