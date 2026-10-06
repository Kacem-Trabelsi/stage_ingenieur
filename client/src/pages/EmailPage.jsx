import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { emailAPI } from '../services/api';
import { 
  Mail, 
  Inbox, 
  Send, 
  Trash2, 
  Star, 
  Paperclip, 
  Download, 
  Search, 
  Plus, 
  Reply, 
  Forward, 
  CheckCircle2, 
  AlertCircle, 
  FileText, 
  ShieldCheck,
  RefreshCw,
  X,
  ArrowLeft,
  RotateCcw,
  Sparkles,
  UserCheck,
  Building,
  Tag
} from 'lucide-react';

const QUICK_TEMPLATES = {
  resident: [
    {
      title: 'Demande d\'avenant de superficie',
      category: 'juridique',
      to: 'direction@s2t.tn',
      subject: 'Demande d\'avenant au contrat d\'hébergement — Extension de superficie',
      body: `Madame, Monsieur la Direction S2T,\n\nPar la présente, nous sollicitons une extension de la surface hébergée au sein du Pôle Technologique El Ghazala afin d'accompagner le recrutement de nouveaux collaborateurs.\n\nMerci de nous transmettre les disponibilités et les conditions tarifaires applicables selon le Règlement Intérieur.\n\nCordialement,\nLa Direction`,
    },
    {
      title: 'Justificatif de virement bancaire',
      category: 'facturation',
      to: 'direction@s2t.tn',
      subject: 'Transmission ordre de virement — Redevance locative S2T',
      body: `Bonjour,\n\nVeuillez trouver ci-joint l'avis d'exécution du virement bancaire pour le règlement de notre dernière facture d'hébergement.\n\nMerci de nous faire parvenir la quittance libératoire dès validation comptable.\n\nBien cordialement,\nService Administratif & Comptable`,
    },
    {
      title: 'Réservation de salle de réunion',
      category: 'reservation',
      to: 'direction@s2t.tn',
      subject: 'Demande de réservation — Salle Polyvalente & Visioconférence',
      body: `Bonjour,\n\nNous souhaitons réserver la salle de conférence du technopark pour une réunion d'équipe.\n\n- Date souhaitée : Prochainement\n- Horaires : 09h00 à 13h00\n- Équipement nécessaire : Visioconférence, vidéoprojecteur, accès fibre\n\nMerci de nous confirmer la disponibilité du créneau.\n\nCordialement,`,
    },
    {
      title: 'Assistance technique & Réseau',
      category: 'technique',
      to: 'direction@s2t.tn',
      subject: 'Signalement technique — Accès réseau / Badges magnétiques',
      body: `Bonjour l'équipe support S2T,\n\nNous rencontrons un besoin d'intervention technique concernant :\n- Configuration / extension des accès badges sécurisés\n- Vérification du débit de raccordement optique\n\nMerci pour votre assistance rapide.\n\nCordialement,`,
    },
  ],
  admin: [
    {
      title: 'Circulaire d\'information officielle',
      category: 'general',
      subject: 'Circulaire officielle S2T — Note d\'information aux entreprises hébergées',
      body: `Chers Résidents du Pôle Technologique El Ghazala,\n\nNous vous prions de bien vouloir prendre connaissance de la note d'information ci-jointe relative aux dispositions administratives et sécuritaires en vigueur sur le technopark.\n\nLa Direction Générale S2T reste à votre entière disposition pour tout renseignement complémentaire.\n\nDirection Générale & Secrétariat S2T`,
    },
    {
      title: 'Avis d\'échéance & Appel de fonds',
      category: 'facturation',
      subject: 'Avis d\'échéance de redevance locative — Pôle El Ghazala',
      body: `Madame, Monsieur,\n\nNous vous transmettons votre avis d'échéance pour le mois à venir conformément aux dispositions de votre convention d'hébergement S2T (Art. 6).\n\nNous vous invitons à régulariser le règlement avant le 5 du mois par virement ou ordre permanent.\n\nService Facturation & Recouvrement S2T`,
    },
    {
      title: 'Notification d\'approbation d\'avenant',
      category: 'juridique',
      subject: 'Validation officielle de votre demande d\'avenant d\'hébergement',
      body: `Cher Résident,\n\nLa commission juridique et financière de Smart Tunisian Technoparks a le plaisir de vous notifier l'approbation de votre demande d'avenant.\n\nL'exemplaire certifié a été enregistré dans votre dossier numérique d'hébergement.\n\nDirection Juridique S2T`,
    },
  ],
};

