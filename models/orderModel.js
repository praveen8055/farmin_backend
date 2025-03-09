import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'user'
  },
  items: [{
    productId: {
      type: String,  // Changed from ObjectId to String since you're using string IDs
      required: true
    },
    productName: {      
      type: String,
      required: true
    },
    quantity: {
      type: Number,
      required: true
    }
  }],
  amount: {
    type: Number,
    required: true
  },
  address: {
    firstName: String,
    lastName: String,
    email: String,
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String,
    phone: String
  },
  status: {
    type: String,
    enum: ['Pending', 'Order Placed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'],
    default: 'Pending'
  },
  payment: {
    type: Boolean,
    default: false
  },
  paymentMethod: {
    type: String,
    enum: ['cod', 'razorpay'],
    required: true
  },
  paymentDetails: {
    paymentId: String,
    orderId: String,
    signature: String
  }
}, {
  timestamps: true
});

const orderModel = mongoose.model('order', orderSchema);
export default orderModel;