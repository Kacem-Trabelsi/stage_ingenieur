import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Le nom est obligatoire'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'L\'adresse email est obligatoire'],
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: [true, 'Le mot de passe est obligatoire'],
      minlength: [6, 'Le mot de passe doit comporter au moins 6 caractères'],
    },
    role: {
      type: String,
      enum: ['client', 'admin', 'juridique', 'finance'],
      default: 'client',
    },
    // Company information for resident enterprises
    companyName: {
      type: String,
      default: '',
      trim: true,
    },
    fiscalId: {
      type: String,
      default: '',
      trim: true,
    },
    phone: {
      type: String,
      default: '',
      trim: true,
    },
    activityType: {
      type: String,
      default: 'TIC / Développement Logiciel',
    },
    officeNumber: {
      type: String,
      default: '',
    },
    surfaceArea: {
      type: Number,
      default: 0, // in m²
    },
    // Account Approval Workflow (Admin must approve new resident accounts)
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    approvedAt: {
      type: Date,
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    rejectionReason: {
      type: String,
      default: '',
    },
    avatar: {
      type: String,
      default: '',
    },
    notifications: {
      rentAlert: { type: Boolean, default: true },
      reminders: { type: Boolean, default: true },
      renewalAlert: { type: Boolean, default: true },
      emailNotif: { type: Boolean, default: true },
    },
    preferences: {
      theme: { type: String, enum: ['light', 'dark'], default: 'light' },
      language: { type: String, enum: ['fr', 'en', 'ar'], default: 'fr' },
    },
    lastPasswordChange: {
      type: Date,
      default: Date.now,
    },
    lastLogin: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);

export default User;
