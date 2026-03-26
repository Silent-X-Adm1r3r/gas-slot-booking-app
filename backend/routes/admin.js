const express = require('express');
const User = require('../models/User');
const Provider = require('../models/Provider');
const Booking = require('../models/Booking');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

// All admin routes require authentication and admin role
router.use(authenticate, authorize('admin'));

// GET /api/admin/stats - Dashboard statistics
router.get('/stats', async (req, res, next) => {
  try {
    const [totalUsers, totalProviders, totalBookings, paidBookings] = await Promise.all([
      User.countDocuments({ role: 'user' }),
      Provider.countDocuments({ isActive: true }),
      Booking.countDocuments(),
      Booking.countDocuments({ 'payment.status': 'paid' })
    ]);

    const revenueData = await Booking.aggregate([
      { $match: { 'payment.status': 'paid' } },
      { $group: { _id: null, total: { $sum: '$pricing.total' } } }
    ]);

    const totalRevenue = revenueData[0]?.total || 0;

    const recentBookings = await Booking.find()
      .populate('user', 'name email')
      .populate('provider', 'name')
      .sort({ createdAt: -1 })
      .limit(10);

    const bookingsByStatus = await Booking.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    const monthlyRevenue = await Booking.aggregate([
      { $match: { 'payment.status': 'paid' } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          revenue: { $sum: '$pricing.total' },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
      { $limit: 12 }
    ]);

    res.json({
      stats: { totalUsers, totalProviders, totalBookings, paidBookings, totalRevenue },
      recentBookings,
      bookingsByStatus,
      monthlyRevenue
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/admin/users - Get all users
router.get('/users', async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    const query = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await User.countDocuments(query);
    const users = await User.find(query).skip(skip).limit(parseInt(limit)).sort({ createdAt: -1 });
    res.json({ users, pagination: { total, page: parseInt(page), pages: Math.ceil(total / limit) } });
  } catch (err) {
    next(err);
  }
});

// PUT /api/admin/users/:id - Update user role or status
router.put('/users/:id', async (req, res, next) => {
  try {
    const { role, isActive } = req.body;
    const user = await User.findByIdAndUpdate(req.params.id, { role, isActive }, { new: true });
    if (!user) return res.status(404).json({ error: 'User not found.' });
    res.json({ message: 'User updated.', user });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/admin/providers/:id - Deactivate provider
router.delete('/providers/:id', async (req, res, next) => {
  try {
    const provider = await Provider.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!provider) return res.status(404).json({ error: 'Provider not found.' });
    res.json({ message: 'Provider deactivated.' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
