import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Helper to generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'fallback_secret', {
    expiresIn: '30d',
  });
};

// @desc    Register a new user / resident application
// @route   POST /api/auth/register
// @access  Public
export const registerUser = async (req, res) => {
  try {
    const { 
      name, 
      email, 
      password, 
      role = 'client', 
      companyName, 
      fiscalId, 
      phone, 
      activityType, 
      surfaceArea 
    } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Veuillez remplir tous les champs obligatoires (nom, email, mot de passe).' });
    }

    const trimmedEmail = email.trim().toLowerCase();
    const userExists = await User.findOne({ email: trimmedEmail });

    if (userExists) {
      return res.status(400).json({ message: 'Un compte avec cette adresse email existe déjà sur la plateforme S2T.' });
    }

    // Role and initial approval status logic:
    // Resident enterprise candidates default to 'pending' approval by S2T Admin
    const initialStatus = role === 'admin' ? 'approved' : 'pending';

    const user = await User.create({
      name: name.trim(),
      email: trimmedEmail,
      password: password.trim(),
      role: role === 'admin' ? 'admin' : 'client',
      companyName: companyName ? companyName.trim() : (role === 'admin' ? 'Direction S2T' : 'Entreprise Candidat'),
      fiscalId: fiscalId ? fiscalId.trim() : '',
      phone: phone ? phone.trim() : '',
      activityType: activityType || 'Édition Logiciels & IA',
      surfaceArea: Number(surfaceArea) || 35,
      status: initialStatus,
    });

    if (user) {
      if (user.status === 'pending') {
        // Return 201 with clear pending message without active JWT session token
        return res.status(201).json({
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          companyName: user.companyName,
          status: 'pending',
          isPendingApproval: true,
          message: 'Votre demande d\'adhésion en tant qu\'entreprise hébergée a été enregistrée avec succès. Elle est actuellement en attente d\'approbation par la Direction S2T (Pôle El Ghazala).',
        });
      } else {
        // Admin account created
        return res.status(201).json({
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          companyName: user.companyName,
          status: 'approved',
          avatar: user.avatar,
          token: generateToken(user._id),
          message: 'Compte administrateur S2T créé avec succès.',
        });
      }
    } else {
      res.status(400).json({ message: 'Données utilisateur invalides.' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Authenticate user & get token (Verifies approval status)
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email et mot de passe requis.' });
    }

    const trimmedEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: trimmedEmail });

    if (user && (await user.matchPassword(password))) {
      // Check account approval status for resident enterprises
      if (user.role !== 'admin' && user.status === 'pending') {
        return res.status(403).json({
          isPendingApproval: true,
          status: 'pending',
          message: 'Votre compte est en attente d\'approbation par la Direction S2T (Pôle El Ghazala). Vos accès seront activés dès validation de votre dossier d\'éligibilité TIC (Loi n°2001-50).',
        });
      }

      if (user.role !== 'admin' && user.status === 'rejected') {
        return res.status(403).json({
          status: 'rejected',
          message: `Votre demande d'accès a été refusée par la Direction S2T. Motif : ${user.rejectionReason || 'Dossier non conforme aux critères d\'éligibilité TIC du technopark.'}`,
        });
      }

      user.lastLogin = Date.now();
      await user.save();

      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status || 'approved',
        companyName: user.companyName,
        fiscalId: user.fiscalId,
        phone: user.phone,
        activityType: user.activityType,
        officeNumber: user.officeNumber,
        surfaceArea: user.surfaceArea,
        avatar: user.avatar,
        notifications: user.notifications,
        preferences: user.preferences,
        lastPasswordChange: user.lastPasswordChange,
        lastLogin: user.lastLogin,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Email ou mot de passe incorrect.' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (user) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status || 'approved',
        companyName: user.companyName,
        fiscalId: user.fiscalId,
        phone: user.phone,
        activityType: user.activityType,
        officeNumber: user.officeNumber,
        surfaceArea: user.surfaceArea,
        avatar: user.avatar,
        notifications: user.notifications,
        preferences: user.preferences,
        lastPasswordChange: user.lastPasswordChange,
        lastLogin: user.lastLogin,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      });
    } else {
      res.status(404).json({ message: 'Utilisateur non trouvé.' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/me
// @access  Private
export const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé.' });
    }

    // Check if new email is already used by another user
    if (req.body.email && req.body.email.trim().toLowerCase() !== user.email.toLowerCase()) {
      const trimmedEmail = req.body.email.trim().toLowerCase();
      const emailExists = await User.findOne({ email: trimmedEmail });
      if (emailExists && emailExists._id.toString() !== user._id.toString()) {
        return res.status(400).json({ message: 'Cette adresse email est déjà utilisée par un autre compte.' });
      }
      user.email = trimmedEmail;
    }

    // Check current password if supplied when user wants to change their password
    if (req.body.password && req.body.password.trim().length >= 6) {
      if (req.body.currentPassword) {
        const isMatch = await user.matchPassword(req.body.currentPassword);
        if (!isMatch) {
          return res.status(400).json({ message: 'Le mot de passe actuel renseigné est incorrect.' });
        }
      }
      user.password = req.body.password.trim();
      user.lastPasswordChange = Date.now();
    }

    if (req.body.name !== undefined) user.name = req.body.name.trim();
    if (req.body.phone !== undefined) user.phone = req.body.phone.trim();
    if (req.body.companyName !== undefined) user.companyName = req.body.companyName.trim();
    if (req.body.fiscalId !== undefined) user.fiscalId = req.body.fiscalId.trim();
    if (req.body.activityType !== undefined) user.activityType = req.body.activityType;
    if (req.body.avatar !== undefined) user.avatar = req.body.avatar;

    // Notifications settings
    if (req.body.notifications) {
      user.notifications = {
        rentAlert: req.body.notifications.rentAlert !== undefined ? req.body.notifications.rentAlert : (user.notifications?.rentAlert ?? true),
        reminders: req.body.notifications.reminders !== undefined ? req.body.notifications.reminders : (user.notifications?.reminders ?? true),
        renewalAlert: req.body.notifications.renewalAlert !== undefined ? req.body.notifications.renewalAlert : (user.notifications?.renewalAlert ?? true),
        emailNotif: req.body.notifications.emailNotif !== undefined ? req.body.notifications.emailNotif : (user.notifications?.emailNotif ?? true),
      };
    }

    // Preferences settings
    if (req.body.preferences) {
      user.preferences = {
        theme: req.body.preferences.theme || user.preferences?.theme || 'light',
        language: req.body.preferences.language || user.preferences?.language || 'fr',
      };
    }

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      status: updatedUser.status || 'approved',
      companyName: updatedUser.companyName,
      fiscalId: updatedUser.fiscalId,
      phone: updatedUser.phone,
      activityType: updatedUser.activityType,
      officeNumber: updatedUser.officeNumber,
      surfaceArea: updatedUser.surfaceArea,
      avatar: updatedUser.avatar,
      notifications: updatedUser.notifications,
      preferences: updatedUser.preferences,
      lastPasswordChange: updatedUser.lastPasswordChange,
      lastLogin: updatedUser.lastLogin,
      token: generateToken(updatedUser._id),
      message: 'Profil et paramètres mis à jour avec succès.',
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// =========================================================================
// ADMIN APPROVAL WORKFLOW ENDPOINTS
// =========================================================================

// @desc    Get all pending resident registrations
// @route   GET /api/auth/pending-users
// @access  Private / Admin
export const getPendingUsers = async (req, res) => {
  try {
    const pendingUsers = await User.find({ status: 'pending' })
      .select('-password')
      .sort({ createdAt: -1 });

    res.json(pendingUsers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all users with status
// @route   GET /api/auth/all-users
// @access  Private / Admin
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select('-password')
      .sort({ createdAt: -1 });

    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Approve a pending resident account
// @route   PUT /api/auth/users/:id/approve
// @access  Private / Admin
export const approveUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'Candidat résident non trouvé.' });
    }

    user.status = 'approved';
    user.approvedAt = Date.now();
    user.approvedBy = req.user._id;
    user.rejectionReason = '';

    await user.save();

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      companyName: user.companyName,
      status: user.status,
      approvedAt: user.approvedAt,
      message: `Le compte de l'entreprise "${user.companyName}" (${user.name}) a été approuvé avec succès par la Direction S2T. L'utilisateur peut désormais se connecter.`,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Reject a pending resident account
// @route   PUT /api/auth/users/:id/reject
// @access  Private / Admin
export const rejectUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'Candidat résident non trouvé.' });
    }

    const { reason } = req.body;

    user.status = 'rejected';
    user.rejectionReason = reason || 'Dossier non conforme aux critères d\'éligibilité TIC du technopark (Loi n°2001-50).';

    await user.save();

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      companyName: user.companyName,
      status: user.status,
      rejectionReason: user.rejectionReason,
      message: `La candidature de l'entreprise "${user.companyName}" a été refusée.`,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