const EmailPage = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [emails, setEmails] = useState([]);
  const [counts, setCounts] = useState({ inbox: 0, unreadInbox: 0, sent: 0, starred: 0, trash: 0 });
  const [activeFolder, setActiveFolder] = useState('inbox'); // 'inbox' | 'sent' | 'starred' | 'trash'
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all'); // 'all' | 'juridique' | 'facturation' | 'technique' | 'reservation' | 'general'
  
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  
  // Mobile / layout navigation state
  const [mobileView, setMobileView] = useState('list'); // 'folders' | 'list' | 'reader'

  // Compose Modal State
  const [composeOpen, setComposeOpen] = useState(false);
  const [recipientsData, setRecipientsData] = useState({ official: [], residents: [] });
  const [composeData, setComposeData] = useState({
    to: isAdmin ? '' : 'direction@s2t.tn',
    subject: '',
    body: '',
    category: 'general',
    replyTo: null,
  });

  // Notification Toast State
  const [toast, setToast] = useState(null); // { type: 'success' | 'error', message: '' }

  const showToast = (message, type = 'success') => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  // Fetch recipients list for compose dropdown
  const loadRecipients = useCallback(async () => {
    try {
      const res = await emailAPI.getRecipients();
      setRecipientsData(res.data || { official: [], residents: [] });
    } catch (err) {
      console.error('Erreur chargement destinataires:', err);
    }
  }, []);

  // Fetch email counts for sidebar badges
  const loadCounts = useCallback(async () => {
    try {
      const res = await emailAPI.getCounts();
      setCounts(res.data);
    } catch (err) {
      console.error('Erreur chargement compteurs:', err);
    }
  }, []);

  // Fetch emails for current active folder and query
  const loadEmails = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    else setRefreshing(true);

    try {
      const res = await emailAPI.getAll({
        folder: activeFolder,
        search: searchQuery,
      });

      const list = res.data || [];
      setEmails(list);

      // If previously selected email is in the list, keep it; else pick first or null
      setSelectedEmail((prev) => {
        if (list.length === 0) return null;
        if (prev) {
          const match = list.find((e) => e._id === prev._id || e.id === prev.id);
          return match || list[0];
        }
        return list[0];
      });

      await loadCounts();
    } catch (err) {
      console.error('Erreur chargement emails:', err);
      showToast('Impossible de charger les courriers.', 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [activeFolder, searchQuery, loadCounts]);

  // Initial load
  useEffect(() => {
    loadRecipients();
  }, [loadRecipients]);

  useEffect(() => {
    loadEmails();
  }, [loadEmails]);

  // Handle selecting an email
  const handleSelectEmail = async (email) => {
    setSelectedEmail(email);
    setMobileView('reader');

    if (!email.isRead) {
      try {
        await emailAPI.markAsRead(email._id, true);
        setEmails((prev) =>
          prev.map((em) => (em._id === email._id ? { ...em, isRead: true } : em))
        );
        setSelectedEmail((prev) => (prev ? { ...prev, isRead: true } : prev));
        setCounts((prev) => ({
          ...prev,
          unreadInbox: Math.max(0, prev.unreadInbox - 1),
        }));
      } catch (err) {
        console.error('Erreur marquage lu:', err);
      }
    }
  };

  // Handle toggling Star
  const handleToggleStar = async (emailId, e) => {
    if (e) e.stopPropagation();
    try {
      const res = await emailAPI.toggleStar(emailId);
      const newStarred = res.data.isStarred;

      setEmails((prev) =>
        prev.map((em) => (em._id === emailId ? { ...em, isStarred: newStarred } : em))
      );

      if (selectedEmail?._id === emailId) {
        setSelectedEmail((prev) => (prev ? { ...prev, isStarred: newStarred } : prev));
      }

      setCounts((prev) => ({
        ...prev,
        starred: newStarred ? prev.starred + 1 : Math.max(0, prev.starred - 1),
      }));

      showToast(newStarred ? 'Message ajouté aux favoris.' : 'Message retiré des favoris.');
    } catch (err) {
      console.error('Erreur toggle star:', err);
      showToast('Erreur lors de la mise à jour des favoris.', 'error');
    }
  };

  // Handle Mark Read / Unread toggle
  const handleToggleReadStatus = async (emailId, currentIsRead, e) => {
    if (e) e.stopPropagation();
    try {
      const nextRead = !currentIsRead;
      await emailAPI.markAsRead(emailId, nextRead);

      setEmails((prev) =>
        prev.map((em) => (em._id === emailId ? { ...em, isRead: nextRead } : em))
      );

      if (selectedEmail?._id === emailId) {
        setSelectedEmail((prev) => (prev ? { ...prev, isRead: nextRead } : prev));
      }

      setCounts((prev) => ({
        ...prev,
        unreadInbox: nextRead ? Math.max(0, prev.unreadInbox - 1) : prev.unreadInbox + 1,
      }));

      showToast(nextRead ? 'Marqué comme lu' : 'Marqué comme non lu');
    } catch (err) {
      console.error('Erreur status lecture:', err);
    }
  };

  // Handle Delete (Move to trash or permanent)
  const handleDeleteEmail = async (emailId, e) => {
    if (e) e.stopPropagation();
    const isPermanent = activeFolder === 'trash';
    
    if (isPermanent && !window.confirm('Voulez-vous supprimer définitivement ce message ? Cette action est irréversible.')) {
      return;
    }

    try {
      setActionLoading(true);
      await emailAPI.delete(emailId, isPermanent);

      setEmails((prev) => prev.filter((em) => em._id !== emailId));
      if (selectedEmail?._id === emailId) {
        const remaining = emails.filter((em) => em._id !== emailId);
        setSelectedEmail(remaining[0] || null);
        if (remaining.length === 0) setMobileView('list');
      }

      await loadCounts();
      showToast(isPermanent ? 'Message définitivement supprimé.' : 'Message déplacé dans la corbeille.');
    } catch (err) {
      console.error('Erreur suppression:', err);
      showToast('Erreur lors de la suppression.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Restore from trash
  const handleRestoreEmail = async (emailId, e) => {
    if (e) e.stopPropagation();
    try {
      setActionLoading(true);
      await emailAPI.restore(emailId);

      setEmails((prev) => prev.filter((em) => em._id !== emailId));
      if (selectedEmail?._id === emailId) {
        const remaining = emails.filter((em) => em._id !== emailId);
        setSelectedEmail(remaining[0] || null);
      }

      await loadCounts();
      showToast('Message restauré dans votre boîte de réception.');
    } catch (err) {
      console.error('Erreur restauration:', err);
      showToast('Erreur lors de la restauration.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Send Email
  const handleSendEmail = async (e) => {
    e.preventDefault();
    if (!composeData.to || !composeData.subject.trim() || !composeData.body.trim()) {
      showToast('Veuillez remplir tous les champs obligatoires.', 'error');
      return;
    }

    try {
      setActionLoading(true);
      const res = await emailAPI.send(composeData);

      setComposeOpen(false);
      setComposeData({
        to: isAdmin ? '' : 'juridique@s2t.tn',
        subject: '',
        body: '',
        category: 'general',
        replyTo: null,
      });

      showToast('Message transmis avec succès avec accusé de réception certifié S2T !');

      // Refresh list & counts
      await loadCounts();
      if (activeFolder === 'sent') {
        setEmails((prev) => [res.data, ...prev]);
        setSelectedEmail(res.data);
      }
    } catch (err) {
      console.error('Erreur envoi email:', err);
      showToast(err.response?.data?.message || 'Erreur lors de la transmission du message.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Open Reply Modal
  const handleOpenReply = () => {
    if (!selectedEmail) return;
    
    // Determine reply recipient
    const replyToEmail = selectedEmail.senderEmail;
    const replySubject = selectedEmail.subject.startsWith('Re:')
      ? selectedEmail.subject
      : `Re: ${selectedEmail.subject}`;
    
    const quoteBody = `\n\n--- En réponse à ${selectedEmail.senderName} (${selectedEmail.date}) ---\n${selectedEmail.body}`;

    setComposeData({
      to: replyToEmail,
      subject: replySubject,
      body: quoteBody,
      category: selectedEmail.category || 'general',
      replyTo: selectedEmail._id,
    });
    setComposeOpen(true);
  };

  // Open Forward Modal
  const handleOpenForward = () => {
    if (!selectedEmail) return;

    setComposeData({
      to: '',
      subject: `Fwd: ${selectedEmail.subject}`,
      body: `\n\n--- Message transféré ---\nDe : ${selectedEmail.senderName} <${selectedEmail.senderEmail}>\nDate : ${selectedEmail.date}\nObjet : ${selectedEmail.subject}\n\n${selectedEmail.body}`,
      category: selectedEmail.category || 'general',
      replyTo: null,
    });
    setComposeOpen(true);
  };

  // Apply quick template
  const applyTemplate = (tpl) => {
    setComposeData((prev) => ({
      ...prev,
      to: isAdmin ? prev.to : 'direction@s2t.tn',
      subject: tpl.subject,
      body: tpl.body,
      category: tpl.category || 'general',
    }));
  };

  // Filter emails by category if selected
  const displayedEmails = emails.filter((em) => {
    if (categoryFilter === 'all') return true;
    return em.category === categoryFilter;
  });

  const availableTemplates = isAdmin ? QUICK_TEMPLATES.admin : QUICK_TEMPLATES.resident;

  return (
    <div className="email-page-container">
      {/* Top Banner Header */}
      <div className="page-header-row">
        <div className="page-header-text">
          <div className="page-breadcrumb">
            <Mail size={16} color="var(--s2t-red)" />
            <span>
              {isAdmin ? 'Administration S2T / Messagerie Officielle' : 'Espace Résident S2T / Courriers Officiels'}
            </span>
          </div>
          <h1 className="page-main-title">
            {isAdmin ? 'Centre de Correspondances Administratives' : 'Boîte de Réception & Communications S2T'}
          </h1>
          <p className="page-subtitle">
            {isAdmin 
              ? 'Échangez avec les entreprises résidentes, notifiez les décisions juridiques et répondez aux requêtes administratives.'
              : 'Consultez les correspondances officielles du Technopark, les avis d\'échéance et vos quittances certifiées.'
            }
          </p>
        </div>

        <div className="page-header-actions">
          <button
            type="button"
            onClick={() => loadEmails(true)}
            className="btn btn-secondary"
            title="Rafraîchir les messages"
            style={{ gap: '0.4rem', padding: '0.65rem 1rem' }}
          >
            <RefreshCw size={16} className={refreshing ? 'spin-animation' : ''} />
            <span className="hide-on-mobile">Actualiser</span>
          </button>

          <button 
            type="button" 
            onClick={() => {
              setComposeData({
                to: isAdmin ? '' : 'direction@s2t.tn',
                subject: '',
                body: '',
                category: 'general',
                replyTo: null,
              });
              setComposeOpen(true);
            }}
            className="btn btn-primary"
            style={{ gap: '0.6rem', padding: '0.65rem 1.4rem' }}
          >
            <Plus size={18} />
            <span>{isAdmin ? 'Nouveau Courrier Résident' : 'Écrire à la Direction S2T'}</span>
          </button>
        </div>
      </div>

      {/* Toast Notification Alert */}
      {toast && (
        <div style={{
          background: toast.type === 'error' ? 'rgba(239, 68, 68, 0.12)' : 'rgba(16, 185, 129, 0.12)',
          border: `1px solid ${toast.type === 'error' ? 'rgba(239, 68, 68, 0.3)' : 'rgba(16, 185, 129, 0.3)'}`,
          color: toast.type === 'error' ? '#EF4444' : '#10B981',
          padding: '0.75rem 1rem',
          borderRadius: 'var(--radius-md)',
          marginBottom: '0.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '0.6rem',
          fontSize: '0.875rem',
          fontWeight: 600
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            {toast.type === 'error' ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
            <span>{toast.message}</span>
          </div>
          <button 
            type="button" 
            onClick={() => setToast(null)} 
            style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer' }}
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Mobile & Tablet Folder Tabs Bar */}
      <div className="mailbox-mobile-nav">
        <button
          type="button"
          onClick={() => {
            setActiveFolder('inbox');
            setMobileView('list');
          }}
          className={`mailbox-nav-tab ${activeFolder === 'inbox' ? 'active' : ''}`}
        >
          <Inbox size={15} />
          <span>Boîte de réception</span>
          {counts.unreadInbox > 0 && <span className="tab-badge">{counts.unreadInbox}</span>}
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveFolder('starred');
            setMobileView('list');
          }}
          className={`mailbox-nav-tab ${activeFolder === 'starred' ? 'active' : ''}`}
        >
          <Star size={15} />
          <span>Favoris</span>
          {counts.starred > 0 && <span className="tab-badge" style={{ background: '#F59E0B' }}>{counts.starred}</span>}
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveFolder('sent');
            setMobileView('list');
          }}
          className={`mailbox-nav-tab ${activeFolder === 'sent' ? 'active' : ''}`}
        >
          <Send size={15} />
          <span>Envoyés</span>
          {counts.sent > 0 && <span className="tab-badge" style={{ background: 'var(--s2t-blue)' }}>{counts.sent}</span>}
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveFolder('trash');
            setMobileView('list');
          }}
          className={`mailbox-nav-tab ${activeFolder === 'trash' ? 'active' : ''}`}
        >
          <Trash2 size={15} />
          <span>Corbeille</span>
          {counts.trash > 0 && <span className="tab-badge" style={{ background: 'var(--text-muted)' }}>{counts.trash}</span>}
        </button>
      </div>

      {/* Main Mailbox Grid */}
      <div className="mailbox-grid">
        {/* Left Mail Folders Bar (Desktop Only) */}
        <div className="mailbox-sidebar-card">
          <div className="mailbox-folders-list">
            <button
              type="button"
              onClick={() => {
                setActiveFolder('inbox');
                setMobileView('list');
              }}
              className={`mailbox-folder-btn ${activeFolder === 'inbox' ? 'active' : ''}`}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Inbox size={18} />
                <span>Boîte de réception</span>
              </div>
              {counts.unreadInbox > 0 && (
                <span className="folder-badge-pill">{counts.unreadInbox}</span>
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveFolder('starred');
                setMobileView('list');
              }}
              className={`mailbox-folder-btn ${activeFolder === 'starred' ? 'active' : ''}`}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Star size={18} />
                <span>Messages favoris</span>
              </div>
              {counts.starred > 0 && (
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{counts.starred}</span>
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveFolder('sent');
                setMobileView('list');
              }}
              className={`mailbox-folder-btn ${activeFolder === 'sent' ? 'active' : ''}`}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Send size={18} />
                <span>Messages envoyés</span>
              </div>
              {counts.sent > 0 && (
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{counts.sent}</span>
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveFolder('trash');
                setMobileView('list');
              }}
              className={`mailbox-folder-btn ${activeFolder === 'trash' ? 'active' : ''}`}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Trash2 size={18} />
                <span>Corbeille</span>
              </div>
              {counts.trash > 0 && (
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{counts.trash}</span>
              )}
            </button>
          </div>

          {/* Quick Legal Notice */}
          <div className="mailbox-legal-box">
            <ShieldCheck size={20} color="var(--s2t-teal)" style={{ flexShrink: 0, marginTop: '2px' }} />
            <span>
              Les correspondances numériques échangées via le portail S2T font foi et sont horodatées conformément au Règlement Intérieur du technopark.
            </span>
          </div>
        </div>

        {/* Center: Email List */}
        <div className={`mailbox-list-card ${mobileView === 'reader' ? 'mobile-hidden' : ''}`}>
          {/* Search & Filter Bar */}
          <div className="mailbox-search-box">
            <Search size={16} color="var(--text-muted)" />
            <input
              type="text"
              placeholder="Rechercher par objet, expéditeur, mot-clé..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="mailbox-search-input"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
              >
                <X size={15} />
              </button>
            )}
          </div>

          {/* Category Filter Pills */}
          <div className="mailbox-category-bar">
            {[
              { key: 'all', label: 'Tous' },
              { key: 'juridique', label: 'Juridique' },
              { key: 'facturation', label: 'Facturation' },
              { key: 'technique', label: 'Technique' },
              { key: 'reservation', label: 'Réservation' },
            ].map((cat) => (
              <button
                key={cat.key}
                type="button"
                onClick={() => setCategoryFilter(cat.key)}
                className={`mailbox-category-chip ${categoryFilter === cat.key ? 'active' : ''}`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Scrollable list */}
          <div className="mailbox-items-scroll">
            {loading ? (
              <div className="mailbox-loading-overlay">
                <RefreshCw size={24} className="spin-animation" color="var(--s2t-blue)" />
                <span style={{ fontSize: '0.85rem' }}>Chargement des messages S2T...</span>
              </div>
            ) : displayedEmails.length === 0 ? (
              <div className="mailbox-empty-state">
                <Mail size={36} style={{ opacity: 0.35, marginBottom: '0.5rem' }} />
                <p style={{ fontWeight: 600, fontSize: '0.9rem', margin: 0 }}>Aucun message trouvé</p>
                <span style={{ fontSize: '0.78rem' }}>Ce dossier ne contient aucun courrier officiel pour l'instant.</span>
              </div>
            ) : (
              displayedEmails.map((em) => {
                const isSelected = selectedEmail?._id === em._id || selectedEmail?.id === em._id;
                return (
                  <div
                    key={em._id || em.id}
                    onClick={() => handleSelectEmail(em)}
                    className={`email-row-item ${isSelected ? 'selected' : ''} ${!em.isRead ? 'unread' : ''}`}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
                      <span className="email-row-sender">
                        {activeFolder === 'sent' ? `À : ${em.recipientName}` : em.senderName}
                      </span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span className="email-row-date">{em.date}</span>
                        <button
                          type="button"
                          onClick={(e) => handleToggleStar(em._id, e)}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: em.isStarred ? '#F59E0B' : 'var(--text-muted)', padding: '2px', display: 'flex' }}
                          title={em.isStarred ? 'Retirer des favoris' : 'Marquer comme favori'}
                        >
                          <Star size={15} fill={em.isStarred ? '#F59E0B' : 'none'} />
                        </button>
                      </div>
                    </div>

                    <div className="email-row-subject">{em.subject}</div>
                    <div className="email-row-preview">{em.preview}</div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.4rem' }}>
                      <span 
                        className="email-tag-pill"
                        style={{ 
                          background: `${em.tagColor || '#2563EB'}1A`, 
                          color: em.tagColor || '#2563EB', 
                          borderColor: `${em.tagColor || '#2563EB'}40` 
                        }}
                      >
                        {em.tag || 'Général'}
                      </span>
                      {em.attachments?.length > 0 && (
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <Paperclip size={12} /> {em.attachments.length} PJ
                        </span>
                      )}
                      {!em.isRead && (
                        <span style={{
                          width: '7px',
                          height: '7px',
                          borderRadius: '50%',
                          background: 'var(--s2t-red)',
                          marginLeft: 'auto',
                        }} />
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right: Email Detail Reader */}
        <div className={`mailbox-reader-card ${mobileView === 'list' ? 'mobile-hidden' : ''}`}>
          {selectedEmail ? (
            <div className="email-reader-content" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              {/* Back to list & Fast Toolbar on mobile */}
              <div className="mobile-view-nav">
                <button
                  type="button"
                  onClick={() => setMobileView('list')}
                  className="btn btn-secondary btn-sm"
                  style={{ gap: '0.4rem', padding: '0.4rem 0.75rem', fontSize: '0.8rem' }}
                >
                  <ArrowLeft size={16} />
                  <span>
                    {activeFolder === 'inbox' ? 'Boîte de réception' : 
                     activeFolder === 'starred' ? 'Messages favoris' :
                     activeFolder === 'sent' ? 'Messages envoyés' : 'Corbeille'}
                  </span>
                </button>

                <div className="email-actions-bar">
                  <button
                    type="button"
                    onClick={(e) => handleToggleStar(selectedEmail._id, e)}
                    className="btn btn-ghost btn-sm"
                    title={selectedEmail.isStarred ? 'Retirer des favoris' : 'Marquer comme favori'}
                    style={{ color: selectedEmail.isStarred ? '#F59E0B' : 'var(--text-secondary)' }}
                  >
                    <Star size={16} fill={selectedEmail.isStarred ? '#F59E0B' : 'none'} />
                  </button>

                  <button
                    type="button"
                    onClick={(e) => handleToggleReadStatus(selectedEmail._id, selectedEmail.isRead, e)}
                    className="btn btn-ghost btn-sm"
                    title={selectedEmail.isRead ? 'Marquer comme non lu' : 'Marquer comme lu'}
                  >
                    <Mail size={16} />
                  </button>

                  {activeFolder === 'trash' ? (
                    <button
                      type="button"
                      onClick={(e) => handleRestoreEmail(selectedEmail._id, e)}
                      className="btn btn-ghost btn-sm"
                      title="Restaurer le message"
                      disabled={actionLoading}
                    >
                      <RotateCcw size={16} color="var(--s2t-teal)" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={(e) => handleDeleteEmail(selectedEmail._id, e)}
                      className="btn btn-ghost btn-sm"
                      title="Déplacer dans la corbeille"
                      disabled={actionLoading}
                      style={{ color: 'var(--s2t-red)' }}
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </div>

              {/* Reader Header */}
              <div className="reader-header">
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                    <span 
                      className="email-tag-pill"
                      style={{ 
                        background: `${selectedEmail.tagColor || '#2563EB'}1A`, 
                        color: selectedEmail.tagColor || '#2563EB', 
                        borderColor: `${selectedEmail.tagColor || '#2563EB'}40` 
                      }}
                    >
                      {selectedEmail.tag || 'Général'}
                    </span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      {selectedEmail.date}
                    </span>
                    {selectedEmail.threadId && (
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', background: 'var(--bg-tertiary)', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>
                        Fil #{selectedEmail.threadId.replace('th-', '')}
                      </span>
                    )}
                  </div>
                  <h2 className="reader-title">{selectedEmail.subject}</h2>
                </div>

                {/* Reader Action Icons (Desktop) */}
                <div className="email-actions-bar hide-on-mobile">
                  <button
                    type="button"
                    onClick={(e) => handleToggleStar(selectedEmail._id, e)}
                    className="btn btn-ghost btn-sm"
                    title={selectedEmail.isStarred ? 'Retirer des favoris' : 'Marquer comme favori'}
                    style={{ color: selectedEmail.isStarred ? '#F59E0B' : 'var(--text-secondary)' }}
                  >
                    <Star size={16} fill={selectedEmail.isStarred ? '#F59E0B' : 'none'} />
                  </button>

                  <button
                    type="button"
                    onClick={(e) => handleToggleReadStatus(selectedEmail._id, selectedEmail.isRead, e)}
                    className="btn btn-ghost btn-sm"
                    title={selectedEmail.isRead ? 'Marquer comme non lu' : 'Marquer comme lu'}
                  >
                    <Mail size={16} />
                  </button>

                  {activeFolder === 'trash' ? (
                    <button
                      type="button"
                      onClick={(e) => handleRestoreEmail(selectedEmail._id, e)}
                      className="btn btn-ghost btn-sm"
                      title="Restaurer le message"
                      disabled={actionLoading}
                    >
                      <RotateCcw size={16} color="var(--s2t-teal)" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={(e) => handleDeleteEmail(selectedEmail._id, e)}
                      className="btn btn-ghost btn-sm"
                      title="Déplacer dans la corbeille"
                      disabled={actionLoading}
                      style={{ color: 'var(--s2t-red)' }}
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </div>

              {/* Sender & Recipient info */}
              <div className="reader-sender-box">
                <div className="reader-sender-info">
                  <div className="reader-sender-avatar" style={{ background: selectedEmail.tagColor || 'var(--s2t-blue)' }}>
                    {selectedEmail.senderName?.charAt(0) || 'S'}
                  </div>
                  <div className="reader-sender-details">
                    <div className="reader-sender-name">
                      <span>{selectedEmail.senderName}</span>
                      {selectedEmail.senderRole === 'admin' && (
                        <span style={{ fontSize: '0.7rem', background: 'rgba(239, 68, 68, 0.12)', color: 'var(--s2t-red)', padding: '0.1rem 0.4rem', borderRadius: '4px', fontWeight: 700 }}>
                          Direction S2T
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', wordBreak: 'break-all' }}>
                      De : <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{selectedEmail.senderEmail}</span>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', wordBreak: 'break-all' }}>
                      À : <span style={{ color: 'var(--text-secondary)' }}>{selectedEmail.recipientName} ({selectedEmail.recipientEmail})</span>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    onClick={handleOpenReply}
                    className="btn btn-secondary btn-sm"
                    style={{ gap: '0.4rem', fontSize: '0.8rem' }}
                  >
                    <Reply size={14} />
                    <span>Répondre</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleOpenForward}
                    className="btn btn-ghost btn-sm"
                    style={{ gap: '0.4rem', fontSize: '0.8rem' }}
                  >
                    <Forward size={14} />
                    <span>Transférer</span>
                  </button>
                </div>
              </div>

              {/* Email Body */}
              <div className="reader-body-text">
                {selectedEmail.body}
              </div>

              {/* Attachments list if any */}
              {selectedEmail.attachments?.length > 0 && (
                <div className="reader-attachments-box">
                  <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.6rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Paperclip size={14} />
                    <span>Pièces jointes certifiées ({selectedEmail.attachments.length}) :</span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {selectedEmail.attachments.map((att, idx) => (
                      <div key={idx} className="attachment-chip">
                        <div className="attachment-chip-info">
                          <FileText size={18} color="var(--s2t-red)" style={{ flexShrink: 0 }} />
                          <div style={{ minWidth: 0 }}>
                            <div className="attachment-chip-name">{att.name}</div>
                            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{att.size || 'Fichier certifié'} • Signature numérique S2T</div>
                          </div>
                        </div>

                        <button 
                          type="button" 
                          className="btn btn-secondary btn-sm"
                          style={{ gap: '0.35rem', fontSize: '0.75rem', flexShrink: 0 }}
                          onClick={() => {
                            showToast(`Téléchargement de "${att.name}" lancé.`);
                          }}
                        >
                          <Download size={14} />
                          <span>Télécharger</span>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="mailbox-empty-state" style={{ height: '100%', justifyContent: 'center' }}>
              <Mail size={44} style={{ margin: '0 auto 1rem', opacity: 0.25 }} />
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
                Aucun message sélectionné
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', maxWidth: '320px' }}>
                Sélectionnez un courrier dans la liste pour en consulter le contenu complet ou rédigez un nouveau message.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Compose Email Modal */}
      {composeOpen && (
        <div className="modal-overlay" onClick={() => setComposeOpen(false)}>
          <form 
            onSubmit={handleSendEmail} 
            className="modal-container" 
            style={{ maxWidth: '720px', width: '95%' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                <div style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '12px',
                  background: 'rgba(225, 29, 72, 0.12)',
                  border: '1px solid rgba(225, 29, 72, 0.25)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--s2t-red)',
                  flexShrink: 0
                }}>
                  <Send size={20} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                    {composeData.replyTo ? 'Répondre au message officiel' : (isAdmin ? 'Nouveau Courrier Officiel S2T' : 'Nouveau Message à la Direction S2T')}
                  </h3>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                    Accusé de réception automatique et archivage numérique certifié
                  </span>
                </div>
              </div>
              <button 
                type="button" 
                onClick={() => setComposeOpen(false)} 
                className="btn btn-ghost"
                style={{ padding: '0.45rem', borderRadius: '50%', color: 'var(--text-secondary)' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Quick Template Picker Bar */}
            <div className="compose-templates-bar">
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.35rem', whiteSpace: 'nowrap' }}>
                <Sparkles size={14} color="#F59E0B" /> Modèles rapides :
              </span>
              {availableTemplates.map((tpl, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => applyTemplate(tpl)}
                  className="compose-template-chip"
                >
                  {tpl.title}
                </button>
              ))}
            </div>

            {/* Modal Body */}
            <div className="modal-body">
              {/* Recipient Selection */}
              {isAdmin ? (
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span>Entreprise destinataire *</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Sélectionnez l'entreprise hébergée</span>
                  </label>
                  <select
                    className="form-select"
                    required
                    value={composeData.to}
                    onChange={(e) => setComposeData({ ...composeData, to: e.target.value })}
                    style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }}
                  >
                    <option value="">-- Sélectionner l'entreprise hébergée --</option>
                    {recipientsData.residents?.map((res) => (
                      <option key={res.email} value={res.email}>
                        {res.label || (res.companyName ? `${res.companyName} — ${res.name} (${res.email})` : `${res.name} (${res.email})`)}
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Destinataire officiel *</label>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.75rem 1rem',
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-md)',
                    color: 'var(--text-primary)',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                  }}>
                    <div style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '8px',
                      background: 'rgba(37, 99, 235, 0.12)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--s2t-blue)',
                      flexShrink: 0
                    }}>
                      <Building size={16} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>Direction Générale S2T</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 400 }}>Pôle Technologique El Ghazala</div>
                    </div>
                    <span style={{ 
                      marginLeft: 'auto', 
                      fontSize: '0.78rem', 
                      background: 'rgba(37, 99, 235, 0.1)', 
                      color: 'var(--s2t-blue)', 
                      padding: '0.2rem 0.6rem', 
                      borderRadius: 'var(--radius-full)', 
                      fontWeight: 600,
                      border: '1px solid rgba(37, 99, 235, 0.2)'
                    }}>
                      direction@s2t.tn
                    </span>
                  </div>
                </div>
              )}

              {/* Category selector & Subject */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Catégorie du courrier *</label>
                  <select
                    className="form-select"
                    value={composeData.category}
                    onChange={(e) => setComposeData({ ...composeData, category: e.target.value })}
                    style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }}
                  >
                    <option value="general">Général / Administratif</option>
                    <option value="juridique">Juridique & Contrats (Avenants, Règlement)</option>
                    <option value="facturation">Facturation & Recouvrement (Redevances, Paiements)</option>
                    <option value="technique">Support Technique & Hébergement</option>
                    <option value="reservation">Réservation Salles & Événements</option>
                    <option value="urgent">Urgent / Priorité Haute</option>
                  </select>
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Objet officiel *</label>
                  <input
                    type="text"
                    className="form-input"
                    required
                    placeholder="Ex: Demande d'extension de surface / Quittance"
                    value={composeData.subject}
                    onChange={(e) => setComposeData({ ...composeData, subject: e.target.value })}
                    style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }}
                  />
                </div>
              </div>

              {/* Message Body */}
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Corps du courrier officiel *</label>
                <textarea
                  className="form-input"
                  required
                  rows={8}
                  placeholder="Rédigez votre demande ou notification officielle..."
                  value={composeData.body}
                  onChange={(e) => setComposeData({ ...composeData, body: e.target.value })}
                  style={{ 
                    resize: 'vertical', 
                    fontFamily: 'inherit', 
                    lineHeight: 1.65,
                    background: 'var(--bg-secondary)',
                    borderColor: 'var(--border-color)'
                  }}
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="modal-footer">
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Expéditeur : <strong style={{ color: 'var(--text-primary)' }}>{user?.name}</strong> ({user?.email})
              </div>

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => setComposeOpen(false)}
                  disabled={actionLoading}
                >
                  Annuler
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={actionLoading}
                  style={{ gap: '0.5rem', padding: '0.65rem 1.4rem' }}
                >
                  {actionLoading ? (
                    <>
                      <RefreshCw size={16} className="spin-animation" />
                      <span>Transmission en cours...</span>
                    </>
                  ) : (
                    <>
                      <Send size={16} />
                      <span>Transmettre le courrier</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default EmailPage;
