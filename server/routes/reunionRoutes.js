import express from 'express';
import {
  getReunions,
  getReunionById,
  createReunion,
  updateReunion,
  updateReunionStatus,
  deleteReunion,
  getRooms,
  getReunionStats,
  getBookedSlots,
  sendMeetingMinutes,
} from '../controllers/reunionController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// All reunion routes are protected by JWT authentication
router.use(protect);

router.get('/rooms', getRooms);
router.get('/stats', getReunionStats);
router.get('/booked-slots', getBookedSlots);
router.post('/send-minutes', sendMeetingMinutes);

router.route('/')
  .get(getReunions)
  .post(createReunion);

router.route('/:id')
  .get(getReunionById)
  .put(updateReunion)
  .delete(deleteReunion);

router.patch('/:id/status', updateReunionStatus);
router.post('/:id/send-minutes', sendMeetingMinutes);

export default router;
