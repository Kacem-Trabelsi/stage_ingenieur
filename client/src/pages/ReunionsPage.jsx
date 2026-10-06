import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
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
  ExternalLink,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';

const S2T_ROOMS = [
  {
    id: 'room-1',
    name: 'Salle Polyvalente Ibn Khaldoun',
    location: 'Bâtiment Central El Ghazala — RDC',
    capacity: '50 personnes',
    equipment: ['Écran 4K 85"', 'Réseau Fibre 5G Dédié', 'Système Son & Micros', 'Visioconférence Teams/Zoom'],
    status: 'disponible',
    badgeColor: '#10B981',
    image: 'https://images.unsplash.com/photo-1517502884422-41eaead166d4?w=600&auto=format&fit=crop&q=80'
  },
  {
    id: 'room-2',
    name: 'Salle Innovation & Pitch B-101',
    location: 'Bâtiment TIC 1 — 1er Étage',
    capacity: '16 personnes',
    equipment: ['Double Écran Visio', 'Tableau Interactif', 'Caméra Cadrage Auto 4K', 'Connexion Fibre'],
    status: 'disponible',
    badgeColor: 'var(--s2t-blue)',
    image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&auto=format&fit=crop&q=80'
  },
  {
    id: 'room-3',
    name: 'Espace Brainstorming Pépinière TIC',
    location: 'Pépinière des Entreprises — Aile A',
    capacity: '8 personnes',
    equipment: ['Écran Collaboratif', 'Paperboard Numérique', 'Wi-Fi 6 Haut Débit'],
    status: 'disponible',
    badgeColor: 'var(--s2t-teal)',
    image: 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=600&auto=format&fit=crop&q=80'
  }
];

const INITIAL_MEETINGS = [
  {
    id: 'meet-1',
    title: 'Comité de Pilotage & Revue d\'Hébergement Q4',
    room: 'Salle Innovation & Pitch B-101',
    date: '10 Octobre 2026',
    time: '10:00 - 11:30',
    organizer: 'Direction S2T & InnovTech Solutions',
    participants: 6,
    isVisio: true,
    visioLink: 'https://meet.s2t.tn/el-ghazala-copil-q4',
    status: 'confirme'
  },
  {
    id: 'meet-2',
    title: 'Session Technique Partenaires & Démo Produit IA',
    room: 'Salle Polyvalente Ibn Khaldoun',
    date: '16 Octobre 2026',
    time: '14:00 - 16:30',
    organizer: 'InnovTech Solutions (Résident)',
    participants: 28,
    isVisio: true,
    visioLink: 'https://meet.s2t.tn/demo-innovtech-2026',
    status: 'confirme'
  }
];

