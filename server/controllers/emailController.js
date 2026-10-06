import Email from '../models/Email.js';
import User from '../models/User.js';
import { createNotification, notifyAdmins } from '../services/notificationService.js';

// Department mappings for S2T official aliases
const S2T_DEPARTMENTS = {
  'juridique@s2t.tn': {
    name: 'Direction Juridique S2T',
    category: 'juridique',
    tag: 'Juridique',
    tagColor: '#2563EB',
  },
  'facturation@s2t.tn': {
    name: 'Service Facturation & Recouvrement S2T',
    category: 'facturation',
    tag: 'Facturation',
    tagColor: '#10B981',
  },
  'support-tech@s2t.tn': {
    name: 'Direction Technique & Infrastructure S2T',
    category: 'technique',
    tag: 'Technique',
    tagColor: '#F59E0B',
  },
  'direction@s2t.tn': {
    name: 'Direction Générale S2T',
    category: 'general',
    tag: 'Direction',
    tagColor: '#E11D48',
  },
  'admin@s2t.tn': {
    name: 'Administration Centrale S2T',
    category: 'general',
    tag: 'Administration',
    tagColor: '#2563EB',
  },
};

const CATEGORY_STYLES = {
  juridique: { tag: 'Juridique', color: '#2563EB' },
  facturation: { tag: 'Facturation', color: '#10B981' },
  technique: { tag: 'Technique', color: '#F59E0B' },
  urgent: { tag: 'Urgent', color: '#EF4444' },
  reservation: { tag: 'Réservation', color: '#06B6D4' },
  general: { tag: 'Général', color: '#6366F1' },
};

/**
 * Format email object for client response with per-user flags
 */
const formatEmailForUser = (email, userId) => {
  const isRead = email.readBy.some((id) => id.toString() === userId.toString());
  const isStarred = email.starredBy.some((id) => id.toString() === userId.toString());
  const isDeleted = email.deletedBy.some((id) => id.toString() === userId.toString());

  return {
    _id: email._id,
    id: email._id,
    sender: email.sender,
    senderName: email.senderName,
    senderEmail: email.senderEmail,
    senderRole: email.senderRole,
    recipient: email.recipient,
    recipientName: email.recipientName,
    recipientEmail: email.recipientEmail,
    subject: email.subject,
    body: email.body,
    preview: email.body.slice(0, 100) + (email.body.length > 100 ? '...' : ''),
    category: email.category,
    tag: email.tag,
    tagColor: email.tagColor,
    isRead,
    isStarred,
    isDeleted,
    attachments: email.attachments || [],
    threadId: email.threadId,
    replyTo: email.replyTo,
    createdAt: email.createdAt,
    updatedAt: email.updatedAt,
    date: new Date(email.createdAt).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }),
  };
};

/**
 * @desc    Get user emails with folder filtering and search
 * @route   GET /api/emails
 * @access  Private
 */
export const getEmails = async (req, res) => {
  try {
    const { folder = 'inbox', search = '' } = req.query;
    const userId = req.user._id;

    let filter = {};

    if (folder === 'inbox') {
      filter = {
        recipient: userId,
        deletedBy: { $ne: userId },
      };
    } else if (folder === 'sent') {
      filter = {
        sender: userId,
        deletedBy: { $ne: userId },
      };
    } else if (folder === 'starred') {
      filter = {
        $or: [{ sender: userId }, { recipient: userId }],
        starredBy: userId,
        deletedBy: { $ne: userId },
      };
    } else if (folder === 'trash') {
      filter = {
        $or: [{ sender: userId }, { recipient: userId }],
        deletedBy: userId,
      };
    }

    if (search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      filter.$and = [
        filter.$and || {},
        {
          $or: [
            { subject: searchRegex },
            { body: searchRegex },
            { senderName: searchRegex },
            { senderEmail: searchRegex },
            { recipientName: searchRegex },
            { recipientEmail: searchRegex },
          ],
        },
      ];
    }

    const emails = await Email.find(filter)
      .sort({ createdAt: -1 })
      .populate('sender', 'name email companyName role avatar')
      .populate('recipient', 'name email companyName role avatar');

    const formatted = emails.map((em) => formatEmailForUser(em, userId));

    res.json(formatted);
  } catch (error) {
    console.error('Erreur getEmails:', error);
    res.status(500).json({ message: 'Erreur lors du chargement des emails' });
  }
};

