import mongoose from 'mongoose';

const emailSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'L\'expéditeur est obligatoire'],
    },
    senderName: {
      type: String,
      required: true,
      trim: true,
    },
    senderEmail: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    senderRole: {
      type: String,
      default: 'client',
    },
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Le destinataire est obligatoire'],
    },
    recipientName: {
      type: String,
      required: true,
      trim: true,
    },
    recipientEmail: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    subject: {
      type: String,
      required: [true, 'L\'objet du message est obligatoire'],
      trim: true,
    },
    body: {
      type: String,
      required: [true, 'Le corps du message est obligatoire'],
    },
    category: {
      type: String,
      enum: ['general', 'juridique', 'facturation', 'technique', 'urgent', 'reservation'],
      default: 'general',
    },
    tag: {
      type: String,
      default: 'Général',
    },
    tagColor: {
      type: String,
      default: '#2563EB',
    },
    readBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    starredBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    deletedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    attachments: [
      {
        name: { type: String, required: true },
        size: { type: String, default: '100 Ko' },
        url: { type: String, default: '' },
        fileType: { type: String, default: 'application/pdf' },
      },
    ],
    threadId: {
      type: String,
      default: '',
    },
    replyTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Email',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Index for fast query lookups
emailSchema.index({ recipient: 1, createdAt: -1 });
emailSchema.index({ sender: 1, createdAt: -1 });
emailSchema.index({ threadId: 1 });

const Email = mongoose.model('Email', emailSchema);

export default Email;
