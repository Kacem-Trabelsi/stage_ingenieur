import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
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

const EmailPage = () => {
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const isRtl = language === 'ar';
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

  const getQuickTemplates = () => ({
    resident: [
      {
        title: t('email_tpl_res_amendment_title'),
        category: 'juridique',
        to: 'direction@s2t.tn',
        subject: t('email_tpl_res_amendment_subj'),
        body: t('email_tpl_res_amendment_body'),
      },
      {
        title: t('email_tpl_res_transfer_title'),
        category: 'facturation',
        to: 'direction@s2t.tn',
        subject: t('email_tpl_res_transfer_subj'),
        body: t('email_tpl_res_transfer_body'),
      },
      {
        title: t('email_tpl_res_room_title'),
        category: 'reservation',
        to: 'direction@s2t.tn',
        subject: t('email_tpl_res_room_subj'),
        body: t('email_tpl_res_room_body'),
      },
      {
        title: t('email_tpl_res_tech_title'),
        category: 'technique',
        to: 'direction@s2t.tn',
        subject: t('email_tpl_res_tech_subj'),
        body: t('email_tpl_res_tech_body'),
      },
    ],
    admin: [
      {
        title: t('email_tpl_adm_circular_title'),
        category: 'general',
        subject: t('email_tpl_adm_circular_subj'),
        body: t('email_tpl_adm_circular_body'),
      },
      {
        title: t('email_tpl_adm_due_title'),
        category: 'facturation',
        subject: t('email_tpl_adm_due_subj'),
        body: t('email_tpl_adm_due_body'),
      },
      {
        title: t('email_tpl_adm_amend_appr_title'),
        category: 'juridique',
        subject: t('email_tpl_adm_amend_appr_subj'),
        body: t('email_tpl_adm_amend_appr_body'),
      },
    ],
  });

  const getCategoryLabel = (cat) => {
    switch (cat) {
      case 'juridique': return t('email_cat_juridique');
      case 'facturation': return t('email_cat_facturation');
      case 'technique': return t('email_cat_technique');
      case 'reservation': return t('email_cat_reservation');
      case 'urgent': return t('email_cat_urgent');
      case 'general':
      default:
        return t('email_cat_general');
    }
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
      showToast(t('email_toast_load_err'), 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [activeFolder, searchQuery, loadCounts, t]);

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

      showToast(newStarred ? t('email_toast_starred') : t('email_toast_unstarred'));
    } catch (err) {
      console.error('Erreur toggle star:', err);
      showToast(t('email_toast_star_err'), 'error');
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

      showToast(nextRead ? t('email_toast_marked_read') : t('email_toast_marked_unread'));
    } catch (err) {
      console.error('Erreur status lecture:', err);
    }
  };

  // Handle Delete (Move to trash or permanent)
  const handleDeleteEmail = async (emailId, e) => {
    if (e) e.stopPropagation();
    const isPermanent = activeFolder === 'trash';
    
    if (isPermanent && !window.confirm(t('email_confirm_perm_delete'))) {
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
      showToast(isPermanent ? t('email_toast_deleted_perm') : t('email_toast_deleted'));
    } catch (err) {
      console.error('Erreur suppression:', err);
      showToast(t('email_toast_delete_err'), 'error');
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
      showToast(t('email_toast_restored'));
    } catch (err) {
      console.error('Erreur restauration:', err);
      showToast(t('email_toast_restore_err'), 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Send Email
  const handleSendEmail = async (e) => {
    e.preventDefault();
    if (!composeData.to || !composeData.subject.trim() || !composeData.body.trim()) {
      showToast(t('email_toast_fill_required'), 'error');
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

      showToast(t('email_toast_sent_success'));

      // Refresh list & counts
      await loadCounts();
      if (activeFolder === 'sent') {
        setEmails((prev) => [res.data, ...prev]);
        setSelectedEmail(res.data);
      }
    } catch (err) {
      console.error('Erreur envoi email:', err);
      showToast(err.response?.data?.message || t('email_toast_load_err'), 'error');
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
    
    const quoteBody = `\n\n${t('email_reply_quote_header').replace('{sender}', selectedEmail.senderName).replace('{date}', selectedEmail.date)}\n${selectedEmail.body}`;

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

    const forwardHeader = t('email_forward_quote_header')
      .replace('{sender}', selectedEmail.senderName)
      .replace('{email}', selectedEmail.senderEmail)
      .replace('{date}', selectedEmail.date)
      .replace('{subject}', selectedEmail.subject);

    setComposeData({
      to: '',
      subject: `Fwd: ${selectedEmail.subject}`,
      body: `\n\n${forwardHeader}${selectedEmail.body}`,
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

  const quickTemplates = getQuickTemplates();
  const availableTemplates = isAdmin ? quickTemplates.admin : quickTemplates.resident;

  return (
    <div className="email-page-container">
      {/* Top Banner Header */}
      <div className="page-header-row">
        <div className="page-header-text">
          <div className="page-breadcrumb">
            <Mail size={16} color="var(--s2t-red)" />
            <span>
              {isAdmin ? t('email_breadcrumb_admin') : t('email_breadcrumb_resident')}
            </span>
          </div>
          <h1 className="page-main-title">
            {isAdmin ? t('email_title_admin') : t('email_title_resident')}
          </h1>
          <p className="page-subtitle">
            {isAdmin 
              ? t('email_subtitle_admin')
              : t('email_subtitle_resident')
            }
          </p>
        </div>

        <div className="page-header-actions">
          <button
            type="button"
            onClick={() => loadEmails(true)}
            className="btn btn-secondary"
            title={t('email_btn_refresh_tooltip')}
            style={{ gap: '0.4rem', padding: '0.65rem 1rem' }}
          >
            <RefreshCw size={16} className={refreshing ? 'spin-animation' : ''} />
            <span className="hide-on-mobile">{t('email_btn_refresh')}</span>
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
            <span>{isAdmin ? t('email_btn_compose_admin') : t('email_btn_compose_resident')}</span>
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
          <span>{t('email_folder_inbox')}</span>
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
          <span>{t('email_folder_starred')}</span>
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
          <span>{t('email_folder_sent')}</span>
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
          <span>{t('email_folder_trash')}</span>
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
                <span>{t('email_folder_inbox')}</span>
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
                <span>{t('email_folder_starred')}</span>
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
                <span>{t('email_folder_sent')}</span>
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
                <span>{t('email_folder_trash')}</span>
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
              {t('email_legal_notice')}
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
              placeholder={t('email_search_placeholder')}
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
              { key: 'all', label: t('email_cat_all') },
              { key: 'juridique', label: t('email_cat_juridique') },
              { key: 'facturation', label: t('email_cat_facturation') },
              { key: 'technique', label: t('email_cat_technique') },
              { key: 'reservation', label: t('email_cat_reservation') },
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
                <span style={{ fontSize: '0.85rem' }}>{t('email_loading')}</span>
              </div>
            ) : displayedEmails.length === 0 ? (
              <div className="mailbox-empty-state">
                <Mail size={36} style={{ opacity: 0.35, marginBottom: '0.5rem' }} />
                <p style={{ fontWeight: 600, fontSize: '0.9rem', margin: 0 }}>{t('email_empty_title')}</p>
                <span style={{ fontSize: '0.78rem' }}>{t('email_empty_desc')}</span>
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
                        {activeFolder === 'sent' ? `${t('email_to_prefix')}${em.recipientName}` : em.senderName}
                      </span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span className="email-row-date">{em.date}</span>
                        <button
                          type="button"
                          onClick={(e) => handleToggleStar(em._id, e)}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: em.isStarred ? '#F59E0B' : 'var(--text-muted)', padding: '2px', display: 'flex' }}
                          title={em.isStarred ? t('email_tooltip_star_remove') : t('email_tooltip_star_add')}
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
                        {getCategoryLabel(em.category)}
                      </span>
                      {em.attachments?.length > 0 && (
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <Paperclip size={12} /> {t('email_attachment_count').replace('{n}', em.attachments.length)}
                        </span>
                      )}
                      {!em.isRead && (
                        <span style={{
                          width: '7px',
                          height: '7px',
                          borderRadius: '50%',
                          background: 'var(--s2t-red)',
                          marginLeft: isRtl ? '0' : 'auto',
                          marginRight: isRtl ? 'auto' : '0',
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
                    {activeFolder === 'inbox' ? t('email_folder_inbox') : 
                     activeFolder === 'starred' ? t('email_folder_starred') :
                     activeFolder === 'sent' ? t('email_folder_sent') : t('email_folder_trash')}
                  </span>
                </button>

                <div className="email-actions-bar">
                  <button
                    type="button"
                    onClick={(e) => handleToggleStar(selectedEmail._id, e)}
                    className="btn btn-ghost btn-sm"
                    title={selectedEmail.isStarred ? t('email_tooltip_star_remove') : t('email_tooltip_star_add')}
                    style={{ color: selectedEmail.isStarred ? '#F59E0B' : 'var(--text-secondary)' }}
                  >
                    <Star size={16} fill={selectedEmail.isStarred ? '#F59E0B' : 'none'} />
                  </button>

                  <button
                    type="button"
                    onClick={(e) => handleToggleReadStatus(selectedEmail._id, selectedEmail.isRead, e)}
                    className="btn btn-ghost btn-sm"
                    title={selectedEmail.isRead ? t('email_tooltip_unread') : t('email_tooltip_read')}
                  >
                    <Mail size={16} />
                  </button>

                  {activeFolder === 'trash' ? (
                    <button
                      type="button"
                      onClick={(e) => handleRestoreEmail(selectedEmail._id, e)}
                      className="btn btn-ghost btn-sm"
                      title={t('email_tooltip_restore')}
                      disabled={actionLoading}
                    >
                      <RotateCcw size={16} color="var(--s2t-teal)" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={(e) => handleDeleteEmail(selectedEmail._id, e)}
                      className="btn btn-ghost btn-sm"
                      title={t('email_tooltip_delete')}
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
                      {getCategoryLabel(selectedEmail.category)}
                    </span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      {selectedEmail.date}
                    </span>
                    {selectedEmail.threadId && (
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', background: 'var(--bg-tertiary)', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>
                        {t('email_thread_prefix')}{selectedEmail.threadId.replace('th-', '')}
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
                    title={selectedEmail.isStarred ? t('email_tooltip_star_remove') : t('email_tooltip_star_add')}
                    style={{ color: selectedEmail.isStarred ? '#F59E0B' : 'var(--text-secondary)' }}
                  >
                    <Star size={16} fill={selectedEmail.isStarred ? '#F59E0B' : 'none'} />
                  </button>

                  <button
                    type="button"
                    onClick={(e) => handleToggleReadStatus(selectedEmail._id, selectedEmail.isRead, e)}
                    className="btn btn-ghost btn-sm"
                    title={selectedEmail.isRead ? t('email_tooltip_unread') : t('email_tooltip_read')}
                  >
                    <Mail size={16} />
                  </button>

                  {activeFolder === 'trash' ? (
                    <button
                      type="button"
                      onClick={(e) => handleRestoreEmail(selectedEmail._id, e)}
                      className="btn btn-ghost btn-sm"
                      title={t('email_tooltip_restore')}
                      disabled={actionLoading}
                    >
                      <RotateCcw size={16} color="var(--s2t-teal)" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={(e) => handleDeleteEmail(selectedEmail._id, e)}
                      className="btn btn-ghost btn-sm"
                      title={t('email_tooltip_delete')}
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
                          {t('email_sender_badge_admin')}
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', wordBreak: 'break-all' }}>
                      {t('email_from_label')}<span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{selectedEmail.senderEmail}</span>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', wordBreak: 'break-all' }}>
                      {t('email_to_label')}<span style={{ color: 'var(--text-secondary)' }}>{selectedEmail.recipientName} ({selectedEmail.recipientEmail})</span>
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
                    <span>{t('email_btn_reply')}</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleOpenForward}
                    className="btn btn-ghost btn-sm"
                    style={{ gap: '0.4rem', fontSize: '0.8rem' }}
                  >
                    <Forward size={14} />
                    <span>{t('email_btn_forward')}</span>
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
                    <span>{t('email_attachments_title').replace('{n}', selectedEmail.attachments.length)}</span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {selectedEmail.attachments.map((att, idx) => (
                      <div key={idx} className="attachment-chip">
                        <div className="attachment-chip-info">
                          <FileText size={18} color="var(--s2t-red)" style={{ flexShrink: 0 }} />
                          <div style={{ minWidth: 0 }}>
                            <div className="attachment-chip-name">{att.name}</div>
                            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{att.size || t('email_attachment_certified')} • {t('email_attachment_signature')}</div>
                          </div>
                        </div>

                        <button 
                          type="button" 
                          className="btn btn-secondary btn-sm"
                          style={{ gap: '0.35rem', fontSize: '0.75rem', flexShrink: 0 }}
                          onClick={() => {
                            showToast(t('email_toast_download_started').replace('{name}', att.name));
                          }}
                        >
                          <Download size={14} />
                          <span>{t('email_btn_download')}</span>
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
                {t('email_no_selection_title')}
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', maxWidth: '320px' }}>
                {t('email_no_selection_desc')}
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
                    {composeData.replyTo ? t('email_compose_title_reply') : (isAdmin ? t('email_compose_title_admin') : t('email_compose_title_resident'))}
                  </h3>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                    {t('email_compose_sub')}
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
                <Sparkles size={14} color="#F59E0B" /> {t('email_templates_label')}
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
                    <span>{t('email_field_recipient_admin')}</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{t('email_field_recipient_admin_sub')}</span>
                  </label>
                  <select
                    className="form-select"
                    required
                    value={composeData.to}
                    onChange={(e) => setComposeData({ ...composeData, to: e.target.value })}
                    style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }}
                  >
                    <option value="">{t('email_select_recipient_ph')}</option>
                    {recipientsData.residents?.map((res) => (
                      <option key={res.email} value={res.email}>
                        {res.label || (res.companyName ? `${res.companyName} — ${res.name} (${res.email})` : `${res.name} (${res.email})`)}
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">{t('email_field_recipient_official')}</label>
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
                      <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{t('email_s2t_management')}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 400 }}>{t('email_s2t_pole')}</div>
                    </div>
                    <span style={{ 
                      marginLeft: isRtl ? '0' : 'auto', 
                      marginRight: isRtl ? 'auto' : '0', 
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
                  <label className="form-label">{t('email_field_category')}</label>
                  <select
                    className="form-select"
                    value={composeData.category}
                    onChange={(e) => setComposeData({ ...composeData, category: e.target.value })}
                    style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }}
                  >
                    <option value="general">{t('email_opt_cat_general')}</option>
                    <option value="juridique">{t('email_opt_cat_juridique')}</option>
                    <option value="facturation">{t('email_opt_cat_facturation')}</option>
                    <option value="technique">{t('email_opt_cat_technique')}</option>
                    <option value="reservation">{t('email_opt_cat_reservation')}</option>
                    <option value="urgent">{t('email_opt_cat_urgent')}</option>
                  </select>
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">{t('email_field_subject')}</label>
                  <input
                    type="text"
                    className="form-input"
                    required
                    placeholder={t('email_field_subject_ph')}
                    value={composeData.subject}
                    onChange={(e) => setComposeData({ ...composeData, subject: e.target.value })}
                    style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }}
                  />
                </div>
              </div>

              {/* Message Body */}
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">{t('email_field_body')}</label>
                <textarea
                  className="form-input"
                  required
                  rows={8}
                  placeholder={t('email_field_body_ph')}
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
                {t('email_sender_label')}<strong style={{ color: 'var(--text-primary)' }}>{user?.name}</strong> ({user?.email})
              </div>

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => setComposeOpen(false)}
                  disabled={actionLoading}
                >
                  {t('email_btn_cancel')}
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
                      <span>{t('email_btn_sending')}</span>
                    </>
                  ) : (
                    <>
                      <Send size={16} />
                      <span>{t('email_btn_send')}</span>
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
