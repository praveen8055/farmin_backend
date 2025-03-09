import express from 'express';
import { loginUser,registerUser,saveAddress,getSavedAddress } from '../controllers/userController.js';
import authMiddleware from '../middleware/auth.js';
const userRouter = express.Router();

userRouter.post("/register",registerUser);
userRouter.post("/login",loginUser);

userRouter.post('/save-address', authMiddleware, saveAddress);
userRouter.get('/saved-address', authMiddleware, getSavedAddress);

export default userRouter;