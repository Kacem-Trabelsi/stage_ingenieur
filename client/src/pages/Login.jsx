import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
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
      setError('Veuillez renseigner votre email et mot de passe');
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
        'Identifiants incorrects ou serveur indisponible.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: 'calc(100vh - 120px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '3rem 1rem',
    }}>
      <div className="glass-card" style={{
        width: '100%',
        maxWidth: '480px',
        padding: '2.5rem',
        boxShadow: 'var(--shadow-lg)',
      }}>
        {/* Logo & Header */}
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <img
            src="/s2t-logo.svg"
            alt="Logo S2T"
            style={{ height: '40px', margin: '0 auto 1rem', display: 'block' }}
          />
          <h2 style={{ fontSize: '1.6rem', marginBottom: '0.35rem' }}>Portail Sécurisé S2T</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            Accédez à vos services de gestion de contrats & de facturation
          </p>
        </div>

        {/* Dual Role Selector Tabs */}
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
            onClick={() => handleTabSwitch('client')}
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
              background: activeTab === 'client' ? 'var(--s2t-blue)' : 'transparent',
              color: activeTab === 'client' ? '#ffffff' : 'var(--text-secondary)',
              transition: 'var(--transition)',
            }}
          >
            <Building2 size={16} />
            <span>Entreprise Hébergée</span>
          </button>

          <button
            type="button"
            onClick={() => handleTabSwitch('admin')}
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
              background: activeTab === 'admin' ? 'var(--s2t-red)' : 'transparent',
              color: activeTab === 'admin' ? '#ffffff' : 'var(--text-secondary)',
              transition: 'var(--transition)',
            }}
          >
            <ShieldCheck size={16} />
            <span>Admin (Juridique/Finance)</span>
          </button>
        </div>

        {/* Pending Approval Alert Banner */}
        {error && error.includes('attente d\'approbation') ? (
          <div style={{
            background: 'rgba(245, 158, 11, 0.12)',
            border: '1px solid rgba(245, 158, 11, 0.35)',
            color: '#F59E0B',
            padding: '0.85rem 1rem',
            borderRadius: 'var(--radius-md)',
            marginBottom: '1.25rem',
            fontSize: '0.85rem',
            lineHeight: 1.5,
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.6rem',
            boxShadow: '0 2px 10px rgba(245, 158, 11, 0.1)'
          }}>
            <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <strong style={{ display: 'block', marginBottom: '0.2rem' }}>Compte en attente d'approbation</strong>
              <span>{error}</span>
            </div>
          </div>
        ) : error ? (
          <div style={{
            background: 'rgba(244, 63, 94, 0.12)',
            border: '1px solid rgba(244, 63, 94, 0.3)',
            color: 'var(--s2t-red)',
            padding: '0.75rem 1rem',
            borderRadius: 'var(--radius-md)',
            marginBottom: '1.25rem',
            fontSize: '0.875rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}>
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        ) : null}

        {/* Login Form */}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">
              {activeTab === 'client' ? 'Email de l\'entreprise hébergée' : 'Email administrateur S2T'}
            </label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} style={{
                position: 'absolute',
                left: '1rem',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-muted)'
              }} />
              <input
                type="email"
                className="form-input"
                style={{ paddingLeft: '2.75rem' }}
                placeholder="votre.email@s2t.tn"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Mot de passe</label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{
                position: 'absolute',
                left: '1rem',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-muted)'
              }} />
              <input
                type={showPassword ? 'text' : 'password'}
                className="form-input"
                style={{ paddingLeft: '2.75rem', paddingRight: '2.75rem' }}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '0.75rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  padding: '0.25rem',
                }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className={activeTab === 'client' ? 'btn btn-blue' : 'btn btn-primary'}
            style={{ width: '100%', marginTop: '0.75rem', padding: '0.85rem' }}
            disabled={loading}
          >
            {loading ? 'Authentification...' : `Se connecter (${activeTab === 'client' ? 'Espace Résident' : 'Espace S2T'})`}
          </button>
        </form>

        {/* Quick Demo Pre-fill helper */}
        <div style={{
          marginTop: '1.5rem',
          padding: '0.85rem 1rem',
          borderRadius: 'var(--radius-md)',
          background: 'var(--bg-tertiary)',
          border: '1px solid var(--border-color)',
          fontSize: '0.8rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <span style={{ color: 'var(--text-secondary)' }}>Compte Démo Actif :</span>
          <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>
            {activeTab === 'client' ? 'InnovTech (client@s2t.tn)' : 'Direction (admin@s2t.tn)'}
          </span>
        </div>

        {/* Register link */}
        <p style={{
          textAlign: 'center',
          marginTop: '1.75rem',
          fontSize: '0.875rem',
          color: 'var(--text-secondary)'
        }}>
          Nouvelle entreprise ?{' '}
          <Link to="/register" style={{ color: 'var(--s2t-red)', fontWeight: 600 }}>
            Déposer une demande d'hébergement
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
