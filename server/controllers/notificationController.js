import Notification from '../models/Notification.js';
import User from '../models/User.js';
import { createNotification, notifyAdmins, broadcastToResidents } from '../services/notificationService.js';

/**
 * Format relative date helper in French
 */
const formatRelativeDate = (date) => {
  const now = new Date();
  const diffMs = now.getTime() - new Date(date).getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMinutes < 1) return 'À l\'instant';
  if (diffMinutes < 60) return `Il y a ${diffMinutes} min`;
  if (diffHours < 24) return `Il y a ${diffHours} heure${diffHours > 1 ? 's' : ''}`;
  if (diffDays === 1) return 'Hier';
  if (diffDays < 7) return `Il y a ${diffDays} jours`;
  if (diffDays < 30) return `Il y a ${Math.floor(diffDays / 7)} semaine${Math.floor(diffDays / 7) > 1 ? 's' : ''}`;
  return new Date(date).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

/**
 * @desc    Get all notifications for logged in user with filters
 * @route   GET /api/notifications
 * @access  Private
 */
export const getNotifications = async (req, res) => {
  try {
    const user = req.user;
    const { category, severity, unreadOnly, search } = req.query;

    let baseQuery = {};

    if (user.role === 'admin') {
      baseQuery.$or = [
        { recipient: user._id },
        { recipientEmail: user.email.toLowerCase() },
        { recipientRole: 'admin' },
        { recipientRole: 'all', recipient: null },
      ];
    } else {
      baseQuery.$or = [
        { recipient: user._id },
        { recipientEmail: user.email.toLowerCase() },
        { recipientRole: 'client', recipient: null },
        { recipientRole: 'all', recipient: null },
      ];
    }

    if (category && category !== 'all') {
      if (category === 'juridique') {
        baseQuery.category = { $in: ['Juridique', 'Contrat'] };
      } else if (category === 'facturation' || category === 'warning') {
        baseQuery.$and = baseQuery.$and || [];
        baseQuery.$and.push({
          $or: [
            { category: { $in: ['Facturation', 'Recouvrement', 'Réglementaire'] } },
            { severity: { $in: ['warning', 'danger'] } },
          ],
        });
      } else {
        baseQuery.category = new RegExp(`^${category}$`, 'i');
      }
    }

    if (severity && severity !== 'all') {
      baseQuery.severity = severity;
    }

    if (unreadOnly === 'true' || unreadOnly === true) {
      baseQuery.isRead = false;
    }

    if (search) {
      baseQuery.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } },
      ];
    }

    const notifs = await Notification.find(baseQuery).sort({ createdAt: -1 }).limit(100);

    const formatted = notifs.map((n) => ({
      _id: n._id,
      id: n._id,
      title: n.title,
      description: n.description,
      type: n.type,
      category: n.category,
      severity: n.severity,
      actionText: n.actionText,
      actionLink: n.actionLink,
      isRead: n.isRead,
      metadata: n.metadata || {},
      createdAt: n.createdAt,
      date: formatRelativeDate(n.createdAt),
      fullDate: new Date(n.createdAt).toLocaleString('fr-FR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
    }));

    res.json(formatted);
  } catch (error) {
    console.error('Erreur getNotifications:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des notifications', error: error.message });
  }
};

/**
 * @desc    Get unread notifications count for badges
 * @route   GET /api/notifications/unread-count
 * @access  Private
 */
export const getUnreadCount = async (req, res) => {
  try {
    const user = req.user;

    let baseQuery = { isRead: false };

    if (user.role === 'admin') {
      baseQuery.$or = [
        { recipient: user._id },
        { recipientEmail: user.email.toLowerCase() },
        { recipientRole: 'admin' },
        { recipientRole: 'all', recipient: null },
      ];
    } else {
      baseQuery.$or = [
        { recipient: user._id },
        { recipientEmail: user.email.toLowerCase() },
        { recipientRole: 'client', recipient: null },
        { recipientRole: 'all', recipient: null },
      ];
    }

    const unreadCount = await Notification.countDocuments(baseQuery);

    res.json({
      unreadCount,
    });
  } catch (error) {
    console.error('Erreur getUnreadCount:', error);
    res.status(500).json({ message: 'Erreur lors du comptage des notifications' });
  }
};

