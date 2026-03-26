const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('./models/User');
const Provider = require('./models/Provider');

const providers = [
  {
    name: 'IndaneGas Express',
    category: 'Domestic',
    description: 'India\'s trusted gas provider with 50+ years of experience. Safe, reliable, and affordable domestic LPG cylinders delivered to your doorstep.',
    contact: { phone: '9876543210', email: 'indane@express.com', website: 'https://indane.co.in' },
    address: { street: '12 Industrial Area', city: 'Mumbai', state: 'Maharashtra', pincode: '400001' },
    pricing: { cylinder14kg: 850, cylinder5kg: 400, deliveryCharge: 50 },
    rating: 4.5, totalReviews: 128,
    features: ['24/7 Support', 'Express Delivery', 'Online Tracking', 'Safety Certified'],
    serviceAreas: ['Mumbai', 'Navi Mumbai', 'Thane'],
    isActive: true,
    availableSlots: generateSlots()
  },
  {
    name: 'HP Gas Premium',
    category: 'LPG',
    description: 'Hindustan Petroleum\'s premium LPG service offering next-day delivery and real-time tracking for households and businesses.',
    contact: { phone: '9876543211', email: 'hpgas@premium.com' },
    address: { street: '45 Ring Road', city: 'Delhi', state: 'Delhi', pincode: '110001' },
    pricing: { cylinder14kg: 870, cylinder5kg: 420, deliveryCharge: 60 },
    rating: 4.3, totalReviews: 95,
    features: ['Next-Day Delivery', 'SMS Alerts', 'Doorstep Service'],
    serviceAreas: ['Delhi', 'Noida', 'Gurugram'],
    isActive: true,
    availableSlots: generateSlots()
  },
  {
    name: 'Bharat Gas Connect',
    category: 'Domestic',
    description: 'Bharat Petroleum\'s reliable domestic gas service. Known for punctual delivery, excellent customer service, and competitive pricing.',
    contact: { phone: '9876543212', email: 'bharat@gasconnect.com' },
    address: { street: '78 Civil Lines', city: 'Bangalore', state: 'Karnataka', pincode: '560001' },
    pricing: { cylinder14kg: 840, cylinder5kg: 395, deliveryCharge: 45 },
    rating: 4.7, totalReviews: 203,
    features: ['Flexible Slots', 'Loyalty Rewards', 'Free Safety Check', 'EMI Options'],
    serviceAreas: ['Bangalore', 'Mysore', 'Mangalore'],
    isActive: true,
    availableSlots: generateSlots()
  },
  {
    name: 'CNG City Solutions',
    category: 'CNG',
    description: 'Leading CNG provider for commercial vehicles and industrial use. Eco-friendly, cost-effective, and available across major city routes.',
    contact: { phone: '9876543213', email: 'cng@citysolutions.com' },
    address: { street: '22 Station Road', city: 'Pune', state: 'Maharashtra', pincode: '411001' },
    pricing: { cylinder14kg: 780, cylinder5kg: 360, deliveryCharge: 80 },
    rating: 4.1, totalReviews: 67,
    features: ['Commercial Grade', 'Fleet Discount', 'Eco Certified', 'Bulk Orders'],
    serviceAreas: ['Pune', 'Pimpri-Chinchwad', 'Nashik'],
    isActive: true,
    availableSlots: generateSlots()
  },
  {
    name: 'PNG Home Connect',
    category: 'PNG',
    description: 'Piped Natural Gas connections for residential complexes and commercial buildings. Hassle-free, no cylinder storage needed.',
    contact: { phone: '9876543214', email: 'png@homeconnect.com' },
    address: { street: '5 Tech Park', city: 'Chennai', state: 'Tamil Nadu', pincode: '600001' },
    pricing: { cylinder14kg: 0, cylinder5kg: 0, deliveryCharge: 100 },
    rating: 4.8, totalReviews: 312,
    features: ['No Cylinder Needed', '24/7 Supply', 'Safe & Secure', 'Metered Billing'],
    serviceAreas: ['Chennai', 'Coimbatore', 'Madurai'],
    isActive: true,
    availableSlots: generateSlots()
  },
  {
    name: 'Industrial Gas Pro',
    category: 'Industrial',
    description: 'Heavy-duty industrial gas supply for factories, restaurants, and large establishments. Bulk delivery with dedicated account managers.',
    contact: { phone: '9876543215', email: 'industrial@gaspro.com' },
    address: { street: '100 Industrial Estate', city: 'Hyderabad', state: 'Telangana', pincode: '500001' },
    pricing: { cylinder14kg: 750, cylinder5kg: 0, deliveryCharge: 120 },
    rating: 4.4, totalReviews: 89,
    features: ['Bulk Supply', 'Dedicated Manager', 'Annual Contracts', 'Emergency Delivery'],
    serviceAreas: ['Hyderabad', 'Secunderabad', 'Warangal'],
    isActive: true,
    availableSlots: generateSlots()
  }
];

function generateSlots() {
  const slots = [];
  const today = new Date();
  for (let day = 1; day <= 14; day++) {
    const date = new Date(today);
    date.setDate(today.getDate() + day);
    const timeSlots = [
      { startTime: '08:00', endTime: '10:00' },
      { startTime: '10:00', endTime: '12:00' },
      { startTime: '12:00', endTime: '14:00' },
      { startTime: '14:00', endTime: '16:00' },
      { startTime: '16:00', endTime: '18:00' }
    ];
    timeSlots.forEach(slot => {
      slots.push({
        date,
        startTime: slot.startTime,
        endTime: slot.endTime,
        capacity: 5,
        booked: Math.floor(Math.random() * 3),
        isAvailable: true
      });
    });
  }
  return slots;
}

async function seedDatabase() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Provider.deleteMany({});
    console.log('🗑️  Cleared existing data');

    // Create admin user
    const adminUser = await User.create({
      name: 'Admin User',
      email: 'admin@gasslot.com',
      password: 'admin123456',
      role: 'admin',
      phone: '9999999999'
    });
    console.log('👑 Admin user created:', adminUser.email);

    // Create test user
    const testUser = await User.create({
      name: 'John Doe',
      email: 'user@gasslot.com',
      password: 'user123456',
      role: 'user',
      phone: '8888888888',
      address: { street: '42 MG Road', city: 'Mumbai', state: 'Maharashtra', pincode: '400001' }
    });
    console.log('👤 Test user created:', testUser.email);

    // Create providers
    const createdProviders = await Provider.insertMany(providers);
    console.log(`🏭 ${createdProviders.length} providers created`);

    console.log('\n✅ Database seeded successfully!');
    console.log('\n📋 Login Credentials:');
    console.log('Admin → Email: admin@gasslot.com | Password: admin123456');
    console.log('User  → Email: user@gasslot.com  | Password: user123456');

    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding error:', err);
    process.exit(1);
  }
}

seedDatabase();
