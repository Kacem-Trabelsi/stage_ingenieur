import Reunion from '../models/Reunion.js';
import User from '../models/User.js';
import { createNotification } from '../services/notificationService.js';

// Official S2T Rooms Definition
export const S2T_ROOMS_DATA = [
  {
    id: 'room-1',
    name: 'Salle Polyvalente Ibn Khaldoun',
    location: 'Bâtiment Central El Ghazala — RDC',
    capacity: '50 personnes',
    maxParticipants: 50,
    equipment: ['Écran 4K 85"', 'Réseau Fibre 5G Dédié', 'Système Son & Micros', 'Visioconférence Teams/Zoom'],
    badgeColor: '#10B981',
    image: 'https://images.unsplash.com/photo-1517502884422-41eaead166d4?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 'room-2',
    name: 'Salle Innovation & Pitch B-101',
    location: 'Bâtiment TIC 1 — 1er Étage',
    capacity: '16 personnes',
    maxParticipants: 16,
    equipment: ['Double Écran Visio', 'Tableau Interactif', 'Caméra Cadrage Auto 4K', 'Connexion Fibre'],
    badgeColor: 'var(--s2t-blue)',
    image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 'room-3',
    name: 'Espace Brainstorming Pépinière TIC',
    location: 'Pépinière des Entreprises — Aile A',
    capacity: '8 personnes',
    maxParticipants: 8,
    equipment: ['Écran Collaboratif', 'Paperboard Numérique', 'Wi-Fi 6 Haut Débit'],
    badgeColor: 'var(--s2t-teal)',
    image: 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=600&auto=format&fit=crop&q=80',
  },
];

/**
 * @desc    Get all meetings with filters & sorting
 * @route   GET /api/reunions
 * @access  Private
 */
export const getReunions = async (req, res) => {
  try {
    const { room, status, search, date } = req.query;
    const user = req.user;

    const query = {};

    if (room && room !== 'all') {
      query.room = { $regex: room, $options: 'i' };
    }

    if (status && status !== 'all') {
      query.status = status;
    }

    if (date) {
      query.date = date;
    }

    if (search && search.trim()) {
      query.$or = [
        { title: { $regex: search.trim(), $options: 'i' } },
        { organizer: { $regex: search.trim(), $options: 'i' } },
        { room: { $regex: search.trim(), $options: 'i' } },
        { notes: { $regex: search.trim(), $options: 'i' } },
      ];
    }

    const meetings = await Reunion.find(query)
      .sort({ date: 1, startTime: 1 })
      .lean();

    const formattedMeetings = meetings.map((m) => {
      let formattedDate = m.formattedDate;
      if (!formattedDate && m.date) {
        try {
          formattedDate = new Intl.DateTimeFormat('fr-FR', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
          }).format(new Date(m.date));
        } catch (e) {
          formattedDate = m.date;
        }
      }

      return {
        id: m._id,
        _id: m._id,
        title: m.title,
        room: m.room,
        roomId: m.roomId,
        date: m.date,
        formattedDate: formattedDate || m.date,
        time: `${m.startTime} - ${m.endTime}`,
        startTime: m.startTime,
        endTime: m.endTime,
        organizer: m.organizer,
        organizerEmail: m.organizerEmail,
        organizerCompany: m.organizerCompany,
        participants: m.participants,
        isVisio: m.isVisio,
        visioLink: m.visioLink || `https://meet.s2t.tn/el-ghazala-${m._id.toString().slice(-4)}`,
        needCoffee: m.needCoffee,
        equipment: m.equipment || [],
        notes: m.notes || '',
        status: m.status || 'en_attente',
        cancellationReason: m.cancellationReason || '',
        approvedAt: m.approvedAt,
        createdAt: m.createdAt,
        isOwner: user.role === 'admin' || m.organizerEmail === user.email || String(m.organizerUser) === String(user._id),
      };
    });

    res.json(formattedMeetings);
  } catch (error) {
    console.error('Erreur getReunions:', error);
    res.status(500).json({ message: 'Erreur lors du chargement des réunions' });
  }
};

/**
 * @desc    Get single meeting by ID
 * @route   GET /api/reunions/:id
 * @access  Private
 */
export const getReunionById = async (req, res) => {
  try {
    const meeting = await Reunion.findById(req.params.id);
    if (!meeting) {
      return res.status(404).json({ message: 'Réunion introuvable' });
    }
    res.json(meeting);
  } catch (error) {
    console.error('Erreur getReunionById:', error);
    res.status(500).json({ message: 'Erreur serveur lors de la récupération de la réunion' });
  }
};

