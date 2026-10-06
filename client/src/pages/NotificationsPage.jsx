import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { notificationAPI } from '../services/api';
import { 
  Bell, 
  AlertTriangle, 
  CheckCircle2, 
  Receipt, 
  FileText, 
  Scale, 
  Trash2, 
  Check, 
  ShieldAlert, 
  Sparkles,
  ArrowRight,
  RefreshCw,
  Search,
  X,
  Send,
  Plus,
  Mail,
  Building,
  CheckCheck,
  Megaphone
} from 'lucide-react';

const NotificationsPage = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all'); // 'all' | 'unread' | 'warning' | 'juridique' | 'correspondance' | 'technique'
  const [searchQuery, setSearchQuery] = useState('');
  const [toast, setToast] = useState(null); // { type: 'success' | 'error', message: '' }

  // Admin Broadcast Modal State
  const [broadcastOpen, setBroadcastOpen] = useState(false);
  const [broadcastLoading, setBroadcastLoading] = useState(false);
  const [broadcastData, setBroadcastData] = useState({
    recipientEmail: 'all',
    title: '',
    description: '',
    category: 'Général',
    severity: 'info',
    actionText: 'Consulter',
    actionLink: '/dashboard',
  });

  const showToast = (message, type = 'success') => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  // Load notifications from API
  const loadNotifications = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    else setRefreshing(true);

    try {
      const res = await notificationAPI.getAll();
      setNotifications(res.data || []);
    } catch (err) {
      console.error('Erreur chargement notifications:', err);
      showToast('Impossible de charger les notifications.', 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  // Handle Mark All as Read
  const handleMarkAllRead = async () => {
    try {
      await notificationAPI.markAllRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      showToast('Toutes les notifications ont été marquées comme lues.');
    } catch (err) {
      console.error('Erreur markAllRead:', err);
      showToast('Erreur lors du marquage.', 'error');
    }
  };

  // Handle Toggle Read Single
  const handleToggleRead = async (id, currentIsRead) => {
    try {
      const nextRead = !currentIsRead;
      await notificationAPI.toggleRead(id, nextRead);
      setNotifications(prev => prev.map(n => n.id === id || n._id === id ? { ...n, isRead: nextRead } : n));
      showToast(nextRead ? 'Marquée comme lue.' : 'Marquée comme non lue.');
    } catch (err) {
      console.error('Erreur toggleRead:', err);
      showToast('Erreur lors de la mise à jour.', 'error');
    }
  };

  // Handle Delete Single
  const handleDelete = async (id) => {
    try {
      await notificationAPI.delete(id);
      setNotifications(prev => prev.filter(n => n.id !== id && n._id !== id));
      showToast('Notification supprimée.');
    } catch (err) {
      console.error('Erreur delete notif:', err);
      showToast('Erreur lors de la suppression.', 'error');
    }
  };

  // Handle Clear All Read
  const handleClearRead = async () => {
    if (!window.confirm('Voulez-vous effacer toutes les notifications déjà lues ?')) return;
    try {
      await notificationAPI.clearAll(true);
      setNotifications(prev => prev.filter(n => !n.isRead));
      showToast('Notifications lues effacées.');
    } catch (err) {
      console.error('Erreur clear read:', err);
      showToast('Erreur lors du nettoyage.', 'error');
    }
  };

  // Handle Admin Broadcast Submit
  const handleSendBroadcast = async (e) => {
    e.preventDefault();
    if (!broadcastData.title.trim() || !broadcastData.description.trim()) {
      showToast('Veuillez remplir le titre et la description.', 'error');
      return;
    }

    try {
      setBroadcastLoading(true);
      await notificationAPI.create(broadcastData);
      setBroadcastOpen(false);
      setBroadcastData({
        recipientEmail: 'all',
        title: '',
        description: '',
        category: 'Général',
        severity: 'info',
        actionText: 'Consulter',
        actionLink: '/dashboard',
      });
      showToast('Notification diffusée avec succès aux résidents S2T !');
      await loadNotifications(true);
    } catch (err) {
      console.error('Erreur broadcast:', err);
      showToast(err.response?.data?.message || 'Erreur lors de la diffusion.', 'error');
    } finally {
      setBroadcastLoading(false);
    }
  };

  // Filter notifications based on active tab and search query
  const filteredNotifs = notifications.filter(n => {
    // Filter Tab
    if (activeFilter === 'unread' && n.isRead) return false;
    if (activeFilter === 'warning') {
      const isFin = ['Facturation', 'Recouvrement', 'Réglementaire'].includes(n.category) || n.severity === 'warning' || n.severity === 'danger' || n.type === 'redevance' || n.type === 'relance';
      if (!isFin) return false;
    }
    if (activeFilter === 'juridique') {
      const isJur = ['Juridique', 'Contrat'].includes(n.category) || n.type === 'avenant' || n.type === 'contrat';
      if (!isJur) return false;
    }
    if (activeFilter === 'correspondance') {
      const isEmail = n.category === 'Correspondance' || n.type === 'email';
      if (!isEmail) return false;
    }
    if (activeFilter === 'technique') {
      const isTech = n.category === 'Technique' || n.category === 'Réservation' || n.type === 'technique' || n.type === 'reunion';
      if (!isTech) return false;
    }

    // Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = n.title?.toLowerCase().includes(q);
      const matchDesc = n.description?.toLowerCase().includes(q);
      const matchCat = n.category?.toLowerCase().includes(q);
      return matchTitle || matchDesc || matchCat;
    }

    return true;
  });

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const getSeverityStyle = (severity, type) => {
    switch (severity) {
      case 'warning':
        return {
          icon: AlertTriangle,
          color: '#F59E0B',
          bg: 'rgba(245, 158, 11, 0.12)',
          border: 'rgba(245, 158, 11, 0.3)'
        };
      case 'danger':
        return {
          icon: ShieldAlert,
          color: 'var(--s2t-red)',
          bg: 'rgba(225, 29, 72, 0.12)',
          border: 'rgba(225, 29, 72, 0.3)'
        };
      case 'success':
        return {
          icon: CheckCircle2,
          color: '#10B981',
          bg: 'rgba(16, 185, 129, 0.12)',
          border: 'rgba(16, 185, 129, 0.3)'
        };
      default:
        if (type === 'email') {
          return {
            icon: Mail,
            color: 'var(--s2t-blue)',
            bg: 'rgba(37, 99, 235, 0.12)',
            border: 'rgba(37, 99, 235, 0.3)'
          };
        }
        return {
          icon: Bell,
          color: 'var(--s2t-blue)',
          bg: 'rgba(37, 99, 235, 0.12)',
          border: 'rgba(37, 99, 235, 0.3)'
        };
    }
  };

  return (
    <div className="notifications-page-container">
      {/* Top Banner Header */}
      <div className="page-header-row">
        <div className="page-header-text">
          <div className="page-breadcrumb">
            <Bell size={16} color="#F59E0B" />
            <span>
              {isAdmin 
                ? 'Administration S2T / Centre d\'Alertes & Notifications'
                : 'Espace Résident S2T / Centre de Notifications'}
            </span>
          </div>
          <h1 className="page-main-title">
            {isAdmin 
              ? 'Supervision des Alertes & Événements S2T'
              : 'Alertes & Notifications Réglementaires'}
          </h1>
          <p className="page-subtitle">
            {isAdmin 
              ? 'Surveillance des demandes d\'avenants, réceptions de règlements, expirations de conventions et diffusion d\'annonces officielles.'
              : 'Suivi des échéances de redevance locative (Article 6.3), alertes de relance J+15/J+30 et actualités du pôle.'}
          </p>
        </div>

        <div className="page-header-actions">
          <button
            type="button"
            onClick={() => loadNotifications(true)}
            className="btn btn-secondary"
            title="Actualiser les notifications"
            style={{ gap: '0.4rem', padding: '0.65rem 1rem' }}
          >
            <RefreshCw size={16} className={refreshing ? 'spin-animation' : ''} />
            <span className="hide-on-mobile">Actualiser</span>
          </button>

          {unreadCount > 0 && (
            <button 
              type="button" 
              onClick={handleMarkAllRead}
              className="btn btn-secondary"
              style={{ gap: '0.45rem', padding: '0.65rem 1rem' }}
            >
              <CheckCheck size={16} color="var(--s2t-teal)" />
              <span>Tout marquer comme lu</span>
            </button>
          )}

          {isAdmin && (
            <button
              type="button"
              onClick={() => setBroadcastOpen(true)}
              className="btn btn-primary"
              style={{ gap: '0.5rem', padding: '0.65rem 1.35rem' }}
            >
              <Megaphone size={16} />
              <span>Diffuser une notification</span>
            </button>
          )}
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
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '0.6rem',
          fontSize: '0.875rem',
          fontWeight: 600
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            {toast.type === 'error' ? <AlertTriangle size={18} /> : <CheckCircle2 size={18} />}
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

      {/* Search & Filter Toolbar */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem',
        background: 'var(--bg-card)',
        padding: '0.85rem 1rem',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-color)',
        boxShadow: 'var(--shadow-sm)'
      }}>
        {/* Search Bar */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.65rem',
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-md)',
          padding: '0.55rem 0.85rem'
        }}>
          <Search size={16} color="var(--text-muted)" />
          <input
            type="text"
            placeholder="Rechercher parmi les alertes (titre, objet, référence...)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: 'var(--text-primary)',
              fontSize: '0.85rem',
              width: '100%'
            }}
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
            >
              <X size={15} />
            </button>
          )}
        </div>

        {/* Filter Pills Bar */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '0.5rem',
          overflowX: 'auto',
          whiteSpace: 'nowrap',
          paddingBottom: '2px',
          scrollbarWidth: 'none'
        }}>
          <div style={{ display: 'flex', gap: '0.45rem', flexWrap: 'nowrap' }}>
            <button
              type="button"
              onClick={() => setActiveFilter('all')}
              className={`notif-filter-btn ${activeFilter === 'all' ? 'active' : ''}`}
            >
              <span>Toutes</span>
              <span className="filter-count-badge">{notifications.length}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveFilter('unread')}
              className={`notif-filter-btn ${activeFilter === 'unread' ? 'active' : ''}`}
            >
              <span>Non lues</span>
              {unreadCount > 0 && (
                <span className="filter-count-badge badge-red">{unreadCount}</span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveFilter('warning')}
              className={`notif-filter-btn ${activeFilter === 'warning' ? 'active' : ''}`}
            >
              <span>Financières & Échéances</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveFilter('juridique')}
              className={`notif-filter-btn ${activeFilter === 'juridique' ? 'active' : ''}`}
            >
              <span>Contrats & Avenants</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveFilter('correspondance')}
              className={`notif-filter-btn ${activeFilter === 'correspondance' ? 'active' : ''}`}
            >
              <span>Correspondances S2T</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveFilter('technique')}
              className={`notif-filter-btn ${activeFilter === 'technique' ? 'active' : ''}`}
            >
              <span>Technique & Salles</span>
            </button>
          </div>

          {notifications.some(n => n.isRead) && (
            <button
              type="button"
              onClick={handleClearRead}
              className="btn btn-ghost btn-sm"
              style={{ fontSize: '0.75rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}
            >
              <Trash2 size={14} />
              <span>Effacer les lues</span>
            </button>
          )}
        </div>
      </div>

      {/* Notifications List */}
      <div className="notif-cards-list">
        {loading ? (
          <div className="notif-empty-state" style={{ padding: '3.5rem 2rem' }}>
            <RefreshCw size={36} className="spin-animation" color="var(--s2t-blue)" style={{ margin: '0 auto 1rem' }} />
            <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: '0 0 0.35rem' }}>Chargement des alertes S2T...</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.825rem' }}>Vérification des registres juridiques et financiers en cours.</p>
          </div>
        ) : filteredNotifs.length === 0 ? (
          <div className="notif-empty-state">
            <CheckCircle2 size={48} color="#10B981" style={{ margin: '0 auto 1rem', opacity: 0.8 }} />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0 0 0.4rem' }}>Aucune notification trouvée</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', maxWidth: '420px', margin: '0 auto' }}>
              {activeFilter === 'unread'
                ? 'Toutes vos notifications sont lues. Vous êtes parfaitement à jour !'
                : 'Aucune alerte ou notification ne correspond aux critères sélectionnés.'}
            </p>
          </div>
        ) : (
          filteredNotifs.map((item) => {
            const notifId = item._id || item.id;
            const style = getSeverityStyle(item.severity, item.type);
            const Icon = style.icon;

            return (
              <div 
                key={notifId} 
                className={`notif-card-item ${!item.isRead ? 'unread' : ''}`}
              >
                {/* Left Severity Icon */}
                <div 
                  className="notif-icon-circle"
                  style={{ background: style.bg, borderColor: style.border, color: style.color }}
                >
                  <Icon size={20} />
                </div>

                {/* Content */}
                <div className="notif-content-area">
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.5rem', marginBottom: '0.4rem', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <span className="notif-category-tag">{item.category || 'Général'}</span>
                      {!item.isRead && (
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.3rem',
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          color: 'var(--s2t-red)',
                          background: 'rgba(225, 29, 72, 0.1)',
                          padding: '0.12rem 0.45rem',
                          borderRadius: 'var(--radius-full)'
                        }}>
                          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--s2t-red)' }} />
                          <span>Non lue</span>
                        </span>
                      )}
                    </div>
                    <span className="notif-item-time" title={item.fullDate}>{item.date}</span>
                  </div>

                  <h4 className="notif-item-title">{item.title}</h4>

                  <p className="notif-item-desc">{item.description}</p>

                  <div className="notif-item-actions">
                    {item.actionLink && (
                      <Link 
                        to={item.actionLink} 
                        className="btn btn-primary btn-sm" 
                        style={{ gap: '0.35rem', fontSize: '0.78rem', padding: '0.42rem 0.85rem', borderRadius: '8px' }}
                        onClick={() => {
                          if (!item.isRead) handleToggleRead(notifId, false);
                        }}
                      >
                        <span>{item.actionText || 'Consulter'}</span>
                        <ArrowRight size={13} />
                      </Link>
                    )}

                    <button
                      type="button"
                      onClick={() => handleToggleRead(notifId, item.isRead)}
                      className="btn btn-secondary btn-sm"
                      style={{ fontSize: '0.78rem', padding: '0.42rem 0.85rem', borderRadius: '8px', gap: '0.35rem' }}
                    >
                      <Check size={13} color={item.isRead ? 'var(--text-muted)' : '#10B981'} />
                      <span>{item.isRead ? 'Marquer comme non lu' : 'Marquer comme lu'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDelete(notifId)}
                      className="btn btn-ghost btn-sm notif-delete-btn"
                      style={{ color: 'var(--text-muted)', padding: '0.42rem 0.65rem', borderRadius: '8px', gap: '0.3rem' }}
                      title="Supprimer la notification"
                    >
                      <Trash2 size={14} />
                      <span className="hide-on-desktop-inline">Supprimer</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Admin Broadcast Composer Modal */}
      {broadcastOpen && (
        <div className="modal-overlay" onClick={() => setBroadcastOpen(false)}>
          <form 
            onSubmit={handleSendBroadcast} 
            className="modal-container" 
            style={{ maxWidth: '640px', width: '95%' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '12px',
                  background: 'rgba(225, 29, 72, 0.12)',
                  border: '1px solid rgba(225, 29, 72, 0.25)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--s2t-red)',
                  flexShrink: 0
                }}>
                  <Megaphone size={20} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                    Diffuser une Notification S2T
                  </h3>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                    Notification instantanée envoyée aux sessions des entreprises résidentes
                  </span>
                </div>
              </div>
              <button 
                type="button" 
                onClick={() => setBroadcastOpen(false)} 
                className="btn btn-ghost"
                style={{ padding: '0.45rem', borderRadius: '50%', color: 'var(--text-secondary)' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="modal-body">
              {/* Target & Severity */}
              <div className="modal-form-grid-2">
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Audience cible *</label>
                  <select
                    className="form-select"
                    value={broadcastData.recipientEmail}
                    onChange={(e) => setBroadcastData({ ...broadcastData, recipientEmail: e.target.value })}
                    style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }}
                  >
                    <option value="all">📢 Tous les résidents du pôle (Broadcast)</option>
                    <option value="client@s2t.tn">InnovTech Solutions SARL (client@s2t.tn)</option>
                    <option value="startup@s2t.tn">CloudTunisia SAS (startup@s2t.tn)</option>
                  </select>
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Niveau d'alerte / Sévérité *</label>
                  <select
                    className="form-select"
                    value={broadcastData.severity}
                    onChange={(e) => setBroadcastData({ ...broadcastData, severity: e.target.value })}
                    style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }}
                  >
                    <option value="info">🔵 Information standard</option>
                    <option value="warning">🟠 Avertissement / Échéance</option>
                    <option value="danger">🔴 Alerte critique / Urgence</option>
                    <option value="success">🟢 Notification de validation</option>
                  </select>
                </div>
              </div>

              {/* Category */}
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Catégorie réglementaire *</label>
                <select
                  className="form-select"
                  value={broadcastData.category}
                  onChange={(e) => setBroadcastData({ ...broadcastData, category: e.target.value })}
                  style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }}
                >
                  <option value="Général">Général / Note de service</option>
                  <option value="Facturation">Facturation & Redevance</option>
                  <option value="Juridique">Juridique & Conventions</option>
                  <option value="Technique">Technique & Infrastructure Fibre / 5G</option>
                  <option value="Réglementaire">Réglementaire (Loi n°2001-50)</option>
                  <option value="Correspondance">Correspondance Officielle</option>
                </select>
              </div>

              {/* Title */}
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Titre de la notification *</label>
                <input
                  type="text"
                  className="form-input"
                  required
                  placeholder="Ex: Avis de maintenance réseau / Rappel de reconduction"
                  value={broadcastData.title}
                  onChange={(e) => setBroadcastData({ ...broadcastData, title: e.target.value })}
                  style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }}
                />
              </div>

              {/* Description */}
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Message / Description complète *</label>
                <textarea
                  className="form-input"
                  required
                  rows={4}
                  placeholder="Détaillez l'information transmise aux entreprises résidentes..."
                  value={broadcastData.description}
                  onChange={(e) => setBroadcastData({ ...broadcastData, description: e.target.value })}
                  style={{ 
                    resize: 'vertical', 
                    fontFamily: 'inherit', 
                    lineHeight: 1.5,
                    background: 'var(--bg-secondary)',
                    borderColor: 'var(--border-color)'
                  }}
                />
              </div>

              {/* Action Link & Text */}
              <div className="modal-form-grid-2">
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Lien d'action</label>
                  <select
                    className="form-select"
                    value={broadcastData.actionLink}
                    onChange={(e) => setBroadcastData({ ...broadcastData, actionLink: e.target.value })}
                    style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }}
                  >
                    <option value="/dashboard">Tableau de bord (/dashboard)</option>
                    <option value="/email">Messagerie S2T (/email)</option>
                    <option value="/reunions">Salles & Événements (/reunions)</option>
                  </select>
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Intitulé du bouton</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Ex: Consulter, Voir mon contrat"
                    value={broadcastData.actionText}
                    onChange={(e) => setBroadcastData({ ...broadcastData, actionText: e.target.value })}
                    style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }}
                  />
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="modal-footer">
              <button 
                type="button" 
                className="btn btn-secondary" 
                onClick={() => setBroadcastOpen(false)}
                disabled={broadcastLoading}
              >
                Annuler
              </button>
              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={broadcastLoading}
                style={{ gap: '0.5rem', padding: '0.65rem 1.4rem' }}
              >
                {broadcastLoading ? (
                  <>
                    <RefreshCw size={16} className="spin-animation" />
                    <span>Diffusion en cours...</span>
                  </>
                ) : (
                  <>
                    <Send size={16} />
                    <span>Diffuser la notification</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default NotificationsPage;
