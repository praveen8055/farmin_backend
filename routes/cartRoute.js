import express from 'express';
import { addToCart, getCart, removeFromCart,getCartCount } from '../controllers/cartController.js';
import authMiddleware from '../middleware/auth.js';

const cartRouter = express.Router();

cartRouter.post("/get",authMiddleware,getCart);
cartRouter.post("/add",authMiddleware,addToCart);
cartRouter.post("/remove",authMiddleware,removeFromCart);
cartRouter.get("/count", authMiddleware, getCartCount);
export default cartRouter;