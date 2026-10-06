import React from 'react';
import { Link } from 'react-router-dom';
import { Home, AlertOctagon } from 'lucide-react';

const NotFound = () => {
  return (
    <div style={{
      minHeight: '70vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      padding: '2rem',
    }}>
      <div style={{
        width: '72px',
        height: '72px',
        borderRadius: '24px',
        background: 'rgba(244, 63, 94, 0.12)',
        color: 'var(--accent-rose)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '1.5rem',
      }}>
        <AlertOctagon size={36} />
      </div>
      <h1 style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>404</h1>
      <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: 'var(--text-secondary)' }}>
        Page introuvable
      </h2>
      <p style={{ maxWidth: '400px', marginBottom: '2rem', color: 'var(--text-muted)' }}>
        La page que vous recherchez semble avoir été déplacée ou n'existe pas.
      </p>
      <Link to="/" className="btn btn-primary" style={{ gap: '0.5rem' }}>
        <Home size={18} />
        <span>Retour à l'accueil</span>
      </Link>
    </div>
  );
};

export default NotFound;
