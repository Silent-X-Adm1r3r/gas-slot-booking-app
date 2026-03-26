const mongoose = require('mongoose');

const slotSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  startTime: { type: String, required: true }, // e.g. "09:00"
  endTime: { type: String, required: true },   // e.g. "11:00"
  capacity: { type: Number, default: 5 },
  booked: { type: Number, default: 0 },
  isAvailable: { type: Boolean, default: true }
});

const reviewSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  userName: String,
  rating: { type: Number, min: 1, max: 5 },
  comment: String,
  createdAt: { type: Date, default: Date.now }
});

const providerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Provider name is required'],
    trim: true
  },
  category: {
    type: String,
    enum: ['Domestic', 'Commercial', 'Industrial', 'LPG', 'CNG', 'PNG'],
    required: true
  },
  description: { type: String, required: true },
  logo: { type: String, default: null },
  images: [String],
  contact: {
    phone: { type: String, required: true },
    email: { type: String },
    website: { type: String }
  },
  address: {
    street: String,
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: String,
    coordinates: {
      lat: Number,
      lng: Number
    }
  },
  pricing: {
    cylinder14kg: { type: Number, default: 0 },
    cylinder5kg: { type: Number, default: 0 },
    deliveryCharge: { type: Number, default: 50 },
    currency: { type: String, default: 'INR' }
  },
  availableSlots: [slotSchema],
  reviews: [reviewSchema],
  rating: { type: Number, default: 0 },
  totalReviews: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  features: [String], // e.g. ['24/7 Support', 'Express Delivery', 'Online Booking']
  serviceAreas: [String],
  manager: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

// Auto-calculate average rating
providerSchema.methods.calculateRating = function() {
  if (this.reviews.length === 0) {
    this.rating = 0;
    this.totalReviews = 0;
  } else {
    const total = this.reviews.reduce((acc, r) => acc + r.rating, 0);
    this.rating = Math.round((total / this.reviews.length) * 10) / 10;
    this.totalReviews = this.reviews.length;
  }
};

// Index for search
providerSchema.index({ name: 'text', description: 'text', category: 'text' });

module.exports = mongoose.model('Provider', providerSchema);
