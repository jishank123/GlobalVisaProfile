# 🧪 ACADEMIC ERP - COMPLETE TESTING GUIDE

## 📋 Table of Contents
1. [Prerequisites](#prerequisites)
2. [Initial Setup](#initial-setup)
3. [Backend Testing](#backend-testing)
4. [Frontend Testing](#frontend-testing)
5. [Integration Testing](#integration-testing)
6. [Test Checklist](#test-checklist)
7. [Troubleshooting](#troubleshooting)

---

## 🔧 Prerequisites

Before you begin testing, ensure you have:

- ✅ **Node.js** (v14 or higher) installed
- ✅ **MongoDB** (v4.4 or higher) installed and running
- ✅ **npm** or **yarn** package manager
- ✅ A modern web browser (Chrome, Firefox, or Edge)
- ✅ **Postman** or similar API testing tool (optional but recommended)

---

## 🚀 Initial Setup

### Step 1: Install MongoDB

#### On Windows:
```bash
# Download from: https://www.mongodb.com/try/download/community
# Install and start MongoDB service
net start MongoDB
```

#### On Mac:
```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

#### On Linux:
```bash
sudo apt-get install mongodb
sudo systemctl start mongodb
```

### Step 2: Verify MongoDB is Running

```bash
# Check if MongoDB is running
mongosh
# or
mongo

# You should see MongoDB shell
# Exit with: exit
```

### Step 3: Setup Backend

```bash
# Navigate to backend directory
cd all_static_pages/backend-mern

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env with your configuration:
# MONGODB_URI=mongodb://localhost:27017/academic_erp
# JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
# JWT_EXPIRE=7d
# NODE_ENV=development
# PORT=5000
```

### Step 4: Seed the Database

```bash
# Run the seed script
npm run seed

# You should see:
# ✅ MongoDB Connected
# ✅ Existing data cleared
# ✅ Created 6 users
# ✅ Created 5 services
# ✅ Created 20 leads
# ✅ Created 15 clients
# ✅ Created 30 projects
# ✅ Created 40 payments
# ✅ Created 15 queries
# ✅ Created 25 documents
# ✅ DATABASE SEEDED SUCCESSFULLY
```

### Step 5: Start the Backend Server

```bash
# In the backend-mern directory
npm run dev

# You should see:
# ✅ MongoDB Connected Successfully
# 🚀 Server running on port 5000
# 📝 Environment: development
# 🔗 API URL: http://localhost:5000
# 💚 Health Check: http://localhost:5000/health
```

---

## 🔌 Backend Testing

### Test 1: Health Check

**Test the API is running:**

```bash
# Using curl
curl http://localhost:5000/health

# Expected Response:
# {
#   "success": true,
#   "message": "Academic ERP API is running",
#   "environment": "development",
#   "timestamp": "2024-01-23T...",
#   "database": "Connected"
# }
```

### Test 2: Authentication

#### 2.1 Login as Admin

```bash
# Using curl
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@academicerp.com","password":"password123"}'

# Expected Response:
# {
#   "success": true,
#   "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
#   "data": {
#     "user": {
#       "id": "...",
#       "name": "Admin User",
#       "email": "admin@academicerp.com",
#       "role": "admin"
#     }
#   }
# }
```

#### 2.2 Login as CRM Manager (Sandeep)

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"sandeep@academicerp.com","password":"password123"}'
```

#### 2.3 Login as Lead Manager

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@academicerp.com","password":"password123"}'
```

#### 2.4 Login as Client

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"client1@email.com","password":"password123"}'
```

### Test 3: API Endpoints (Use the token from login)

#### 3.1 Get All Leads

```bash
curl http://localhost:5000/api/leads \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

#### 3.2 Get All Clients

```bash
curl http://localhost:5000/api/clients \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

#### 3.3 Get All Projects

```bash
curl http://localhost:5000/api/projects \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

#### 3.4 Get Dashboard Analytics

```bash
curl http://localhost:5000/api/analytics/dashboard \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Test 4: Create Operations

#### 4.1 Create a New Lead

```bash
curl -X POST http://localhost:5000/api/leads \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Test",
    "lastName": "User",
    "email": "testlead@university.edu",
    "phone": "+1-555-9999",
    "university": "Test University",
    "country": "USA",
    "degree": "PhD",
    "fieldOfStudy": "Computer Science",
    "status": "new",
    "priority": "high",
    "source": "website"
  }'
```

#### 4.2 Create a New Query

```bash
curl -X POST http://localhost:5000/api/queries \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "subject": "Test Query",
    "description": "This is a test query",
    "category": "General",
    "priority": "medium"
  }'
```

---

## 🖥️ Frontend Testing

### Step 1: Open the Login Page

1. Open your web browser
2. Navigate to: `file:///path/to/all_static_pages/login.html`
   - Or if using a local server: `http://localhost:8080/all_static_pages/login.html`

### Step 2: Test Login Flow

#### Test Case 1: Admin Login
- **Email:** `admin@academicerp.com`
- **Password:** `password123`
- **Expected:** Redirect to Admin Dashboard

#### Test Case 2: CRM Manager Login (Sandeep)
- **Email:** `sandeep@academicerp.com`
- **Password:** `password123`
- **Expected:** Redirect to CRM Manager Dashboard

#### Test Case 3: CRM Manager Login (Preet)
- **Email:** `preet@academicerp.com`
- **Password:** `password123`
- **Expected:** Redirect to CRM Manager Dashboard

#### Test Case 4: CRM Manager Login (Deepali)
- **Email:** `deepali@academicerp.com`
- **Password:** `password123`
- **Expected:** Redirect to CRM Manager Dashboard

#### Test Case 5: Lead Manager Login
- **Email:** `john@academicerp.com`
- **Password:** `password123`
- **Expected:** Redirect to Lead Manager Dashboard

#### Test Case 6: Client Login
- **Email:** `client1@email.com`
- **Password:** `password123`
- **Expected:** Redirect to Client Dashboard

#### Test Case 7: Invalid Credentials
- **Email:** `invalid@email.com`
- **Password:** `wrongpassword`
- **Expected:** Error message displayed

### Step 3: Test Dashboard Pages

#### Admin Dashboard (2-admin-dashboard.html)

**Test Data Display:**
- [ ] Total users count is displayed
- [ ] Total clients count is displayed
- [ ] Total leads count is displayed
- [ ] Revenue statistics are shown
- [ ] Charts are rendering properly
- [ ] Recent activities are listed

**Test User Management:**
- [ ] Can view list of all users
- [ ] Can add new user
- [ ] Can edit user details
- [ ] Can deactivate user
- [ ] Can assign managers to clients

**Test Services Management:**
- [ ] Can view all services
- [ ] Can add new service
- [ ] Can edit service details
- [ ] Can deactivate service

#### Lead Manager Dashboard (1-lead-manager.html)

**Test Lead Display:**
- [ ] All leads are displayed
- [ ] Can filter by status
- [ ] Can filter by priority
- [ ] Can search leads
- [ ] Pagination works

**Test Lead Management:**
- [ ] Can create new lead
- [ ] Can edit lead details
- [ ] Can update lead status
- [ ] Can assign lead to another manager
- [ ] Can convert lead to client
- [ ] Can delete lead

**Test Lead Statistics:**
- [ ] Total leads count
- [ ] New leads this week
- [ ] Conversion rate
- [ ] Leads by status chart

#### CRM Manager Dashboard (4-crm-manager.html)

**Test Project Display:**
- [ ] All assigned projects are displayed
- [ ] Can filter by status
- [ ] Can filter by priority
- [ ] Can search projects
- [ ] Pagination works

**Test Project Management:**
- [ ] Can create new project
- [ ] Can update project progress
- [ ] Can change project status
- [ ] Can add milestones
- [ ] Can update milestones
- [ ] Can view project details

**Test Client Management:**
- [ ] Can view assigned clients
- [ ] Can update client details
- [ ] Can view client projects
- [ ] Can view client payments
- [ ] Can view client documents

**Test Query Management:**
- [ ] Can view all queries
- [ ] Can respond to queries
- [ ] Can update query status
- [ ] Can close queries
- [ ] Can filter queries by status

**Test Statistics:**
- [ ] Total projects count
- [ ] Active projects count
- [ ] Total revenue
- [ ] Pending queries count

#### Client Profile Page (3-client-profile.html)

**Test Profile Display:**
- [ ] Client details are shown
- [ ] Contact information is displayed
- [ ] University and degree info is shown

**Test Projects Display:**
- [ ] All client projects are listed
- [ ] Project progress is shown
- [ ] Can view project details
- [ ] Project status badges are correct

**Test Payments Display:**
- [ ] All payments are listed
- [ ] Payment status is shown
- [ ] Total spent is calculated
- [ ] Can view payment details

**Test Documents Display:**
- [ ] All documents are listed
- [ ] Can download documents
- [ ] Document categories are shown
- [ ] Can filter documents

**Test Query System:**
- [ ] Can create new query
- [ ] Can view query status
- [ ] Can add responses
- [ ] Can view query history

---

## 🔗 Integration Testing

### Test 1: Complete User Flow - Admin

1. **Login as Admin**
   - Email: `admin@academicerp.com`
   - Password: `password123`

2. **View Dashboard**
   - Verify all statistics are loading from API
   - Check that numbers match database

3. **Create New User (CRM Manager)**
   - Name: Test Manager
   - Email: testmanager@academicerp.com
   - Role: CRM Manager
   - Verify user appears in users list

4. **Create New Service**
   - Name: Test Service
   - Category: Research
   - Price Range: $1000-$3000
   - Verify service appears in services list

5. **Assign Client to Manager**
   - Select a client
   - Assign to "Sandeep Kumar"
   - Verify assignment is saved

6. **Logout**
   - Click logout
   - Verify redirect to login page

### Test 2: Complete User Flow - Lead Manager

1. **Login as Lead Manager**
   - Email: `john@academicerp.com`
   - Password: `password123`

2. **View Leads Dashboard**
   - Verify leads are displayed
   - Check filters work

3. **Create New Lead**
   - Fill in lead details
   - Submit form
   - Verify lead appears in list

4. **Update Lead Status**
   - Select a lead
   - Change status to "Contacted"
   - Verify status is updated

5. **Convert Lead to Client**
   - Select a qualified lead
   - Click "Convert to Client"
   - Verify client is created

6. **Logout**

### Test 3: Complete User Flow - CRM Manager (Sandeep)

1. **Login as Sandeep**
   - Email: `sandeep@academicerp.com`
   - Password: `password123`

2. **View CRM Dashboard**
   - Verify only assigned clients/projects are shown
   - Check statistics

3. **View Client Details**
   - Click on a client
   - Verify all client information loads
   - Check project history
   - Check payment history

4. **Create New Project**
   - Select client
   - Select service
   - Fill project details
   - Submit form
   - Verify project is created

5. **Update Project Progress**
   - Select a project
   - Update progress to 50%
   - Verify progress bar updates

6. **Respond to Query**
   - Open a pending query
   - Add response
   - Change status to "In Progress"
   - Verify response is saved

7. **Logout**

### Test 4: Complete User Flow - Client

1. **Login as Client**
   - Email: `client1@email.com`
   - Password: `password123`

2. **View Client Dashboard**
   - Verify own projects are displayed
   - Check payment history
   - View documents

3. **Create New Query**
   - Subject: Test Query
   - Description: Need help with project
   - Submit query
   - Verify query appears in list

4. **Download Document**
   - Click on a document
   - Click download
   - Verify download is tracked

5. **View Project Progress**
   - Open project details
   - Check progress bar
   - View milestones

6. **Logout**

---

## ✅ Test Checklist

### Backend API Tests

- [ ] MongoDB connection successful
- [ ] Database seeded successfully
- [ ] Server starts without errors
- [ ] Health check endpoint responds
- [ ] All authentication endpoints work
- [ ] All CRUD operations work for:
  - [ ] Users
  - [ ] Leads
  - [ ] Clients
  - [ ] Projects
  - [ ] Payments
  - [ ] Queries
  - [ ] Services
  - [ ] Documents
- [ ] Analytics endpoints return data
- [ ] Role-based access control works
- [ ] JWT authentication works
- [ ] Error handling works properly

### Frontend Tests

- [ ] All pages load without errors
- [ ] Login page works
- [ ] Registration page works
- [ ] All dashboards display data
- [ ] All forms submit successfully
- [ ] All filters work correctly
- [ ] All search functions work
- [ ] Pagination works
- [ ] Charts and graphs display
- [ ] Modals open and close
- [ ] Alerts and toasts display
- [ ] Logout works correctly

### Integration Tests

- [ ] Admin can manage all users
- [ ] Admin can manage all resources
- [ ] Lead Manager can only see assigned leads
- [ ] CRM Manager (Sandeep) can only see assigned clients
- [ ] CRM Manager (Preet) can only see assigned clients
- [ ] CRM Manager (Deepali) can only see assigned clients
- [ ] Client can only see own data
- [ ] Lead conversion to client works
- [ ] Client assignment to managers works
- [ ] Project progress updates work
- [ ] Query system works end-to-end
- [ ] Payment tracking works
- [ ] Document management works
- [ ] Real-time data refresh works

### Security Tests

- [ ] Cannot access protected pages without login
- [ ] Cannot access admin pages as non-admin
- [ ] Cannot access other users' data
- [ ] Cannot perform unauthorized actions
- [ ] JWT token expires correctly
- [ ] Passwords are hashed
- [ ] SQL injection protection
- [ ] XSS protection

### Performance Tests

- [ ] Pages load in < 2 seconds
- [ ] API responses < 500ms
- [ ] Large data sets paginate correctly
- [ ] No memory leaks
- [ ] Database queries optimized

---

## 🐛 Troubleshooting

### Issue: MongoDB Connection Error

**Solution:**
```bash
# Check if MongoDB is running
sudo systemctl status mongodb  # Linux
brew services list  # Mac
net start MongoDB  # Windows

# If not running, start it
sudo systemctl start mongodb  # Linux
brew services start mongodb-community  # Mac
net start MongoDB  # Windows
```

### Issue: Backend Server Won't Start

**Solution:**
```bash
# Check if port 5000 is in use
lsof -i :5000  # Mac/Linux
netstat -ano | findstr :5000  # Windows

# Kill the process or change port in .env
PORT=5001
```

### Issue: CORS Errors in Browser

**Solution:**
- Make sure backend server is running
- Check CORS settings in server.js
- Use the correct API_BASE_URL in api.js

### Issue: JWT Token Invalid

**Solution:**
```bash
# Clear browser localStorage
# In browser console:
localStorage.clear()

# Then login again
```

### Issue: Seed Script Fails

**Solution:**
```bash
# Drop the database and try again
mongosh
use academic_erp
db.dropDatabase()
exit

# Run seed again
npm run seed
```

### Issue: Frontend Not Connecting to Backend

**Solution:**
1. Verify backend is running: `http://localhost:5000/health`
2. Check `API_BASE_URL` in `assets/js/api.js`
3. Open browser console for errors
4. Check CORS settings

### Issue: No Data Showing on Dashboards

**Solution:**
1. Check browser console for errors
2. Verify you're logged in (check localStorage for token)
3. Check API responses in Network tab
4. Verify backend seed script ran successfully

---

## 📞 Need Help?

If you encounter any issues not covered in this guide:

1. Check the browser console for errors
2. Check the backend server logs
3. Verify all environment variables are set
4. Make sure MongoDB is running
5. Try clearing cache and localStorage
6. Restart the backend server

---

## ✅ Success Criteria

Your system is working correctly if:

1. ✅ All 3 CRM managers (Sandeep, Preet, Deepali) can login
2. ✅ Each manager only sees their assigned clients
3. ✅ Admin can see and manage everything
4. ✅ Lead managers can manage leads
5. ✅ Clients can only see their own data
6. ✅ All CRUD operations work
7. ✅ Real-time data updates work
8. ✅ No console errors
9. ✅ All dashboards display correct data
10. ✅ Authentication and authorization work correctly

---

**Last Updated:** January 24, 2024  
**Version:** 1.0  
**Status:** Production Ready ✅
