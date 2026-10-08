import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { authAPI } from '../services/api';
import { 
  User, 
  Building2, 
  Mail, 
  Phone, 
  FileSpreadsheet, 
  Lock, 
  ShieldCheck, 
  Settings, 
  Bell, 
  Globe, 
  Sun, 
  Moon, 
  Save, 
  X, 
  CheckCircle2, 
  AlertCircle,
  Eye,
  EyeOff,
  KeyRound,
  Check,
  Shield,
  Camera,
  Upload,
  Trash2,
  Clock,
  Laptop
} from 'lucide-react';

const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&auto=format&fit=crop&q=80',
];

const ProfileSettingsModal = ({ isOpen, onClose, initialTab = 'profile' }) => {
  const { user, updateProfile } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { language, setLanguage, languages, t } = useLanguage();
  const isRtl = language === 'ar';

  const [activeTab, setActiveTab] = useState(initialTab);
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    companyName: '',
    fiscalId: '',
    activityType: '',
    avatar: '',
    currentPassword: '',
    password: '',
    confirmPassword: '',
  });

  const [securityMeta, setSecurityMeta] = useState({
    lastPasswordChange: null,
    lastLogin: null,
    createdAt: null,
  });

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [notifications, setNotifications] = useState({
    rentAlert: true,
    reminders: true,
    renewalAlert: true,
    emailNotif: true,
  });

  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
      setSuccessMessage('');
      setErrorMessage('');

      // Fetch fresh profile data directly from MongoDB backend
      const loadProfileData = async () => {
        try {
          const res = await authAPI.getProfile();
          const data = res.data;
          setFormData({
            name: data.name || '',
            email: data.email || '',
            phone: data.phone || '',
            companyName: data.companyName || '',
            fiscalId: data.fiscalId || '',
            activityType: data.activityType || 'Édition Logiciels & IA',
            avatar: data.avatar || '',
            currentPassword: '',
            password: '',
            confirmPassword: '',
          });

          if (data.notifications) {
            setNotifications({
              rentAlert: data.notifications.rentAlert ?? true,
              reminders: data.notifications.reminders ?? true,
              renewalAlert: data.notifications.renewalAlert ?? true,
              emailNotif: data.notifications.emailNotif ?? true,
            });
          }

          setSecurityMeta({
            lastPasswordChange: data.lastPasswordChange || null,
            lastLogin: data.lastLogin || null,
            createdAt: data.createdAt || null,
          });
        } catch (err) {
          console.warn('Erreur récupération profil frais, utilisation du contexte local:', err.message);
          if (user) {
            setFormData({
              name: user.name || '',
              email: user.email || '',
              phone: user.phone || '',
              companyName: user.companyName || '',
              fiscalId: user.fiscalId || '',
              activityType: user.activityType || 'Édition Logiciels & IA',
              avatar: user.avatar || '',
              currentPassword: '',
              password: '',
              confirmPassword: '',
            });
            if (user.notifications) {
              setNotifications(user.notifications);
            }
            setSecurityMeta({
              lastPasswordChange: user.lastPasswordChange || null,
              lastLogin: user.lastLogin || null,
              createdAt: user.createdAt || null,
            });
          }
        }
      };

      loadProfileData();
    }
  }, [isOpen, initialTab, user]);

  if (!isOpen) return null;

  // Handle Photo File Upload with Canvas Compression
  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMessage(t('prof_msg_err_invalid_img'));
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage(t('prof_msg_err_img_size'));
      return;
    }

    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxDim = 300;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxDim) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          }
        } else {
          if (height > maxDim) {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.85);
        setFormData((prev) => ({ ...prev, avatar: compressedDataUrl }));
        setSuccessMessage(t('prof_msg_photo_uploaded'));
        setTimeout(() => setSuccessMessage(''), 3500);
      };
      img.src = uploadEvent.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveAvatar = () => {
    setFormData((prev) => ({ ...prev, avatar: '' }));
    if (fileInputRef.current) fileInputRef.current.value = '';
    setSuccessMessage(t('prof_msg_photo_removed'));
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setSuccessMessage('');
    setErrorMessage('');

    if (formData.password) {
      if (formData.password.length < 6) {
        setErrorMessage(t('prof_msg_err_pwd_min'));
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        setErrorMessage(t('prof_msg_err_pwd_match'));
        return;
      }
    }

    try {
      setLoading(true);
      const updateData = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        companyName: formData.companyName.trim(),
        fiscalId: formData.fiscalId.trim(),
        activityType: formData.activityType,
        avatar: formData.avatar,
        notifications: notifications,
        preferences: {
          theme: theme,
          language: language,
        },
      };

      if (formData.password && formData.password.trim().length >= 6) {
        updateData.password = formData.password.trim();
        if (formData.currentPassword) {
          updateData.currentPassword = formData.currentPassword.trim();
        }
      }

      const resData = await updateProfile(updateData);
      setSuccessMessage(t('prof_msg_success'));
      setFormData(prev => ({ ...prev, currentPassword: '', password: '', confirmPassword: '' }));
      if (resData?.lastPasswordChange) {
        setSecurityMeta(prev => ({
          ...prev,
          lastPasswordChange: resData.lastPasswordChange,
          lastLogin: resData.lastLogin || prev.lastLogin,
        }));
      }
      setTimeout(() => setSuccessMessage(''), 4500);
    } catch (err) {
      setErrorMessage(err.response?.data?.message || t('prof_msg_error_default'));
    } finally {
      setLoading(false);
    }
  };

  const getPasswordStrength = () => {
    if (!formData.password) return 0;
    let score = 0;
    if (formData.password.length >= 6) score += 33;
    if (formData.password.length >= 8 && /[A-Z]/.test(formData.password)) score += 33;
    if (/[0-9]/.test(formData.password) && /[^A-Za-z0-9]/.test(formData.password)) score += 34;
    return score;
  };

  const passStrength = getPasswordStrength();

  const formatDate = (dateStr) => {
    if (!dateStr) return t('prof_audit_not_set');
    try {
      const locale = language === 'ar' ? 'ar-TN' : language === 'en' ? 'en-US' : 'fr-FR';
      return new Intl.DateTimeFormat(locale, {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }).format(new Date(dateStr));
    } catch {
      return String(dateStr);
    }
  };

  return createPortal(
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 1200 }}>
      <form 
        onSubmit={handleProfileSubmit}
        className="profile-modal-container" 
        dir={isRtl ? 'rtl' : 'ltr'}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 1. Modal Top Header */}
        <div className="profile-modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '50%',
              background: user?.role === 'admin' ? 'var(--s2t-red)' : 'var(--s2t-blue)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.15rem',
              fontWeight: 800,
              boxShadow: user?.role === 'admin' ? '0 0 12px var(--s2t-red-glow)' : '0 0 12px var(--s2t-blue-glow)',
              flexShrink: 0,
              overflow: 'hidden'
            }}>
              {formData.avatar ? (
                <img src={formData.avatar} alt={formData.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                formData.name ? formData.name.charAt(0).toUpperCase() : (user?.name ? user.name.charAt(0).toUpperCase() : 'U')
              )}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0 }}>
                  {formData.name || user?.name || t('prof_modal_title')}
                </h3>
                <span style={{
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  padding: '0.15rem 0.55rem',
                  borderRadius: 'var(--radius-full)',
                  background: user?.role === 'admin' ? 'rgba(225, 29, 72, 0.12)' : 'rgba(37, 99, 235, 0.12)',
                  color: user?.role === 'admin' ? 'var(--s2t-red)' : 'var(--s2t-blue)',
                  border: `1px solid ${user?.role === 'admin' ? 'rgba(225, 29, 72, 0.25)' : 'rgba(37, 99, 235, 0.25)'}`,
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em'
                }}>
                  {user?.role === 'admin' ? t('prof_badge_admin') : t('prof_badge_client')}
                </span>
              </div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                {formData.email || user?.email} — {user?.role === 'admin' ? t('prof_sub_admin') : (formData.companyName || user?.companyName || t('prof_sub_default'))}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="btn btn-ghost"
            style={{ 
              padding: '0.45rem', 
              borderRadius: '50%', 
              color: 'var(--text-secondary)',
              cursor: 'pointer' 
            }}
            title={t('prof_btn_close_title')}
          >
            <X size={20} />
          </button>
        </div>

        {/* 2. Horizontal Segmented Tabs */}
        <div className="profile-modal-tabs">
          <button
            type="button"
            onClick={() => setActiveTab('profile')}
            className={`profile-tab-pill ${activeTab === 'profile' ? 'active' : ''}`}
          >
            <User size={16} />
            <span>{t('prof_tab_info')}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('security')}
            className={`profile-tab-pill ${activeTab === 'security' ? 'active' : ''}`}
          >
            <Lock size={16} />
            <span>{t('prof_tab_security')}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('preferences')}
            className={`profile-tab-pill ${activeTab === 'preferences' ? 'active' : ''}`}
          >
            <Settings size={16} />
            <span>{t('prof_tab_prefs')}</span>
          </button>
        </div>

        {/* 3. Modal Body Content */}
        <div className="profile-modal-body">
          {/* Success / Error Banners */}
          {successMessage && (
            <div style={{
              background: 'rgba(16, 185, 129, 0.12)',
              border: '1px solid rgba(16, 185, 129, 0.35)',
              color: '#10B981',
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.85rem',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
              animation: 'fadeIn 0.2s ease-out'
            }}>
              <CheckCircle2 size={18} style={{ flexShrink: 0 }} />
              <span>{successMessage}</span>
            </div>
          )}

          {errorMessage && (
            <div style={{
              background: 'rgba(244, 63, 94, 0.12)',
              border: '1px solid rgba(244, 63, 94, 0.35)',
              color: 'var(--s2t-red)',
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.85rem',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
              animation: 'fadeIn 0.2s ease-out'
            }}>
              <AlertCircle size={18} style={{ flexShrink: 0 }} />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* TAB 1: Informations Profil & Entité */}
          {activeTab === 'profile' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* Photo de Profil Card */}
              <div className="profile-section-card">
                <div className="profile-section-header">
                  <Camera size={18} color="var(--s2t-red)" />
                  <span>{t('prof_sec_avatar')}</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
                  {/* Avatar Circle Preview */}
                  <div style={{ position: 'relative' }}>
                    <div style={{
                      width: '76px',
                      height: '76px',
                      borderRadius: '50%',
                      background: user?.role === 'admin' ? 'var(--s2t-red)' : 'var(--s2t-blue)',
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '2rem',
                      fontWeight: 800,
                      boxShadow: '0 4px 18px rgba(0, 0, 0, 0.25)',
                      border: '3px solid var(--bg-card)',
                      overflow: 'hidden',
                      flexShrink: 0
                    }}>
                      {formData.avatar ? (
                        <img src={formData.avatar} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        formData.name ? formData.name.charAt(0).toUpperCase() : 'U'
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      style={{
                        position: 'absolute',
                        bottom: 0,
                        right: isRtl ? 'auto' : 0,
                        left: isRtl ? 0 : 'auto',
                        width: '26px',
                        height: '26px',
                        borderRadius: '50%',
                        background: 'var(--s2t-red)',
                        color: '#fff',
                        border: '2px solid var(--bg-secondary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        boxShadow: '0 2px 6px rgba(0,0,0,0.3)'
                      }}
                      title={t('prof_btn_upload')}
                    >
                      <Camera size={13} />
                    </button>
                  </div>

                  {/* Hidden File Input */}
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handlePhotoUpload}
                    accept="image/png, image/jpeg, image/webp"
                    style={{ display: 'none' }}
                  />

                  {/* Action Buttons */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1, minWidth: '220px' }}>
                    <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="btn btn-secondary btn-sm"
                        style={{ gap: '0.4rem', fontSize: '0.8rem' }}
                      >
                        <Upload size={14} />
                        <span>{t('prof_btn_upload')}</span>
                      </button>

                      {formData.avatar && (
                        <button
                          type="button"
                          onClick={handleRemoveAvatar}
                          className="btn btn-ghost btn-sm"
                          style={{ gap: '0.4rem', color: 'var(--s2t-red)', fontSize: '0.8rem' }}
                        >
                          <Trash2 size={14} />
                          <span>{t('prof_btn_delete_photo')}</span>
                        </button>
                      )}
                    </div>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                      {t('prof_avatar_hint')}
                    </span>
                  </div>
                </div>

                {/* Preset Executive Avatars */}
                <div style={{ marginTop: '0.25rem', borderTop: '1px dashed var(--border-color)', paddingTop: '0.75rem' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.5rem' }}>
                    {t('prof_avatar_presets_label')}
                  </span>
                  <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center', flexWrap: 'wrap' }}>
                    {PRESET_AVATARS.map((preset, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => setFormData((prev) => ({ ...prev, avatar: preset }))}
                        style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: '50%',
                          border: formData.avatar === preset ? '2px solid var(--s2t-red)' : '2px solid var(--border-color)',
                          overflow: 'hidden',
                          cursor: 'pointer',
                          padding: 0,
                          background: 'none',
                          transform: formData.avatar === preset ? 'scale(1.1)' : 'scale(1)',
                          transition: 'all 0.2s ease',
                          boxShadow: formData.avatar === preset ? '0 0 8px var(--s2t-red-glow)' : 'none'
                        }}
                        title={t('prof_avatar_preset_title').replace('{num}', index + 1)}
                      >
                        <img src={preset} alt={`Avatar ${index + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Personal Identity Card */}
              <div className="profile-section-card">
                <div className="profile-section-header">
                  <User size={18} color="var(--s2t-red)" />
                  <span>{t('prof_sec_identity')}</span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">{t('prof_label_fullname')}</label>
                    <div style={{ position: 'relative' }}>
                      <User size={16} style={{ position: 'absolute', left: isRtl ? 'auto' : '0.9rem', right: isRtl ? '0.9rem' : 'auto', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                      <input
                        type="text"
                        className="form-input"
                        style={{ paddingLeft: isRtl ? '1rem' : '2.5rem', paddingRight: isRtl ? '2.5rem' : '1rem' }}
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                        placeholder={t('prof_ph_fullname')}
                      />
                    </div>
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">{t('prof_label_email')}</label>
                    <div style={{ position: 'relative' }}>
                      <Mail size={16} style={{ position: 'absolute', left: isRtl ? 'auto' : '0.9rem', right: isRtl ? '0.9rem' : 'auto', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                      <input
                        type="email"
                        className="form-input"
                        style={{ paddingLeft: isRtl ? '1rem' : '2.5rem', paddingRight: isRtl ? '2.5rem' : '1rem' }}
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                        placeholder={t('prof_ph_email')}
                      />
                    </div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">{t('prof_label_phone')}</label>
                    <div style={{ position: 'relative' }}>
                      <Phone size={16} style={{ position: 'absolute', left: isRtl ? 'auto' : '0.9rem', right: isRtl ? '0.9rem' : 'auto', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                      <input
                        type="tel"
                        className="form-input"
                        style={{ paddingLeft: isRtl ? '1rem' : '2.5rem', paddingRight: isRtl ? '2.5rem' : '1rem' }}
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder={t('prof_ph_phone')}
                      />
                    </div>
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">{t('prof_label_role')}</label>
                    <div style={{
                      padding: '0.75rem 0.9rem',
                      background: 'var(--bg-secondary)',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-color)',
                      fontSize: '0.85rem',
                      fontWeight: 700,
                      color: user?.role === 'admin' ? 'var(--s2t-red)' : 'var(--s2t-blue)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      height: '42px'
                    }}>
                      {user?.role === 'admin' ? <ShieldCheck size={16} /> : <Building2 size={16} />}
                      <span>{user?.role === 'admin' ? t('prof_role_admin_tag') : t('prof_role_client_tag')}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Company & Hosting Information Card */}
              <div className="profile-section-card">
                <div className="profile-section-header">
                  <Building2 size={18} color="var(--s2t-blue)" />
                  <span>{t('prof_sec_company')}</span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">{t('prof_label_company')}</label>
                    <div style={{ position: 'relative' }}>
                      <Building2 size={16} style={{ position: 'absolute', left: isRtl ? 'auto' : '0.9rem', right: isRtl ? '0.9rem' : 'auto', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                      <input
                        type="text"
                        className="form-input"
                        style={{ paddingLeft: isRtl ? '1rem' : '2.5rem', paddingRight: isRtl ? '2.5rem' : '1rem' }}
                        value={formData.companyName}
                        onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                        placeholder={t('prof_ph_company')}
                      />
                    </div>
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">{t('prof_label_fiscal')}</label>
                    <div style={{ position: 'relative' }}>
                      <FileSpreadsheet size={16} style={{ position: 'absolute', left: isRtl ? 'auto' : '0.9rem', right: isRtl ? '0.9rem' : 'auto', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                      <input
                        type="text"
                        className="form-input"
                        style={{ paddingLeft: isRtl ? '1rem' : '2.5rem', paddingRight: isRtl ? '2.5rem' : '1rem' }}
                        value={formData.fiscalId}
                        onChange={(e) => setFormData({ ...formData, fiscalId: e.target.value })}
                        placeholder={t('prof_ph_fiscal')}
                      />
                    </div>
                  </div>
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">{t('prof_label_sector')}</label>
                  <select
                    className="form-select"
                    value={formData.activityType}
                    onChange={(e) => setFormData({ ...formData, activityType: e.target.value })}
                  >
                    <option value="Édition Logiciels & IA">{t('prof_sector_software')}</option>
                    <option value="Télécoms & Réseaux">{t('prof_sector_telecom')}</option>
                    <option value="Cybersécurité & Cloud">{t('prof_sector_cyber')}</option>
                    <option value="IoT & Systèmes Embarqués">{t('prof_sector_iot')}</option>
                    <option value="FinTech & Services Numériques">{t('prof_sector_fintech')}</option>
                    <option value="Direction Juridique & Financière S2T">{t('prof_sector_admin')}</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Sécurité & Accès */}
          {activeTab === 'security' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div className="profile-section-card">
                <div className="profile-section-header">
                  <KeyRound size={18} color="var(--s2t-red)" />
                  <span>{t('prof_sec_pwd')}</span>
                </div>

                <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', margin: 0 }}>
                  {t('prof_pwd_desc')}
                </p>

                {/* Mot de passe actuel (optionnel si non requis) */}
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">{t('prof_label_curr_pwd')}</label>
                  <div style={{ position: 'relative' }}>
                    <Lock size={16} style={{ position: 'absolute', left: isRtl ? 'auto' : '0.9rem', right: isRtl ? '0.9rem' : 'auto', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input
                      type={showCurrentPassword ? 'text' : 'password'}
                      className="form-input"
                      style={{ paddingLeft: isRtl ? '2.5rem' : '2.5rem', paddingRight: isRtl ? '2.5rem' : '2.5rem' }}
                      value={formData.currentPassword}
                      onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                      placeholder={t('prof_ph_curr_pwd')}
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      style={{
                        position: 'absolute',
                        right: isRtl ? 'auto' : '0.75rem',
                        left: isRtl ? '0.75rem' : 'auto',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        color: 'var(--text-muted)',
                        cursor: 'pointer'
                      }}
                      title={showCurrentPassword ? t('prof_pwd_hide') : t('prof_pwd_show')}
                    >
                      {showCurrentPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">{t('prof_label_new_pwd')}</label>
                    <div style={{ position: 'relative' }}>
                      <Lock size={16} style={{ position: 'absolute', left: isRtl ? 'auto' : '0.9rem', right: isRtl ? '0.9rem' : 'auto', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        className="form-input"
                        style={{ paddingLeft: isRtl ? '2.5rem' : '2.5rem', paddingRight: isRtl ? '2.5rem' : '2.5rem' }}
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        placeholder={t('prof_ph_new_pwd')}
                        minLength={6}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        style={{
                          position: 'absolute',
                          right: isRtl ? 'auto' : '0.75rem',
                          left: isRtl ? '0.75rem' : 'auto',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          background: 'none',
                          border: 'none',
                          color: 'var(--text-muted)',
                          cursor: 'pointer'
                        }}
                        title={showPassword ? t('prof_pwd_hide') : t('prof_pwd_show')}
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">{t('prof_label_confirm_pwd')}</label>
                    <div style={{ position: 'relative' }}>
                      <Lock size={16} style={{ position: 'absolute', left: isRtl ? 'auto' : '0.9rem', right: isRtl ? '0.9rem' : 'auto', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        className="form-input"
                        style={{ paddingLeft: isRtl ? '2.5rem' : '2.5rem', paddingRight: isRtl ? '2.5rem' : '2.5rem' }}
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                        placeholder={t('prof_ph_confirm_pwd')}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        style={{
                          position: 'absolute',
                          right: isRtl ? 'auto' : '0.75rem',
                          left: isRtl ? '0.75rem' : 'auto',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          background: 'none',
                          border: 'none',
                          color: 'var(--text-muted)',
                          cursor: 'pointer'
                        }}
                        title={showConfirmPassword ? t('prof_pwd_hide') : t('prof_pwd_show')}
                      >
                        {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Password strength indicator */}
                {formData.password && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>{t('prof_pwd_strength_label')}</span>
                      <span style={{ 
                        fontWeight: 700, 
                        color: passStrength < 50 ? 'var(--s2t-red)' : passStrength < 80 ? 'orange' : '#10B981' 
                      }}>
                        {passStrength < 50 ? t('prof_pwd_weak') : passStrength < 80 ? t('prof_pwd_medium') : t('prof_pwd_strong')}
                      </span>
                    </div>
                    <div style={{ height: '5px', background: 'var(--border-color)', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ 
                        height: '100%', 
                        width: `${passStrength}%`, 
                        background: passStrength < 50 ? 'var(--s2t-red)' : passStrength < 80 ? 'orange' : '#10B981',
                        transition: 'all 0.3s ease'
                      }} />
                    </div>
                  </div>
                )}
              </div>

              {/* Journal d'audit et Historique de Sécurité */}
              <div className="profile-section-card">
                <div className="profile-section-header">
                  <ShieldCheck size={18} color="var(--s2t-teal)" />
                  <span>{t('prof_sec_audit')}</span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
                  <div style={{
                    padding: '0.75rem 0.9rem',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border-color)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem'
                  }}>
                    <div style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      background: 'rgba(37, 99, 235, 0.1)',
                      color: 'var(--s2t-blue)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      <Clock size={18} />
                    </div>
                    <div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{t('prof_audit_last_pwd_change')}</div>
                      <div style={{ fontSize: '0.825rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                        {formatDate(securityMeta.lastPasswordChange)}
                      </div>
                    </div>
                  </div>

                  <div style={{
                    padding: '0.75rem 0.9rem',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border-color)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem'
                  }}>
                    <div style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      background: 'rgba(16, 185, 129, 0.1)',
                      color: '#10B981',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      <Laptop size={18} />
                    </div>
                    <div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{t('prof_audit_last_login')}</div>
                      <div style={{ fontSize: '0.825rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                        {formatDate(securityMeta.lastLogin)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Session Security & Cryptography Card */}
              <div className="profile-section-card">
                <div className="profile-section-header">
                  <Shield size={18} color="var(--s2t-teal)" />
                  <span>{t('prof_sec_crypto')}</span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', fontSize: '0.8rem' }}>
                  <div style={{
                    padding: '0.75rem',
                    borderRadius: 'var(--radius-sm)',
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border-color)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}>
                    <CheckCircle2 size={16} color="#10B981" />
                    <span>{t('prof_crypto_jwt')}</span>
                  </div>

                  <div style={{
                    padding: '0.75rem',
                    borderRadius: 'var(--radius-sm)',
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border-color)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}>
                    <CheckCircle2 size={16} color="#10B981" />
                    <span>{t('prof_crypto_ssl')}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Paramètres Généraux & Notifications */}
          {activeTab === 'preferences' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* Theme Selector Section */}
              <div className="profile-section-card">
                <div className="profile-section-header">
                  <Sun size={18} color="var(--s2t-red)" />
                  <span>{t('prof_sec_theme')}</span>
                </div>

                <div className="theme-select-grid">
                  <button
                    type="button"
                    onClick={() => theme !== 'dark' && toggleTheme()}
                    className={`theme-card-btn ${theme === 'dark' ? 'active' : ''}`}
                  >
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      background: 'rgba(255, 255, 255, 0.08)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--s2t-red)'
                    }}>
                      <Moon size={20} />
                    </div>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{t('prof_theme_dark')}</div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      {t('prof_theme_dark_desc')}
                    </span>
                    {theme === 'dark' && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: 'var(--s2t-red)', fontSize: '0.75rem', fontWeight: 700 }}>
                        <Check size={14} /> {t('prof_theme_active')}
                      </div>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => theme !== 'light' && toggleTheme()}
                    className={`theme-card-btn ${theme === 'light' ? 'active' : ''}`}
                  >
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      background: 'rgba(245, 158, 11, 0.1)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#F59E0B'
                    }}>
                      <Sun size={20} />
                    </div>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{t('prof_theme_light')}</div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      {t('prof_theme_light_desc')}
                    </span>
                    {theme === 'light' && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: 'var(--s2t-red)', fontSize: '0.75rem', fontWeight: 700 }}>
                        <Check size={14} /> {t('prof_theme_active')}
                      </div>
                    )}
                  </button>
                </div>
              </div>

              {/* Language Selector Section */}
              <div className="profile-section-card">
                <div className="profile-section-header">
                  <Globe size={18} color="var(--s2t-blue)" />
                  <span>{t('prof_sec_lang')}</span>
                </div>

                <div className="lang-select-grid">
                  {languages.map((l) => (
                    <button
                      key={l.code}
                      type="button"
                      onClick={() => setLanguage(l.code)}
                      className={`lang-card-btn ${language === l.code ? 'active' : ''}`}
                    >
                      <img
                        src={l.flagImg}
                        alt={l.label}
                        style={{
                          width: '24px',
                          height: '16px',
                          borderRadius: '3px',
                          objectFit: 'cover',
                          boxShadow: '0 1px 4px rgba(0,0,0,0.2)'
                        }}
                      />
                      <span>{l.native}</span>
                      {language === l.code && <Check size={14} color="var(--s2t-blue)" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Regulatory Notifications & Billing Alerts Section */}
              <div className="profile-section-card">
                <div className="profile-section-header">
                  <Bell size={18} color="var(--s2t-teal)" />
                  <span>{t('prof_sec_notifs')}</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div 
                    className="switch-wrapper"
                    onClick={() => setNotifications({ ...notifications, rentAlert: !notifications.rentAlert })}
                  >
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                      <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                        {t('prof_notif_rent_title')}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                        {t('prof_notif_rent_desc')}
                      </span>
                    </div>
                    <div className={`custom-toggle ${notifications.rentAlert ? 'checked' : ''}`}>
                      <div className="custom-toggle-thumb" />
                    </div>
                  </div>

                  <div 
                    className="switch-wrapper"
                    onClick={() => setNotifications({ ...notifications, reminders: !notifications.reminders })}
                  >
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                      <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                        {t('prof_notif_reminders_title')}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                        {t('prof_notif_reminders_desc')}
                      </span>
                    </div>
                    <div className={`custom-toggle ${notifications.reminders ? 'checked' : ''}`}>
                      <div className="custom-toggle-thumb" />
                    </div>
                  </div>

                  <div 
                    className="switch-wrapper"
                    onClick={() => setNotifications({ ...notifications, renewalAlert: !notifications.renewalAlert })}
                  >
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                      <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                        {t('prof_notif_renewal_title')}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                        {t('prof_notif_renewal_desc')}
                      </span>
                    </div>
                    <div className={`custom-toggle ${notifications.renewalAlert ? 'checked' : ''}`}>
                      <div className="custom-toggle-thumb" />
                    </div>
                  </div>

                  <div 
                    className="switch-wrapper"
                    onClick={() => setNotifications({ ...notifications, emailNotif: !notifications.emailNotif })}
                  >
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                      <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                        {t('prof_notif_email_title')}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                        {t('prof_notif_email_desc')}
                      </span>
                    </div>
                    <div className={`custom-toggle ${notifications.emailNotif ? 'checked' : ''}`}>
                      <div className="custom-toggle-thumb" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 4. Fixed Bottom Action Bar */}
        <div className="profile-modal-footer">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--s2t-teal)', fontSize: '0.75rem', fontWeight: 600 }}>
            <ShieldCheck size={16} />
            <span>{t('prof_footer_session')}</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={loading}
              style={{ padding: '0.55rem 1.25rem' }}
            >
              {t('prof_btn_close')}
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              style={{ gap: '0.5rem', padding: '0.55rem 1.35rem' }}
            >
              <Save size={16} />
              <span>{loading ? t('prof_btn_saving') : t('prof_btn_save')}</span>
            </button>
          </div>
        </div>
      </form>
    </div>,
    document.body
  );
};

export default ProfileSettingsModal;
