import React from 'react';
import { Link } from 'react-router-dom';
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
  const technoparks = [
    { name: 'Pôle Technologique El Ghazala', city: 'Ariana / Grand Tunis', focus: 'Télécoms, Logiciels, IA & IoT', size: '65 Hectares' },
    { name: 'Technopark Manouba (Novation City)', city: 'Manouba', focus: 'Technologies Médicales & TIC', size: '52 Hectares' },
    { name: 'Technopôle de Sfax', city: 'Sfax', focus: 'Informatique & Multimédia', size: '40 Hectares' },
    { name: 'Technopôle de Sousse', city: 'Sousse', focus: 'Mécatronique & Électronique Intelligente', size: '56 Hectares' },
    { name: 'Technoparc de Bizerte', city: 'Bizerte', focus: 'Agro-alimentaire & Énergies Renouvelables', size: '35 Hectares' },
    { name: 'Technopôle de Médenine', city: 'Médenine', focus: 'Valorisation des Ressources Sahariennes', size: '30 Hectares' },
  ];

  const missions = [
    {
      title: 'Aménagement & Infrastructures Intelligentes',
      desc: 'Conception et gestion d\'espaces bureautiques modernes, de pépinières et de centres de données adaptés aux exigences des multinationales et startups TIC.',
      icon: Building2,
    },
    {
      title: 'Incubation & Pépinière d\'Entreprises',
      desc: 'Accompagnement juridique, technique et financier des porteurs de projets innovants avec des redevances locatives progressives et bonifiées.',
      icon: Target,
    },
    {
      title: 'Animation de l\'Écosystème & Synergies',
      desc: 'Création de passerelles directes entre les écoles d\'ingénieurs (Sup\'Com, INSAT, ENSI), les laboratoires de recherche et le tissu industriel.',
      icon: Users,
    },
    {
      title: 'Cadre Juridique Sécurisé & Réglementaire',
      desc: 'Application stricte des lois régissant les pôles technologiques (Loi n°2001-50 et Loi n°2006-37) pour garantir la pérennité contractuelle.',
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
            Histoire & Vision
          </span>
          <h1 style={{ fontSize: 'clamp(2.2rem, 5vw, 3.5rem)', marginBottom: '1.25rem' }}>
            À Propos de <span className="gradient-text">Smart Tunisian Technoparks</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', lineHeight: 1.6 }}>
            Pionnier de l'économie du savoir et premier pôle technologique en Tunisie, S2T impulse l'innovation numérique, l'hébergement d'entreprises et la valorisation des compétences technologiques.
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
              Notre Vocation
            </span>
            <h2 style={{ fontSize: '2.1rem', margin: '0.5rem 0 1.25rem' }}>
              Un catalyseur d'innovation technologique au cœur du Maghreb
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.7, marginBottom: '1.25rem' }}>
              Créé dans le cadre de la stratégie nationale de promotion des Technologies de l'Information et de la Communication, <strong>S2T (Smart Tunisian Technoparks)</strong> gère notamment le prestigieux <strong>Pôle Technologique El Ghazala</strong> à l'Ariana.
            </p>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.7, marginBottom: '1.75rem' }}>
              S2T offre un environnement d'affaires d'excellence, doté d'infrastructures de télécommunication de pointe, d'un guichet unique administratif, juridique et financier pour accompagner les entreprises de l'incubation jusqu'au rayonnement international.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <CheckCircle2 size={18} color="var(--s2t-teal)" />
                <span style={{ fontSize: '0.925rem' }}>Conformité réglementaire aux lois n°2001-50 et n°2006-37</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <CheckCircle2 size={18} color="var(--s2t-teal)" />
                <span style={{ fontSize: '0.925rem' }}>Partenariat étroit avec le Ministère des Technologies de la Communication</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <CheckCircle2 size={18} color="var(--s2t-teal)" />
                <span style={{ fontSize: '0.925rem' }}>Gestion transparente des baux d'hébergement & des redevances</span>
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
              }}>
                <Award size={24} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.25rem' }}>Chiffres Clés S2T</h3>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Impact National & International</span>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
              <div style={{ background: 'var(--bg-tertiary)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
                <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--s2t-red)' }}>65 Ha</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Superficie globale aménagée</div>
              </div>
              <div style={{ background: 'var(--bg-tertiary)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
                <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--s2t-blue)' }}>250+</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Sociétés résidentes</div>
              </div>
              <div style={{ background: 'var(--bg-tertiary)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
                <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--s2t-teal)' }}>98%</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Diplômés de l'enseignement supérieur</div>
              </div>
              <div style={{ background: 'var(--bg-tertiary)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
                <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#8B5CF6' }}>1999</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Année de création du pôle</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Missions Grid */}
      <section className="container" style={{ padding: '3rem 1.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Nos Missions Stratégiques</h2>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto' }}>
            Des engagements forts pour dynamiser l'économie numérique tunisienne.
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
          <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Le Réseau National des Technoparcs</h2>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '650px', margin: '0 auto' }}>
            Un maillage territorial intelligent connecté pour favoriser l'émergence de champions technologiques.
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
              }}>
                <MapPin size={20} />
              </div>
              <div>
                <h4 style={{ fontSize: '1.05rem', marginBottom: '0.2rem' }}>{p.name}</h4>
                <div style={{ fontSize: '0.8rem', color: 'var(--s2t-red)', fontWeight: 600, marginBottom: '0.35rem' }}>
                  {p.city} • {p.size}
                </div>
                <div style={{ fontSize: '0.825rem', color: 'var(--text-secondary)' }}>
                  Spécialisation : {p.focus}
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