/**
 * @desc    Get booked slots for a specific room and date
 * @route   GET /api/reunions/booked-slots
 * @access  Private
 */
export const getBookedSlots = async (req, res) => {
  try {
    const { room, date } = req.query;
    if (!room || !date) {
      return res.json([]);
    }

    const booked = await Reunion.find({
      room: room.trim(),
      date,
      status: { $in: ['confirme', 'en_attente'] },
    })
      .select('title startTime endTime organizer organizerCompany status')
      .sort({ startTime: 1 })
      .lean();

    res.json(booked);
  } catch (error) {
    console.error('Erreur getBookedSlots:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des créneaux occupés' });
  }
};

/**
 * @desc    Create a new meeting room booking (Client -> en_attente, Admin -> confirme)
 * @route   POST /api/reunions
 * @access  Private
 */
export const createReunion = async (req, res) => {
  try {
    const user = req.user;
    const {
      title,
      room,
      date,
      startTime,
      endTime,
      participants = 6,
      isVisio = true,
      needCoffee = false,
      equipment = [],
      notes = '',
    } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ message: 'Le titre ou objet de la réunion est obligatoire' });
    }

    if (!room || !room.trim()) {
      return res.status(400).json({ message: 'Veuillez sélectionner une salle de réunion' });
    }

    if (!date) {
      return res.status(400).json({ message: 'La date de la réunion est obligatoire' });
    }

    if (!startTime || !endTime) {
      return res.status(400).json({ message: 'Les heures de début et de fin sont obligatoires' });
    }

    if (startTime >= endTime) {
      return res.status(400).json({ message: "L'heure de début doit être antérieure à l'heure de fin" });
    }

    // 1. Strict Conflict checking: Check if room is already booked on the same date with overlapping times
    const conflict = await Reunion.findOne({
      room: room.trim(),
      date,
      status: { $in: ['confirme', 'en_attente'] },
      $or: [
        {
          startTime: { $lt: endTime },
          endTime: { $gt: startTime },
        },
      ],
    });

    if (conflict) {
      return res.status(409).json({
        message: `La salle "${room}" est déjà réservée le ${date} de ${conflict.startTime} à ${conflict.endTime} pour "${conflict.title}". Veuillez choisir un autre créneau horaire ou une autre salle.`,
        conflictMeeting: {
          title: conflict.title,
          startTime: conflict.startTime,
          endTime: conflict.endTime,
          organizer: conflict.organizer,
          status: conflict.status,
        },
      });
    }

    // Determine roomId from room name
    const foundRoom = S2T_ROOMS_DATA.find((r) => r.name === room.trim());
    const roomId = foundRoom ? foundRoom.id : 'room-1';

    // Format French date
    let formattedDate = '';
    try {
      formattedDate = new Intl.DateTimeFormat('fr-FR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      }).format(new Date(date));
    } catch (e) {
      formattedDate = date;
    }

    // Generate secure video link
    const uniqueSlug = Math.random().toString(36).substring(2, 8);
    const visioLink = isVisio ? `https://meet.s2t.tn/el-ghazala-${uniqueSlug}` : '';

    const organizerName = user.role === 'admin'
      ? (user.name || 'Direction S2T')
      : `${user.name} (${user.companyName || 'Entreprise Résidente'})`;

    const initialStatus = user.role === 'admin' ? 'confirme' : 'en_attente';

    const meeting = await Reunion.create({
      title: title.trim(),
      room: room.trim(),
      roomId,
      date,
      formattedDate,
      startTime,
      endTime,
      organizer: organizerName,
      organizerEmail: user.email,
      organizerCompany: user.companyName || '',
      organizerUser: user._id,
      participants: Number(participants) || 6,
      isVisio: Boolean(isVisio),
      visioLink,
      needCoffee: Boolean(needCoffee),
      equipment: Array.isArray(equipment) && equipment.length > 0
        ? equipment
        : (foundRoom ? foundRoom.equipment : []),
      notes: (notes || '').trim(),
      status: initialStatus,
      approvedBy: user.role === 'admin' ? user._id : undefined,
      approvedAt: user.role === 'admin' ? new Date() : undefined,
    });

    // Notify administration and organizer
    if (user.role === 'admin') {
      await createNotification({
        recipientEmail: user.email,
        recipientRole: 'admin',
        title: '📅 Réservation de Salle Confirmée',
        description: `Votre réunion "${meeting.title}" dans la salle "${meeting.room}" a été confirmée pour le ${meeting.formattedDate} (${meeting.startTime} - ${meeting.endTime}).`,
        type: 'reunion',
        category: 'Réservation',
        severity: 'success',
        actionText: 'Voir la réservation',
        actionLink: '/reunions',
        metadata: { reunionId: meeting._id, room: meeting.room, date: meeting.date },
      });
    } else {
      // Client submission -> Notify client of submission
      await createNotification({
        recipientEmail: user.email,
        recipientRole: 'client',
        title: '📋 Demande de Réservation Transmise',
        description: `Votre demande pour "${meeting.title}" dans la salle "${meeting.room}" (${meeting.formattedDate} de ${meeting.startTime} à ${meeting.endTime}) a été transmise à la Direction S2T pour validation.`,
        type: 'reunion',
        category: 'Réservation',
        severity: 'info',
        actionText: 'Suivre la demande',
        actionLink: '/reunions',
        metadata: { reunionId: meeting._id, room: meeting.room, date: meeting.date },
      });

      // Notify all admins of pending request requiring validation
      const adminUsers = await User.find({ role: 'admin' }).select('_id email');
      for (const admin of adminUsers) {
        await createNotification({
          recipient: admin._id,
          recipientEmail: admin.email,
          recipientRole: 'admin',
          title: '🏢 Nouvelle Demande de Salle à Valider',
          description: `${user.companyName || user.name} sollicite la salle "${meeting.room}" le ${meeting.formattedDate} (${meeting.startTime} - ${meeting.endTime}). Action de confirmation requise.`,
          type: 'reunion',
          category: 'Réservation',
          severity: 'warning',
          actionText: 'Valider la réservation',
          actionLink: '/reunions',
          metadata: { reunionId: meeting._id, companyName: user.companyName },
        });
      }
    }

    // Socket.IO real-time emission
    const io = req.app.get('io');
    if (io) {
      io.emit('reunion_created', {
        id: meeting._id,
        title: meeting.title,
        room: meeting.room,
        date: meeting.date,
        time: `${meeting.startTime} - ${meeting.endTime}`,
        organizer: meeting.organizer,
        status: meeting.status,
      });
    }

    res.status(201).json({
      success: true,
      message: user.role === 'admin' 
        ? 'Réservation de salle confirmée avec succès' 
        : 'Votre demande de réservation a été transmise à la Direction S2T pour validation',
      meeting: {
        id: meeting._id,
        _id: meeting._id,
        title: meeting.title,
        room: meeting.room,
        roomId: meeting.roomId,
        date: meeting.date,
        formattedDate: meeting.formattedDate,
        time: `${meeting.startTime} - ${meeting.endTime}`,
        startTime: meeting.startTime,
        endTime: meeting.endTime,
        organizer: meeting.organizer,
        organizerEmail: meeting.organizerEmail,
        organizerCompany: meeting.organizerCompany,
        participants: meeting.participants,
        isVisio: meeting.isVisio,
        visioLink: meeting.visioLink,
        needCoffee: meeting.needCoffee,
        equipment: meeting.equipment,
        notes: meeting.notes,
        status: meeting.status,
        isOwner: true,
      },
    });
  } catch (error) {
    console.error('Erreur createReunion:', error);
    res.status(500).json({ message: 'Erreur lors de la création de la réservation de salle' });
  }
};

