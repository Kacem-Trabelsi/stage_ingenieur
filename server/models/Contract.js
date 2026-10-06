import mongoose from 'mongoose';

const amendmentSchema = new mongoose.Schema(
  {
    amendmentNumber: { type: String, required: true },
    type: {
      type: String,
      enum: ['augmentation_superficie', 'reduction_superficie', 'prolongation', 'changement_tarif', 'autre'],
      required: true,
    },
    description: { type: String, required: true },
    oldSurface: { type: Number },
    newSurface: { type: Number },
    oldRate: { type: Number },
    newRate: { type: Number },
    effectiveDate: { type: Date, default: Date.now },
    status: {
      type: String,
      enum: ['en_attente', 'approuve', 'rejete'],
      default: 'en_attente',
    },
    requestedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

const contractSchema = new mongoose.Schema(
  {
    contractNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    companyName: {
      type: String,
      required: true,
    },
    spaceNumber: {
      type: String,
      required: true, // ex: Bureau B-204
    },
    surface: {
      type: Number,
      required: true, // en m²
    },
    // Article 6: Redevance par m²
    ratePerM2: {
      type: Number,
      required: true, // 30, 55, ou 75 DT HTVA/m² par an
    },
    annualRentHT: {
      type: Number,
      required: true,
    },
    monthlyRentHT: {
      type: Number,
      required: true,
    },
    monthlyRentTTC: {
      type: Number,
      required: true,
    },
    // Article 7: Caution (2 mois de redevance)
    depositAmount: {
      type: Number,
      required: true,
    },
    depositPaid: {
      type: Boolean,
      default: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ['actif', 'a_renouveler', 'resilie', 'expire', 'brouillon'],
      default: 'actif',
    },
    // Inclus Article 2
    includedServices: {
      internet: { type: Boolean, default: true },
      secretariat: { type: Boolean, default: true },
      meetingRooms: { type: Boolean, default: true },
      cleaningAndSecurity: { type: Boolean, default: true },
    },
    amendments: [amendmentSchema],
  },
  {
    timestamps: true,
  }
);

const Contract = mongoose.model('Contract', contractSchema);

export default Contract;
