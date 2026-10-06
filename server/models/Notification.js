import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null, // null means broadcast/all in recipientRole
    },
    recipientEmail: {
      type: String,
      default: '',
      trim: true,
      lowercase: true,
    },
    recipientRole: {
      type: String,
      enum: ['client', 'admin', 'all'],
      default: 'client',
    },
    title: {
      type: String,
      required: [true, 'Le titre de la notification est obligatoire'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'La description de la notification est obligatoire'],
      trim: true,
    },
    type: {
      type: String,
      enum: [
        'email',
        'redevance',
        'paiement',
        'avenant',
        'contrat',
        'reunion',
        'technique',
        'system',
        'relance',
      ],
      default: 'system',
    },
    category: {
      type: String,
      enum: [
        'Juridique',
        'Facturation',
        'Technique',
        'Réservation',
        'Correspondance',
        'Réglementaire',
        'Recouvrement',
        'Contrat',
        'Direction',
        'Général',
      ],
      default: 'Général',
    },
    severity: {
      type: String,
      enum: ['info', 'warning', 'danger', 'success'],
      default: 'info',
    },
    actionText: {
      type: String,
      default: 'Consulter',
      trim: true,
    },
    actionLink: {
      type: String,
      default: '/dashboard',
      trim: true,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    readBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for fast lookup
notificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ recipientEmail: 1, isRead: 1 });
notificationSchema.index({ recipientRole: 1, createdAt: -1 });

const Notification = mongoose.model('Notification', notificationSchema);

export default Notification;
