import express from 'express';
import {
  getInvoices,
  getInvoiceById,
  createInvoice,
  generateInvoiceFromContract,
  updatePayment,
  sendReminder,
  getFinancialStats,
} from '../controllers/invoiceController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/stats', getFinancialStats);
router.post('/generate-from-contract/:contractId', generateInvoiceFromContract);
router.route('/').get(getInvoices).post(createInvoice);
router.route('/:id').get(getInvoiceById);
router.put('/:id/payment', updatePayment);
router.post('/:id/remind', sendReminder);

export default router;
