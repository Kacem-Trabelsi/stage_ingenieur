import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
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
      setError('Veuillez remplir tous les champs obligatoires');
      return;
    }

    if (accountType === 'client' && !formData.companyName) {
      setError('Veuillez indiquer la raison sociale de votre entreprise');
      return;
    }

    if (accountType === 'client' && !acceptedArticles) {
      setError('Veuillez lire et accepter les 16 articles de la Convention d\'Hébergement S2T pour soumettre votre dossier.');
      return;
    }

    if (formData.password.length < 6) {
      setError('Le mot de passe doit comporter au moins 6 caractères');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
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
        'Erreur lors de la création du compte. Veuillez vérifier les informations saisies.'
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
      <div style={{
        minHeight: 'calc(100vh - 120px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '3rem 1rem',
      }}>
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
              Dossier Transmis • En attente d'approbation
            </span>

            <h2 style={{ fontSize: '1.6rem', fontWeight: 800, margin: '0 0 0.5rem', color: 'var(--text-primary)' }}>
              Demande d'Hébergement Enregistrée !
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.5 }}>
              Votre candidature pour l'entreprise <strong style={{ color: 'var(--text-primary)' }}>{submittedCandidate.companyName}</strong> a été transmise à la Direction de Smart Tunisian Technoparks (S2T).
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
              <span>Récapitulatif de votre demande</span>
            </h4>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', fontSize: '0.85rem' }}>
              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem' }}>Raison Sociale</span>
                <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{submittedCandidate.companyName}</span>
              </div>

              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem' }}>Représentant Légal</span>
                <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{submittedCandidate.name}</span>
              </div>

              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem' }}>Email Professionnel</span>
                <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>{submittedCandidate.email}</span>
              </div>

              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem' }}>Activité TIC Éligible</span>
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
                Procédure d'admission (Loi n°2001-50 relative aux Parcs Technologiques) :
              </strong>
              Un administrateur de la <strong>Direction Juridique & Financière S2T</strong> vérifie la conformité de votre activité TIC avec le cahier des charges du Pôle El Ghazala. Vous recevrez une notification d'activation dès l'approbation de votre dossier.
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
              <span><strong>Convention d'Hébergement (16 Articles)</strong> consultée et acceptée.</span>
            </div>
            <button
              type="button"
              onClick={() => setShowArticlesModal(true)}
              className="btn btn-ghost btn-sm"
              style={{ fontSize: '0.76rem', color: 'var(--s2t-blue)', padding: '0.2rem 0.5rem', fontWeight: 700 }}
            >
              Relire les 16 Articles
            </button>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <Link
              to="/login"
              className="btn btn-primary"
              style={{ flex: 1, justifyContent: 'center', gap: '0.5rem', padding: '0.75rem' }}
            >
              <span>Page de Connexion</span>
              <ArrowRight size={16} />
            </Link>

            <Link
              to="/"
              className="btn btn-secondary"
              style={{ justifyContent: 'center', gap: '0.4rem', padding: '0.75rem 1.25rem' }}
            >
              <HomeIcon size={16} />
              <span>Accueil S2T</span>
            </Link>
          </div>

          {/* Modal Articles if triggered from recap */}
          <LegalArticlesModal
            isOpen={showArticlesModal}
            onClose={() => setShowArticlesModal(false)}
            title="Convention d'Hébergement S2T — 16 Articles Réglementaires"
          />
        </div>
      </div>
    );
  }

  // --------------------------------------------------------------------------
  // REGISTRATION FORM SCREEN
  // --------------------------------------------------------------------------
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
        maxWidth: '580px',
        padding: '2.5rem',
        boxShadow: 'var(--shadow-lg)',
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <img
            src="/s2t-logo.svg"
            alt="Logo S2T"
            style={{ height: '38px', margin: '0 auto 1rem', display: 'block' }}
          />
          <h2 style={{ fontSize: '1.6rem', marginBottom: '0.35rem' }}>Demande d'Hébergement S2T</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            Rejoignez l'écosystème technologique du Pôle El Ghazala
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
            <span>Entreprise Hébergée</span>
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
            <span>Agent S2T (Direction)</span>
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
                  Convention d'Hébergement Pôle S2T (16 Articles)
                </strong>
                <span style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>
                  Régie par la Loi n°2001-50 & 2006-37 • Redevances & Règlement Pépinière
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
              <span>Lire les 16 Articles</span>
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
                  <label className="form-label">Raison Sociale / Société *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="ex: InnovTech SARL"
                    value={formData.companyName}
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Matricule Fiscal</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="ex: 1234567/A/M/000"
                    value={formData.fiscalId}
                    onChange={(e) => setFormData({ ...formData, fiscalId: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Activité TIC (Loi 2001-50)</label>
                  <select
                    className="form-select"
                    value={formData.activityType}
                    onChange={(e) => setFormData({ ...formData, activityType: e.target.value })}
                  >
                    <option value="Édition Logiciels & IA">Édition Logiciels & IA</option>
                    <option value="Télécoms & Réseaux">Télécoms & Réseaux</option>
                    <option value="Cybersécurité & Cloud">Cybersécurité & Cloud</option>
                    <option value="IoT & Systèmes Embarqués">IoT & Systèmes Embarqués</option>
                    <option value="FinTech & Services Numériques">FinTech & Services Numériques</option>
                    <option value="R&D et Innovation">R&D et Innovation</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Superficie souhaitée (m²)</label>
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
              <label className="form-label">Département S2T</label>
              <select
                className="form-select"
                value={formData.activityType}
                onChange={(e) => setFormData({ ...formData, activityType: e.target.value })}
              >
                <option value="Service Affaires Juridiques">Service Affaires Juridiques</option>
                <option value="Direction Financière & Facturation">Direction Financière & Facturation</option>
                <option value="Direction Générale S2T">Direction Générale S2T</option>
              </select>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Nom du Représentant *</label>
              <input
                type="text"
                className="form-input"
                placeholder="ex: Karim Ben Salem"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Téléphone</label>
              <input
                type="tel"
                className="form-input"
                placeholder="+216 -- --- ---"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Email Professionnel *</label>
            <input
              type="email"
              className="form-input"
              placeholder="contact@societe.tn"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Mot de passe (min. 6 car.) *</label>
              <input
                type="password"
                className="form-input"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                minLength={6}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Confirmer mot de passe *</label>
              <input
                type="password"
                className="form-input"
                placeholder="••••••••"
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
                  J'atteste avoir pris connaissance de l'intégralité des <strong>16 articles de la Convention d'Hébergement S2T</strong> et du <strong>Règlement Intérieur</strong>, et j'en accepte les conditions (redevances, caution de 2 mois, destination TIC, obligations légales).{' '}
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
                    [Consulter les 16 Articles]
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
            {loading ? 'Traitement du dossier...' : (accountType === 'client' ? 'Soumettre ma Candidature Résident' : 'Créer le Compte Agent S2T')}
          </button>
        </form>

        <p style={{
          textAlign: 'center',
          marginTop: '1.75rem',
          fontSize: '0.875rem',
          color: 'var(--text-secondary)'
        }}>
          Vous avez déjà un compte validé ?{' '}
          <Link to="/login" style={{ color: 'var(--s2t-blue)', fontWeight: 600 }}>
            Se connecter
          </Link>
        </p>

        {/* Modal Articles for candidate */}
        <LegalArticlesModal
          isOpen={showArticlesModal}
          onClose={() => setShowArticlesModal(false)}
          onAccept={() => setAcceptedArticles(true)}
          hasAccepted={acceptedArticles}
          title="Convention d'Hébergement S2T — 16 Articles Réglementaires"
        />
      </div>
    </div>
  );
};

export default Register;
