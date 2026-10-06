import express from 'express';
import {
  getTasks,
  getTaskStats,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
} from '../controllers/taskController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Apply auth middleware to all task routes
router.use(protect);

router.route('/').get(getTasks).post(createTask);
router.get('/stats', getTaskStats);
router.route('/:id').get(getTaskById).put(updateTask).delete(deleteTask);

export default router;
