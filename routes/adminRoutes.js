import express from 'express';
import { adminLogin, verifyAdmin, createAdmin } from '../controllers/adminController.js';
import adminAuth from '../middleware/adminAuth.js';

const adminRouter = express.Router();

adminRouter.post('/login', adminLogin);
adminRouter.post('/create', createAdmin);
adminRouter.get('/verify', adminAuth, verifyAdmin);

export default adminRouter;