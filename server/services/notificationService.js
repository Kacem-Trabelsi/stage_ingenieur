import Notification from '../models/Notification.js';
import User from '../models/User.js';

/**
 * Create a notification for a specific user or role
 */
export const createNotification = async ({
  recipient = null,
  recipientEmail = '',
  recipientRole = 'client',
  title,
  description,
  type = 'system',
  category = 'Général',
  severity = 'info',
  actionText = 'Consulter',
  actionLink = '/dashboard',
  metadata = {},
}) => {
  try {
    let finalRecipientId = recipient;
    let finalRecipientEmail = recipientEmail;

    if (!finalRecipientId && finalRecipientEmail) {
      const u = await User.findOne({ email: finalRecipientEmail.toLowerCase() });
      if (u) {
        finalRecipientId = u._id;
        finalRecipientEmail = u.email;
      }
    } else if (finalRecipientId && !finalRecipientEmail) {
      const u = await User.findById(finalRecipientId);
      if (u) {
        finalRecipientEmail = u.email;
      }
    }

    const notification = await Notification.create({
      recipient: finalRecipientId || null,
      recipientEmail: finalRecipientEmail ? finalRecipientEmail.toLowerCase() : '',
      recipientRole,
      title,
      description,
      type,
      category,
      severity,
      actionText,
      actionLink,
      metadata,
    });

    return notification;
  } catch (err) {
    console.error('Erreur création notification:', err.message);
    return null;
  }
};

/**
 * Notify all admins
 */
export const notifyAdmins = async ({
  title,
  description,
  type = 'system',
  category = 'Général',
  severity = 'info',
  actionText = 'Voir détails',
  actionLink = '/dashboard',
  metadata = {},
}) => {
  try {
    const admins = await User.find({ role: { $in: ['admin', 'juridique', 'finance'] } });
    const promises = admins.map((admin) =>
      Notification.create({
        recipient: admin._id,
        recipientEmail: admin.email,
        recipientRole: 'admin',
        title,
        description,
        type,
        category,
        severity,
        actionText,
        actionLink,
        metadata,
      })
    );
    return await Promise.all(promises);
  } catch (err) {
    console.error('Erreur notifyAdmins:', err.message);
    return [];
  }
};

/**
 * Broadcast notification to all residents
 */
export const broadcastToResidents = async ({
  title,
  description,
  type = 'system',
  category = 'Général',
  severity = 'info',
  actionText = 'Consulter',
  actionLink = '/dashboard',
  metadata = {},
}) => {
  try {
    const notification = await Notification.create({
      recipient: null,
      recipientEmail: '',
      recipientRole: 'client',
      title,
      description,
      type,
      category,
      severity,
      actionText,
      actionLink,
      metadata,
    });
    return notification;
  } catch (err) {
    console.error('Erreur broadcastToResidents:', err.message);
    return null;
  }
};