/**
 * @desc    Update a meeting booking
 * @route   PUT /api/reunions/:id
 * @access  Private
 */
export const updateReunion = async (req, res) => {
  try {
    const user = req.user;
    const meeting = await Reunion.findById(req.params.id);

    if (!meeting) {
      return res.status(404).json({ message: 'Réunion introuvable' });
    }

    // Permission check
    if (user.role !== 'admin' && meeting.organizerEmail !== user.email && String(meeting.organizerUser) !== String(user._id)) {
      return res.status(403).json({ message: 'Vous n\'êtes pas autorisé à modifier cette réunion' });
    }

    const {
      title,
      room,
      date,
      startTime,
      endTime,
      participants,
      isVisio,
      needCoffee,
      equipment,
      notes,
    } = req.body;

    const newRoom = room ? room.trim() : meeting.room;
    const newDate = date || meeting.date;
    const newStart = startTime || meeting.startTime;
    const newEnd = endTime || meeting.endTime;

    if (newStart >= newEnd) {
      return res.status(400).json({ message: "L'heure de début doit être antérieure à l'heure de fin" });
    }

    // Check conflict excluding current meeting
    const conflict = await Reunion.findOne({
      _id: { $ne: meeting._id },
      room: newRoom,
      date: newDate,
      status: { $in: ['confirme', 'en_attente'] },
      $or: [
        {
          startTime: { $lt: newEnd },
          endTime: { $gt: newStart },
        },
      ],
    });

    if (conflict) {
      return res.status(409).json({
        message: `La salle "${newRoom}" est déjà réservée le ${newDate} de ${conflict.startTime} à ${conflict.endTime}.`,
      });
    }

    if (title) meeting.title = title.trim();
    if (room) meeting.room = newRoom;
    if (date) {
      meeting.date = newDate;
      try {
        meeting.formattedDate = new Intl.DateTimeFormat('fr-FR', {
          day: '2-digit',
          month: 'long',
          year: 'numeric',
        }).format(new Date(newDate));
      } catch (e) {
        meeting.formattedDate = newDate;
      }
    }
    if (startTime) meeting.startTime = newStart;
    if (endTime) meeting.endTime = newEnd;
    if (participants !== undefined) meeting.participants = Number(participants);
    if (isVisio !== undefined) meeting.isVisio = Boolean(isVisio);
    if (needCoffee !== undefined) meeting.needCoffee = Boolean(needCoffee);
    if (equipment !== undefined) meeting.equipment = equipment;
    if (notes !== undefined) meeting.notes = notes.trim();

    await meeting.save();

    res.json({
      success: true,
      message: 'Réunion mise à jour avec succès',
      meeting,
    });
  } catch (error) {
    console.error('Erreur updateReunion:', error);
    res.status(500).json({ message: 'Erreur lors de la mise à jour de la réunion' });
  }
};

