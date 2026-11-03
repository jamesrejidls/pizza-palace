# 🍕 Pizza Palace - Full Stack Delivery App

A complete pizza ordering system built with React, Node.js, Express, and MongoDB.

---

## Features

- **Auth System**: Register → Email verification → Login. Forgot/Reset password via email.
- **Pizza Builder**: 5-step builder (Base → Sauce → Cheese → Veggies → Meats) with live price total.
- **Razorpay Payments**: Test mode integration. Click "Success" in test popup to confirm order.
- **Inventory Management**: Admin tracks stock for all ingredients, receives low-stock alerts.
- **Order Tracking**: Customers see live status updates. Admin advances orders through stages.
- **Email Notifications**: Order confirmation, status updates, and stock alerts via Nodemailer.
- **Scheduled Cron**: Daily 8AM stock check emails admin if any ingredient is below threshold.

---

## Tech Stack

| Layer     | Technology                              |
|-----------|-----------------------------------------|
| Frontend  | React 18, React Router v6, Axios        |
| Backend   | Node.js, Express                        |
| Database  | MongoDB + Mongoose                      |
| Auth      | JWT + bcryptjs                          |
| Payments  | Razorpay (test mode)                    |
| Email     | Nodemailer (Gmail)                      |
| Scheduler | node-cron                               |

---

## Project Structure

```
pizza-app/
├── backend/
│   ├── config/db.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── inventoryController.js
│   │   └── orderController.js
│   ├── middleware/auth.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Inventory.js
│   │   └── Order.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── inventory.js
│   │   └── orders.js
│   ├── utils/
│   │   ├── email.js
│   │   ├── jwt.js
│   │   └── stockCron.js
│   ├── seed.js
│   ├── server.js
│   ├── package.json
│   └── .env.example
└── frontend/
    ├── public/
    │   └── index.html        ← Razorpay script loaded here
    ├── src/
    │   ├── context/AuthContext.js
    │   ├── components/shared/Navbar.js
    │   ├── pages/
    │   │   ├── LoginPage.js
    │   │   ├── RegisterPage.js
    │   │   ├── VerifyEmailPage.js
    │   │   ├── ForgotPasswordPage.js
    │   │   ├── ResetPasswordPage.js
    │   │   ├── DashboardPage.js
    │   │   ├── BuildPizzaPage.js
    │   │   ├── MyOrdersPage.js
    │   │   ├── OrderDetailPage.js
    │   │   ├── ProfilePage.js
    │   │   └── admin/
    │   │       ├── AdminDashboardPage.js
    │   │       ├── AdminInventoryPage.js
    │   │       └── AdminOrdersPage.js
    │   ├── utils/api.js
    │   ├── App.js
    │   ├── index.js
    │   └── index.css
    ├── package.json
    └── .env.example
```

---

## Step-by-Step Setup

### Prerequisites
- Node.js v18+
- MongoDB (local or Atlas)
- Gmail account (for sending emails)
- Razorpay account (free test account)

---

### Step 1: Get Accounts & Keys

#### MongoDB
Option A – Local: Install MongoDB Community from https://www.mongodb.com/try/download/community
Option B – Cloud: Create a free cluster at https://cloud.mongodb.com and copy the connection string.

#### Gmail App Password (for Nodemailer)
1. Go to your Google Account → Security
2. Enable 2-Step Verification
3. Search for "App Passwords" → Generate one for "Mail"
4. Copy the 16-character password

#### Razorpay Test Keys
1. Sign up free at https://razorpay.com
2. Dashboard → Settings → API Keys → Generate Test Key
3. Copy Key ID and Key Secret

---

### Step 2: Configure Backend Environment

```bash
cd pizza-app/backend
cp .env.example .env
```

Edit `.env`:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/pizzapalace
JWT_SECRET=your_super_secret_jwt_key_here

EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_gmail@gmail.com
EMAIL_PASS=your_16_char_app_password

RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxx
RAZORPAY_KEY_SECRET=your_razorpay_secret