/**
 * @desc    Get email counts (unread, inbox, sent, starred, trash)
 * @route   GET /api/emails/counts
 * @access  Private
 */
export const getEmailCounts = async (req, res) => {
  try {
    const userId = req.user._id;

    const [inboxTotal, unreadInbox, sentTotal, starredTotal, trashTotal] = await Promise.all([
      Email.countDocuments({ recipient: userId, deletedBy: { $ne: userId } }),
      Email.countDocuments({
        recipient: userId,
        readBy: { $ne: userId },
        deletedBy: { $ne: userId },
      }),
      Email.countDocuments({ sender: userId, deletedBy: { $ne: userId } }),
      Email.countDocuments({
        $or: [{ sender: userId }, { recipient: userId }],
        starredBy: userId,
        deletedBy: { $ne: userId },
      }),
      Email.countDocuments({
        $or: [{ sender: userId }, { recipient: userId }],
        deletedBy: userId,
      }),
    ]);

    res.json({
      inbox: inboxTotal,
      unreadInbox,
      sent: sentTotal,
      starred: starredTotal,
      trash: trashTotal,
    });
  } catch (error) {
    console.error('Erreur getEmailCounts:', error);
    res.status(500).json({ message: 'Erreur lors du comptage des emails' });
  }
};

/**
 * @desc    Get single email by ID and mark as read
 * @route   GET /api/emails/:id
 * @access  Private
 */
export const getEmailById = async (req, res) => {
  try {
    const userId = req.user._id;
    const email = await Email.findById(req.params.id)
      .populate('sender', 'name email companyName role avatar phone officeNumber')
      .populate('recipient', 'name email companyName role avatar phone officeNumber');

    if (!email) {
      return res.status(404).json({ message: 'Email introuvable' });
    }

    const isAuthorized =
      email.sender._id.toString() === userId.toString() ||
      email.recipient._id.toString() === userId.toString() ||
      req.user.role === 'admin';

    if (!isAuthorized) {
      return res.status(403).json({ message: 'Accès non autorisé à cet email' });
    }

    // Auto mark as read if recipient
    if (!email.readBy.includes(userId)) {
      email.readBy.push(userId);
      await email.save();
    }

    res.json(formatEmailForUser(email, userId));
  } catch (error) {
    console.error('Erreur getEmailById:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération de l\'email' });
  }
};

/**
 * @desc    Send / Create a new email
 * @route   POST /api/emails
 * @access  Private
 */
