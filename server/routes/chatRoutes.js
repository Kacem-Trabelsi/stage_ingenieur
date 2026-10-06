import express from 'express';
import {
  getChannels,
  getMessages,
  sendMessage,
  markChannelAsRead,
  clearChannelHistory,
  getResidents,
} from '../controllers/chatController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/channels', protect, getChannels);
router.get('/residents', protect, getResidents);
router.get('/messages/:channelId', protect, getMessages);
router.post('/messages', protect, sendMessage);
router.put('/read/:channelId', protect, markChannelAsRead);
router.delete('/clear/:channelId', protect, clearChannelHistory);

export default router;

