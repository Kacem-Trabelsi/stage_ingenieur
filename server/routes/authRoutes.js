import express from 'express';
import {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  getPendingUsers,
  getAllUsers,
  approveUser,
  rejectUser,
} from '../controllers/authController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.route('/me').get(protect, getUserProfile).put(protect, updateUserProfile);

// Admin Approval Routes
router.get('/pending-users', protect, admin, getPendingUsers);
router.get('/all-users', protect, admin, getAllUsers);
router.put('/users/:id/approve', protect, admin, approveUser);
router.put('/users/:id/reject', protect, admin, rejectUser);

export default router;
