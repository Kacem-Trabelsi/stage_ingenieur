import express from 'express';
import {
  getEmails,
  getEmailCounts,
  getEmailById,
  sendEmail,
  toggleStar,
  markAsRead,
  deleteEmail,
  restoreEmail,
  getRecipients,
} from '../controllers/emailController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/counts', getEmailCounts);
router.get('/recipients', getRecipients);

router.route('/')
  .get(getEmails)
  .post(sendEmail);

router.route('/:id')
  .get(getEmailById)
  .delete(deleteEmail);

router.put('/:id/star', toggleStar);
router.put('/:id/read', markAsRead);
router.put('/:id/restore', restoreEmail);

export default router;