/**
 * @desc    Change meeting status (Admin confirms/rejects or Owner cancels)
 * @route   PATCH /api/reunions/:id/status
 * @access  Private
 */
export const updateReunionStatus = async (req, res) => {
  try {
    const user = req.user;
    const { status, cancellationReason = '' } = req.body;
    const meeting = await Reunion.findById(req.params.id);

    if (!meeting) {
      return res.status(404).json({ message: 'Réunion introuvable' });
    }

    const isAdmin = user.role === 'admin';
    const isOwner = meeting.organizerEmail === user.email || String(meeting.organizerUser) === String(user._id);

    if (!isAdmin && !isOwner) {
      return res.status(403).json({ message: 'Action non autorisée' });
    }

    // Clients can only cancel their own meetings
    if (!isAdmin && isOwner && status !== 'annule') {
      return res.status(403).json({ message: 'Seule la Direction S2T peut valider ou refuser une réservation' });
    }

    if (!['confirme', 'en_attente', 'annule', 'rejete', 'termine'].includes(status)) {
      return res.status(400).json({ message: 'Statut invalide' });
    }

    meeting.status = status;
    if (cancellationReason) {
      meeting.cancellationReason = cancellationReason.trim();
    }

    if (status === 'confirme') {
      meeting.approvedBy = user._id;
      meeting.approvedAt = new Date();

      // Notify the resident that their booking is approved!
      await createNotification({
        recipientEmail: meeting.organizerEmail,
        recipientRole: 'client',
        title: '✅ Réservation de Salle Validée',
        description: `Votre réunion "${meeting.title}" dans la salle "${meeting.room}" le ${meeting.formattedDate} (${meeting.startTime} - ${meeting.endTime}) a été confirmée et scellée par la Direction S2T.`,
        type: 'reunion',
        category: 'Réservation',
        severity: 'success',
        actionText: 'Voir la réservation',
        actionLink: '/reunions',
        metadata: { reunionId: meeting._id, room: meeting.room, date: meeting.date },
      });
    } else if (status === 'rejete') {
      meeting.cancellationReason = cancellationReason.trim() || 'Créneau indisponible ou impératif technique';

      // Notify resident of rejection
      await createNotification({
        recipientEmail: meeting.organizerEmail,
        recipientRole: 'client',
        title: '❌ Demande de Réservation Rejetée',
        description: `Votre demande pour "${meeting.title}" dans la salle "${meeting.room}" (${meeting.formattedDate}) a été refusée par la Direction S2T. Motif : ${meeting.cancellationReason}`,
        type: 'reunion',
        category: 'Réservation',
        severity: 'warning',
        actionText: 'Choisir un autre créneau',
        actionLink: '/reunions',
        metadata: { reunionId: meeting._id, room: meeting.room, date: meeting.date },
      });
    } else if (status === 'annule') {
      // Cancellation notification
      await createNotification({
        recipientEmail: meeting.organizerEmail,
        recipientRole: 'client',
        title: '⚠️ Réservation de Salle Annulée',
        description: `La réunion "${meeting.title}" prévue le ${meeting.formattedDate} dans la salle "${meeting.room}" a été annulée.`,
        type: 'reunion',
        category: 'Réservation',
        severity: 'warning',
        actionText: 'Consulter l\'agenda',
        actionLink: '/reunions',
      });
    }

    await meeting.save();

    const io = req.app.get('io');
    if (io) {
      io.emit('reunion_updated', {
        id: meeting._id,
        status: meeting.status,
        room: meeting.room,
        date: meeting.date,
        time: `${meeting.startTime} - ${meeting.endTime}`,
      });
    }

    res.json({
      success: true,
      message: status === 'confirme' 
        ? 'Réservation confirmée avec succès' 
        : status === 'rejete' 
        ? 'Demande de réservation refusée' 
        : 'Réservation annulée',
      meeting,
    });
  } catch (error) {
    console.error('Erreur updateReunionStatus:', error);
    res.status(500).json({ message: 'Erreur lors de la mise à jour du statut' });
  }
};

