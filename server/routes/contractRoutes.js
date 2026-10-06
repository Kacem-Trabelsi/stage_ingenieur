import express from 'express';
import {
  getContracts,
  getContractById,
  createContract,
  getUncontractedResidents,
  requestAmendment,
  handleAmendment,
} from '../controllers/contractController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/uncontracted-residents', getUncontractedResidents);
router.route('/').get(getContracts).post(createContract);
router.route('/:id').get(getContractById);
router.post('/:id/amendments', requestAmendment);
router.put('/:id/amendments/:amendmentId', handleAmendment);

export default router;
