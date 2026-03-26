# ⛽ GasSlot - Gas Cylinder Booking App
*(Triggering deployment for emojis and CORS fix)*

A full-stack web application for booking gas cylinder delivery slots from certified providers.

---

## 🚀 Live Demo

| Service | URL |
|---------|-----|
| Frontend | `https://gas-slot-booking-frontend.netlify.app` |
| Backend  | `https://gas-slot-booking-backend.onrender.com` |

---

## 📁 Repository Structure

```
gas-slot-app/
├── frontend/   → React app → Deploy to Netlify
└── backend/    → Node/Express API → Deploy to Render
```

- **Frontend repo:** `gas-slot-booking-frontend`
- **Backend repo:** `gas-slot-booking-backend`

---

## 🛠️ Tech Stack

| Layer | Technologies |
|-------|-------------|
| Frontend | React 18, Redux Toolkit, React Router v6, Formik + Yup, Bootstrap 5, Stripe.js |
| Backend | Node.js, Express.js, MongoDB + Mongoose, JWT, Bcrypt, Stripe |
| Deployment | Netlify (frontend), Render (backend), MongoDB Atlas |

---

## ✨ Features

### User Features
- 🔐 **Auth** — Register, Login, JWT sessions, Role-based access
- 🏭 **Browse Providers** — View all gas providers with categories (Domestic, LPG, CNG, PNG, Commercial, Industrial)
- 🔍 **Search & Filter** — Search by name/city, filter by category, rating, sort options
- 📅 **Slot Booking** — View available slots per date, book preferred delivery windows
- 🛒 **Booking Flow** — Cylinder type, quantity, delivery address, time slot selection
- 💳 **Stripe Payment** — Secure online payment via Stripe
- 📋 **Manage Bookings** — View, reschedule, cancel bookings
- 👤 **Profile** — Update profile info, change password
- ⭐ **Reviews** — Rate and review providers after delivery

### Admin Features
- 📊 **Dashboard** — Real-time stats, revenue charts, booking status pie chart
- 👥 **User Management** — View all users, change roles, activate/deactivate
- 🏭 **Provider Management** — Add, edit, deactivate providers
- 📦 **Booking Management** — View all bookings, update delivery status

---

## 🏃 Local Setup

### Prerequisites
- Node.js v18+
- MongoDB Atlas account (or local MongoDB)
- Stripe account (for payment keys)

### Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Fill in your values in .env
npm run dev       # Development
node seed.js      # Seed sample data
```

### Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env
# Fill in REACT_APP_API_URL and REACT_APP_STRIPE_PUBLISHABLE_KEY
npm start
```

### Environment Variables

**Backend `.env`:**
```env
PORT=5000
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your_32_char_secret
JWT_EXPIRE=7d
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
CLIENT_URL=http://localhost:3000
NODE_ENV=development
```

**Frontend `.env`:**
```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

---

## 🔑 Demo Credentials

| Role  | Email | Password |
|-------|-------|----------|
| Admin | admin@gasslot.com | admin123456 |
| User  | user@gasslot.com  | user123456  |

---

## 📡 API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register user |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Get current user |
| PUT | `/api/auth/update-profile` | Update profile |
| PUT | `/api/auth/change-password` | Change password |

### Providers
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/providers` | List providers (search, filter, paginate) |
| GET | `/api/providers/categories` | Get distinct categories |
| GET | `/api/providers/:id` | Get provider details |
| GET | `/api/providers/:id/slots` | Get available slots |
| POST | `/api/providers/:id/reviews` | Add review |

### Bookings
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/bookings` | Create booking |
| GET | `/api/bookings/my` | My bookings |
| GET | `/api/bookings/:id` | Booking detail |
| PUT | `/api/bookings/:id/reschedule` | Reschedule |
| PUT | `/api/bookings/:id/cancel` | Cancel |

### Payments
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/payments/create-intent` | Create Stripe intent |
| POST | `/api/payments/confirm` | Confirm payment |
| GET | `/api/payments/history` | Payment history |
| POST | `/api/payments/webhook` | Stripe webhook |

---

## 🚀 Deployment Guide

### 1. Deploy Backend to Render
1. Push backend code to `gas-slot-booking-backend` GitHub repo
2. Go to [render.com](https://render.com) → New → Web Service
3. Connect your GitHub repo
4. Set environment variables in Render dashboard
5. Deploy — Render uses `render.yaml` config

### 2. Deploy Frontend to Netlify
1. Push frontend code to `gas-slot-booking-frontend` GitHub repo
2. Update `REACT_APP_API_URL` to your Render backend URL
3. Go to [netlify.com](https://netlify.com) → New site → Import from Git
4. Set build command: `npm run build`, publish dir: `build`
5. Add environment variables in Netlify dashboard
6. Deploy — Netlify uses `netlify.toml` for redirects

### 3. MongoDB Atlas Setup
1. Create cluster at [cloud.mongodb.com](https://cloud.mongodb.com)
2. Add IP `0.0.0.0/0` to Network Access
3. Copy connection string to `MONGODB_URI`
4. Run `node seed.js` to seed initial data

### 4. Stripe Setup
1. Create account at [stripe.com](https://stripe.com)
2. Get publishable key → Frontend `.env`
3. Get secret key → Backend `.env`
4. Set up webhook → copy signing secret → Backend `.env`
5. Webhook endpoint: `https://your-backend.onrender.com/api/payments/webhook`

---

## 📂 Project Structure

```
backend/
├── server.js          # Entry point
├── models/
│   ├── User.js        # User model with bcrypt
│   ├── Provider.js    # Provider with slots & reviews
│   └── Booking.js     # Booking with payment info
├── routes/
│   ├── auth.js        # Auth endpoints
│   ├── providers.js   # Provider CRUD + search
│   ├── bookings.js    # Booking management
│   ├── payments.js    # Stripe integration
│   └── admin.js       # Admin dashboard API
├── middleware/
│   └── auth.js        # JWT + RBAC middleware
└── seed.js            # Database seeder

frontend/src/
├── App.js             # Root with routing
├── components/        # Reusable components
├── pages/             # Page-level components
├── redux/             # Redux store + slices
├── utils/             # Axios instance
└── styles/            # Global CSS
```

---

## 🤝 Contributing

Pull requests welcome! For major changes, please open an issue first.

---

## 📄 License

MIT License — see LICENSE file for details.
