import Invoice from '../models/Invoice.js';
import Contract from '../models/Contract.js';
import User from '../models/User.js';
import { createNotification, notifyAdmins } from '../services/notificationService.js';

// @desc    Get all invoices (Admin sees all, Client sees own)
// @route   GET /api/invoices
// @access  Private
export const getInvoices = async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'client') {
      query.client = req.user._id;
    }

    const { status, type, search } = req.query;
    if (status && status !== 'all') {
      query.status = status;
    }
    if (type && type !== 'all') {
      query.invoiceType = type;
    }
    if (search) {
      query.$or = [
        { invoiceNumber: { $regex: search, $options: 'i' } },
        { companyName: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const invoices = await Invoice.find(query).populate('client', 'name email companyName phone').sort({ createdAt: -1 });
    res.json(invoices);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single invoice by ID
// @route   GET /api/invoices/:id
// @access  Private
export const getInvoiceById = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id)
      .populate('client', 'name email companyName phone fiscalId')
      .populate('contract');

    if (!invoice) {
      return res.status(404).json({ message: 'Facture introuvable' });
    }

    if (req.user.role === 'client' && invoice.client._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Accès non autorisé à cette facture' });
    }

    res.json(invoice);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create new invoice
// @route   POST /api/invoices
// @access  Private (Admin / Finance)
export const createInvoice = async (req, res) => {
  try {
    const {
      clientId,
      contractId,
      companyName,
      invoiceType,
      description,
      periodMonth,
      amountHT,
      dueDate,
    } = req.body;

    let finalClientId = clientId;
    let finalCompanyName = companyName;

    // If contractId provided, look up contract details
    if (contractId) {
      const contract = await Contract.findById(contractId);
      if (contract) {
        if (!finalClientId) finalClientId = contract.client;
        if (!finalCompanyName) finalCompanyName = contract.companyName;
      }
    }

    if (!finalClientId && finalCompanyName) {
      const user = await User.findOne({
        role: 'client',
        $or: [
          { companyName: new RegExp(`^${finalCompanyName.trim()}$`, 'i') },
          { name: new RegExp(`^${finalCompanyName.trim()}$`, 'i') }
        ]
      });
      if (user) finalClientId = user._id;
    }

    if (!finalClientId) {
      finalClientId = req.user._id;
    }

    const parsedHT = Number(amountHT);
    const tvaAmount = Math.round(parsedHT * 0.19 * 1000) / 1000;
    const timbreFiscal = 1.0;
    const amountTTC = Math.round((parsedHT + tvaAmount + timbreFiscal) * 1000) / 1000;

    const count = await Invoice.countDocuments();
    const invoiceNumber = `FAC-S2T-${new Date().getFullYear()}-${String(count + 1).padStart(4, '0')}`;

    const invoice = await Invoice.create({
      invoiceNumber,
      client: finalClientId,
      contract: contractId || null,
      companyName: finalCompanyName || 'Entreprise Résidente',
      invoiceType: invoiceType || 'loyer_mensuel',
      description: description || `Facturation ${invoiceType || 'loyer'} - ${periodMonth || 'Mois en cours'}`,
      periodMonth: periodMonth || new Date().toLocaleString('fr-FR', { month: 'long', year: 'numeric' }),
      amountHT: parsedHT,
      tvaRate: 19,
      tvaAmount,
      timbreFiscal,
      amountTTC,
      amountPaid: 0,
      remainingAmount: amountTTC,
      status: 'envoyee',
      dueDate: dueDate || new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // Échéance standard
    });

    // Notify resident about new invoice
    await createNotification({
      recipient: finalClientId,
      recipientRole: 'client',
      title: 'Nouvel Avis d\'Échéance de Redevance Locative',
      description: `La facture N° ${invoiceNumber} pour un montant de ${amountTTC.toFixed(3)} DT TTC (${invoice.periodMonth}) est disponible.`,
      type: 'redevance',
      category: 'Facturation',
      severity: 'warning',
      actionText: 'Consulter la facture',
      actionLink: '/dashboard',
      metadata: { invoiceId: invoice._id, invoiceNumber, amountTTC },
    });

    res.status(201).json(invoice);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Generate and send monthly invoice automatically from a contract
// @route   POST /api/invoices/generate-from-contract/:contractId
// @access  Private (Admin / Finance)
export const generateInvoiceFromContract = async (req, res) => {
  try {
    const contract = await Contract.findById(req.params.contractId).populate('client');
    if (!contract) {
      return res.status(404).json({ message: 'Contrat d\'hébergement introuvable.' });
    }

    const currentMonthName = new Date().toLocaleString('fr-FR', { month: 'long', year: 'numeric' });
    const capitalizedMonth = currentMonthName.charAt(0).toUpperCase() + currentMonthName.slice(1);

    // Loyer mensuel HT
    const parsedHT = Number(contract.monthlyRentHT) || Math.round(((Number(contract.surface) * Number(contract.ratePerM2)) / 12) * 1000) / 1000;
    const tvaAmount = Math.round(parsedHT * 0.19 * 1000) / 1000;
    const timbreFiscal = 1.0;
    const amountTTC = Math.round((parsedHT + tvaAmount + timbreFiscal) * 1000) / 1000;

    const count = await Invoice.countDocuments();
    const invoiceNumber = `FAC-S2T-${new Date().getFullYear()}-${String(count + 1).padStart(4, '0')}`;

    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 15); // Payable sous 15 jours

    const invoice = await Invoice.create({
      invoiceNumber,
      client: contract.client?._id || contract.client,
      contract: contract._id,
      companyName: contract.companyName,
      invoiceType: 'loyer_mensuel',
      description: `Loyer mensuel d'hébergement S2T — ${capitalizedMonth} (Contrat N° ${contract.contractNumber})`,
      periodMonth: capitalizedMonth,
      amountHT: parsedHT,
      tvaRate: 19,
      tvaAmount,
      timbreFiscal,
      amountTTC,
      amountPaid: 0,
      remainingAmount: amountTTC,
      status: 'envoyee',
      dueDate,
    });

    // Notify resident
    await createNotification({
      recipient: contract.client?._id || contract.client,
      recipientRole: 'client',
      title: 'Avis d\'Échéance de Loyer Mensuel S2T',
      description: `Facture mensuelle N° ${invoiceNumber} (${amountTTC.toFixed(3)} DT TTC) émise pour le local ${contract.spaceNumber}.`,
      type: 'redevance',
      category: 'Facturation',
      severity: 'warning',
      actionText: 'Régler la redevance',
      actionLink: '/dashboard',
      metadata: { invoiceId: invoice._id, invoiceNumber, amountTTC },
    });

    res.status(201).json({
      invoice,
      message: `Facture ${invoice.invoiceNumber} (${amountTTC.toFixed(3)} DT TTC) émise et transmise directement à la session résidente de "${contract.companyName}".`
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update invoice status / record payment
// @route   PUT /api/invoices/:id/payment
// @access  Private (Admin / Client)
export const updatePayment = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) {
      return res.status(404).json({ message: 'Facture introuvable' });
    }

    if (req.user.role === 'client' && invoice.client.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Accès non autorisé à cette facture' });
    }

    const { amountPaid, paymentMethod, status, receiptFile, transferReference, rejectionReason } = req.body;

    if (receiptFile) {
      invoice.receiptFile = receiptFile;
      invoice.receiptSubmittedAt = new Date();
    }
    if (transferReference) {
      invoice.transferReference = transferReference;
    }
    if (rejectionReason !== undefined) {
      invoice.rejectionReason = rejectionReason;
    }

    if (paymentMethod) {
      invoice.paymentMethod = paymentMethod;
    }

    if (status) {
      invoice.status = status;
      if (status === 'payee') {
        invoice.paymentDate = new Date();
        invoice.amountPaid = invoice.amountTTC;
        invoice.remainingAmount = 0;
        invoice.rejectionReason = '';
      }
    } else if (amountPaid !== undefined) {
      invoice.amountPaid = Number(amountPaid);
      invoice.remainingAmount = Math.max(0, Math.round((invoice.amountTTC - invoice.amountPaid) * 1000) / 1000);
      
      if (invoice.remainingAmount === 0 && invoice.status !== 'en_attente_validation') {
        invoice.status = 'payee';
        invoice.paymentDate = new Date();
      } else if (invoice.amountPaid > 0 && invoice.status !== 'en_attente_validation') {
        invoice.status = 'payee_partiellement';
      }
    }

    await invoice.save();

    // Trigger appropriate notifications depending on action
    if (status === 'en_attente_validation' || receiptFile) {
      // Resident submitted payment proof -> notify Admins
      await notifyAdmins({
        title: 'Justificatif de Paiement Transmis',
        description: `${invoice.companyName} a soumis un justificatif de règlement pour la facture ${invoice.invoiceNumber} (${invoice.amountTTC.toFixed(3)} DT).`,
        type: 'paiement',
        category: 'Facturation',
        severity: 'info',
        actionText: 'Vérifier le virement',
        actionLink: '/dashboard',
        metadata: { invoiceId: invoice._id, invoiceNumber: invoice.invoiceNumber, companyName: invoice.companyName },
      });
    } else if (status === 'payee') {
      // Admin validated payment -> notify Resident
      await createNotification({
        recipient: invoice.client,
        recipientRole: 'client',
        title: 'Paiement Validé — Quittance Libératoire S2T',
        description: `Le règlement de votre facture ${invoice.invoiceNumber} (${invoice.amountTTC.toFixed(3)} DT) a été certifié par le service financier. Quittance disponible.`,
        type: 'paiement',
        category: 'Facturation',
        severity: 'success',
        actionText: 'Télécharger ma quittance',
        actionLink: '/dashboard',
        metadata: { invoiceId: invoice._id, invoiceNumber: invoice.invoiceNumber },
      });
    } else if (rejectionReason && status === 'impayee') {
      // Admin rejected payment proof -> notify Resident
      await createNotification({
        recipient: invoice.client,
        recipientRole: 'client',
        title: 'Justificatif de Paiement Rejeté',
        description: `Le justificatif transmis pour la facture ${invoice.invoiceNumber} a été rejeté. Motif : ${rejectionReason}.`,
        type: 'paiement',
        category: 'Facturation',
        severity: 'danger',
        actionText: 'Régulariser paiement',
        actionLink: '/dashboard',
        metadata: { invoiceId: invoice._id, invoiceNumber: invoice.invoiceNumber },
      });
    }

    res.json(invoice);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Trigger reminder (Relance J+15 ou J+30)
// @route   POST /api/invoices/:id/remind
// @access  Private (Admin / Finance)
export const sendReminder = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) {
      return res.status(404).json({ message: 'Facture introuvable' });
    }

    const { type } = req.body; // 'J+15' | 'J+30' | 'manuel'
    const reminder = {
      type: type || 'J+15',
      sentDate: new Date(),
      message: `Relance ${type || 'automatique'} envoyée pour la facture ${invoice.invoiceNumber} (Reste dû: ${invoice.remainingAmount.toFixed(3)} DT)`,
      status: 'envoye',
    };

    invoice.reminders.push(reminder);
    if (invoice.status === 'envoyee') {
      invoice.status = 'impayee'; // Mark as overdue/impayée after reminder
    }

    await invoice.save();

    // Send Notification to Resident about the reminder
    await createNotification({
      recipient: invoice.client,
      recipientRole: 'client',
      title: `Alerte Relance Réglementaire (${type || 'J+15'})`,
      description: `Rappel d'échéance : La facture ${invoice.invoiceNumber} (${invoice.remainingAmount.toFixed(3)} DT restants) est en souffrance. Merci de régulariser.`,
      type: 'relance',
      category: 'Recouvrement',
      severity: 'danger',
      actionText: 'Régulariser paiement',
      actionLink: '/dashboard',
      metadata: { invoiceId: invoice._id, invoiceNumber: invoice.invoiceNumber, remainingAmount: invoice.remainingAmount },
    });

    res.json(invoice);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get complete financial & contract dashboard metrics (Tableau de bord financier S2T)
// @route   GET /api/invoices/stats
// @access  Private
export const getFinancialStats = async (req, res) => {
  try {
    const isClient = req.user.role === 'client';
    const clientFilter = isClient ? { client: req.user._id } : {};

    // 1. Forecast for next month: sum of monthlyRentTTC of all active contracts
    const activeContracts = await Contract.find({ ...clientFilter, status: 'actif' });
    const monthlyForecast = activeContracts.reduce((acc, c) => acc + (c.monthlyRentTTC || 0), 0);

    // 2. Contracts expiring in 30 days
    const now = new Date();
    const in30Days = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    const expiringContracts = await Contract.find({
      ...clientFilter,
      status: 'actif',
      endDate: { $gte: now, $lte: in30Days },
    });

    // 3. Invoices metrics (Total Impayés, Total Encaissé, Total Facturé)
    const invoices = await Invoice.find(clientFilter);
    const totalInvoiced = invoices.reduce((acc, i) => acc + (i.amountTTC || 0), 0);
    const totalCollected = invoices.reduce((acc, i) => acc + (i.amountPaid || 0), 0);
    const totalUnpaid = invoices.reduce((acc, i) => {
      if (['impayee', 'envoyee', 'payee_partiellement'].includes(i.status)) {
        return acc + (i.remainingAmount || 0);
      }
      return acc;
    }, 0);

    const pendingRemindersCount = invoices.filter(i => i.status === 'impayee' || (i.status === 'envoyee' && new Date(i.dueDate) < now)).length;

    res.json({
      monthlyForecast: Math.round(monthlyForecast * 1000) / 1000,
      activeContractsCount: activeContracts.length,
      expiringContractsCount: expiringContracts.length,
      expiringContracts,
      totalInvoiced: Math.round(totalInvoiced * 1000) / 1000,
      totalCollected: Math.round(totalCollected * 1000) / 1000,
      totalUnpaid: Math.round(totalUnpaid * 1000) / 1000,
      pendingRemindersCount,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
