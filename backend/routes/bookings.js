const express = require('express');
const Booking = require('../models/Booking');
const Provider = require('../models/Provider');
const User = require('../models/User');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

// POST /api/bookings - Create a new booking
router.post('/', authenticate, async (req, res, next) => {
  try {
    const {
      providerId, slotId, cylinderType, quantity,
      deliveryAddress, paymentMethod = 'stripe'
    } = req.body;

    const provider = await Provider.findById(providerId);
    if (!provider) return res.status(404).json({ error: 'Provider not found.' });

    // Find the slot
    const slot = provider.availableSlots.id(slotId);
    if (!slot) return res.status(404).json({ error: 'Slot not found.' });
    if (!slot.isAvailable || slot.booked >= slot.capacity) {
      return res.status(400).json({ error: 'This slot is no longer available.' });
    }

    // Calculate pricing
    const cylinderPrice = cylinderType === '14kg'
      ? provider.pricing.cylinder14kg
      : provider.pricing.cylinder5kg;
    const subtotal = cylinderPrice * quantity;
    const deliveryCharge = provider.pricing.deliveryCharge;
    const total = subtotal + deliveryCharge;

    // Create booking
    const booking = await Booking.create({
      user: req.user._id,
      provider: providerId,
      slot: {
        slotId: slot._id,
        date: slot.date,
        startTime: slot.startTime,
        endTime: slot.endTime
      },
      cylinderType,
      quantity,
      deliveryAddress,
      pricing: {
        cylinderPrice: subtotal,
        deliveryCharge,
        total,
        currency: 'INR'
      },
      payment: { method: paymentMethod }
    });

    // Update slot booked count
    slot.booked += 1;
    if (slot.booked >= slot.capacity) slot.isAvailable = false;
    await provider.save();

    // Update user booking count
    await User.findByIdAndUpdate(req.user._id, { $inc: { bookingsCount: 1 } });

    await booking.populate(['user', 'provider']);

    res.status(201).json({
      message: 'Booking created successfully!',
      booking
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/bookings/my - Get current user's bookings
router.get('/my', authenticate, async (req, res, next) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const query = { user: req.user._id };
    if (status) query.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Booking.countDocuments(query);
    const bookings = await Booking.find(query)
      .populate('provider', 'name logo address contact category rating')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.json({
      bookings,
      pagination: { total, page: parseInt(page), pages: Math.ceil(total / limit) }
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/bookings/:id - Get single booking
router.get('/:id', authenticate, async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('provider', 'name logo address contact category')
      .populate('user', 'name email phone');

    if (!booking) return res.status(404).json({ error: 'Booking not found.' });

    // Users can only see their own bookings; admins see all
    if (req.user.role === 'user' && booking.user._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Access denied.' });
    }

    res.json({ booking });
  } catch (err) {
    next(err);
  }
});

// PUT /api/bookings/:id/reschedule - Reschedule booking
router.put('/:id/reschedule', authenticate, async (req, res, next) => {
  try {
    const { newSlotId, providerId } = req.body;
    const booking = await Booking.findById(req.params.id);

    if (!booking) return res.status(404).json({ error: 'Booking not found.' });
    if (booking.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Access denied.' });
    }
    if (!['pending', 'confirmed'].includes(booking.status)) {
      return res.status(400).json({ error: 'This booking cannot be rescheduled.' });
    }

    const provider = await Provider.findById(booking.provider);
    const newSlot = provider.availableSlots.id(newSlotId);

    if (!newSlot || !newSlot.isAvailable || newSlot.booked >= newSlot.capacity) {
      return res.status(400).json({ error: 'Selected slot is not available.' });
    }

    // Free old slot
    const oldSlot = provider.availableSlots.id(booking.slot.slotId);
    if (oldSlot) {
      oldSlot.booked = Math.max(0, oldSlot.booked - 1);
      oldSlot.isAvailable = true;
    }

    // Save rescheduled info
    booking.rescheduledFrom = { ...booking.slot };
    booking.slot = {
      slotId: newSlot._id,
      date: newSlot.date,
      startTime: newSlot.startTime,
      endTime: newSlot.endTime
    };
    booking.status = 'confirmed';

    // Update new slot
    newSlot.booked += 1;
    if (newSlot.booked >= newSlot.capacity) newSlot.isAvailable = false;

    await provider.save();
    await booking.save();

    res.json({ message: 'Booking rescheduled successfully!', booking });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/bookings/:id/cancel - Cancel booking
router.put('/:id/cancel', authenticate, async (req, res, next) => {
  try {
    const { reason } = req.body;
    const booking = await Booking.findById(req.params.id);

    if (!booking) return res.status(404).json({ error: 'Booking not found.' });
    if (booking.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied.' });
    }
    if (['delivered', 'cancelled'].includes(booking.status)) {
      return res.status(400).json({ error: 'This booking cannot be cancelled.' });
    }

    booking.status = 'cancelled';
    booking.cancelReason = reason || 'Cancelled by user';
    booking.cancelledAt = new Date();
    await booking.save();

    // Free up the slot
    const provider = await Provider.findById(booking.provider);
    if (provider) {
      const slot = provider.availableSlots.id(booking.slot.slotId);
      if (slot) {
        slot.booked = Math.max(0, slot.booked - 1);
        slot.isAvailable = true;
        await provider.save();
      }
    }

    res.json({ message: 'Booking cancelled successfully.', booking });
  } catch (err) {
    next(err);
  }
});

// ADMIN: GET /api/bookings - Get all bookings
router.get('/', authenticate, authorize('admin'), async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const query = {};
    if (status) query.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Booking.countDocuments(query);
    const bookings = await Booking.find(query)
      .populate('user', 'name email phone')
      .populate('provider', 'name category')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.json({ bookings, pagination: { total, page: parseInt(page), pages: Math.ceil(total / limit) } });
  } catch (err) {
    next(err);
  }
});

// ADMIN: Update booking status
router.put('/:id/status', authenticate, authorize('admin', 'provider'), async (req, res, next) => {
  try {
    const { status } = req.body;
    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { status, ...(status === 'delivered' && { deliveredAt: new Date() }) },
      { new: true }
    );
    if (!booking) return res.status(404).json({ error: 'Booking not found.' });
    res.json({ message: 'Booking status updated.', booking });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
