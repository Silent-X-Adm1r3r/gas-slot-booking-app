const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  provider: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Provider',
    required: true
  },
  slot: {
    slotId: mongoose.Schema.Types.ObjectId,
    date: { type: Date, required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true }
  },
  cylinderType: {
    type: String,
    enum: ['14kg', '5kg'],
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
    default: 1
  },
  deliveryAddress: {
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true }
  },
  pricing: {
    cylinderPrice: Number,
    deliveryCharge: Number,
    total: Number,
    currency: { type: String, default: 'INR' }
  },
  payment: {
    method: { type: String, enum: ['stripe', 'cod', 'razorpay'], default: 'stripe' },
    status: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded'],
      default: 'pending'
    },
    transactionId: String,
    paymentIntentId: String,
    paidAt: Date
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'out_for_delivery', 'delivered', 'cancelled', 'rescheduled'],
    default: 'pending'
  },
  notes: { type: String, maxlength: 500 },
  bookingId: { type: String, unique: true },
  cancelReason: String,
  cancelledAt: Date,
  deliveredAt: Date,
  rescheduledFrom: {
    date: Date,
    startTime: String,
    endTime: String
  }
}, { timestamps: true });

// Generate unique booking ID before saving
bookingSchema.pre('save', async function(next) {
  if (!this.bookingId) {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substr(2, 4).toUpperCase();
    this.bookingId = `GAS-${timestamp}-${random}`;
  }
  next();
});

// Index for faster queries
bookingSchema.index({ user: 1, createdAt: -1 });
bookingSchema.index({ provider: 1, status: 1 });
bookingSchema.index({ bookingId: 1 });

module.exports = mongoose.model('Booking', bookingSchema);
