import React, { useState } from 'react';
import { 
  Calendar, 
  Clock, 
  Tag, 
  Search, 
  ArrowRight, 
  Sparkles, 
  FileText, 
  Share2, 
  X,
  BookOpen
} from 'lucide-react';

const Blog = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [search, setSearch] = useState('');
  const [activeArticle, setActiveArticle] = useState(null);

  const categories = [
    { id: 'all', label: 'Toutes les actualités' },
    { id: 'incubation', label: 'Incubation & Pépinière' },
    { id: 'juridique', label: 'Juridique & Réglementation' },
    { id: 'evenements', label: 'Événements & Salons' },
    { id: 'finance', label: 'Finance & Facturation' },
  ];

  const articles = [
    {
      id: 1,
      title: 'Lancement de la nouvelle session d\'hébergement au Pôle El Ghazala 2026',
      category: 'incubation',
      categoryLabel: 'Incubation & Pépinière',
      date: '15 Mars 2026',
      readTime: '4 min de lecture',
      author: 'Direction de la Pépinière S2T',
      imageGradient: 'linear-gradient(135deg, #E11D48 0%, #2563EB 100%)',
      excerpt: 'S2T ouvre les candidatures pour les startups et PME innovantes souhaitant bénéficier d\'un bureau équipé à tarif bonifié (Article 6 : 30 DT/m² la première année).',
      content: `Le Pôle Technologique El Ghazala annonce l'ouverture officielle de l'appel à candidature pour l'intégration de la pépinière d'entreprises 2026.

Ce programme offre aux jeunes entreprises sélectionnées :
- Un local bureautique privatif avec charges comprises (Art. 2 du contrat d'hébergement).
- Une redevance annuelle bonifiée de 30,000 DT HTVA/m² pour la première année.
- Un accompagnement sur mesure pour la propriété intellectuelle, le financement et la mise en réseau.

Les dossiers de candidature doivent être soumis via le portail en ligne avant le 30 Avril 2026.`,
    },
    {
      id: 2,
      title: 'Guide Pratique : Comprendre votre Contrat d\'Hébergement S2T (Articles 1 à 16)',
      category: 'juridique',
      categoryLabel: 'Juridique & Réglementation',
      date: '02 Mars 2026',
      readTime: '6 min de lecture',
      author: 'Service des Affaires Juridiques',
      imageGradient: 'linear-gradient(135deg, #2563EB 0%, #0D9488 100%)',
      excerpt: 'Tout savoir sur les obligations contractuelles, les modalités d\'avenant pour extension de surface et la constitution du dépôt de garantie (Article 7).',
      content: `Afin d'assurer une transparence totale avec les sociétés résidentes, le service juridique publie un guide détaillé expliquant chaque clause clé :

1. Prestations offertes & Charges (Article 2) :
L'accès aux espaces communs, le gardiennage 24/7, la fibre optique et les salles de réunion sont inclus dans le forfait de base.

2. Modalités de paiement (Article 6.3) :
La redevance mensuelle doit être réglée avant le 5 de chaque mois par virement ou ordre permanent.

3. Demandes d'Avenants (Article 11) :
Toute augmentation ou réduction de superficie nécessite la signature d'un avenant formalisé par les deux parties.`,
    },
    {
      id: 3,
      title: 'Digitalisation des Factures & Suivi des Relances Automatisées',
      category: 'finance',
      categoryLabel: 'Finance & Facturation',
      date: '20 Février 2026',
      readTime: '3 min de lecture',
      author: 'Direction Financière',
      imageGradient: 'linear-gradient(135deg, #0D9488 0%, #E11D48 100%)',
      excerpt: 'Mise en place de la plateforme de gestion unifiée permettant aux résidents de consulter en temps réel leurs factures, états de paiement et quittances.',
      content: `Dans le cadre de la modernisation de ses services, S2T déploie son portail financier intelligent. 

Les entreprises résidentes peuvent désormais :
- Télécharger leurs avis de paiement et factures certifiées en format PDF.
- Suivre le statut de leurs relances (J+15 et J+30) pour éviter tout intérêt de retard.
- Soumettre des demandes de justificatifs fiscaux en un clic.`,
    },
    {
      id: 4,
      title: 'Forum National de l\'IA et de la Cybersécurité à El Ghazala',
      category: 'evenements',
      categoryLabel: 'Événements & Salons',
      date: '10 Février 2026',
      readTime: '5 min de lecture',
      author: 'Pôle Communication',
      imageGradient: 'linear-gradient(135deg, #8B5CF6 0%, #2563EB 100%)',
      excerpt: 'Plus de 500 experts, chercheurs et dirigeants d\'entreprises réunis à l\'amphithéâtre S2T pour débattre des défis de l\'intelligence artificielle générative.',
      content: `Le Pôle El Ghazala a accueilli la 4ème édition du Forum National de l'IA. Cet événement a permis aux startups hébergées de présenter leurs solutions innovantes aux investisseurs et fonds de capital-risque tunisiens et internationaux.`,
    },
  ];

  const filteredArticles = articles.filter((art) => {
    const matchCat = selectedCategory === 'all' || art.category === selectedCategory;
    const matchSearch =
      art.title.toLowerCase().includes(search.toLowerCase()) ||
      art.excerpt.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

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
          <span className="badge" style={{ background: 'var(--primary-light)', color: 'var(--s2t-red)', marginBottom: '1.25rem' }}>
            Actualités & Publications
          </span>
          <h1 style={{ fontSize: 'clamp(2.2rem, 5vw, 3.5rem)', marginBottom: '1.25rem' }}>
            Blog du <span className="gradient-text">Pôle Technologique S2T</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', lineHeight: 1.6 }}>
            Retrouvez les dernières annonces, guides juridiques, appels à projets et actualités de l'écosystème Smart Tunisian Technoparks.
          </p>
        </div>
      </section>

      {/* Filter & Search Bar */}
      <section className="container" style={{ padding: '3rem 1.5rem 2rem' }}>
        <div className="glass-card" style={{
          padding: '1.25rem',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          marginBottom: '2.5rem',
        }}>
          {/* Categories */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`btn btn-sm ${selectedCategory === cat.id ? 'btn-primary' : 'btn-ghost'}`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Search */}
          <div style={{ position: 'relative', flex: '1 1 260px', maxWidth: '340px' }}>
            <Search size={16} style={{
              position: 'absolute',
              left: '1rem',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--text-muted)'
            }} />
            <input
              type="text"
              className="form-input"
              style={{ paddingLeft: '2.5rem', height: '38px', fontSize: '0.875rem' }}
              placeholder="Rechercher un article..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Articles Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: '2rem',
        }}>
          {filteredArticles.map((art) => (
            <article
              key={art.id}
              className="glass-card glass-card-hover"
              style={{
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                cursor: 'pointer',
              }}
              onClick={() => setActiveArticle(art)}
            >
              {/* Header Color Banner */}
              <div style={{
                height: '140px',
                background: art.imageGradient,
                padding: '1.5rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}>
                <span className="badge" style={{ background: 'rgba(0,0,0,0.4)', color: '#fff', alignSelf: 'flex-start' }}>
                  {art.categoryLabel}
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: 'rgba(255,255,255,0.9)', fontSize: '0.8rem' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <Calendar size={13} /> {art.date}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <Clock size={13} /> {art.readTime}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
                <h3 style={{ fontSize: '1.2rem', marginBottom: '0.75rem', lineHeight: 1.4 }}>
                  {art.title}
                </h3>
                <p style={{
                  fontSize: '0.875rem',
                  color: 'var(--text-secondary)',
                  lineHeight: 1.6,
                  marginBottom: '1.5rem',
                  display: '-webkit-box',
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                }}>
                  {art.excerpt}
                </p>

                <div style={{
                  marginTop: 'auto',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingTop: '1rem',
                  borderTop: '1px solid var(--border-color)',
                  fontSize: '0.825rem',
                  color: 'var(--s2t-red)',
                  fontWeight: 600,
                }}>
                  <span>Lire l'article</span>
                  <ArrowRight size={16} />
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Article Detail Modal */}
      {activeArticle && (
        <div className="modal-overlay" onClick={() => setActiveArticle(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '720px' }}>
            <div style={{
              padding: '2rem',
              background: activeArticle.imageGradient,
              color: '#fff',
              position: 'relative',
            }}>
              <button
                type="button"
                onClick={() => setActiveArticle(null)}
                style={{
                  position: 'absolute',
                  top: '1rem',
                  right: '1rem',
                  background: 'rgba(0,0,0,0.5)',
                  border: 'none',
                  color: '#fff',
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <X size={18} />
              </button>

              <span className="badge" style={{ background: 'rgba(0,0,0,0.4)', color: '#fff', marginBottom: '1rem' }}>
                {activeArticle.categoryLabel}
              </span>
              <h2 style={{ fontSize: '1.6rem', lineHeight: 1.3, marginBottom: '0.75rem' }}>
                {activeArticle.title}
              </h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.85rem', opacity: 0.9 }}>
                <span>Par {activeArticle.author}</span>
                <span>•</span>
                <span>{activeArticle.date}</span>
              </div>
            </div>

            <div style={{ padding: '2rem' }}>
              <div style={{ whiteSpace: 'pre-line', lineHeight: 1.8, fontSize: '0.95rem', color: 'var(--text-secondary)' }}>
                {activeArticle.content}
              </div>

              <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setActiveArticle(null)}
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Blog;
