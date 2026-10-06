import mongoose from 'mongoose';

const reminderSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['J+15', 'J+30', 'manuel'],
    required: true,
  },
  sentDate: { type: Date, default: Date.now },
  message: { type: String },
  status: { type: String, enum: ['envoye', 'erreur'], default: 'envoye' },
});

const invoiceSchema = new mongoose.Schema(
  {
    invoiceNumber: {
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
    contract: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Contract',
    },
    companyName: {
      type: String,
      required: true,
    },
    invoiceType: {
      type: String,
      enum: ['loyer_mensuel', 'charges', 'prestation_ponctuelle', 'caution', 'regularisation'],
      default: 'loyer_mensuel',
    },
    description: {
      type: String,
      required: true,
    },
    periodMonth: {
      type: String, // ex: "Mars 2026"
    },
    amountHT: {
      type: Number,
      required: true,
    },
    tvaRate: {
      type: Number,
      default: 19, // 19% TVA
    },
    tvaAmount: {
      type: Number,
      required: true,
    },
    timbreFiscal: {
      type: Number,
      default: 1.0, // 1.000 DT timbre
    },
    amountTTC: {
      type: Number,
      required: true,
    },
    amountPaid: {
      type: Number,
      default: 0,
    },
    remainingAmount: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ['brouillon', 'envoyee', 'en_attente_validation', 'payee_partiellement', 'payee', 'impayee', 'annulee'],
      default: 'envoyee',
    },
    issueDate: {
      type: Date,
      default: Date.now,
    },
    dueDate: {
      type: Date,
      required: true, // Payable avant le 5 de chaque mois (Article 6.3)
    },
    paymentDate: {
      type: Date,
    },
    paymentMethod: {
      type: String,
      enum: ['virement', 'ordre_permanent', 'cheque', 'especes', 'carte', 'en_attente'],
      default: 'en_attente',
    },
    receiptFile: {
      type: String,
      default: '',
    },
    transferReference: {
      type: String,
      default: '',
    },
    receiptSubmittedAt: {
      type: Date,
    },
    rejectionReason: {
      type: String,
      default: '',
    },
    reminders: [reminderSchema],
  },
  {
    timestamps: true,
  }
);

const Invoice = mongoose.model('Invoice', invoiceSchema);

export default Invoice;