/**
 * @desc    Toggle single notification read status
 * @route   PUT /api/notifications/:id/read
 * @access  Private
 */
export const toggleReadStatus = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) {
      return res.status(404).json({ message: 'Notification introuvable' });
    }

    const { isRead } = req.body;
    if (typeof isRead === 'boolean') {
      notification.isRead = isRead;
    } else {
      notification.isRead = !notification.isRead;
    }

    await notification.save();

    res.json({
      _id: notification._id,
      id: notification._id,
      isRead: notification.isRead,
      message: notification.isRead ? 'Notification marquée comme lue' : 'Notification marquée comme non lue',
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Mark all notifications as read for current user
 * @route   PUT /api/notifications/mark-all-read
 * @access  Private
 */
export const markAllAsRead = async (req, res) => {
  try {
    const user = req.user;

    let baseQuery = { isRead: false };
    if (user.role === 'admin') {
      baseQuery.$or = [
        { recipient: user._id },
        { recipientEmail: user.email.toLowerCase() },
        { recipientRole: 'admin' },
        { recipientRole: 'all', recipient: null },
      ];
    } else {
      baseQuery.$or = [
        { recipient: user._id },
        { recipientEmail: user.email.toLowerCase() },
        { recipientRole: 'client', recipient: null },
        { recipientRole: 'all', recipient: null },
      ];
    }

    const result = await Notification.updateMany(baseQuery, { $set: { isRead: true } });

    res.json({
      message: 'Toutes les notifications ont été marquées comme lues',
      modifiedCount: result.modifiedCount,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Delete single notification
 * @route   DELETE /api/notifications/:id
 * @access  Private
 */
export const deleteNotification = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) {
      return res.status(404).json({ message: 'Notification introuvable' });
    }

    await Notification.findByIdAndDelete(req.params.id);

    res.json({ message: 'Notification supprimée avec succès' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Clear all notifications for user
 * @route   DELETE /api/notifications/clear-all
 * @access  Private
 */
export const clearAllNotifications = async (req, res) => {
  try {
    const user = req.user;
    const { readOnly = 'false' } = req.query;

    let baseQuery = {};
    if (readOnly === 'true') {
      baseQuery.isRead = true;
    }

    if (user.role === 'admin') {
      baseQuery.$or = [
        { recipient: user._id },
        { recipientEmail: user.email.toLowerCase() },
        { recipientRole: 'admin' },
      ];
    } else {
      baseQuery.$or = [
        { recipient: user._id },
        { recipientEmail: user.email.toLowerCase() },
      ];
    }

    const result = await Notification.deleteMany(baseQuery);

    res.json({
      message: 'Notifications effacées avec succès',
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Create custom notification / broadcast (Admin only)
 * @route   POST /api/notifications
 * @access  Private (Admin)
 */
export const createDirectNotification = async (req, res) => {
  try {
    const {
      recipientEmail,
      recipientRole = 'client',
      title,
      description,
      type = 'system',
      category = 'Général',
      severity = 'info',
      actionText = 'Consulter',
      actionLink = '/dashboard',
    } = req.body;

    if (!title || !description) {
      return res.status(400).json({ message: 'Le titre et la description sont requis' });
    }

    let notification;
    if (recipientEmail && recipientEmail !== 'all') {
      notification = await createNotification({
        recipientEmail,
        recipientRole,
        title,
        description,
        type,
        category,
        severity,
        actionText,
        actionLink,
      });
    } else {
      notification = await broadcastToResidents({
        title,
        description,
        type,
        category,
        severity,
        actionText,
        actionLink,
      });
    }

    res.status(201).json({
      message: 'Notification créée et diffusée avec succès',
      notification,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
