import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { reunionAPI } from '../services/api';
import { getSocket } from '../services/socket';
import { 
  CalendarDays, 
  Clock, 
  Users, 
  MapPin, 
  Video, 
  Plus, 
  CheckCircle2, 
  Building2, 
  Tv, 
  Wifi, 
  Coffee, 
  Calendar as CalendarIcon, 
  X, 
  Check, 
  ShieldCheck, 
  RefreshCw, 
  Search, 
  Filter, 
  AlertCircle, 
  Trash2, 
  Ban, 
  Activity, 
  Info, 
  CheckCheck, 
  XCircle, 
  Layers, 
  Lock, 
  CalendarCheck2 
} from 'lucide-react';

const FALLBACK_ROOMS = [
  {
    id: 'room-1',
    name: 'Salle Polyvalente Ibn Khaldoun',
    location: 'Bâtiment Central El Ghazala — RDC',
    capacity: '50 personnes',
    maxParticipants: 50,
    equipment: ['Écran 4K 85"', 'Réseau Fibre 5G Dédié', 'Système Son & Micros', 'Visioconférence Teams/Zoom'],
    status: 'disponible',
    badgeColor: '#10B981',
    image: 'https://images.unsplash.com/photo-1517502884422-41eaead166d4?w=800&auto=format&fit=crop&q=80'
  },
  {
    id: 'room-2',
    name: 'Salle Innovation & Pitch B-101',
    location: 'Bâtiment TIC 1 — 1er Étage',
    capacity: '16 personnes',
    maxParticipants: 16,
    equipment: ['Double Écran Visio', 'Tableau Interactif', 'Caméra Cadrage Auto 4K', 'Connexion Fibre'],
    status: 'disponible',
    badgeColor: 'var(--s2t-blue)',
    image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&auto=format&fit=crop&q=80'
  },
  {
    id: 'room-3',
    name: 'Espace Brainstorming Pépinière TIC',
    location: 'Pépinière des Entreprises — Aile A',
    capacity: '8 personnes',
    maxParticipants: 8,
    equipment: ['Écran Collaboratif', 'Paperboard Numérique', 'Wi-Fi 6 Haut Débit'],
    status: 'disponible',
    badgeColor: 'var(--s2t-teal)',
    image: 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=800&auto=format&fit=crop&q=80'
  }
];

// Suggested quick meeting slots
const SUGGESTED_SLOTS = [
  { start: '08:30', end: '10:00', label: '08:30 - 10:00' },
  { start: '10:00', end: '11:30', label: '10:00 - 11:30' },
  { start: '11:30', end: '13:00', label: '11:30 - 13:00' },
  { start: '14:00', end: '15:30', label: '14:00 - 15:30' },
  { start: '15:30', end: '17:00', label: '15:30 - 17:00' },
  { start: '17:00', end: '18:30', label: '17:00 - 18:30' },
];

