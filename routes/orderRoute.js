import express from 'express';
import authMiddleware from '../middleware/auth.js';
import adminAuth from '../middleware/adminAuth.js';
import { 
    listOrders, 
    placeOrder,
    updateStatus,
    userOrders, 
    verifyOrder, 
    placeOrderCod ,
    hasOrders
} from '../controllers/orderController.js';
import { 
    createRazorpayOrder, 
    verifyRazorpayPayment 
} from '../controllers/razorpayController.js';

const orderRouter = express.Router();

// User order routes
orderRouter.get("/userorders", authMiddleware, async (req, res) => {
    console.log("Accessing userorders route");
    await userOrders(req, res);
});// Make sure this is GET
orderRouter.post("/place", authMiddleware, placeOrder);
orderRouter.post("/placecod", authMiddleware, placeOrderCod);

// Razorpay routes
orderRouter.post("/create-razorpay-order", authMiddleware, createRazorpayOrder);
orderRouter.post("/verify-razorpay-payment", authMiddleware, verifyRazorpayPayment);

// Admin routes
orderRouter.get("/list", adminAuth, listOrders);
orderRouter.post("/status", adminAuth, updateStatus);
orderRouter.get('/has-orders', authMiddleware, hasOrders);
export default orderRouter;