CLIENT_URL=http://localhost:3000
ADMIN_EMAIL=your_gmail@gmail.com
STOCK_THRESHOLD=20
```

---

### Step 3: Configure Frontend Environment

```bash
cd pizza-app/frontend
cp .env.example .env
```

Edit `.env`:
```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxx
```

---

### Step 4: Install Dependencies

```bash
# Backend
cd pizza-app/backend
npm install

# Frontend
cd pizza-app/frontend
npm install
```

---

### Step 5: Seed the Database

```bash
cd pizza-app/backend
node seed.js
```

This creates:
- **5 pizza bases**, **5 sauces**, **5 cheeses**, **8 veggies**, **5 meats** — all with 50 stock
- **Admin account**: admin@pizzapalace.com / Admin@123
- **Test user**: user@test.com / User@123

---

### Step 6: Run the App

Open two terminals:

```bash
# Terminal 1 - Backend
cd pizza-app/backend
npm run dev
# Runs on http://localhost:5000

# Terminal 2 - Frontend
cd pizza-app/frontend
npm start
# Opens http://localhost:3000
```

---

## How to Use

### As a Customer
1. Register at `/register` → Check email → Click verification link
2. Login → View available ingredients on Dashboard
3. Click "Build Pizza" → Go through 5-step builder
4. Review your pizza and total → Click "Pay with Razorpay"
5. In the Razorpay test popup → Click "Success"
6. Order is confirmed! Track it at "My Orders"

### As Admin
1. Login with admin@pizzapalace.com / Admin@123
2. **Dashboard** (`/admin`): See stats, low stock alerts, recent orders
3. **Inventory** (`/admin/inventory`): Add/Edit/Delete ingredients, restock items
4. **Orders** (`/admin/orders`): Click an order → Update status → Customer gets email notification

---

## API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Register user |
| GET | /api/auth/verify-email/:token | Verify email |
| POST | /api/auth/login | Login |
| GET | /api/auth/me | Get current user |
| PUT | /api/auth/profile | Update profile |
| POST | /api/auth/forgot-password | Send reset email |
| POST | /api/auth/reset-password/:token | Reset password |
| POST | /api/auth/resend-verification | Resend verify email |

### Inventory (Admin only for write)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/inventory | Get all ingredients |
| GET | /api/inventory/summary | Stats summary |
| POST | /api/inventory | Create ingredient |
| PUT | /api/inventory/:id | Update ingredient |
| DELETE | /api/inventory/:id | Delete ingredient |
| POST | /api/inventory/:id/restock | Add stock |

### Orders
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/orders/create-razorpay-order | Init Razorpay payment |
| POST | /api/orders/place | Place order (verify payment) |
| POST | /api/orders/simulate-success | Test mode order (no real payment) |
| GET | /api/orders/my-orders | Customer's orders |
| GET | /api/orders/all | All orders (Admin) |
| GET | /api/orders/:id | Order detail |
| PUT | /api/orders/:id/status | Update status (Admin) |

---

## Order Status Flow

```
pending → paid → order_received → in_kitchen → sent_to_delivery → delivered
                                                                  → cancelled
```

---

## Troubleshooting

**Email not sending?**
- Make sure 2FA is ON in Gmail
- Use App Password (not your Gmail password)
- Check EMAIL_USER and EMAIL_PASS in .env

**MongoDB connection failed?**
- Make sure MongoDB is running: `mongod` (local)
- Or check your Atlas IP whitelist (add 0.0.0.0/0 for development)

**Razorpay popup not appearing?**
- Check REACT_APP_RAZORPAY_KEY_ID starts with `rzp_test_`
- Make sure `checkout.js` is loaded in public/index.html

**CORS errors?**
- Make sure CLIENT_URL in backend .env matches your frontend URL exactly

---

## Demo Credentials

| Role  | Email                    | Password  |
|-------|--------------------------|-----------|
| Admin | admin@pizzapalace.com    | Admin@123 |
| User  | user@test.com            | User@123  |

> Note: The test user's email is pre-verified in seed data.