const ReunionsPage = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const isClient = user?.role === 'client';

  // Backend state
  const [meetings, setMeetings] = useState([]);
  const [rooms, setRooms] = useState(FALLBACK_ROOMS);
  const [stats, setStats] = useState({ totalMeetings: 0, upcomingMeetings: 0, pendingMeetings: 0, visioMeetings: 0, roomsCount: 3 });
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [roomFilter, setRoomFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'pending', 'confirmed', 'mine'

  // Booking Modal
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [bookingData, setBookingData] = useState({
    title: '',
    room: FALLBACK_ROOMS[0].name,
    date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    startTime: '10:00',
    endTime: '11:30',
    participants: 6,
    isVisio: true,
    needCoffee: true,
    notes: '',
  });
  const [bookedSlotsForDate, setBookedSlotsForDate] = useState([]);
  const [conflictError, setConflictError] = useState('');
  const [bookingSuccess, setBookingSuccess] = useState('');

  // Admin Reject Modal
  const [rejectModalMeeting, setRejectModalMeeting] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [selectedQuickReason, setSelectedQuickReason] = useState('');

  // Cancel Meeting Modal
  const [cancelModalMeeting, setCancelModalMeeting] = useState(null);
  const [cancelReason, setCancelReason] = useState('');

  // Fetch Meetings & Rooms from backend
  const fetchReunionsData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [meetingsRes, roomsRes, statsRes] = await Promise.allSettled([
        reunionAPI.getAll({
          search: searchQuery || undefined,
          room: roomFilter !== 'all' ? roomFilter : undefined,
          status: statusFilter !== 'all' ? statusFilter : undefined,
        }),
        reunionAPI.getRooms({
          date: bookingData.date,
          startTime: bookingData.startTime,
          endTime: bookingData.endTime,
        }),
        reunionAPI.getStats(),
      ]);

      if (meetingsRes.status === 'fulfilled' && Array.isArray(meetingsRes.value.data)) {
        setMeetings(meetingsRes.value.data);
      }

      if (roomsRes.status === 'fulfilled' && Array.isArray(roomsRes.value.data) && roomsRes.value.data.length > 0) {
        setRooms(roomsRes.value.data);
      }

      if (statsRes.status === 'fulfilled' && statsRes.value.data) {
        setStats(statsRes.value.data);
      }
    } catch (err) {
      console.error('Erreur chargement réunions:', err);
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, roomFilter, statusFilter, bookingData.date, bookingData.startTime, bookingData.endTime]);

  useEffect(() => {
    fetchReunionsData();
  }, [fetchReunionsData]);

  // Fetch Booked Slots when Room or Date changes in booking modal
  useEffect(() => {
    if (!bookingModalOpen) return;

    let isMounted = true;
    const fetchSlots = async () => {
      try {
        const res = await reunionAPI.getBookedSlots({
          room: bookingData.room,
          date: bookingData.date,
        });
        if (isMounted && Array.isArray(res.data)) {
          setBookedSlotsForDate(res.data);
        }
      } catch (e) {
        const localBooked = meetings.filter(
          (m) => m.room === bookingData.room && m.date === bookingData.date && ['confirme', 'en_attente'].includes(m.status)
        );
        if (isMounted) setBookedSlotsForDate(localBooked);
      }
    };

    fetchSlots();
    return () => {
      isMounted = false;
    };
  }, [bookingModalOpen, bookingData.room, bookingData.date, meetings]);

  // Real-time Socket.IO Listeners
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const handleReunionEvent = () => {
      fetchReunionsData();
    };

    socket.on('reunion_created', handleReunionEvent);
    socket.on('reunion_updated', handleReunionEvent);

    return () => {
      socket.off('reunion_created', handleReunionEvent);
      socket.off('reunion_updated', handleReunionEvent);
    };
  }, [fetchReunionsData]);

  // Conflict Checker: Test if current bookingData overlaps with any booked slot
  const detectedConflict = bookedSlotsForDate.find((slot) => {
    return bookingData.startTime < slot.endTime && bookingData.endTime > slot.startTime;
  });

  const isInvalidTimeRange = bookingData.startTime >= bookingData.endTime;

  // Submit new booking
  const handleCreateBooking = async (e) => {
    e.preventDefault();
    setConflictError('');

    if (isInvalidTimeRange) {
      setConflictError("L'heure de début doit être strictement antérieure à l'heure de fin.");
      return;
    }

    if (detectedConflict) {
      setConflictError(
        `La salle "${bookingData.room}" est déjà réservée de ${detectedConflict.startTime} à ${detectedConflict.endTime} (${detectedConflict.title || 'Réservation en cours'}). Veuillez choisir un autre horaire.`
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await reunionAPI.create(bookingData);
      if (res.data?.success) {
        setBookingSuccess(res.data.message || 'Votre réservation de salle a été enregistrée avec succès !');
        setBookingModalOpen(false);
        setBookingData({
          title: '',
          room: FALLBACK_ROOMS[0].name,
          date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          startTime: '10:00',
          endTime: '11:30',
          participants: 6,
          isVisio: true,
          needCoffee: true,
          notes: '',
        });
        fetchReunionsData();
        setTimeout(() => setBookingSuccess(''), 6000);
      }
    } catch (err) {
      console.error('Erreur réservation:', err);
      const msg = err.response?.data?.message || 'Erreur lors de la réservation de la salle.';
      setConflictError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Admin Action: Confirm / Validate Pending Reservation
  const handleAdminApprove = async (meet) => {
    try {
      setIsSubmitting(true);
      await reunionAPI.updateStatus(meet.id || meet._id, 'confirme');
      setBookingSuccess(`✅ La réservation "${meet.title}" dans la salle "${meet.room}" a été validée et confirmée !`);
      fetchReunionsData();
      setTimeout(() => setBookingSuccess(''), 5000);
    } catch (err) {
      console.error('Erreur confirmation réservation:', err);
      alert(err.response?.data?.message || 'Erreur lors de la confirmation de la réservation');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Admin Action: Reject Pending Reservation
  const handleAdminReject = async (e) => {
    e.preventDefault();
    if (!rejectModalMeeting) return;

    const finalReason = rejectReason.trim() || selectedQuickReason || 'Créneau indisponible ou impératif technique';

    try {
      setIsSubmitting(true);
      await reunionAPI.updateStatus(rejectModalMeeting.id || rejectModalMeeting._id, 'rejete', finalReason);
      setRejectModalMeeting(null);
      setRejectReason('');
      setSelectedQuickReason('');
      setBookingSuccess(`❌ La demande de réservation pour "${rejectModalMeeting.title}" a été refusée.`);
      fetchReunionsData();
      setTimeout(() => setBookingSuccess(''), 5000);
    } catch (err) {
      console.error('Erreur refus réservation:', err);
      alert(err.response?.data?.message || 'Erreur lors du refus de la réservation');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Cancel Meeting (Client or Owner)
  const handleConfirmCancel = async (e) => {
    e.preventDefault();
    if (!cancelModalMeeting) return;

    try {
      setIsSubmitting(true);
      await reunionAPI.updateStatus(cancelModalMeeting.id || cancelModalMeeting._id, 'annule', cancelReason);
      setCancelModalMeeting(null);
      setCancelReason('');
      setBookingSuccess('La réservation de la réunion a été annulée avec succès.');
      fetchReunionsData();
      setTimeout(() => setBookingSuccess(''), 5000);
    } catch (err) {
      console.error('Erreur annulation réunion:', err);
      alert(err.response?.data?.message || 'Erreur lors de l\'annulation');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete Meeting (admin or owner)
  const handleDeleteMeeting = async (id, title) => {
    if (!window.confirm(`Êtes-vous sûr de vouloir supprimer définitivement la réunion "${title}" ?`)) {
      return;
    }

    try {
      await reunionAPI.delete(id);
      fetchReunionsData();
      setBookingSuccess('Réunion supprimée avec succès.');
      setTimeout(() => setBookingSuccess(''), 4000);
    } catch (err) {
      console.error('Erreur suppression réunion:', err);
      alert(err.response?.data?.message || 'Erreur lors de la suppression');
    }
  };

  // Filtered meetings list with tabs
  const pendingCount = meetings.filter((m) => m.status === 'en_attente').length;
  const confirmedCount = meetings.filter((m) => m.status === 'confirme').length;

  const filteredMeetings = meetings.filter((m) => {
    if (activeTab === 'pending' && m.status !== 'en_attente') return false;
    if (activeTab === 'confirmed' && m.status !== 'confirme') return false;
    if (activeTab === 'mine' && !m.isOwner) return false;

    if (roomFilter !== 'all' && m.room !== roomFilter) return false;
    if (statusFilter !== 'all' && m.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        (m.title || '').toLowerCase().includes(q) ||
        (m.organizer || '').toLowerCase().includes(q) ||
        (m.organizerCompany || '').toLowerCase().includes(q) ||
        (m.room || '').toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="reunions-page-container">
      {/* Top Banner Header */}
      <div className="page-header-row">
        <div className="page-header-text">
          <div className="page-breadcrumb">
            <CalendarDays size={15} color="var(--s2t-cyan)" />
            <span>{isClient ? 'Espace Entreprise Résidente' : 'Direction S2T Administration'} / Réunions & Salles</span>
          </div>
          <h1 className="page-main-title">Gestion des Salles & Réservations S2T</h1>
          <p className="page-subtitle">
            Planifiez vos comités, réunions stratégiques et visioconférences 4K au Technopark El Ghazala en évitant les conflits d'horaires.
          </p>
        </div>

        <div className="page-header-actions">
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={fetchReunionsData}
            title="Actualiser le calendrier"
          >
            <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
            <span>Actualiser</span>
          </button>

          <button 
            type="button" 
            onClick={() => {
              setConflictError('');
              setBookingModalOpen(true);
            }}
            className="btn btn-primary"
            style={{ gap: '0.5rem' }}
          >
            <Plus size={18} />
            <span>Réserver une Salle</span>
          </button>
        </div>
      </div>

      {/* Success Notification Banner */}
      {bookingSuccess && (
        <div className="reunions-success-banner">
          <CheckCircle2 size={20} style={{ flexShrink: 0 }} />
          <span>{bookingSuccess}</span>
        </div>
      )}

      {/* Admin Alert for Pending Requests */}
      {isAdmin && pendingCount > 0 && activeTab !== 'pending' && (
        <div className="reunions-admin-alert">
          <div className="admin-alert-content">
            <div className="admin-alert-badge-count">
              {pendingCount}
            </div>
            <div>
              <h4 className="admin-alert-title">
                {pendingCount} Demande{pendingCount > 1 ? 's' : ''} de réservation en attente de votre validation
              </h4>
              <p className="admin-alert-sub">
                Des entreprises résidentes attendent la confirmation de leur créneau de salle.
              </p>
            </div>
          </div>
          <button
            type="button"
            className="btn btn-primary btn-sm admin-alert-btn"
            onClick={() => setActiveTab('pending')}
          >
            Examiner les demandes ({pendingCount})
          </button>
        </div>
      )}

      {/* KPI Stats Cards Row */}
      <div className="reunions-stats-grid">
        <div className="glass-card stat-card-box">
          <div className="stat-icon-wrapper" style={{ background: 'rgba(37, 99, 235, 0.15)', color: 'var(--s2t-blue)' }}>
            <CalendarIcon size={20} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Total Réservations</span>
            <h4 className="stat-value">{meetings.length}</h4>
          </div>
        </div>

        <div className="glass-card stat-card-box">
          <div className="stat-icon-wrapper" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#F59E0B' }}>
            <Clock size={20} />
          </div>
          <div className="stat-info">
            <span className="stat-label">En Attente Validation</span>
            <h4 className="stat-value" style={{ color: '#F59E0B' }}>{pendingCount}</h4>
          </div>
        </div>

        <div className="glass-card stat-card-box">
          <div className="stat-icon-wrapper" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10B981' }}>
            <Activity size={20} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Confirmées S2T</span>
            <h4 className="stat-value" style={{ color: '#10B981' }}>{confirmedCount}</h4>
          </div>
        </div>

        <div className="glass-card stat-card-box">
          <div className="stat-icon-wrapper" style={{ background: 'rgba(139, 92, 246, 0.15)', color: '#8B5CF6' }}>
            <Video size={20} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Visioconférences 4K</span>
            <h4 className="stat-value" style={{ color: '#8B5CF6' }}>
              {meetings.filter(m => m.isVisio && m.status === 'confirme').length}
            </h4>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="reunions-tabs-bar">
        <button
          type="button"
          onClick={() => setActiveTab('all')}
          className={`reunion-tab-btn ${activeTab === 'all' ? 'active-blue' : ''}`}
        >
          <Layers size={14} />
          <span>Toutes ({meetings.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('pending')}
          className={`reunion-tab-btn ${activeTab === 'pending' ? 'active-amber' : ''}`}
        >
          <Clock size={14} />
          <span>À Valider (Admin)</span>
          {pendingCount > 0 && (
            <span className="tab-counter-pill">
              {pendingCount}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('confirmed')}
          className={`reunion-tab-btn ${activeTab === 'confirmed' ? 'active-green' : ''}`}
        >
          <CheckCircle2 size={14} />
          <span>Confirmées ({confirmedCount})</span>
        </button>

        {isClient && (
          <button
            type="button"
            onClick={() => setActiveTab('mine')}
            className={`reunion-tab-btn ${activeTab === 'mine' ? 'active-teal' : ''}`}
          >
            <Users size={14} />
            <span>Mes Réservations ({meetings.filter(m => m.isOwner).length})</span>
          </button>
        )}
      </div>

      {/* Search & Filter Bar */}
      <div className="glass-card reunions-filter-bar">
        <div className="reunions-search-box">
          <Search size={16} color="var(--text-muted)" />
          <input
            type="text"
            placeholder="Rechercher par titre, entreprise, organisateur ou salle..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button type="button" onClick={() => setSearchQuery('')} className="search-clear-btn">
              <X size={14} />
            </button>
          )}
        </div>

        <div className="reunions-filter-selects">
          <div className="filter-select-wrapper">
            <Filter size={14} color="var(--text-secondary)" />
            <select
              className="form-select"
              value={roomFilter}
              onChange={(e) => setRoomFilter(e.target.value)}
            >
              <option value="all">Toutes les salles</option>
              {rooms.map(r => (
                <option key={r.id} value={r.name}>{r.name}</option>
              ))}
            </select>
          </div>

          <select
            className="form-select status-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">Tous les statuts</option>
            <option value="en_attente">En attente</option>
            <option value="confirme">Confirmées</option>
            <option value="rejete">Rejetées</option>
            <option value="annule">Annulées</option>
          </select>
        </div>
      </div>

      {/* Main Grid: Scheduled Meetings (Left) & Technopark Rooms (Right) */}
      <div className="reunions-main-grid">
        
        {/* Left Column: Scheduled Meetings */}
        <div className="reunions-schedule-col">
          <div className="reunions-section-header">
            <CalendarIcon size={18} color="var(--s2t-blue)" />
            <span>
              {activeTab === 'pending' ? 'Demandes de Réservation à Valider' : 'Planning des Réunions'} ({filteredMeetings.length})
            </span>
          </div>

          {isLoading ? (
            <div className="reunions-loading-box">
              <RefreshCw size={24} className="animate-spin" style={{ margin: '0 auto 0.75rem' }} />
              <p style={{ margin: 0, fontWeight: 600 }}>Synchronisation du calendrier en direct...</p>
            </div>
          ) : filteredMeetings.length === 0 ? (
            <div className="glass-card reunions-empty-card">
              <CalendarDays size={40} style={{ opacity: 0.35, marginBottom: '0.75rem' }} />
              <h4 style={{ margin: '0 0 0.4rem', color: 'var(--text-primary)', fontWeight: 700 }}>
                {activeTab === 'pending' ? 'Aucune demande en attente' : 'Aucune réunion trouvée'}
              </h4>
              <p style={{ fontSize: '0.85rem', margin: 0, color: 'var(--text-secondary)' }}>
                {activeTab === 'pending' 
                  ? 'Toutes les réservations de salles ont été traitées et confirmées.'
                  : 'Aucune réservation ne correspond à vos filtres. Cliquez sur "Réserver une Salle" pour planifier un créneau.'}
              </p>
            </div>
          ) : (
            <div className="meetings-cards-list">
              {filteredMeetings.map((meet) => {
                const isCancelled = meet.status === 'annule';
                const isRejected = meet.status === 'rejete';
                const isConfirmed = meet.status === 'confirme';
                const isPending = meet.status === 'en_attente';

                return (
                  <div 
                    key={meet.id || meet._id} 
                    className="meeting-card-item" 
                    style={{ 
                      opacity: (isCancelled || isRejected) ? 0.75 : 1,
                      borderLeft: isPending 
                        ? '4px solid #F59E0B' 
                        : isConfirmed 
                        ? '4px solid #10B981' 
                        : isRejected 
                        ? '4px solid #EF4444' 
                        : '4px solid var(--border-color)'
                    }}
                  >
                    <div className="meeting-card-top-row">
                      <div className="meeting-card-title-block">
                        {isConfirmed && (
                          <span className="meeting-status-tag status-confirmed">
                            <CheckCheck size={13} />
                            Confirmée & Scellée S2T
                          </span>
                        )}

                        {isPending && (
                          <span className="meeting-status-tag status-pending">
                            <Clock size={13} />
                            En attente de validation Admin
                          </span>
                        )}

                        {isRejected && (
                          <span className="meeting-status-tag status-rejected">
                            <XCircle size={13} />
                            Refusée par l'Administration
                          </span>
                        )}

                        {isCancelled && (
                          <span className="meeting-status-tag status-cancelled">
                            <Ban size={13} />
                            Annulée
                          </span>
                        )}

                        <h3 className="meeting-card-title" style={{ textDecoration: (isCancelled || isRejected) ? 'line-through' : 'none' }}>
                          {meet.title}
                        </h3>
                      </div>

                      <div className="meeting-card-quick-actions">
                        {meet.isVisio && isConfirmed && meet.visioLink && (
                          <a
                            href={meet.visioLink}
                            target="_blank"
                            rel="noreferrer"
                            className="btn btn-primary btn-sm join-visio-btn"
                            title="Rejoindre la visioconférence sécurisée S2T"
                          >
                            <Video size={14} />
                            <span>Visio</span>
                          </a>
                        )}

                        {meet.isOwner && !isCancelled && !isRejected && (
                          <button
                            type="button"
                            className="btn btn-ghost btn-sm action-icon-btn"
                            onClick={() => setCancelModalMeeting(meet)}
                            title="Annuler cette réservation"
                          >
                            <Ban size={15} />
                          </button>
                        )}

                        {(isAdmin || meet.isOwner) && (
                          <button
                            type="button"
                            className="btn btn-ghost btn-sm action-icon-btn"
                            onClick={() => handleDeleteMeeting(meet.id || meet._id, meet.title)}
                            title="Supprimer la réunion"
                          >
                            <Trash2 size={15} />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Metadata Pills */}
                    <div className="meeting-meta-grid">
                      <div className="meeting-meta-pill">
                        <CalendarIcon size={14} color="var(--s2t-blue)" />
                        <span>{meet.formattedDate || meet.date}</span>
                      </div>
                      <div className="meeting-meta-pill">
                        <Clock size={14} color="#F59E0B" />
                        <span>{meet.time || `${meet.startTime} - ${meet.endTime}`}</span>
                      </div>
                      <div className="meeting-meta-pill">
                        <MapPin size={14} color="var(--s2t-red)" />
                        <span>{meet.room}</span>
                      </div>
                      <div className="meeting-meta-pill">
                        <Users size={14} color="#10B981" />
                        <span>{meet.participants} participants</span>
                      </div>
                    </div>

                    {/* Rejection notice */}
                    {isRejected && meet.cancellationReason && (
                      <div className="meeting-rejection-notice">
                        <Info size={15} style={{ flexShrink: 0 }} />
                        <span><strong>Motif du refus :</strong> {meet.cancellationReason}</span>
                      </div>
                    )}

                    {/* Notes */}
                    {meet.notes && (
                      <div className="meeting-card-note">
                        <strong>Note :</strong> {meet.notes}
                      </div>
                    )}

                    {/* ADMIN ACTION BAR: Confirm or Reject pending request */}
                    {isAdmin && isPending && (
                      <div className="admin-action-row">
                        <div className="admin-action-label">
                          <ShieldCheck size={16} color="#F59E0B" />
                          <span>Validation Administrative Requise</span>
                        </div>

                        <div className="admin-action-buttons">
                          <button
                            type="button"
                            onClick={() => {
                              setRejectModalMeeting(meet);
                              setRejectReason('');
                              setSelectedQuickReason('');
                            }}
                            className="btn btn-secondary btn-sm admin-btn-reject"
                            disabled={isSubmitting}
                          >
                            <X size={14} />
                            <span>Refuser</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleAdminApprove(meet)}
                            className="btn btn-primary btn-sm admin-btn-approve"
                            disabled={isSubmitting}
                          >
                            <Check size={14} />
                            <span>Confirmer & Valider</span>
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Client Pending Notice */}
                    {isClient && isPending && (
                      <div className="client-pending-notice">
                        <Info size={14} color="#F59E0B" style={{ flexShrink: 0 }} />
                        <span>Votre demande est en cours de validation par la Direction S2T. Vous recevrez une notification dès confirmation.</span>
                      </div>
                    )}

                    {/* Footer Info */}
                    <div className="meeting-card-footer">
                      <span className="organizer-text">Organisateur : <strong>{meet.organizer}</strong></span>
                      <div className="amenities-text">
                        {meet.needCoffee && <span style={{ color: '#F59E0B', fontWeight: 600 }}>☕ Pause Café S2T</span>}
                        <span style={{ color: 'var(--s2t-teal)', fontWeight: 600 }}>Équipements réservés ✓</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Technopark Available Rooms Showcase */}
        <div className="reunions-rooms-col">
          <div className="reunions-section-header">
            <Building2 size={18} color="var(--s2t-red)" />
            <span>Salles & Espaces de Conférence El Ghazala</span>
          </div>

          <div className="s2t-rooms-showcase">
            {rooms.map((room) => {
              const isOccupied = room.status === 'occupee';

              return (
                <div key={room.id} className="s2t-room-card">
                  <div className="s2t-room-img-wrapper">
                    <img 
                      src={room.image} 
                      alt={room.name} 
                      className="s2t-room-img" 
                      loading="lazy"
                      onError={(e) => {
                        e.target.src = 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&auto=format&fit=crop&q=80';
                      }}
                    />
                    <span
                      className="s2t-room-badge"
                      style={{
                        backgroundColor: isOccupied ? 'rgba(239, 68, 68, 0.95)' : 'rgba(16, 185, 129, 0.95)'
                      }}
                    >
                      {isOccupied ? 'Occupée' : 'Disponible'}
                    </span>
                  </div>

                  <div className="s2t-room-body">
                    <h4 className="s2t-room-title">{room.name}</h4>
                    <div className="s2t-room-loc">
                      <MapPin size={14} color="var(--s2t-red)" />
                      <span>{room.location} • Capacité : {room.capacity}</span>
                    </div>

                    <div className="s2t-room-equipments">
                      {(room.equipment || []).map((eq, i) => (
                        <span key={i} className="equipment-tag">{eq}</span>
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setBookingData(prev => ({ ...prev, room: room.name }));
                        setConflictError('');
                        setBookingModalOpen(true);
                      }}
                      className="btn btn-secondary btn-sm book-room-btn"
                    >
                      <CalendarDays size={14} />
                      <span>Réserver cette salle</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Booking Modal with Visual Conflict Prevention */}
      {bookingModalOpen && (
        <div className="modal-overlay" onClick={() => setBookingModalOpen(false)} style={{ zIndex: 1300 }}>
          <form 
            onSubmit={handleCreateBooking} 
            className="modal-container responsive-booking-modal" 
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <CalendarDays size={20} color="var(--s2t-cyan)" />
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800 }}>Réserver une Salle de Réunion S2T</h3>
                  <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    {isAdmin ? 'Création directe avec confirmation automatique' : 'Demande transmise à la Direction S2T pour validation'}
                  </p>
                </div>
              </div>
              <button 
                type="button" 
                onClick={() => setBookingModalOpen(false)} 
                className="btn btn-ghost"
                style={{ padding: '0.4rem', borderRadius: '50%' }}
              >
                <X size={18} />
              </button>
            </div>

            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              
              {/* Conflict error banner */}
              {(conflictError || detectedConflict) && (
                <div className="modal-conflict-banner">
                  <AlertCircle size={20} style={{ flexShrink: 0, marginTop: '2px' }} />
                  <div>
                    <strong style={{ display: 'block', marginBottom: '2px' }}>⛔ Conflit d'horaire détecté :</strong>
                    <span>
                      {conflictError || `La salle "${bookingData.room}" est déjà occupée de ${detectedConflict?.startTime} à ${detectedConflict?.endTime} ("${detectedConflict?.title || 'Réservation active'}"). Impossible de réserver sur ce créneau.`}
                    </span>
                  </div>
                </div>
              )}

              {/* Title Input */}
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Titre ou Objet de la Réunion *</label>
                <input
                  type="text"
                  required
                  className="form-input"
                  placeholder="Ex: Réunion Comité Stratégique / Démo Client Étranger"
                  value={bookingData.title}
                  onChange={(e) => setBookingData({ ...bookingData, title: e.target.value })}
                />
              </div>

              {/* Room Selection */}
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Choix de la Salle S2T *</label>
                <select
                  className="form-select"
                  value={bookingData.room}
                  onChange={(e) => {
                    setBookingData({ ...bookingData, room: e.target.value });
                    setConflictError('');
                  }}
                >
                  {rooms.map(r => (
                    <option key={r.id} value={r.name}>{r.name} ({r.capacity}) - {r.location}</option>
                  ))}
                </select>
              </div>

              {/* Date & Time Selectors */}
              <div className="modal-datetime-grid">
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Date *</label>
                  <input
                    type="date"
                    required
                    min={new Date().toISOString().split('T')[0]}
                    className="form-input"
                    value={bookingData.date}
                    onChange={(e) => {
                      setBookingData({ ...bookingData, date: e.target.value });
                      setConflictError('');
                    }}
                  />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Heure Début *</label>
                  <input
                    type="time"
                    required
                    className="form-input"
                    style={{ borderColor: detectedConflict ? '#EF4444' : undefined }}
                    value={bookingData.startTime}
                    onChange={(e) => {
                      setBookingData({ ...bookingData, startTime: e.target.value });
                      setConflictError('');
                    }}
                  />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Heure Fin *</label>
                  <input
                    type="time"
                    required
                    className="form-input"
                    style={{ borderColor: detectedConflict ? '#EF4444' : undefined }}
                    value={bookingData.endTime}
                    onChange={(e) => {
                      setBookingData({ ...bookingData, endTime: e.target.value });
                      setConflictError('');
                    }}
                  />
                </div>
              </div>

              {/* Visual Availability Box */}
              <div className="modal-availability-card">
                <div className="availability-card-header">
                  <span className="avail-title">
                    <CalendarCheck2 size={14} color="var(--s2t-blue)" />
                    Créneaux du {bookingData.date} pour {bookingData.room} :
                  </span>
                  <span className="avail-count">
                    {bookedSlotsForDate.length} créneau{bookedSlotsForDate.length > 1 ? 'x' : ''} réservé{bookedSlotsForDate.length > 1 ? 's' : ''}
                  </span>
                </div>

                {bookedSlotsForDate.length === 0 ? (
                  <div className="avail-free-msg">
                    <CheckCircle2 size={15} />
                    <span>✨ Salle 100% disponible toute la journée. Tous les créneaux sont libres.</span>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    <div className="booked-slots-badges-row">
                      {bookedSlotsForDate.map((b, idx) => (
                        <span key={idx} className="booked-slot-chip">
                          <Lock size={12} />
                          ⛔ {b.startTime} - {b.endTime} ({b.title || 'Réservé'})
                        </span>
                      ))}
                    </div>

                    {/* Quick suggestion free slots */}
                    <div className="suggested-slots-section">
                      <span className="suggested-label">
                        💡 Suggestions de créneaux rapides (cliquez pour sélectionner) :
                      </span>
                      <div className="suggested-chips-group">
                        {SUGGESTED_SLOTS.map((slot, i) => {
                          const isSlotBusy = bookedSlotsForDate.some(
                            (b) => slot.start < b.endTime && slot.end > b.startTime
                          );
                          const isSelected = bookingData.startTime === slot.start && bookingData.endTime === slot.end;

                          return (
                            <button
                              key={i}
                              type="button"
                              disabled={isSlotBusy}
                              onClick={() => {
                                setBookingData(prev => ({ ...prev, startTime: slot.start, endTime: slot.end }));
                                setConflictError('');
                              }}
                              className={`suggested-slot-btn ${isSelected ? 'selected' : ''} ${isSlotBusy ? 'disabled' : ''}`}
                            >
                              {slot.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Participants & Amenities */}
              <div className="modal-options-grid">
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Nombre de Participants</label>
                  <input
                    type="number"
                    min={1}
                    max={100}
                    className="form-input"
                    value={bookingData.participants}
                    onChange={(e) => setBookingData({ ...bookingData, participants: e.target.value })}
                  />
                </div>

                <div className="form-group" style={{ margin: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <label className="form-label">Options d'Accueil S2T</label>
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', height: '42px', flexWrap: 'wrap' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.825rem', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={bookingData.isVisio}
                        onChange={(e) => setBookingData({ ...bookingData, isVisio: e.target.checked })}
                      />
                      <span>Visio 4K WebRTC</span>
                    </label>

                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.825rem', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={bookingData.needCoffee}
                        onChange={(e) => setBookingData({ ...bookingData, needCoffee: e.target.checked })}
                      />
                      <span>Pause Café S2T</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Remarques ou besoins techniques spécifiques (Optionnel)</label>
                <textarea
                  className="form-textarea"
                  rows={2}
                  placeholder="Ex: Besoin de 2 micros sans fil et câble HDMI..."
                  value={bookingData.notes}
                  onChange={(e) => setBookingData({ ...bookingData, notes: e.target.value })}
                />
              </div>
            </div>

            <div className="modal-footer modal-footer-responsive">
              <button 
                type="button" 
                className="btn btn-secondary" 
                onClick={() => setBookingModalOpen(false)}
                disabled={isSubmitting}
              >
                Annuler
              </button>
              <button 
                type="submit" 
                className="btn btn-primary"
                style={{ 
                  gap: '0.5rem',
                  background: (detectedConflict || isInvalidTimeRange) ? 'var(--text-muted)' : undefined,
                  borderColor: (detectedConflict || isInvalidTimeRange) ? 'var(--text-muted)' : undefined,
                  cursor: (detectedConflict || isInvalidTimeRange) ? 'not-allowed' : 'pointer'
                }}
                disabled={Boolean(detectedConflict) || isInvalidTimeRange || isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw size={16} className="animate-spin" />
                    <span>Traitement...</span>
                  </>
                ) : detectedConflict ? (
                  <>
                    <AlertCircle size={16} />
                    <span>Créneau Occupé (Conflit)</span>
                  </>
                ) : (
                  <>
                    <Check size={16} />
                    <span>{isAdmin ? 'Confirmer la réservation' : 'Transmettre la demande'}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Admin Reject Confirmation Modal */}
      {rejectModalMeeting && (
        <div className="modal-overlay" onClick={() => setRejectModalMeeting(null)} style={{ zIndex: 1350 }}>
          <form 
            onSubmit={handleAdminReject}
            className="modal-container responsive-reject-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <XCircle size={22} color="#EF4444" />
                <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800 }}>Refuser la réservation de salle</h3>
              </div>
              <button 
                type="button" 
                onClick={() => setRejectModalMeeting(null)} 
                className="btn btn-ghost"
                style={{ padding: '0.4rem', borderRadius: '50%' }}
              >
                <X size={18} />
              </button>
            </div>

            <div className="modal-body">
              <p style={{ margin: '0 0 1rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                Vous êtes sur le point de refuser la demande pour : <strong>"{rejectModalMeeting.title}"</strong> ({rejectModalMeeting.room}, le {rejectModalMeeting.formattedDate || rejectModalMeeting.date}).
              </p>

              <div style={{ marginBottom: '1rem' }}>
                <label className="form-label" style={{ marginBottom: '0.4rem' }}>Motifs rapides fréquents :</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  {[
                    'Salle réservée pour un événement officiel Technopark',
                    'Créneau indisponible en raison d\'une maintenance technique',
                    'Dépassement de la capacité d\'accueil maximale autorisée',
                    'Veuillez reformuler votre demande sur un autre horaire'
                  ].map((reason, idx) => (
                    <label 
                      key={idx}
                      className={`quick-reason-option ${selectedQuickReason === reason ? 'selected' : ''}`}
                    >
                      <input
                        type="radio"
                        name="quickReason"
                        checked={selectedQuickReason === reason}
                        onChange={() => {
                          setSelectedQuickReason(reason);
                          setRejectReason(reason);
                        }}
                      />
                      <span>{reason}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Message explicatif ou personnalisé envoyé au résident</label>
                <textarea
                  className="form-textarea"
                  rows={2}
                  placeholder="Précisez le motif du refus..."
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                />
              </div>
            </div>

            <div className="modal-footer modal-footer-responsive">
              <button 
                type="button" 
                className="btn btn-secondary" 
                onClick={() => setRejectModalMeeting(null)}
                disabled={isSubmitting}
              >
                Annuler
              </button>
              <button 
                type="submit" 
                className="btn btn-primary"
                style={{ background: '#EF4444', borderColor: '#EF4444' }}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Traitement...' : 'Confirmer le refus'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Cancel Confirmation Modal */}
      {cancelModalMeeting && (
        <div className="modal-overlay" onClick={() => setCancelModalMeeting(null)} style={{ zIndex: 1350 }}>
          <form 
            onSubmit={handleConfirmCancel}
            className="modal-container responsive-cancel-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <AlertCircle size={20} color="var(--s2t-red)" />
                <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800 }}>Annuler la réservation</h3>
              </div>
              <button 
                type="button" 
                onClick={() => setCancelModalMeeting(null)} 
                className="btn btn-ghost"
                style={{ padding: '0.4rem', borderRadius: '50%' }}
              >
                <X size={18} />
              </button>
            </div>

            <div className="modal-body">
              <p style={{ margin: '0 0 1rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                Êtes-vous sûr de vouloir annuler la réservation pour : <strong>"{cancelModalMeeting.title}"</strong> prévue le <strong>{cancelModalMeeting.formattedDate || cancelModalMeeting.date}</strong> ?
              </p>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Motif de l'annulation (Optionnel)</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Ex: Report de la réunion avec le client..."
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                />
              </div>
            </div>

            <div className="modal-footer modal-footer-responsive">
              <button 
                type="button" 
                className="btn btn-secondary" 
                onClick={() => setCancelModalMeeting(null)}
                disabled={isSubmitting}
              >
                Conserver
              </button>
              <button 
                type="submit" 
                className="btn btn-primary"
                style={{ background: 'var(--s2t-red)', borderColor: 'var(--s2t-red)' }}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Traitement...' : 'Confirmer l\'annulation'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default ReunionsPage;