const ReunionsPage = () => {
  const { user } = useAuth();
  const [meetings, setMeetings] = useState(INITIAL_MEETINGS);
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(S2T_ROOMS[0].name);

  const [bookingData, setBookingData] = useState({
    title: '',
    room: S2T_ROOMS[0].name,
    date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    startTime: '10:00',
    endTime: '11:30',
    participants: 6,
    isVisio: true,
    needCoffee: true,
    notes: '',
  });

  const [bookingSuccess, setBookingSuccess] = useState(false);

  const handleCreateBooking = (e) => {
    e.preventDefault();
    const newMeeting = {
      id: `meet-${Date.now()}`,
      title: bookingData.title,
      room: bookingData.room,
      date: new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' }).format(new Date(bookingData.date)),
      time: `${bookingData.startTime} - ${bookingData.endTime}`,
      organizer: `${user?.name || 'Résident'} (${user?.companyName || 'Entreprise Hébergée'})`,
      participants: Number(bookingData.participants),
      isVisio: bookingData.isVisio,
      visioLink: `https://meet.s2t.tn/reservation-${Date.now().toString().slice(-4)}`,
      status: 'confirme'
    };

    setMeetings([newMeeting, ...meetings]);
    setBookingModalOpen(false);
    setBookingData({
      title: '',
      room: S2T_ROOMS[0].name,
      date: new Date().toISOString().split('T')[0],
      startTime: '10:00',
      endTime: '11:30',
      participants: 6,
      isVisio: true,
      needCoffee: true,
      notes: '',
    });
    setBookingSuccess(true);
    setTimeout(() => setBookingSuccess(false), 4000);
  };

  return (
    <div className="reunions-page-container">
      {/* Top Banner */}
      <div className="page-header-row">
        <div>
          <div className="page-breadcrumb">
            <CalendarDays size={16} color="var(--s2t-cyan)" />
            <span>Espace Résident S2T / Réunions & Salles de Conférence</span>
          </div>
          <h1 className="page-main-title">Planification de Réunions & Espaces S2T</h1>
          <p className="page-subtitle">
            Réservez les salles de conférence du Technopark El Ghazala et organisez vos rendez-vous stratégiques.
          </p>
        </div>

        <button 
          type="button" 
          onClick={() => setBookingModalOpen(true)}
          className="btn btn-primary"
          style={{ gap: '0.6rem', padding: '0.65rem 1.4rem' }}
        >
          <Plus size={18} />
          <span>Réserver une Salle S2T</span>
        </button>
      </div>

      {bookingSuccess && (
        <div style={{
          background: 'rgba(16, 185, 129, 0.12)',
          border: '1px solid rgba(16, 185, 129, 0.3)',
          color: '#10B981',
          padding: '0.75rem 1rem',
          borderRadius: 'var(--radius-md)',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.6rem',
          fontSize: '0.875rem',
          fontWeight: 600
        }}>
          <CheckCircle2 size={18} />
          <span>Votre réservation de salle a été confirmée et synchronisée avec le secrétariat S2T !</span>
        </div>
      )}

      {/* Grid: Left Upcoming Meetings, Right Available S2T Rooms */}
      <div className="reunions-main-grid">
        {/* Left Column: Scheduled Meetings */}
        <div className="reunions-schedule-col">
          <div className="reunions-section-header">
            <CalendarIcon size={18} color="var(--s2t-blue)" />
            <span>Mes Réunions Planifiées ({meetings.length})</span>
          </div>

          <div className="meetings-cards-list">
            {meetings.map((meet) => (
              <div key={meet.id} className="meeting-card-item">
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.75rem', marginBottom: '0.5rem' }}>
                  <div>
                    <span className="meeting-status-tag">Confirmée & Scellée S2T</span>
                    <h3 className="meeting-card-title">{meet.title}</h3>
                  </div>
                  {meet.isVisio && (
                    <a
                      href={meet.visioLink}
                      target="_blank"
                      rel="noreferrer"
                      className="btn btn-primary btn-sm"
                      style={{ gap: '0.35rem', fontSize: '0.75rem', padding: '0.35rem 0.75rem' }}
                      title="Rejoindre la visioconférence sécurisée"
                    >
                      <Video size={14} />
                      <span>Rejoindre</span>
                    </a>
                  )}
                </div>

                <div className="meeting-meta-grid">
                  <div className="meeting-meta-pill">
                    <CalendarIcon size={14} color="var(--s2t-blue)" />
                    <span>{meet.date}</span>
                  </div>
                  <div className="meeting-meta-pill">
                    <Clock size={14} color="#F59E0B" />
                    <span>{meet.time}</span>
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

                <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px dashed var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  <span>Organisateur : <strong>{meet.organizer}</strong></span>
                  <span style={{ color: 'var(--s2t-teal)', fontWeight: 600 }}>Équipements réservés ✓</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Technopark Available Rooms Showcase */}
        <div className="reunions-rooms-col">
          <div className="reunions-section-header">
            <Building2 size={18} color="var(--s2t-red)" />
            <span>Salles & Espaces de Conférence El Ghazala</span>
          </div>

          <div className="s2t-rooms-showcase">
            {S2T_ROOMS.map((room) => (
              <div key={room.id} className="s2t-room-card">
                <div className="s2t-room-img-wrapper">
                  <img src={room.image} alt={room.name} className="s2t-room-img" />
                  <span className="s2t-room-badge" style={{ backgroundColor: 'rgba(16, 185, 129, 0.9)' }}>
                    {room.status === 'disponible' ? 'Disponible' : 'Occupée'}
                  </span>
                </div>

                <div className="s2t-room-body">
                  <h4 className="s2t-room-title">{room.name}</h4>
                  <div className="s2t-room-loc">
                    <MapPin size={14} />
                    <span>{room.location} • Capacité : {room.capacity}</span>
                  </div>

                  <div className="s2t-room-equipments">
                    {room.equipment.map((eq, i) => (
                      <span key={i} className="equipment-tag">{eq}</span>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setBookingData(prev => ({ ...prev, room: room.name }));
                      setBookingModalOpen(true);
                    }}
                    className="btn btn-secondary btn-sm"
                    style={{ width: '100%', marginTop: '0.75rem', gap: '0.4rem', justifyContent: 'center' }}
                  >
                    <CalendarDays size={14} />
                    <span>Réserver cette salle</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      {bookingModalOpen && (
        <div className="modal-overlay" onClick={() => setBookingModalOpen(false)} style={{ zIndex: 1300 }}>
          <form 
            onSubmit={handleCreateBooking} 
            className="modal-container" 
            style={{ maxWidth: '620px', width: '92%' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <CalendarDays size={20} color="var(--s2t-cyan)" />
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800 }}>Réserver une Salle de Réunion S2T</h3>
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
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Titre ou Objet de la Réunion *</label>
                <input
                  type="text"
                  required
                  className="form-input"
                  placeholder="Ex: Réunion Conseil d'Administration / Présentation Client"
                  value={bookingData.title}
                  onChange={(e) => setBookingData({ ...bookingData, title: e.target.value })}
                />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Choix de la Salle S2T *</label>
                <select
                  className="form-select"
                  value={bookingData.room}
                  onChange={(e) => setBookingData({ ...bookingData, room: e.target.value })}
                >
                  {S2T_ROOMS.map(r => (
                    <option key={r.id} value={r.name}>{r.name} ({r.capacity}) - {r.location}</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Date *</label>
                  <input
                    type="date"
                    required
                    className="form-input"
                    value={bookingData.date}
                    onChange={(e) => setBookingData({ ...bookingData, date: e.target.value })}
                  />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Heure Début *</label>
                  <input
                    type="time"
                    required
                    className="form-input"
                    value={bookingData.startTime}
                    onChange={(e) => setBookingData({ ...bookingData, startTime: e.target.value })}
                  />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Heure Fin *</label>
                  <input
                    type="time"
                    required
                    className="form-input"
                    value={bookingData.endTime}
                    onChange={(e) => setBookingData({ ...bookingData, endTime: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
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
                  <label className="form-label">Options d'Accueil</label>
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', height: '42px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.825rem', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={bookingData.isVisio}
                        onChange={(e) => setBookingData({ ...bookingData, isVisio: e.target.checked })}
                      />
                      <span>Visio 4K</span>
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
            </div>

            <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button 
                type="button" 
                className="btn btn-secondary" 
                onClick={() => setBookingModalOpen(false)}
              >
                Annuler
              </button>
              <button 
                type="submit" 
                className="btn btn-primary"
                style={{ gap: '0.5rem' }}
              >
                <Check size={16} />
                <span>Confirmer la réservation</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default ReunionsPage;