export const sendEmail = async (req, res) => {
  try {
    const {
      to,
      subject,
      body,
      category = 'general',
      attachments = [],
      replyTo = null,
    } = req.body;

    if (!to || !subject || !body) {
      return res.status(400).json({ message: 'Veuillez renseigner le destinataire, l\'objet et le corps du message' });
    }

    const sender = req.user;
    let recipientUser = null;
    let recipientName = '';
    let recipientEmail = to.trim().toLowerCase();

    // Check if target is an official S2T administration alias
    if (S2T_DEPARTMENTS[recipientEmail]) {
      const deptInfo = S2T_DEPARTMENTS[recipientEmail];
      recipientName = deptInfo.name;

      // Find an admin user to link to this message in database
      recipientUser = await User.findOne({ role: 'admin' });
      if (!recipientUser) {
        // Fallback to any admin
        recipientUser = await User.findOne({ role: { $in: ['admin', 'juridique', 'finance'] } });
      }
    } else {
      // Find recipient by email or by ID
      if (recipientEmail.match(/^[0-9a-fA-F]{24}$/)) {
        recipientUser = await User.findById(recipientEmail);
      } else {
        recipientUser = await User.findOne({ email: recipientEmail });
      }

      if (!recipientUser) {
        return res.status(404).json({
          message: `Destinataire introuvable pour l'adresse "${recipientEmail}". Veuillez vérifier l'adresse email.`,
        });
      }

      recipientName = recipientUser.companyName
        ? `${recipientUser.name} (${recipientUser.companyName})`
        : recipientUser.name;
      recipientEmail = recipientUser.email;
    }

    if (!recipientUser) {
      return res.status(400).json({ message: 'Impossible d\'identifier le destinataire' });
    }

    // Determine sender display name
    const senderName =
      sender.role === 'admin'
        ? `${sender.name} (S2T Direction)`
        : sender.companyName
        ? `${sender.name} (${sender.companyName})`
        : sender.name;

    // Determine style tag & color
    let tag = CATEGORY_STYLES[category]?.tag || 'Général';
    let tagColor = CATEGORY_STYLES[category]?.color || '#2563EB';

    if (S2T_DEPARTMENTS[recipientEmail]) {
      tag = S2T_DEPARTMENTS[recipientEmail].tag;
      tagColor = S2T_DEPARTMENTS[recipientEmail].tagColor;
    }

    const newEmail = await Email.create({
      sender: sender._id,
      senderName,
      senderEmail: sender.email,
      senderRole: sender.role,
      recipient: recipientUser._id,
      recipientName,
      recipientEmail,
      subject,
      body,
      category,
      tag,
      tagColor,
      readBy: [sender._id], // Sender has read their own sent message
      starredBy: [],
      deletedBy: [],
      attachments,
      replyTo: replyTo || null,
      threadId: replyTo ? `th-${replyTo}` : `th-${Date.now()}`,
    });

    // Automatic Notification dispatch
    if (sender.role === 'admin') {
      await createNotification({
        recipient: recipientUser._id,
        recipientEmail: recipientUser.email,
        recipientRole: 'client',
        title: 'Nouveau Courrier Officiel S2T',
        description: `La Direction S2T vous a adressé un courrier officiel : "${subject}"`,
        type: 'email',
        category: 'Correspondance',
        severity: category === 'urgent' ? 'danger' : 'info',
        actionText: 'Consulter le courrier',
        actionLink: '/email',
        metadata: { emailId: newEmail._id, subject, category },
      });
    } else {
      await notifyAdmins({
        title: 'Nouveau Courrier de Résident',
        description: `${senderName} a envoyé un courrier : "${subject}"`,
        type: 'email',
        category: 'Correspondance',
        severity: category === 'urgent' ? 'warning' : 'info',
        actionText: 'Lire le courrier',
        actionLink: '/email',
        metadata: { emailId: newEmail._id, senderEmail: sender.email, subject, category },
      });
    }

    const formatted = formatEmailForUser(newEmail, sender._id);
    res.status(201).json(formatted);
  } catch (error) {
    console.error('Erreur sendEmail:', error);
    res.status(500).json({ message: 'Erreur lors de l\'envoi du message' });
  }
};

/**
 * @desc    Toggle star on email for current user
 * @route   PUT /api/emails/:id/star
 * @access  Private
 */
export const toggleStar = async (req, res) => {
  try {
    const userId = req.user._id;
    const email = await Email.findById(req.params.id);

    if (!email) {
      return res.status(404).json({ message: 'Email introuvable' });
    }

    const starIndex = email.starredBy.indexOf(userId);
    let isStarred = false;

    if (starIndex === -1) {
      email.starredBy.push(userId);
      isStarred = true;
    } else {
      email.starredBy.splice(starIndex, 1);
      isStarred = false;
    }

    await email.save();
    res.json({ success: true, isStarred, emailId: email._id });
  } catch (error) {
    console.error('Erreur toggleStar:', error);
    res.status(500).json({ message: 'Erreur lors de la mise à jour des favoris' });
  }
};

/**
 * @desc    Mark email as read or unread
 * @route   PUT /api/emails/:id/read
 * @access  Private
 */
export const markAsRead = async (req, res) => {
  try {
    const userId = req.user._id;
    const { isRead = true } = req.body;
    const email = await Email.findById(req.params.id);

    if (!email) {
      return res.status(404).json({ message: 'Email introuvable' });
    }

    const readIndex = email.readBy.indexOf(userId);

    if (isRead && readIndex === -1) {
      email.readBy.push(userId);
    } else if (!isRead && readIndex !== -1) {
      email.readBy.splice(readIndex, 1);
    }

    await email.save();
    res.json({ success: true, isRead, emailId: email._id });
  } catch (error) {
    console.error('Erreur markAsRead:', error);
    res.status(500).json({ message: 'Erreur lors du changement de statut de lecture' });
  }
};