/**
 * @desc    Delete a meeting booking
 * @route   DELETE /api/reunions/:id
 * @access  Private
 */
export const deleteReunion = async (req, res) => {
  try {
    const user = req.user;
    const meeting = await Reunion.findById(req.params.id);

    if (!meeting) {
      return res.status(404).json({ message: 'Réunion introuvable' });
    }

    if (user.role !== 'admin' && meeting.organizerEmail !== user.email && String(meeting.organizerUser) !== String(user._id)) {
      return res.status(403).json({ message: 'Vous n\'êtes pas autorisé à supprimer cette réunion' });
    }

    await Reunion.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Réservation supprimée avec succès',
    });
  } catch (error) {
    console.error('Erreur deleteReunion:', error);
    res.status(500).json({ message: 'Erreur lors de la suppression de la réunion' });
  }
};

/**
 * @desc    Get Technopark Rooms with live availability status and booked slots
 * @route   GET /api/reunions/rooms
 * @access  Private
 */
export const getRooms = async (req, res) => {
  try {
    const { date, startTime, endTime } = req.query;

    const checkDate = date || new Date().toISOString().split('T')[0];

    // Check active meetings for this date
    const query = {
      date: checkDate,
      status: { $in: ['confirme', 'en_attente'] },
    };

    const bookedMeetings = await Reunion.find(query)
      .select('room startTime endTime title organizer status isVisio participants')
      .lean();

    const roomsWithStatus = S2T_ROOMS_DATA.map((room) => {
      const activeBookings = bookedMeetings.filter((b) => b.room === room.name);
      
      let isOccupied = false;
      if (startTime && endTime) {
        isOccupied = activeBookings.some((b) => b.startTime < endTime && b.endTime > startTime);
      } else {
        isOccupied = activeBookings.length > 0;
      }

      return {
        ...room,
        status: isOccupied ? 'occupee' : 'disponible',
        statusLabel: isOccupied ? 'Occupée' : 'Disponible',
        activeBookings,
        bookedCount: activeBookings.length,
      };
    });

    res.json(roomsWithStatus);
  } catch (error) {
    console.error('Erreur getRooms:', error);
    res.status(500).json({ message: 'Erreur lors du chargement des salles S2T' });
  }
};

/**
 * @desc    Get Meeting Statistics & KPIs
 * @route   GET /api/reunions/stats
 * @access  Private
 */
export const getReunionStats = async (req, res) => {
  try {
    const totalMeetings = await Reunion.countDocuments({ status: { $ne: 'annule' } });
    const today = new Date().toISOString().split('T')[0];
    const upcomingMeetings = await Reunion.countDocuments({ date: { $gte: today }, status: 'confirme' });
    const pendingMeetings = await Reunion.countDocuments({ status: 'en_attente' });
    const visioMeetings = await Reunion.countDocuments({ isVisio: true, status: 'confirme' });
    const cancelledMeetings = await Reunion.countDocuments({ status: { $in: ['annule', 'rejete'] } });

    res.json({
      totalMeetings,
      upcomingMeetings,
      pendingMeetings,
      visioMeetings,
      cancelledMeetings,
      roomsCount: S2T_ROOMS_DATA.length,
    });
  } catch (error) {
    console.error('Erreur getReunionStats:', error);
    res.status(500).json({ message: 'Erreur lors du calcul des statistiques de réunions' });
  }
};
