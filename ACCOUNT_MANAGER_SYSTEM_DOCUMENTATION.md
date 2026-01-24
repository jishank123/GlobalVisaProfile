# Account Manager System - Complete Documentation

## 🎯 Overview

The Account Manager System allows **Admins** to assign dedicated account managers to clients who can then track and manage their clients' complete journey including:

- Profile assessments and progress
- Service enrollment and milestones
- Payment tracking and status
- Client queries and support requests

---

## 📋 System Components

### 1. Database Tables

#### `account_managers` Table
Stores account manager profiles and credentials.

**Fields:**
- `id` (text) - Unique manager ID
- `name` (text) - Manager's full name
- `email` (text) - Manager's email (login username)
- `password_hash` (text) - Hashed password
- `phone` (text) - Contact phone number
- `status` (text) - active/inactive
- `created_at` (datetime) - Account creation date
- `updated_at` (datetime) - Last update
- `notes` (text) - Admin notes about the manager

#### `client_accounts` Table (Updated)
Includes `account_manager_id` field to link clients to their assigned manager.

**Key Fields:**
- `id` - Client ID
- `account_manager_id` - Assigned manager's ID
- `name`, `email`, `phone` - Client contact info
- `field_of_expertise` - Professional field
- `status` - Client status

---

## 🚀 Setup Instructions

### Step 1: Create Default Account Managers

Three default managers are pre-configured:

1. **Sandeep Kumar**
   - Email: sandeep@immigrationpro.com
   - Password: sandeep123
   
2. **Preet Singh**
   - Email: preet@immigrationpro.com
   - Password: preet123
   
3. **Deepali Sharma**
   - Email: deepali@immigrationpro.com
   - Password: deepali123

**To initialize managers:**
1. Open `_setup-managers.html` in your browser
2. Click "Create Default Managers"
3. Wait for confirmation message

---

## 👥 User Roles & Access

### Admin Dashboard (`admin-dashboard.html`)

**Access:** Admin users only  
**URL:** `/admin-dashboard.html`

**Capabilities:**
- View all contact submissions, appointments, and profile assessments
- Assign account managers to clients
- Track overall system metrics
- Update submission statuses

**Manager Assignment Workflow:**
1. Navigate to "Profile Assessments" tab
2. Click "View" on any assessment
3. Review client details and assessment scores
4. Click "Assign Account Manager" button
5. Select manager from dropdown
6. Confirm assignment

**What Happens:**
- If client account exists → Manager ID is added to their account
- If client account doesn't exist → New account is created with manager assignment
- Client can now be tracked by assigned manager

---

### Account Manager Dashboard (`manager-dashboard.html`)

**Access:** Account managers only  
**URL:** `/manager-dashboard.html`  
**Login:** `/manager-login.html`

**Features:**

#### 📊 Dashboard Overview
4 stat cards showing:
- Total Clients assigned
- Active Services count
- Pending Queries count  
- Total Revenue from assigned clients

#### 👥 My Clients Tab
**View all assigned clients with:**
- Name, Email, Phone (clickable for contact)
- Field of Expertise
- Current Status
- Actions: View full details

**Client Search:** Real-time search by name, email, or phone

#### 💼 Services Tab
**Track all services for assigned clients:**
- Service Type (EB-1A, EB-2 NIW, O-1, etc.)
- Status (active, on_hold, completed, cancelled)
- Progress percentage (0-100%)
- Current Milestone
- Actions: View details, Update progress

**Update Service Progress:**
- Click "Update" button
- Modify progress percentage
- Update current milestone
- Change status if needed
- Save changes

#### 💳 Payments Tab
**Monitor payment status:**
- Total Amount
- Amount Paid
- Balance Due
- Payment Status (paid, pending, partial, overdue)
- Payment Date

#### 💬 Queries Tab
**Manage client questions:**
- Query Date and Subject
- Priority (high, medium, low)
- Status (pending, resolved)
- Actions: View full details, Mark as resolved

---

### Manager Login Process

**Login Page:** `manager-login.html`

**Steps:**
1. Enter email address
2. Enter password
3. Click "Sign In"

**Authentication:**
- Credentials verified against `account_managers` table
- Password hashing using SHA-256
- Session data stored in `sessionStorage`
- Automatic redirect to dashboard on success

**Password Validation:**
- Minimum 8 characters
- Must include uppercase, lowercase, and number
- Hashed before storage

---

## 🔄 Complete Client Flow

### 1. Client Takes Assessment
```
Client visits profile-assessment.html
↓
Fills out comprehensive EB-1A assessment
↓
Provides contact info (name, email, phone)
↓
Data saved to profile_assessments table
```

### 2. Admin Reviews & Assigns Manager
```
Admin opens admin-dashboard.html
↓
Views "Profile Assessments" tab
↓
Reviews client's score and details
↓
Clicks "Assign Account Manager"
↓
Selects appropriate manager
↓
Client-Manager relationship established
```

### 3. Manager Takes Ownership
```
Manager logs into manager-dashboard.html
↓
Sees new client in "My Clients" tab
↓
Reviews assessment results
↓
Tracks services, payments, queries
↓
Updates progress as work progresses
```

### 4. Client Portal Access
```
Client logs into client-dashboard.html
↓
Views their assessment results
↓
Sees real-time service progress
↓
Checks payment status
↓
Submits queries to manager
```

