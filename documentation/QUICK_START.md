# 🚀 QUICK START GUIDE - Academic ERP System

## ⚡ Get Started in 5 Minutes

This guide will help you get the Academic ERP system up and running quickly.

---

## 📋 Prerequisites

Make sure you have:
- ✅ **Node.js** (v14+): Download from [nodejs.org](https://nodejs.org)
- ✅ **MongoDB** (v4.4+): Download from [mongodb.com](https://www.mongodb.com/try/download/community)
- ✅ A modern web browser (Chrome, Firefox, or Edge)

---

## 🎯 Quick Start Steps

### Step 1: Start MongoDB

#### Windows:
```bash
net start MongoDB
```

#### Mac:
```bash
brew services start mongodb-community
```

#### Linux:
```bash
sudo systemctl start mongodb
```

**Verify MongoDB is running:**
```bash
mongosh
# You should see MongoDB shell
# Type: exit
```

---

### Step 2: Setup Backend

```bash
# Navigate to backend directory
cd all_static_pages/backend-mern

# Install dependencies (first time only)
npm install

# Create environment file
cp .env.example .env
```

**Edit `.env` file with these values:**
```env
MONGODB_URI=mongodb://localhost:27017/academic_erp
JWT_SECRET=academic_erp_super_secret_key_2024
JWT_EXPIRE=7d
NODE_ENV=development
PORT=5000
```

---

### Step 3: Seed the Database

```bash
# Run seed script (in backend-mern directory)
npm run seed
```

**Expected output:**
```
✅ MongoDB Connected
✅ Existing data cleared
✅ Created 21 users
✅ Created 5 services
✅ Created 20 leads
✅ Created 15 clients
✅ Created 30 projects
✅ Created 40 payments
✅ Created 15 queries
✅ Created 25 documents
✅ DATABASE SEEDED SUCCESSFULLY
```

---

### Step 4: Start the Backend Server

```bash
# Start server (in backend-mern directory)
npm run dev
```

**Expected output:**
```
✅ MongoDB Connected Successfully
🚀 Server running on port 5000
📝 Environment: development
🔗 API URL: http://localhost:5000
💚 Health Check: http://localhost:5000/health
```

**✅ Backend is now running!**

---

### Step 5: Test the API

Open a new terminal and run:

```bash
# Test health endpoint
curl http://localhost:5000/health

# Test login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"sandeep@academicerp.com","password":"password123"}'
```

If you see a response with a token, **congratulations!** Your backend is working perfectly!

---

### Step 6: Open the Frontend (Current State)

**Note:** The frontend pages currently have hardcoded data. They need to be connected to the backend API.

To view the current frontend:
```bash
# Open in your browser:
# file:///path/to/all_static_pages/login.html

# Or use a simple HTTP server:
cd all_static_pages
python -m http.server 8080
# Then open: http://localhost:8080/login.html
```

---

## 🔐 Test Login Credentials

### Admin Account:
```
Email:    admin@academicerp.com
Password: password123
```

### CRM Managers (3 default managers):
```
Sandeep:  sandeep@academicerp.com  / password123
Preet:    preet@academicerp.com    / password123
Deepali:  deepali@academicerp.com  / password123
```

### Lead Managers:
```
John:     john@academicerp.com     / password123
Sarah:    sarah@academicerp.com    / password123
```

### Sample Clients:
```
Client 1: client1@email.com       / password123
Client 2: client2@email.com       / password123
... (client3 to client15)
```

---

## 📊 What's in the Database?

After seeding, you'll have:

- **21 Users** (1 admin, 3 CRM managers, 2 lead managers, 15 clients)
- **5 Services** (Research, Writing, Consulting)
- **20 Leads** (From top universities worldwide)
- **15 Clients** (Distributed among 3 managers)
- **30 Projects** (Various statuses)
- **40 Payments** (Completed, pending, failed)
- **15 Queries** (Support tickets)
- **25 Documents** (Contracts, reports, etc.)

**Total: 171 realistic dummy records**

---

## 🎯 Test Each User Role

### Test 1: Admin Access

```bash
# Login as admin
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@academicerp.com","password":"password123"}'

# Save the token from response

# Get all users
curl http://localhost:5000/api/users \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"

# Get analytics
curl http://localhost:5000/api/analytics/dashboard \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Test 2: CRM Manager Access (Sandeep)

```bash
# Login as Sandeep
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"sandeep@academicerp.com","password":"password123"}'

# Get assigned clients (should see only 5 clients)
curl http://localhost:5000/api/clients \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"

# Get assigned projects
curl http://localhost:5000/api/projects \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Test 3: Lead Manager Access (John)

```bash
# Login as John
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@academicerp.com","password":"password123"}'

# Get assigned leads (should see 10 leads)
curl http://localhost:5000/api/leads \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Test 4: Client Access

```bash
# Login as client1
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"client1@email.com","password":"password123"}'

