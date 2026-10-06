import express from 'express';
import {
  getNotifications,
  getUnreadCount,
  toggleReadStatus,
  markAllAsRead,
  deleteNotification,
  clearAllNotifications,
  createDirectNotification,
} from '../controllers/notificationController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(protect, getNotifications)
  .post(protect, authorize('admin', 'juridique', 'finance'), createDirectNotification);

router.get('/unread-count', protect, getUnreadCount);
router.put('/mark-all-read', protect, markAllAsRead);
router.delete('/clear-all', protect, clearAllNotifications);
router.put('/:id/read', protect, toggleReadStatus);
router.delete('/:id', protect, deleteNotification);

export default router;
