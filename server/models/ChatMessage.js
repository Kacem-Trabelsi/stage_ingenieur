import mongoose from 'mongoose';

const attachmentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  size: { type: String, default: '0 KB' },
  type: { type: String, default: 'application/pdf' },
  url: { type: String, default: '' },
  dataUrl: { type: String, default: '' },
  isImage: { type: Boolean, default: false },
});

const audioSchema = new mongoose.Schema({
  url: { type: String, default: '' },
  duration: { type: Number, default: 0 }, // in seconds
  waveform: [{ type: Number }],
});

const chatMessageSchema = new mongoose.Schema(
  {
    channelId: {
      type: String,
      required: true,
      default: 'direction',
      index: true,
    },
    channelType: {
      type: String,
      enum: ['department', 'ia', 'direct'],
      default: 'direct',
    },
    department: {
      type: String,
      default: 'Direction S2T',
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false, // Optional for AI / System bot replies
    },
    senderName: {
      type: String,
      required: true,
      default: 'Utilisateur S2T',
    },
    senderRole: {
      type: String,
      enum: ['client', 'admin', 'juridique', 'finance', 'ai', 'system'],
      default: 'client',
    },
    senderEmail: {
      type: String,
      default: '',
    },
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    recipientEmail: {
      type: String,
      default: '',
    },
    companyName: {
      type: String,
      default: '',
    },
    text: {
      type: String,
      default: '',
      trim: true,
    },
    attachments: [attachmentSchema],
    audio: audioSchema,
    messageType: {
      type: String,
      enum: ['text', 'image', 'document', 'audio', 'call', 'mixed'],
      default: 'text',
    },
    callDuration: {
      type: Number,
      default: 0, // in seconds
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    isAi: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Helpful index for fast channel and user history lookups
chatMessageSchema.index({ channelId: 1, senderEmail: 1, createdAt: 1 });
chatMessageSchema.index({ recipientEmail: 1, createdAt: 1 });
chatMessageSchema.index({ companyName: 1, createdAt: 1 });

const ChatMessage = mongoose.model('ChatMessage', chatMessageSchema);

export default ChatMessage;
