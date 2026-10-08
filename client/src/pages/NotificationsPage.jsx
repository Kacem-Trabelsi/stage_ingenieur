import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
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
  const { t, language } = useLanguage();
  const isRtl = language === 'ar';
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
      showToast(t('notif_toast_load_err'), 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [t]);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  // Handle Mark All as Read
  const handleMarkAllRead = async () => {
    try {
      await notificationAPI.markAllRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      showToast(t('notif_toast_all_read'));
    } catch (err) {
      console.error('Erreur markAllRead:', err);
      showToast(t('notif_toast_mark_err'), 'error');
    }
  };

  // Handle Toggle Read Single
  const handleToggleRead = async (id, currentIsRead) => {
    try {
      const nextRead = !currentIsRead;
      await notificationAPI.toggleRead(id, nextRead);
      setNotifications(prev => prev.map(n => n.id === id || n._id === id ? { ...n, isRead: nextRead } : n));
      showToast(nextRead ? t('notif_toast_marked_read') : t('notif_toast_marked_unread'));
    } catch (err) {
      console.error('Erreur toggleRead:', err);
      showToast(t('notif_toast_update_err'), 'error');
    }
  };

  // Handle Delete Single
  const handleDelete = async (id) => {
    try {
      await notificationAPI.delete(id);
      setNotifications(prev => prev.filter(n => n.id !== id && n._id !== id));
      showToast(t('notif_toast_deleted'));
    } catch (err) {
      console.error('Erreur delete notif:', err);
      showToast(t('notif_toast_delete_err'), 'error');
    }
  };

  // Handle Clear All Read
  const handleClearRead = async () => {
    if (!window.confirm(t('notif_confirm_clear_read'))) return;
    try {
      await notificationAPI.clearAll(true);
      setNotifications(prev => prev.filter(n => !n.isRead));
      showToast(t('notif_toast_cleared_read'));
    } catch (err) {
      console.error('Erreur clear read:', err);
      showToast(t('notif_toast_clear_err'), 'error');
    }
  };

  // Handle Admin Broadcast Submit
  const handleSendBroadcast = async (e) => {
    e.preventDefault();
    if (!broadcastData.title.trim() || !broadcastData.description.trim()) {
      showToast(t('notif_toast_fill_required'), 'error');
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
      showToast(t('notif_toast_broadcast_success'));
      await loadNotifications(true);
    } catch (err) {
      console.error('Erreur broadcast:', err);
      showToast(err.response?.data?.message || t('notif_toast_broadcast_err'), 'error');
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
                ? t('notif_breadcrumb_admin')
                : t('notif_breadcrumb_resident')}
            </span>
          </div>
          <h1 className="page-main-title">
            {isAdmin 
              ? t('notif_title_admin')
              : t('notif_title_resident')}
          </h1>
          <p className="page-subtitle">
            {isAdmin 
              ? t('notif_sub_admin')
              : t('notif_sub_resident')}
          </p>
        </div>

        <div className="page-header-actions">
          <button
            type="button"
            onClick={() => loadNotifications(true)}
            className="btn btn-secondary"
            title={t('notif_btn_refresh_tooltip')}
            style={{ gap: '0.4rem', padding: '0.65rem 1rem' }}
          >
            <RefreshCw size={16} className={refreshing ? 'spin-animation' : ''} />
            <span className="hide-on-mobile">{t('notif_btn_refresh')}</span>
          </button>

          {unreadCount > 0 && (
            <button 
              type="button" 
              onClick={handleMarkAllRead}
              className="btn btn-secondary"
              style={{ gap: '0.45rem', padding: '0.65rem 1rem' }}
            >
              <CheckCheck size={16} color="var(--s2t-teal)" />
              <span>{t('notif_btn_mark_all_read')}</span>
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
              <span>{t('notif_btn_broadcast')}</span>
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
            placeholder={t('notif_search_ph')}
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
              <span>{t('notif_filter_all')}</span>
              <span className="filter-count-badge">{notifications.length}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveFilter('unread')}
              className={`notif-filter-btn ${activeFilter === 'unread' ? 'active' : ''}`}
            >
              <span>{t('notif_filter_unread')}</span>
              {unreadCount > 0 && (
                <span className="filter-count-badge badge-red">{unreadCount}</span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveFilter('warning')}
              className={`notif-filter-btn ${activeFilter === 'warning' ? 'active' : ''}`}
            >
              <span>{t('notif_filter_finance')}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveFilter('juridique')}
              className={`notif-filter-btn ${activeFilter === 'juridique' ? 'active' : ''}`}
            >
              <span>{t('notif_filter_contracts')}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveFilter('correspondance')}
              className={`notif-filter-btn ${activeFilter === 'correspondance' ? 'active' : ''}`}
            >
              <span>{t('notif_filter_mail')}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveFilter('technique')}
              className={`notif-filter-btn ${activeFilter === 'technique' ? 'active' : ''}`}
            >
              <span>{t('notif_filter_tech')}</span>
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
              <span>{t('notif_btn_clear_read')}</span>
            </button>
          )}
        </div>
      </div>

      {/* Notifications List */}
      <div className="notif-cards-list">
        {loading ? (
          <div className="notif-empty-state" style={{ padding: '3.5rem 2rem' }}>
            <RefreshCw size={36} className="spin-animation" color="var(--s2t-blue)" style={{ margin: '0 auto 1rem' }} />
            <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: '0 0 0.35rem' }}>{t('notif_loading_title')}</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.825rem' }}>{t('notif_loading_desc')}</p>
          </div>
        ) : filteredNotifs.length === 0 ? (
          <div className="notif-empty-state">
            <CheckCircle2 size={48} color="#10B981" style={{ margin: '0 auto 1rem', opacity: 0.8 }} />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0 0 0.4rem' }}>{t('notif_empty_title')}</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', maxWidth: '420px', margin: '0 auto' }}>
              {activeFilter === 'unread'
                ? t('notif_empty_unread_desc')
                : t('notif_empty_filtered_desc')}
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
                      <span className="notif-category-tag">{item.category || t('notif_tag_general')}</span>
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
                          <span>{t('notif_badge_unread')}</span>
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
                        <span>{item.actionText || t('notif_btn_consult')}</span>
                        <ArrowRight size={13} style={{ transform: isRtl ? 'rotate(180deg)' : 'none' }} />
                      </Link>
                    )}

                    <button
                      type="button"
                      onClick={() => handleToggleRead(notifId, item.isRead)}
                      className="btn btn-secondary btn-sm"
                      style={{ fontSize: '0.78rem', padding: '0.42rem 0.85rem', borderRadius: '8px', gap: '0.35rem' }}
                    >
                      <Check size={13} color={item.isRead ? 'var(--text-muted)' : '#10B981'} />
                      <span>{item.isRead ? t('notif_btn_mark_unread') : t('notif_btn_mark_read')}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDelete(notifId)}
                      className="btn btn-ghost btn-sm notif-delete-btn"
                      style={{ color: 'var(--text-muted)', padding: '0.42rem 0.65rem', borderRadius: '8px', gap: '0.3rem' }}
                      title={t('notif_btn_delete_tooltip')}
                    >
                      <Trash2 size={14} />
                      <span className="hide-on-desktop-inline">{t('notif_btn_delete')}</span>
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
                    {t('notif_modal_title')}
                  </h3>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                    {t('notif_modal_sub')}
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
                  <label className="form-label">{t('notif_modal_target')}</label>
                  <select
                    className="form-select"
                    value={broadcastData.recipientEmail}
                    onChange={(e) => setBroadcastData({ ...broadcastData, recipientEmail: e.target.value })}
                    style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }}
                  >
                    <option value="all">{t('notif_modal_target_all')}</option>
                    <option value="client@s2t.tn">InnovTech Solutions SARL (client@s2t.tn)</option>
                    <option value="startup@s2t.tn">CloudTunisia SAS (startup@s2t.tn)</option>
                  </select>
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">{t('notif_modal_severity')}</label>
                  <select
                    className="form-select"
                    value={broadcastData.severity}
                    onChange={(e) => setBroadcastData({ ...broadcastData, severity: e.target.value })}
                    style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }}
                  >
                    <option value="info">{t('notif_modal_sev_info')}</option>
                    <option value="warning">{t('notif_modal_sev_warning')}</option>
                    <option value="danger">{t('notif_modal_sev_danger')}</option>
                    <option value="success">{t('notif_modal_sev_success')}</option>
                  </select>
                </div>
              </div>

              {/* Category */}
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">{t('notif_modal_cat')}</label>
                <select
                  className="form-select"
                  value={broadcastData.category}
                  onChange={(e) => setBroadcastData({ ...broadcastData, category: e.target.value })}
                  style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }}
                >
                  <option value="Général">{t('notif_modal_cat_general')}</option>
                  <option value="Facturation">{t('notif_modal_cat_facturation')}</option>
                  <option value="Juridique">{t('notif_modal_cat_juridique')}</option>
                  <option value="Technique">{t('notif_modal_cat_technique')}</option>
                  <option value="Réglementaire">{t('notif_modal_cat_reglementaire')}</option>
                  <option value="Correspondance">{t('notif_modal_cat_correspondance')}</option>
                </select>
              </div>

              {/* Title */}
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">{t('notif_modal_title_label')}</label>
                <input
                  type="text"
                  className="form-input"
                  required
                  placeholder={t('notif_modal_title_ph')}
                  value={broadcastData.title}
                  onChange={(e) => setBroadcastData({ ...broadcastData, title: e.target.value })}
                  style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }}
                />
              </div>

              {/* Description */}
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">{t('notif_modal_desc_label')}</label>
                <textarea
                  className="form-input"
                  required
                  rows={4}
                  placeholder={t('notif_modal_desc_ph')}
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
                  <label className="form-label">{t('notif_modal_link_label')}</label>
                  <select
                    className="form-select"
                    value={broadcastData.actionLink}
                    onChange={(e) => setBroadcastData({ ...broadcastData, actionLink: e.target.value })}
                    style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }}
                  >
                    <option value="/dashboard">{t('notif_modal_link_dash')}</option>
                    <option value="/email">{t('notif_modal_link_email')}</option>
                    <option value="/reunions">{t('notif_modal_link_meetings')}</option>
                  </select>
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">{t('notif_modal_btn_label')}</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder={t('notif_modal_btn_ph')}
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
                {t('notif_modal_btn_cancel')}
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
                    <span>{t('notif_modal_btn_sending')}</span>
                  </>
                ) : (
                  <>
                    <Send size={16} />
                    <span>{t('notif_modal_btn_send')}</span>
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
