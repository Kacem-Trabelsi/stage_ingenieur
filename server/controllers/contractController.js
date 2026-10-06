import Contract from '../models/Contract.js';
import User from '../models/User.js';
import { createNotification, notifyAdmins } from '../services/notificationService.js';

// @desc    Get all contracts (Admin sees all, Client sees own)
// @route   GET /api/contracts
// @access  Private
export const getContracts = async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'client') {
      query.client = req.user._id;
    }

    const { status, search } = req.query;
    if (status && status !== 'all') {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { companyName: { $regex: search, $options: 'i' } },
        { contractNumber: { $regex: search, $options: 'i' } },
        { spaceNumber: { $regex: search, $options: 'i' } },
      ];
    }

    const contracts = await Contract.find(query).populate('client', 'name email companyName phone').sort({ createdAt: -1 });
    res.json(contracts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get contract by ID
// @route   GET /api/contracts/:id
// @access  Private
export const getContractById = async (req, res) => {
  try {
    const contract = await Contract.findById(req.params.id).populate('client', 'name email companyName phone fiscalId');

    if (!contract) {
      return res.status(404).json({ message: 'Contrat introuvable' });
    }

    if (req.user.role === 'client' && contract.client._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Accès refusé à ce contrat' });
    }

    res.json(contract);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get resident clients without an active contract
// @route   GET /api/contracts/uncontracted-residents
// @access  Private (Admin / Juridique / Finance)
export const getUncontractedResidents = async (req, res) => {
  try {
    // 1. Get all active or non-terminated contracts
    const activeContracts = await Contract.find({ status: { $ne: 'resilie' } }).select('client companyName');
    
    // Extract set of client IDs and lowercase company names already contracted
    const contractedClientIds = new Set(
      activeContracts.map((c) => c.client?.toString()).filter(Boolean)
    );
    const contractedCompanyNames = new Set(
      activeContracts.map((c) => (c.companyName || '').trim().toLowerCase()).filter(Boolean)
    );

    // 2. Find all client users (status not rejected)
    const residentUsers = await User.find({
      role: 'client',
      status: { $ne: 'rejected' },
    }).select('-password').sort({ companyName: 1, name: 1 });

    // 3. Filter only those without a contract
    const uncontractedResidents = residentUsers.filter((user) => {
      const idMatch = contractedClientIds.has(user._id.toString());
      const nameMatch = user.companyName && contractedCompanyNames.has(user.companyName.trim().toLowerCase());
      return !idMatch && !nameMatch;
    });

    res.json(uncontractedResidents);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create new contract (S2T Juridique)
// @route   POST /api/contracts
// @access  Private (Admin / Juridique)
export const createContract = async (req, res) => {
  try {
    const {
      clientId,
      companyName,
      spaceNumber,
      surface,
      ratePerM2,
      startDate,
      endDate,
    } = req.body;

    let finalClientId = clientId;
    if (!finalClientId && companyName) {
      const foundUser = await User.findOne({
        role: 'client',
        $or: [
          { companyName: new RegExp(`^${companyName.trim()}$`, 'i') },
          { name: new RegExp(`^${companyName.trim()}$`, 'i') }
        ]
      });
      if (foundUser) {
        finalClientId = foundUser._id;
      }
    }

    if (!finalClientId) {
      finalClientId = req.user._id;
    }

    const annualRentHT = Number(surface) * Number(ratePerM2);
    const monthlyRentHT = annualRentHT / 12;
    const monthlyRentTTC = monthlyRentHT * 1.19; // + 19% TVA
    const depositAmount = monthlyRentTTC * 2; // Article 7: 2 mois de redevance

    const count = await Contract.countDocuments();
    const contractNumber = `CT-S2T-${new Date().getFullYear()}-${String(count + 1).padStart(4, '0')}`;

    const contract = await Contract.create({
      contractNumber,
      client: finalClientId,
      companyName: companyName ? companyName.trim() : 'Entreprise Résidente',
      spaceNumber: spaceNumber || 'Bureau B-204',
      surface: Number(surface) || 40,
      ratePerM2: Number(ratePerM2) || 55,
      annualRentHT: Math.round(annualRentHT * 1000) / 1000,
      monthlyRentHT: Math.round(monthlyRentHT * 1000) / 1000,
      monthlyRentTTC: Math.round(monthlyRentTTC * 1000) / 1000,
      depositAmount: Math.round(depositAmount * 1000) / 1000,
      startDate,
      endDate,
      status: 'actif',
    });

    // Notify resident about new contract
    await createNotification({
      recipient: finalClientId,
      recipientRole: 'client',
      title: 'Nouvelle Convention d\'Hébergement S2T',
      description: `Votre contrat N° ${contractNumber} pour l'espace ${spaceNumber || 'Bureau'} a été établi par la Direction Juridique.`,
      type: 'contrat',
      category: 'Juridique',
      severity: 'success',
      actionText: 'Voir mon contrat',
      actionLink: '/dashboard',
      metadata: { contractId: contract._id, contractNumber },
    });

    res.status(201).json(contract);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Request an amendment (Demande d'avenant - réduction/augmentation superficie ou prolongation)
// @route   POST /api/contracts/:id/amendments
// @access  Private
export const requestAmendment = async (req, res) => {
  try {
    const contract = await Contract.findById(req.params.id);
    if (!contract) {
      return res.status(404).json({ message: 'Contrat introuvable' });
    }

    const { type, description, newSurface, newRate } = req.body;
    const amendmentCount = contract.amendments.length + 1;
    const amendmentNumber = `AV-${contract.contractNumber}-${amendmentCount}`;

    const newAmendment = {
      amendmentNumber,
      type,
      description,
      oldSurface: contract.surface,
      newSurface: newSurface || contract.surface,
      oldRate: contract.ratePerM2,
      newRate: newRate || contract.ratePerM2,
      status: 'en_attente',
      requestedBy: req.user._id,
    };

    contract.amendments.push(newAmendment);
    await contract.save();

    // Notify Admins about new amendment request
    const typeLabel = type === 'augmentation_superficie' ? 'Extension de surface' : type === 'reduction_superficie' ? 'Réduction de surface' : 'Prolongation de bail';
    await notifyAdmins({
      title: 'Nouvelle Demande d\'Avenant Déposée',
      description: `${contract.companyName} a déposé une demande d'avenant (${typeLabel}) pour le contrat ${contract.contractNumber}.`,
      type: 'avenant',
      category: 'Juridique',
      severity: 'warning',
      actionText: 'Examiner la demande',
      actionLink: '/dashboard',
      metadata: { contractId: contract._id, amendmentNumber, companyName: contract.companyName },
    });

    res.status(201).json(contract);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Approve / Reject amendment (Admin / Juridique)
// @route   PUT /api/contracts/:id/amendments/:amendmentId
// @access  Private (Admin / Juridique)
export const handleAmendment = async (req, res) => {
  try {
    const contract = await Contract.findById(req.params.id);
    if (!contract) {
      return res.status(404).json({ message: 'Contrat introuvable' });
    }

    const amendment = contract.amendments.id(req.params.amendmentId);
    if (!amendment) {
      return res.status(404).json({ message: 'Avenant introuvable' });
    }

    const { action } = req.body; // 'approuve' | 'rejete'
    amendment.status = action;
    amendment.approvedBy = req.user._id;

    if (action === 'approuve') {
      if (amendment.newSurface) {
        contract.surface = amendment.newSurface;
      }
      if (amendment.newRate) {
        contract.ratePerM2 = amendment.newRate;
      }

      // Recalculate rent
      const annualRentHT = contract.surface * contract.ratePerM2;
      contract.annualRentHT = Math.round(annualRentHT * 1000) / 1000;
      contract.monthlyRentHT = Math.round((annualRentHT / 12) * 1000) / 1000;
      contract.monthlyRentTTC = Math.round((contract.monthlyRentHT * 1.19) * 1000) / 1000;
    }

    await contract.save();

    // Notify resident about amendment decision
    if (action === 'approuve') {
      await createNotification({
        recipient: contract.client,
        recipientRole: 'client',
        title: 'Avenant Validé par la Direction S2T',
        description: `Votre avenant N° ${amendment.amendmentNumber} au contrat ${contract.contractNumber} a été validé et scellé.`,
        type: 'avenant',
        category: 'Juridique',
        severity: 'success',
        actionText: 'Voir mon contrat',
        actionLink: '/dashboard',
        metadata: { contractId: contract._id, amendmentNumber: amendment.amendmentNumber },
      });
    } else {
      await createNotification({
        recipient: contract.client,
        recipientRole: 'client',
        title: 'Décision Juridique — Demande d\'Avenant Rejetée',
        description: `Votre demande d'avenant N° ${amendment.amendmentNumber} a été rejetée par la commission S2T.`,
        type: 'avenant',
        category: 'Juridique',
        severity: 'danger',
        actionText: 'Détails du contrat',
        actionLink: '/dashboard',
        metadata: { contractId: contract._id, amendmentNumber: amendment.amendmentNumber },
      });
    }

    res.json(contract);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
