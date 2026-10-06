import React, { useState } from 'react';
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
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    subject: 'Demande d\'hébergement & Superficie',
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
      q: 'Comment candidater pour un espace au Pôle El Ghazala ?',
      a: 'Toute entreprise exerçant dans le secteur des TIC peut soumettre sa candidature en ligne via le bouton Inscription ou en transmettant son dossier d\'activité au service d\'incubation S2T.',
    },
    {
      q: 'Comment s\'applique la tarification de la redevance (Article 6) ?',
      a: 'La redevance locative annuelle est fixée selon l\'ancienneté en pépinière : 30 DT HTVA/m² pour la 1ère année, 55 DT HTVA/m² pour la 2ème année, et 75 DT HTVA/m² pour la 3ème année et au-delà.',
    },
    {
      q: 'Quel est le montant du dépôt de garantie (Article 7) ?',
      a: 'Le dépôt de garantie (caution) correspond à deux (2) mois de redevance locative TTC, versé sur le compte bancaire de la S2T auprès de l\'Agence Ariana Nord.',
    },
    {
      q: 'Comment demander un avenant pour augmenter ou réduire ma superficie ?',
      a: 'Les entreprises hébergées peuvent soumettre une demande d\'avenant directement depuis leur Espace Client (Dashboard). La demande est traitée par le service juridique et financier pour actualisation du contrat.',
    },
    {
      q: 'Quels sont les délais de règlement des factures ?',
      a: 'Conformément à l\'Article 6.3 du contrat d\'hébergement, les redevances sont payables d\'avance avant le 5 de chaque mois par ordre permanent ou virement bancaire.',
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
            Service Relations Résidents & Partenaires
          </span>
          <h1 style={{ fontSize: 'clamp(2.2rem, 5vw, 3.5rem)', marginBottom: '1.25rem' }}>
            Contactez la <span className="gradient-text">Direction S2T</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', lineHeight: 1.6 }}>
            Une équipe dédiée à votre écoute pour toute demande d'hébergement, renseignement juridique ou suivi de facturation.
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
            <h2 style={{ fontSize: '1.8rem', marginBottom: '1rem' }}>Nos Coordonnées</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', lineHeight: 1.6 }}>
              Retrouvez nos services administratifs, juridiques et financiers au siège du Pôle El Ghazala.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div className="glass-card" style={{ padding: '1.25rem', display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                <div style={{ padding: '0.6rem', borderRadius: '10px', background: 'var(--primary-light)', color: 'var(--s2t-red)' }}>
                  <MapPin size={22} />
                </div>
                <div>
                  <h4 style={{ fontSize: '1rem', marginBottom: '0.2rem' }}>Adresse Principale</h4>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                    Pôle Technologique El Ghazala, Route de Raoued Km 3.5, 2088 Ariana, Tunisie
                  </p>
                </div>
              </div>

              <div className="glass-card" style={{ padding: '1.25rem', display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                <div style={{ padding: '0.6rem', borderRadius: '10px', background: 'var(--secondary-light)', color: 'var(--s2t-blue)' }}>
                  <Phone size={22} />
                </div>
                <div>
                  <h4 style={{ fontSize: '1rem', marginBottom: '0.2rem' }}>Téléphone & Fax</h4>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                    Standard : +216 71 857 000 <br />
                    Fax : +216 71 856 000
                  </p>
                </div>
              </div>

              <div className="glass-card" style={{ padding: '1.25rem', display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                <div style={{ padding: '0.6rem', borderRadius: '10px', background: 'var(--accent-light)', color: 'var(--s2t-teal)' }}>
                  <Mail size={22} />
                </div>
                <div>
                  <h4 style={{ fontSize: '1rem', marginBottom: '0.2rem' }}>Emails Dédiés</h4>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                    Facturation : facturation@s2t.tn <br />
                    Affaires Juridiques : juridique@s2t.tn
                  </p>
                </div>
              </div>

              <div className="glass-card" style={{ padding: '1.25rem', display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                <div style={{ padding: '0.6rem', borderRadius: '10px', background: 'rgba(245, 158, 11, 0.15)', color: '#F59E0B' }}>
                  <Clock size={22} />
                </div>
                <div>
                  <h4 style={{ fontSize: '1rem', marginBottom: '0.2rem' }}>Horaires d'Ouverture</h4>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                    Du Lundi au Vendredi : 08h00 — 17h00
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Contact Form */}
          <div className="glass-card" style={{ padding: '2.5rem' }}>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Envoyez-nous un Message</h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1.75rem' }}>
              Remplissez le formulaire ci-dessous et notre équipe vous répondra sous 24h ouvrées.
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
                <h4 style={{ fontSize: '1.2rem', marginBottom: '0.35rem' }}>Message Envoyé avec Succès !</h4>
                <p style={{ fontSize: '0.875rem' }}>
                  Votre demande a été transmise aux services compétents de S2T.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Nom & Prénom *</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="ex: Ahmed Mansour"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Société / Startup</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="ex: DigitalTech"
                      value={formData.company}
                      onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
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
                  <label className="form-label">Objet de la Demande</label>
                  <select
                    className="form-select"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  >
                    <option value="Demande d'hébergement & Superficie">🏢 Demande d'hébergement & Superficie</option>
                    <option value="Affaires Juridiques & Contrat">⚖️ Affaires Juridiques & Contrat d'Hébergement</option>
                    <option value="Facturation & Paiement de Redevance">💰 Facturation & Paiement de Redevance</option>
                    <option value="Demande d'Avenant / Modification">📝 Demande d'Avenant / Modification de bail</option>
                    <option value="Autre demande">💬 Autre demande</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Message *</label>
                  <textarea
                    className="form-textarea"
                    placeholder="Précisez votre demande, la superficie souhaitée ou le numéro de contrat concerné..."
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
                  <Send size={16} />
                  <span>Envoyer la Demande</span>
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
            Foire Aux Questions
          </span>
          <h2 style={{ fontSize: '2rem' }}>Questions Fréquentes des Entreprises</h2>
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
                  textAlign: 'left',
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