# Get own projects
curl http://localhost:5000/api/projects \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"

# Get own payments
curl http://localhost:5000/api/payments \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## 📝 Common Commands

### Restart Everything:
```bash
# Stop MongoDB (if needed)
# Windows: net stop MongoDB
# Mac: brew services stop mongodb-community
# Linux: sudo systemctl stop mongodb

# Start MongoDB
# Windows: net start MongoDB
# Mac: brew services start mongodb-community
# Linux: sudo systemctl start mongodb

# Restart backend server
# In backend-mern directory:
npm run dev
```

### Re-seed Database:
```bash
# In backend-mern directory:
npm run seed
# This will clear all data and create fresh dummy data
```

### Check Server Status:
```bash
# Test if backend is running
curl http://localhost:5000/health

# Check MongoDB
mongosh
# Should open MongoDB shell
```

---

## 🔍 Verify Everything Works

### ✅ Backend Checklist:

- [ ] MongoDB is running (test with `mongosh`)
- [ ] Backend server started successfully
- [ ] Health check responds: `curl http://localhost:5000/health`
- [ ] Can login as admin
- [ ] Can login as Sandeep (CRM manager)
- [ ] Can login as John (lead manager)
- [ ] Can login as client1
- [ ] API returns data for all endpoints

### 📊 Database Checklist:

Open MongoDB shell and verify:
```bash
mongosh
use academic_erp
db.users.countDocuments()      # Should return 21
db.clients.countDocuments()    # Should return 15
db.projects.countDocuments()   # Should return 30
db.leads.countDocuments()      # Should return 20
```

---

## 🐛 Troubleshooting

### Problem: "MongoDB connection error"

**Solution:**
```bash
# Make sure MongoDB is running
# Windows:
net start MongoDB

# Mac:
brew services start mongodb-community

# Linux:
sudo systemctl start mongodb
```

### Problem: "Port 5000 already in use"

**Solution:**
```bash
# Option 1: Kill the process using port 5000
# Mac/Linux:
lsof -ti:5000 | xargs kill -9

# Windows:
netstat -ano | findstr :5000
# Then: taskkill /PID <PID> /F

# Option 2: Change port in .env
# Edit .env file: PORT=5001
```

### Problem: "Module not found"

**Solution:**
```bash
# Reinstall dependencies
cd all_static_pages/backend-mern
rm -rf node_modules package-lock.json
npm install
```

### Problem: "Seed script fails"

**Solution:**
```bash
# Drop database and try again
mongosh
use academic_erp
db.dropDatabase()
exit

# Run seed again
npm run seed
```

---

## 📚 Next Steps

### 1. Explore the API
- Check `backend-mern/README.md` for all API endpoints
- Test endpoints with Postman or curl
- Review `TESTING_GUIDE.md` for comprehensive tests

### 2. Review Dummy Data
- Open `CREATE_DUMMY_DATA.md` to see data structure
- Login as different users to see role-based access
- Check assigned clients for each CRM manager

### 3. Frontend Integration (Next Phase)
- Frontend pages exist but need API integration
- Use `assets/js/api.js` utility library
- Follow integration instructions in `INTEGRATION_COMPLETE.md`

---

## 🎉 Success!

If you've completed all steps and verified everything works:

✅ **Backend is fully functional!**
✅ **Database has 171 dummy records**
✅ **3 CRM managers ready (Sandeep, Preet, Deepali)**
✅ **Authentication working**
✅ **RBAC enforced**
✅ **All API endpoints operational**

---

## 📞 Quick Reference

### Important URLs:
- **API Base:** `http://localhost:5000/api`
- **Health Check:** `http://localhost:5000/health`
- **Login:** `POST http://localhost:5000/api/auth/login`

### Important Files:
- **Backend Setup:** `backend-mern/README.md`
- **Testing Guide:** `TESTING_GUIDE.md`
- **Data Structure:** `CREATE_DUMMY_DATA.md`
- **Integration Status:** `INTEGRATION_COMPLETE.md`

### Key Commands:
```bash
# Start MongoDB
brew services start mongodb-community  # Mac
sudo systemctl start mongodb           # Linux
net start MongoDB                      # Windows

# Start Backend
cd all_static_pages/backend-mern
npm run dev

# Re-seed Database
npm run seed

# Test API
curl http://localhost:5000/health
```

---

## 🚀 Ready to Go!

Your Academic ERP backend is now fully operational and ready for frontend integration!

**Next:** Open `INTEGRATION_COMPLETE.md` to see the complete project status and next steps.

---

**Last Updated:** January 24, 2024  
**Version:** 1.0  
**Status:** Backend Complete ✅
