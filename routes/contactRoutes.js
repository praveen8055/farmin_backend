import express from 'express';
import { submitContact, listContacts,updateMessageStatus } from '../controllers/contactController.js';
import adminAuth from '../middleware/auth.js';

const router = express.Router();

router.post('/submit', submitContact);
router.get('/list', adminAuth, listContacts);
router.patch('/update-status/:id', adminAuth, updateMessageStatus);
export default router;