/**
 * @desc    Move email to trash (soft delete) or permanent delete
 * @route   DELETE /api/emails/:id
 * @access  Private
 */
export const deleteEmail = async (req, res) => {
  try {
    const userId = req.user._id;
    const { permanent = false } = req.query;
    const email = await Email.findById(req.params.id);

    if (!email) {
      return res.status(404).json({ message: 'Email introuvable' });
    }

    if (permanent === 'true') {
      // If permanently deleting from trash
      await Email.findByIdAndDelete(req.params.id);
      return res.json({ success: true, message: 'Message définitivement supprimé' });
    }

    if (!email.deletedBy.includes(userId)) {
      email.deletedBy.push(userId);
      await email.save();
    }

    res.json({ success: true, message: 'Message déplacé dans la corbeille' });
  } catch (error) {
    console.error('Erreur deleteEmail:', error);
    res.status(500).json({ message: 'Erreur lors de la suppression de l\'email' });
  }
};

/**
 * @desc    Restore email from trash
 * @route   PUT /api/emails/:id/restore
 * @access  Private
 */
export const restoreEmail = async (req, res) => {
  try {
    const userId = req.user._id;
    const email = await Email.findById(req.params.id);

    if (!email) {
      return res.status(404).json({ message: 'Email introuvable' });
    }

    const delIndex = email.deletedBy.indexOf(userId);
    if (delIndex !== -1) {
      email.deletedBy.splice(delIndex, 1);
      await email.save();
    }

    res.json({ success: true, message: 'Message restauré dans la boîte de réception' });
  } catch (error) {
    console.error('Erreur restoreEmail:', error);
    res.status(500).json({ message: 'Erreur lors de la restauration de l\'email' });
  }
};

/**
 * @desc    Get contacts and S2T official departments for message composition
 * @route   GET /api/emails/recipients
 * @access  Private
 */
export const getRecipients = async (req, res) => {
  try {
    // Official departments available to everyone
    const officialServices = [
      {
        id: 'juridique@s2t.tn',
        email: 'juridique@s2t.tn',
        name: 'Direction Juridique S2T',
        description: 'Contrats, Avenants, Superficie & Règlement Intérieur',
        type: 'official',
      },
      {
        id: 'facturation@s2t.tn',
        email: 'facturation@s2t.tn',
        name: 'Service Facturation & Recouvrement S2T',
        description: 'Quittances, Redevances locatives, Décomptes & Paiements',
        type: 'official',
      },
      {
        id: 'support-tech@s2t.tn',
        email: 'support-tech@s2t.tn',
        name: 'Direction Technique & Infrastructure S2T',
        description: 'Badges d\'accès, Fibre optique, Salles de réunion & Maintenance',
        type: 'official',
      },
      {
        id: 'direction@s2t.tn',
        email: 'direction@s2t.tn',
        name: 'Direction Générale S2T',
        description: 'Administration générale Pôle Technologique El Ghazala',
        type: 'official',
      },
    ];

    // Fetch resident enterprises ONLY if the logged-in user is an administrator
    let mappedResidents = [];
    if (req.user.role === 'admin' || req.user.role === 'juridique' || req.user.role === 'finance') {
      const residents = await User.find({
        _id: { $ne: req.user._id },
        role: 'client',
      }).select('name email companyName officeNumber role');

      mappedResidents = residents.map((u) => {
        const cleanName = u.name.replace(/\(S2T\)/gi, '').replace(/\(.*?\)/g, '').trim() || u.name.trim();
        const company = u.companyName ? u.companyName.trim() : '';
        const office = u.officeNumber ? u.officeNumber.split('(')[0].trim() : '';
        
        let label = '';
        if (company) {
          label = `${company}${office ? ` (${office})` : ''} — ${cleanName} (${u.email})`;
        } else {
          label = `${cleanName} (${u.email})`;
        }

        return {
          id: u.email,
          userId: u._id,
          email: u.email,
          name: cleanName,
          companyName: company,
          officeNumber: office,
          label,
          type: 'resident',
        };
      });
    }

    res.json({
      official: officialServices,
      residents: mappedResidents,
    });
  } catch (error) {
    console.error('Erreur getRecipients:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des destinataires' });
  }
};
