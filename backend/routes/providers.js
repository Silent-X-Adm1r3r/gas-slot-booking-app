const express = require('express');
const Provider = require('../models/Provider');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

// GET /api/providers - Get all providers with search & filter
router.get('/', async (req, res, next) => {
  try {
    const {
      search, category, city, minRating,
      sortBy = 'rating', order = 'desc',
      page = 1, limit = 12
    } = req.query;

    const query = { isActive: true };

    // Text search
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { 'address.city': { $regex: search, $options: 'i' } }
      ];
    }

    // Category filter
    if (category && category !== 'All') {
      query.category = category;
    }

    // City filter
    if (city) {
      query['address.city'] = { $regex: city, $options: 'i' };
    }

    // Rating filter
    if (minRating) {
      query.rating = { $gte: parseFloat(minRating) };
    }

    const sortOptions = {};
    sortOptions[sortBy] = order === 'desc' ? -1 : 1;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Provider.countDocuments(query);
    const providers = await Provider.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit))
      .select('-reviews -availableSlots.__v')
      .populate('manager', 'name email');

    res.json({
      providers,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        limit: parseInt(limit)
      }
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/providers/categories - Get distinct categories
router.get('/categories', async (req, res, next) => {
  try {
    const categories = await Provider.distinct('category', { isActive: true });
    res.json({ categories: ['All', ...categories] });
  } catch (err) {
    next(err);
  }
});

// GET /api/providers/:id - Get single provider
router.get('/:id', async (req, res, next) => {
  try {
    const provider = await Provider.findById(req.params.id)
      .populate('manager', 'name email');

    if (!provider || !provider.isActive) {
      return res.status(404).json({ error: 'Provider not found.' });
    }

    res.json({ provider });
  } catch (err) {
    next(err);
  }
});

// GET /api/providers/:id/slots - Get available slots for a provider
router.get('/:id/slots', authenticate, async (req, res, next) => {
  try {
    const { date } = req.query;
    const provider = await Provider.findById(req.params.id);

    if (!provider) {
      return res.status(404).json({ error: 'Provider not found.' });
    }

    let slots = provider.availableSlots.filter(slot => slot.isAvailable);

    if (date) {
      const filterDate = new Date(date);
      filterDate.setHours(0, 0, 0, 0);
      const nextDay = new Date(filterDate);
      nextDay.setDate(nextDay.getDate() + 1);

      slots = slots.filter(slot => {
        const slotDate = new Date(slot.date);
        return slotDate >= filterDate && slotDate < nextDay;
      });
    }

    // Filter out fully booked slots
    slots = slots.filter(slot => slot.booked < slot.capacity);

    res.json({ slots });
  } catch (err) {
    next(err);
  }
});

// POST /api/providers/:id/reviews - Add a review
router.post('/:id/reviews', authenticate, async (req, res, next) => {
  try {
    const { rating, comment } = req.body;
    const provider = await Provider.findById(req.params.id);

    if (!provider) {
      return res.status(404).json({ error: 'Provider not found.' });
    }

    // Check if user already reviewed
    const existingReview = provider.reviews.find(
      r => r.user.toString() === req.user._id.toString()
    );
    if (existingReview) {
      return res.status(400).json({ error: 'You have already reviewed this provider.' });
    }

    provider.reviews.push({
      user: req.user._id,
      userName: req.user.name,
      rating: parseInt(rating),
      comment
    });

    provider.calculateRating();
    await provider.save();

    res.status(201).json({ message: 'Review added successfully.', rating: provider.rating });
  } catch (err) {
    next(err);
  }
});

// ADMIN: POST /api/providers - Create provider
router.post('/', authenticate, authorize('admin'), async (req, res, next) => {
  try {
    const provider = await Provider.create(req.body);
    res.status(201).json({ message: 'Provider created.', provider });
  } catch (err) {
    next(err);
  }
});

// ADMIN: PUT /api/providers/:id - Update provider
router.put('/:id', authenticate, authorize('admin', 'provider'), async (req, res, next) => {
  try {
    const provider = await Provider.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!provider) return res.status(404).json({ error: 'Provider not found.' });
    res.json({ message: 'Provider updated.', provider });
  } catch (err) {
    next(err);
  }
});

// ADMIN: POST /api/providers/:id/slots - Add slots to provider
router.post('/:id/slots', authenticate, authorize('admin', 'provider'), async (req, res, next) => {
  try {
    const provider = await Provider.findById(req.params.id);
    if (!provider) return res.status(404).json({ error: 'Provider not found.' });

    const { slots } = req.body; // Array of slot objects
    provider.availableSlots.push(...slots);
    await provider.save();

    res.status(201).json({ message: 'Slots added.', slots: provider.availableSlots });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
