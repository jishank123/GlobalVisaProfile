# 🚀 Immigration Pro - Quick Start Guide

## Prerequisites
- Node.js (v18 or higher)
- MongoDB Atlas account (already configured)
- Git

## Running the Project

### Method 1: Using Two Terminals (Recommended)

**Terminal 1 - Backend Server:**
```bash
cd backend
npm run dev
```
Backend will run on: http://localhost:5000

**Terminal 2 - Frontend Server:**
```bash
cd frontend  
npm run dev
```
Frontend will run on: http://localhost:3000

### Method 2: Using Root Directory
```bash
# Install dependencies (if not already done)
cd backend && npm install
cd ../frontend && npm install

# Start backend
cd backend
npm run dev

# In another terminal, start frontend
cd frontend
npm run dev
```

## 🌐 Access Points

- **Main Website**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **Admin Dashboard**: http://localhost:3000/admin (after login)
- **Client Dashboard**: http://localhost:3000/dashboard (after login)

## 🔧 Troubleshooting

If you get errors:
1. Make sure both servers are running
2. Check that ports 3000 and 5000 are available
3. Verify MongoDB connection in backend/.env
4. Clear browser cache if navigation issues persist

## 📊 Available Routes

### Public Routes
- `/` - Homepage
- `/login` - Client Login
- `/signup` - Client Signup
- `/assessment` - Profile Assessment
- `/schedule` - Schedule Appointment
- `/eb1a` - EB-1A Information
- `/eb2-niw` - EB-2 NIW Information
- `/o1-visa` - O-1 Visa Information
- `/profile-building` - Profile Building
- `/attorneys` - Attorney Referrals
- `/faq` - FAQ
- `/pricing` - Pricing

### Admin Routes (After Login)
- `/admin` - Main Admin Dashboard
- `/manager` - Manager Dashboard
- `/crm` - CRM Manager Dashboard
- `/dashboard` - Client Dashboard