---

## 📈 Key Features

### For Admins:
✅ Centralized view of all leads  
✅ Easy manager assignment  
✅ System-wide metrics  
✅ Status tracking  

### For Account Managers:
✅ See only assigned clients  
✅ Complete client history  
✅ Update service progress  
✅ Manage queries  
✅ Track payments  
✅ Real-time data refresh (every 60 seconds)  

### For Clients:
✅ 24/7 portal access  
✅ See service progress  
✅ Track payment status  
✅ Submit queries  
✅ View assessment results  

---

## 🛠️ Technical Details

### Authentication
- **Manager Authentication:** Email + Password (SHA-256 hashed)
- **Session Management:** Browser sessionStorage
- **Auto-logout:** On browser close

### Data Loading
- **Initial Load:** All data loaded on page load
- **Auto-Refresh:** Every 60 seconds (managers), 30 seconds (admin)
- **Search:** Client-side filtering for instant results

### API Endpoints Used
```
GET  tables/client_accounts       - Fetch clients
GET  tables/client_services        - Fetch services
GET  tables/client_payments        - Fetch payments
GET  tables/client_queries         - Fetch queries
GET  tables/account_managers       - Fetch managers

POST   tables/client_accounts      - Create client account
PATCH  tables/client_accounts/:id  - Assign manager
PATCH  tables/client_services/:id  - Update progress
PATCH  tables/client_queries/:id   - Update status
```

---

## 📊 Manager Assignment Logic

**When Assigning a Manager:**

```javascript
1. Check if client_accounts record exists
   - Search by email address
   
2. If EXISTS:
   - PATCH client_accounts/:id
   - Add account_manager_id field
   
3. If NOT EXISTS:
   - POST new client_accounts record
   - Include account_manager_id in creation
   - Set temporary password
   - Status: 'active'
```

---

## 🎨 UI/UX Features

### Color-Coded Status Badges
- **Active/Resolved:** Green
- **Pending:** Yellow
- **On Hold:** Orange
- **Completed:** Blue
- **Cancelled/Overdue:** Red

### Progress Indicators
- Visual progress bars (0-100%)
- Color-coded scores
- Strength indicators (Excellent, Strong, Good, Weak)

### Quick Actions
- One-click email/phone contact
- Instant status updates
- Real-time search
- Modal pop-ups for details

---

## 🔐 Security Considerations

1. **Password Hashing:** All passwords hashed with SHA-256
2. **Session-Based Auth:** No persistent tokens in localStorage
3. **Client-Side Validation:** Form validation before submission
4. **Role Separation:** Managers only see their clients
5. **Secure Communication:** All API calls over HTTPS (in production)

---

## 📝 Example Workflows

### Assigning a Manager to High-Score Client

1. **Admin Dashboard:**
   - Profile Assessment shows: John Doe, 87% score, 7 criteria met
   - Click "View" → See full assessment details
   - Click "Assign Account Manager"
   - Select "Sandeep" from dropdown
   - Confirm assignment

2. **Sandeep's Dashboard:**
   - Automatically sees John Doe in "My Clients"
   - Views assessment: Strong in Publications, Awards, Media
   - Ready to reach out with EB-1A Premium Package offer

### Updating Service Progress

1. **Manager Dashboard → Services Tab:**
   - See "Jane Smith - EB-1A Application"
   - Current: 40% - "Evidence Collection"
   - Click "Update"
   
2. **Update Modal:**
   - Progress: Change to 60%
   - Milestone: "Evidence Package Assembly"
   - Status: Keep as "active"
   - Save

3. **Client Portal:**
   - Jane logs in
   - Sees updated progress: 60%
   - Sees new milestone notification

---

## 🚨 Troubleshooting

### Manager Can't Login
**Check:**
- Email is correct (from account_managers table)
- Password meets requirements (8+ chars, mixed case, number)
- Manager status is 'active'

### Client Not Showing for Manager
**Check:**
- Client account has account_manager_id field set
- Manager ID matches in client_accounts table
- Try refreshing dashboard

### Assign Manager Button Not Working
**Check:**
- Account managers exist in system
- Run _setup-managers.html if needed
- Check browser console for errors

---

## 📧 Support & Contact

For technical issues or questions about the Account Manager System:

**Documentation:** This file (`ACCOUNT_MANAGER_SYSTEM_DOCUMENTATION.md`)  
**Setup File:** `_setup-managers.html`  
**Login Pages:** `manager-login.html`, `client-login.html`  
**Dashboards:** `admin-dashboard.html`, `manager-dashboard.html`, `client-dashboard.html`

---

## ✅ Quick Reference

### Default Manager Credentials:
| Name | Email | Password |
|------|-------|----------|
| Sandeep Kumar | sandeep@immigrationpro.com | sandeep123 |
| Preet Singh | preet@immigrationpro.com | preet123 |
| Deepali Sharma | deepali@immigrationpro.com | deepali123 |

### Key URLs:
- **Admin:** `/admin-dashboard.html`
- **Manager Login:** `/manager-login.html`
- **Manager Dashboard:** `/manager-dashboard.html`
- **Client Login:** `/client-login.html`
- **Client Dashboard:** `/client-dashboard.html`
- **Setup:** `/_setup-managers.html`

---

**Last Updated:** 2025-01-XX  
**Version:** 1.0  
**Status:** ✅ Production Ready
