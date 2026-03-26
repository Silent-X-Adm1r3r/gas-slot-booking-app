const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Booking = require('../models/Booking');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// POST /api/payments/create-intent - Create Stripe PaymentIntent
router.post('/create-intent', authenticate, async (req, res, next) => {
  try {
    const { bookingId } = req.body;
    const booking = await Booking.findById(bookingId).populate('provider', 'name');

    if (!booking) return res.status(404).json({ error: 'Booking not found.' });
    if (booking.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Access denied.' });
    }
    if (booking.payment.status === 'paid') {
      return res.status(400).json({ error: 'This booking is already paid.' });
    }

    const amountInPaise = Math.round(booking.pricing.total * 100); // INR to paise

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInPaise,
      currency: 'inr',
      metadata: {
        bookingId: booking._id.toString(),
        bookingRef: booking.bookingId,
        userId: req.user._id.toString(),
        providerName: booking.provider.name
      },
      description: `Gas Delivery - ${booking.bookingId}`
    });

    // Save payment intent ID to booking
    booking.payment.paymentIntentId = paymentIntent.id;
    await booking.save();

    res.json({
      clientSecret: paymentIntent.client_secret,
      amount: booking.pricing.total,
      currency: 'INR',
      bookingRef: booking.bookingId
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/payments/confirm - Confirm payment after Stripe success
router.post('/confirm', authenticate, async (req, res, next) => {
  try {
    const { bookingId, paymentIntentId } = req.body;
    const booking = await Booking.findById(bookingId);

    if (!booking) return res.status(404).json({ error: 'Booking not found.' });

    // Verify with Stripe
    const intent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (intent.status === 'succeeded') {
      booking.payment.status = 'paid';
      booking.payment.transactionId = intent.id;
      booking.payment.paidAt = new Date();
      booking.status = 'confirmed';
      await booking.save();

      res.json({
        message: 'Payment confirmed! Booking is confirmed.',
        booking,
        transactionId: intent.id
      });
    } else {
      booking.payment.status = 'failed';
      await booking.save();
      res.status(400).json({ error: 'Payment verification failed.' });
    }
  } catch (err) {
    next(err);
  }
});

// POST /api/payments/webhook - Stripe webhook handler
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return res.status(400).json({ error: `Webhook Error: ${err.message}` });
  }

  switch (event.type) {
    case 'payment_intent.succeeded': {
      const intent = event.data.object;
      const booking = await Booking.findById(intent.metadata.bookingId);
      if (booking) {
        booking.payment.status = 'paid';
        booking.payment.transactionId = intent.id;
        booking.payment.paidAt = new Date();
        booking.status = 'confirmed';
        await booking.save();
      }
      break;
    }
    case 'payment_intent.payment_failed': {
      const intent = event.data.object;
      const booking = await Booking.findById(intent.metadata.bookingId);
      if (booking) {
        booking.payment.status = 'failed';
        await booking.save();
      }
      break;
    }
  }

  res.json({ received: true });
});

// GET /api/payments/history - User payment history
router.get('/history', authenticate, async (req, res, next) => {
  try {
    const bookings = await Booking.find({
      user: req.user._id,
      'payment.status': 'paid'
    })
    .populate('provider', 'name category')
    .select('bookingId pricing payment status slot createdAt')
    .sort({ createdAt: -1 });

    res.json({ payments: bookings });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
