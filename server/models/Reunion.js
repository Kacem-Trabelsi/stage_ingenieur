import mongoose from 'mongoose';

const reunionSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Le titre de la réunion est obligatoire'],
      trim: true,
    },
    room: {
      type: String,
      required: [true, 'Le choix de la salle est obligatoire'],
      trim: true,
    },
    roomId: {
      type: String,
      default: 'room-1',
    },
    date: {
      type: String, // format YYYY-MM-DD
      required: [true, 'La date de la réunion est obligatoire'],
    },
    formattedDate: {
      type: String,
    },
    startTime: {
      type: String, // format HH:mm
      required: [true, "L'heure de début est obligatoire"],
    },
    endTime: {
      type: String, // format HH:mm
      required: [true, "L'heure de fin est obligatoire"],
    },
    organizer: {
      type: String,
      required: true,
    },
    organizerEmail: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    organizerCompany: {
      type: String,
      default: '',
    },
    organizerUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    participants: {
      type: Number,
      default: 6,
      min: 1,
    },
    isVisio: {
      type: Boolean,
      default: true,
    },
    visioLink: {
      type: String,
      default: '',
    },
    needCoffee: {
      type: Boolean,
      default: false,
    },
    equipment: {
      type: [String],
      default: [],
    },
    notes: {
      type: String,
      default: '',
      trim: true,
    },
    status: {
      type: String,
      enum: ['confirme', 'en_attente', 'annule', 'rejete', 'termine'],
      default: 'en_attente',
    },
    cancellationReason: {
      type: String,
      default: '',
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    approvedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Helper method to format date in French
reunionSchema.pre('save', function (next) {
  if (this.date && !this.formattedDate) {
    try {
      const d = new Date(this.date);
      if (!isNaN(d.getTime())) {
        this.formattedDate = new Intl.DateTimeFormat('fr-FR', {
          day: '2-digit',
          month: 'long',
          year: 'numeric',
        }).format(d);
      } else {
        this.formattedDate = this.date;
      }
    } catch (e) {
      this.formattedDate = this.date;
    }
  }
  next();
});

const Reunion = mongoose.model('Reunion', reunionSchema);
export default Reunion;
