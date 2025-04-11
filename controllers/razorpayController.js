import Razorpay from 'razorpay';
import crypto from 'crypto';
import orderModel from '../models/orderModel.js';
import userModel from '../models/userModel.js';
import mongoose from 'mongoose';

// Initialize Razorpay instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

// Validate Razorpay credentials
if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
  console.error('Missing Razorpay credentials in environment variables');
}

export const createRazorpayOrder = async (req, res) => {
  let savedOrder = null;
  try {
    // Input validation
    const { amount, items, address } = req.body;
    
    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid amount"
      });
    }

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Items array is required"
      });
    }

    if (!address || !address.firstName || !address.phone) {
      return res.status(400).json({
        success: false,
        message: "Valid address details are required"
      });
    }

    // Create MongoDB order
    const newOrder = new orderModel({
      userId: req.user.id,
      items: items.map(item => ({
        productId: item.productId,
        productName: item.productName || "Unknown Product",
        quantity: Number(item.quantity)
      })),
      amount,
      address,
      status: "Pending",
      payment: false,
      paymentMethod: 'razorpay'
    });

    savedOrder = await newOrder.save();
    console.log('Order saved in database:', savedOrder._id);

    // Create Razorpay order
    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(amount * 100), // Convert to paise
      currency: "INR",
      receipt: savedOrder._id.toString(),
      notes: {
        orderId: savedOrder._id.toString(),
        userId: req.user.id
      }
    });

    return res.json({
      success: true,
      order: razorpayOrder,
      orderId: savedOrder._id,
      key: process.env.RAZORPAY_KEY_ID
    });

  } catch (error) {
    console.error('Order creation error:', {
      message: error.message,
      userId: req.user?.id,
      orderData: req.body
    });

    // Cleanup failed order
    if (savedOrder) {
      try {
        await orderModel.findByIdAndDelete(savedOrder._id);
      } catch (cleanupError) {
        console.error('Order cleanup failed:', cleanupError);
      }
    }

    return res.status(500).json({
      success: false,
      message: "Failed to create order. Please try again."
    });
  }
};

export const verifyRazorpayPayment = async (req, res) => {
  try {
    const {
      orderCreationId,
      razorpayPaymentId,
      razorpayOrderId,
      razorpaySignature,
      orderId
    } = req.body;

    // Validate required fields
    if (!orderCreationId || !razorpayPaymentId || !razorpaySignature || !orderId) {
      return res.status(400).json({
        success: false,
        message: 'Missing payment verification details'
      });
    }

    // Verify signature
    const shasum = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET);
    shasum.update(`${orderCreationId}|${razorpayPaymentId}`);
    const digest = shasum.digest('hex');

    if (digest !== razorpaySignature) {
      console.error('Payment signature verification failed', {
        orderId,
        expected: digest,
        received: razorpaySignature
      });
      return res.status(400).json({
        success: false,
        message: 'Invalid payment signature'
      });
    }

    // Update order status
    const updatedOrder = await orderModel.findByIdAndUpdate(
      orderId,
      {
        status: "Order Placed",
        payment: true,
        paymentDetails: {
          paymentId: razorpayPaymentId,
          orderId: razorpayOrderId,
          signature: razorpaySignature,
          method: 'razorpay',
          paidAt: new Date()
        }
      },
      { new: true }
    );

    if (!updatedOrder) {
      throw new Error('Order not found');
    }

    // Clear user's cart
    await userModel.findByIdAndUpdate(
      req.user.id,
      { cartData: {} }
    );

    console.log('Payment verified successfully', {
      orderId,
      userId: req.user.id,
      amount: updatedOrder.amount
    });

    return res.json({
      success: true,
      message: 'Payment verified successfully',
      order: updatedOrder
    });

  } catch (error) {
    console.error('Payment verification failed:', {
      error: error.message,
      orderId: req.body?.orderId,
      userId: req.user?.id
    });

    return res.status(500).json({
      success: false,
      message: 'Payment verification failed. Please contact support.'
    });
  }
};

// Webhook handler for Razorpay events
export const handleRazorpayWebhook = async (req, res) => {
  try {
    const signature = req.headers['x-razorpay-signature'];
    
    // Verify webhook signature
    const shasum = crypto.createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET);
    shasum.update(JSON.stringify(req.body));
    const digest = shasum.digest('hex');

    if (digest !== signature) {
      return res.status(400).json({ message: 'Invalid webhook signature' });
    }

    const { event, payload } = req.body;
    console.log('Received Razorpay webhook:', event);

    // Handle different webhook events
    switch (event) {
      case 'payment.captured':
        await handlePaymentCaptured(payload);
        break;
      case 'payment.failed':
        await handlePaymentFailed(payload);
        break;
      default:
        console.log('Unhandled webhook event:', event);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ message: 'Webhook processing failed' });
  }
};