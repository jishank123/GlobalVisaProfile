# 📊 ImmigrationPro - Complete Database Design Documentation

## Table of Contents

1. [System Overview](#system-overview)
2. [Database Tables](#database-tables)
3. [Table Relationships](#table-relationships)
4. [ER Diagram](#er-diagram)
5. [Admin Panel Guide](#admin-panel)
6. [Manager Dashboard Guide](#manager-dashboard)
7. [Client Portal Guide](#client-portal)
8. [API Endpoints](#api-endpoints)
9. [Workflows](#workflows)

---

## 1. System Overview

### Purpose
**Immigration Pro** is a comprehensive client management system for immigration profile building and application services. It manages:
- Client profile assessments
- Service tracking with progress bars
- Payment management
- Query/support ticketing
- Account manager assignments (optional)

### Technology Stack
- **Frontend:** HTML5, CSS3, JavaScript (ES6+)
- **Styling:** Tailwind CSS
- **Database:** RESTful Table API
- **Authentication:** SHA-256 + SessionStorage

---

## 2. Database Tables

### 2.1 profile_assessments
**Purpose:** Store EB-1A profile assessments from potential clients

| Field | Type | Key | Description |
|-------|------|-----|-------------|
| id | text | PK | Unique assessment ID (UUID) |
| client_name | text | - | Client's full name |
| client_email | text | - | Client's email |
| client_phone | text | - | Client's phone |
| field_of_expertise | text | - | Professional field |
| years_of_experience | number | - | Years of experience |
| current_location | text | - | us/outside_us |
| criterion_1_awards | number | - | Score 0-3 for Awards |
| criterion_2_memberships | number | - | Score 0-3 for Memberships |
| criterion_3_media | number | - | Score 0-3 for Media Coverage |
| criterion_4_judging | number | - | Score 0-3 for Judging |
| criterion_5_contributions | number | - | Score 0-3 for Original Contributions |
| criterion_6_publications | number | - | Score 0-3 for Publications |
| criterion_7_exhibitions | number | - | Score 0-3 for Exhibitions |
| criterion_8_leadership | number | - | Score 0-3 for Leadership |
| criterion_9_salary | number | - | Score 0-3 for High Salary |
| criterion_10_commercial | number | - | Score 0-3 for Commercial Success |
| overall_score | number | - | Overall percentage (0-100) |
| profile_strength | text | - | Excellent/Strong/Good/Weak |
| criteria_met | number | - | Number of criteria met |
| strong_criteria_count | number | - | Count of strong criteria |
| moderate_criteria_count | number | - | Count of moderate criteria |
| status | text | - | new/contacted/qualified |
| follow_up_status | text | - | pending/scheduled/completed |
| created_at | datetime | - | Creation timestamp |
| updated_at | datetime | - | Update timestamp |

---

### 2.2 client_accounts
**Purpose:** Store authenticated client accounts

| Field | Type | Key | Description |
|-------|------|-----|-------------|
| id | text | PK | Unique client ID (UUID) |
| name | text | - | Client's full name |
| email | text | - | Email (login username) |
| phone | text | - | Contact phone |
| password_hash | text | - | SHA-256 hashed password |
| field_of_expertise | text | - | Professional field |
| account_manager_id | text | FK | References account_managers.id |
| status | text | - | active/inactive/suspended |
| created_at | datetime | - | Account creation date |
| updated_at | datetime | - | Last update date |

**Relationships:**
- `account_manager_id` → `account_managers.id` (Many-to-One)

---

### 2.3 client_services
**Purpose:** Track services and progress for clients

| Field | Type | Key | Description |
|-------|------|-----|-------------|
| id | text | PK | Unique service ID (UUID) |
| client_id | text | FK | References client_accounts.id |
| service_type | text | - | EB-1A/EB-2 NIW/O-1/etc. |
| service_name | text | - | Descriptive name |
| status | text | - | active/on_hold/completed/cancelled |
| progress_percentage | number | - | Progress 0-100% |
| current_milestone | text | - | Current phase description |
| start_date | datetime | - | Service start date |
| expected_completion_date | datetime | - | Expected completion |
| actual_completion_date | datetime | - | Actual completion |
| notes | text | - | Internal notes |
| created_at | datetime | - | Creation timestamp |
| updated_at | datetime | - | Update timestamp |

**Relationships:**
- `client_id` → `client_accounts.id` (Many-to-One)

---

### 2.4 client_payments
**Purpose:** Manage payment records and balances

| Field | Type | Key | Description |
|-------|------|-----|-------------|
| id | text | PK | Unique payment ID (UUID) |
| client_id | text | FK | References client_accounts.id |
| service_type | text | - | Service being paid for |
| total_amount | number | - | Total cost |
| amount_paid | number | - | Amount paid |
| payment_status | text | - | paid/pending/partial/overdue |
| payment_date | datetime | - | Payment date |
| payment_method | text | - | credit_card/bank_transfer/check |
| created_at | datetime | - | Creation timestamp |

**Relationships:**
- `client_id` → `client_accounts.id` (Many-to-One)

---

### 2.5 client_queries
**Purpose:** Support ticket system for client questions

| Field | Type | Key | Description |
|-------|------|-----|-------------|
| id | text | PK | Unique query ID (UUID) |
| client_id | text | FK | References client_accounts.id |
| subject | text | - | Query subject |
| message | text | - | Query message |
| priority | text | - | high/medium/low |
| status | text | - | pending/resolved/closed |
| response | text | - | Admin/manager response |
| response_date | datetime | - | Response date |
| query_date | datetime | - | Query submission date |
| created_at | datetime | - | Creation timestamp |

**Relationships:**
- `client_id` → `client_accounts.id` (Many-to-One)

---

### 2.6 account_managers
**Purpose:** Store account manager profiles (optional)

| Field | Type | Key | Description |
|-------|------|-----|-------------|
| id | text | PK | Unique manager ID (UUID) |
| name | text | - | Manager's full name |
| email | text | - | Email (login username) |
| password_hash | text | - | SHA-256 hashed password |
| phone | text | - | Contact phone |
| status | text | - | active/inactive |
| created_at | datetime | - | Account creation |
| updated_at | datetime | - | Last update |
| notes | text | - | Admin notes |

---

### 2.7 contact_submissions
**Purpose:** Store contact form submissions from website

| Field | Type | Key | Description |
|-------|------|-----|-------------|
| id | text | PK | Unique submission ID |
| name | text | - | Visitor's name |
| email | text | - | Visitor's email |
| phone | text | - | Visitor's phone |
| visa_type | text | - | Visa type of interest |
| message | text | - | Contact message |
| status | text | - | new/contacted/converted |
| submission_date | datetime | - | Submission timestamp |

---

### 2.8 appointment_requests
**Purpose:** Store appointment booking requests

| Field | Type | Key | Description |
|-------|------|-----|-------------|
| id | text | PK | Unique appointment ID |
| name | text | - | Client name |
| email | text | - | Client email |
| phone | text | - | Client phone |
| visa_category | text | - | EB-1A/EB-2 NIW/O-1 |
| timezone | text | - | Client's timezone |
| preferred_date | text | - | Preferred date |
| preferred_time | text | - | Preferred time |
| consultation_type | text | - | phone/video/in-person |
| details | text | - | Additional details |
| status | text | - | pending/confirmed/completed/cancelled |
| submission_date | datetime | - | Submission timestamp |

---

## 3. Table Relationships

### 3.1 Relationship Diagram (Text)

```
client_accounts (1) ←──────── (N) client_services
      ↓
      │ (1-to-Many)
      ↓
client_payments (N)
      ↓
      │ (1-to-Many)
      ↓
client_queries (N)

account_managers (1) ←──────── (N) client_accounts
      ↓
      │ (1-to-Many - Optional)
      ↓
Assigned Clients
```

### 3.2 Foreign Key Relationships

| Child Table | Foreign Key Field | Parent Table | Parent Key | Relationship |
|-------------|-------------------|--------------|------------|--------------|
| client_accounts | account_manager_id | account_managers | id | Many-to-One (Optional) |
| client_services | client_id | client_accounts | id | Many-to-One |
| client_payments | client_id | client_accounts | id | Many-to-One |
| client_queries | client_id | client_accounts | id | Many-to-One |

### 3.3 Relationship Details

**1. account_managers → client_accounts**
- Type: One-to-Many (Optional)
- Description: One manager can have multiple clients. Clients may not have a manager assigned.
- Usage: Used for assigning clients to specific account managers for personalized service.

**2. client_accounts → client_services**
- Type: One-to-Many
- Description: One client can have multiple services (e.g., EB-1A, O-1, Profile Building).
- Usage: Track all services purchased by a client.

**3. client_accounts → client_payments**
- Type: One-to-Many
- Description: One client can have multiple payment records.
- Usage: Track payment history and outstanding balances.

**4. client_accounts → client_queries**
- Type: One-to-Many
- Description: One client can submit multiple queries/support tickets.
- Usage: Communication channel between clients and support team.

---

## 4. ER Diagram

### Complete Entity Relationship Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         ER DIAGRAM                               │
└─────────────────────────────────────────────────────────────────┘

┌──────────────────────┐
│  account_managers    │
│──────────────────────│
│ • id (PK)            │
│   name               │
│   email              │
│   password_hash      │
│   phone              │
│   status             │
│   created_at         │
│   updated_at         │
└──────────┬───────────┘
           │
           │ 1:N (Optional)
           │
           ▼
┌──────────────────────┐        ┌──────────────────────┐
│  client_accounts     │        │ profile_assessments  │
│──────────────────────│        │──────────────────────│
│ • id (PK)            │        │ • id (PK)            │
│   name               │        │   client_name        │
│   email              │        │   client_email       │
│   phone              │        │   client_phone       │
│   password_hash      │        │   field_of_expertise │
│   field_of_expertise │        │   overall_score      │
│ ○ account_manager_id │        │   profile_strength   │
│     (FK)             │        │   criteria_met       │
│   status             │        │   status             │
│   created_at         │        │   created_at         │
└──────────┬───────────┘        └──────────────────────┘
           │
           │ 1:N
           │
    ┌──────┴──────┬──────────────┐
    │             │              │
    ▼             ▼              ▼
┌──────────────┐ ┌─────────────┐ ┌──────────────┐
│client_services│ │client_      │ │client_queries│
│──────────────│ │payments     │ │──────────────│
│• id (PK)     │ │─────────────│ │• id (PK)     │
│○ client_id   │ │• id (PK)    │ │○ client_id   │
│  (FK)        │ │○ client_id  │ │  (FK)        │
│  service_type│ │  (FK)       │ │  subject     │
│  status      │ │  total_amt  │ │  message     │
│  progress_%  │ │  amt_paid   │ │  priority    │
│  milestone   │ │  status     │ │  status      │
│  start_date  │ │  pay_date   │ │  response    │
│  created_at  │ │  created_at │ │  query_date  │
└──────────────┘ └─────────────┘ └──────────────┘

Legend:
  • PK = Primary Key
  ○ FK = Foreign Key
  1:N = One-to-Many relationship
```

---

## 5. Admin Panel Guide

### 5.1 Admin Panel Overview

**URL:** `admin-dashboard.html`  
**Access:** Open directly (no authentication required)

**Purpose:** Central hub for viewing all submissions and assigning account managers.

### 5.2 Admin Panel Features

#### Feature 1: View Contact Submissions
**Tab:** Contact Submissions

**What You See:**
- Date of submission
- Name, Email, Phone (clickable to contact)
- Visa Type of interest
- Message content
- Current status
- Actions (View details, Update status)

**Actions Available:**
- View full submission details in modal
- Update status (new → contacted → converted)

#### Feature 2: View Appointment Requests
**Tab:** Appointment Requests

**What You See:**
- Date of request
- Name, Email, Phone
- Visa Category
- Preferred Date/Time, Timezone
- Consultation Type
- Status
- Actions (View, Update status)

**Actions Available:**
- View complete appointment details
- Update status (pending → confirmed → completed)

#### Feature 3: View Profile Assessments
**Tab:** Profile Assessments

**What You See:**
- Date/Time of assessment
- Client Name (clickable email)
- Field of Expertise
- Overall Score (color-coded)
- Profile Strength badge
- Criteria Met (X/3 required)
- Status
- Actions (View, **Assign Manager**)

**Actions Available:**
- View complete assessment with all 10 criteria scores
- **Assign Account Manager** to client
- Update follow-up status

#### Feature 4: Assign Account Managers
**How It Works:**

1. Click "View" on any profile assessment
2. Review client details and scores
3. Click "Assign Account Manager" button (green)
4. Select manager from dropdown:
   - Sandeep Kumar
   - Preet Singh
   - Deepali Sharma
5. Click "Assign Manager"
6. System creates/updates client account
7. Manager can now see client in their dashboard

**Screenshot Description:**
```
┌─────────────────────────────────────────────────────┐
│ Admin Dashboard - Profile Assessments Tab           │
├─────────────────────────────────────────────────────┤
│                                                      │
│ [Contact Submissions] [Appointments] [Assessments]  │
│                                      ============    │
│                                                      │
│ ┌─────────────────────────────────────────────────┐│
│ │ Date/Time │ Name  │ Field  │ Score │ Actions  ││
│ ├─────────────────────────────────────────────────┤│
│ │ 01/15 9AM │ John  │ Tech   │ 87%   │ [View]   ││
│ │           │ Doe   │        │ Green │          ││
│ └─────────────────────────────────────────────────┘│
│                                                      │
│ [View Details Modal Opens]                          │
│ ┌───────────────────────────────────────────────┐  │
│ │ Assessment Details: John Doe                   │  │
│ │                                                │  │
│ │ Contact: john@example.com | +1-555-0100       │  │
│ │ Field: Computer Science | Score: 87%          │  │
│ │                                                │  │
│ │ All 10 Criteria Scores Displayed...           │  │
│ │                                                │  │
│ │ [Assign Account Manager] ← Click This         │  │
│ └───────────────────────────────────────────────┘  │
│                                                      │
│ [Manager Selection Modal]                           │
│ ┌───────────────────────────────────────────────┐  │
│ │ Assign Manager to: John Doe                    │  │
│ │                                                │  │
│ │ Select Manager:                                │  │
│ │ [▼ Dropdown]                                   │  │
│ │   • Sandeep Kumar                              │  │
│ │   • Preet Singh                                │  │
│ │   • Deepali Sharma                             │  │
│ │                                                │  │
│ │ [Cancel] [Assign Manager]                      │  │
│ └───────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────┘
```

### 5.3 Admin Panel Statistics

**Stats Cards (Top of Dashboard):**
- Total Contacts
- Total Appointments
- Total Assessments
- New (Uncontacted)
- Pending Appointments

---

## 6. Manager Dashboard Guide

### 6.1 Manager Dashboard Overview

**URL:** `manager-dashboard.html`  
**Access:** Open directly (no authentication required)  
**Note:** Shows ALL clients (authentication removed)

### 6.2 Manager Dashboard Features

#### Feature 1: Dashboard Overview
**Stats Cards:**
- **Total Clients:** All clients in system
- **Active Services:** Count of active services
- **Pending Queries:** Count of pending queries
- **Total Revenue:** Sum of all payments received

#### Feature 2: My Clients Tab
**What You See:**
- Client Name
- Email (clickable mailto:)
- Phone (clickable tel:)
- Field of Expertise
- Status badge (color-coded)
- Actions (View details)

**Features:**
- Real-time search by name, email, or phone
- View full client details in modal
- Click email/phone for instant contact

**Screenshot Description:**
```
┌─────────────────────────────────────────────────────┐
│ Client Management Dashboard                          │
│ View: All Managers                                   │
├─────────────────────────────────────────────────────┤
│                                                      │
│ [📊 Stats Cards Row]                                │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ │
│  │ Clients │ │ Services│ │ Queries │ │ Revenue │ │
│  │   15    │ │    8    │ │    3    │ │ $45,000 │ │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘ │
│                                                      │
│ [My Clients] [Services] [Payments] [Queries]        │
│  ==========                                          │
│                                                      │
│ Search: [____________] [Refresh]                    │
│                                                      │
│ ┌─────────────────────────────────────────────────┐│
│ │ Name    │ Email    │ Phone    │ Field │ Actions││
│ ├─────────────────────────────────────────────────┤│
│ │ John    │ john@... │ 555-0100 │ Tech  │ [View] ││
│ │ Jane    │ jane@... │ 555-0200 │ Bio   │ [View] ││
│ │ Mike    │ mike@... │ 555-0300 │ Arts  │ [View] ││
│ └─────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────┘
```

#### Feature 3: Services Tab
**What You See:**
- Client Name
- Service Type (EB-1A, EB-2 NIW, etc.)
- Status badge
- Progress bar (0-100%)
- Current Milestone
- Actions (View, **Update**)

**Update Progress Feature:**
1. Click "Update" button
2. Modal opens with form:
   - Progress % (slider 0-100)
   - Current Milestone (text input)
   - Status dropdown
3. Save changes
4. Client sees update in their portal immediately

**Screenshot Description:**
```
┌─────────────────────────────────────────────────────┐
│ Services Tab                                         │
├─────────────────────────────────────────────────────┤
│                                                      │
│ [My Clients] [Services] [Payments] [Queries]        │
│              =========                               │
│                                                      │
│ ┌─────────────────────────────────────────────────┐│
│ │ Client │ Service │ Status │ Progress │ Actions ││
│ ├─────────────────────────────────────────────────┤│
│ │ John   │ EB-1A   │ Active │ [████░░] │ [View]  ││
│ │        │         │        │ 60%      │ [Update]││
│ │        │         │        │          │         ││
│ │ Milestone: Evidence Package Assembly           ││
│ └─────────────────────────────────────────────────┘│
│                                                      │
│ [Update Modal]                                      │
│ ┌───────────────────────────────────────────────┐  │
│ │ Update Service Progress                        │  │
│ │                                                │  │
│ │ Progress (%): [===60===] 60%                  │  │
│ │                                                │  │
│ │ Milestone: [Evidence Package Assembly_______] │  │
│ │                                                │  │
│ │ Status: [Active ▼]                            │  │
│ │                                                │  │
│ │ [Cancel] [Update Progress]                     │  │
│ └───────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────┘
```

#### Feature 4: Payments Tab
**What You See:**
- Client Name
- Service Type
- Total Amount
- Amount Paid (green)
- Balance (orange)
- Payment Status badge
- Payment Date

**Features:**
- Monitor all payment statuses
- Identify overdue payments
- Track revenue by service

#### Feature 5: Queries Tab
**What You See:**
- Query Date
- Client Name
- Subject
- Priority badge (high/medium/low)
- Status badge
- Actions (View, **Resolve**)

**Resolve Query Feature:**
1. Click "Resolve" button
2. Confirmation dialog
3. Query marked as resolved
4. Client sees resolution in their portal

---

## 7. Client Portal Guide

### 7.1 Client Portal Overview

**URLs:**
- Sign Up: `client-signup.html`
- Login: `client-login.html`
- Dashboard: `client-dashboard.html`

**Access:** Clients create accounts and login

### 7.2 Client Registration

**Process:**
1. Visit `client-signup.html`
2. Fill form:
   - Full Name
   - Email
   - Phone
   - Password (min 8 chars)
   - Confirm Password
3. Click "Create Account"
4. Account created, redirected to login

### 7.3 Client Login

**Process:**
1. Visit `client-login.html`
2. Enter Email + Password
3. Click "Sign In"
4. Redirected to `client-dashboard.html`

### 7.4 Client Dashboard Features

#### Tab 1: Overview
**What Clients See:**
- Welcome message with name
- Quick action buttons
- Recent activity summary

#### Tab 2: Assessment
**What Clients See:**
- Their profile assessment results
- Overall score (color-coded)
- Profile strength rating
- All 10 criteria scores
- Recommendations

**Screenshot Description:**
```
┌─────────────────────────────────────────────────────┐
│ Client Portal - My Dashboard                         │
│ Welcome, John Doe                                    │
├─────────────────────────────────────────────────────┤
│                                                      │
│ [Overview] [Assessment] [Services] [Payments] [Q's] │
│            ===========                               │
│                                                      │
│ Your Profile Assessment Results                     │
│                                                      │
│ ┌───────────────────────────────────────────────┐  │
│ │ Overall Score: 87%                             │  │
│ │ [████████████████░░░] Excellent                │  │
│ │                                                │  │
│ │ Criteria Met: 7 out of 10                     │  │
│ │                                                │  │
│ │ Strong Areas:                                  │  │
│ │ ✓ Publications (Strong)                        │  │
│ │ ✓ Citations (Strong)                           │  │
│ │ ✓ Awards (Strong)                              │  │
│ │                                                │  │
│ │ Recommendations:                               │  │
│ │ • Strengthen Media Coverage                    │  │
│ │ • Document Leadership Roles                    │  │
│ └───────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────┘
```

#### Tab 3: Services
**What Clients See:**
- List of all their purchased services
- Service name and type
- **Real-time progress bar (0-100%)**
- **Current milestone**
- Status badge
- Start and expected completion dates

**Key Feature:** Progress updates made by managers appear instantly!

**Screenshot Description:**
```
┌─────────────────────────────────────────────────────┐
│ Services Tab                                         │
├─────────────────────────────────────────────────────┤
│                                                      │
│ [Overview] [Assessment] [Services] [Payments] [Q's] │
│                         =========                    │
│                                                      │
│ My Services                                         │
│                                                      │
│ ┌───────────────────────────────────────────────┐  │
│ │ EB-1A Application Preparation                  │  │
│ │                                                │  │
│ │ Progress: [████████████░░░░░] 60%             │  │
│ │                                                │  │
│ │ Current Milestone:                             │  │
│ │ 📝 Evidence Package Assembly                   │  │
│ │                                                │  │
│ │ Status: ● Active                               │  │
│ │ Started: Jan 1, 2025                           │  │
│ │ Expected: July 1, 2025                         │  │
│ └───────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────┘
```

#### Tab 4: Payments
**What Clients See:**
- Payment history table
- Service paid for
- Total amount
- Amount paid
- Balance remaining
- Payment status
- Payment date

**Benefits:**
- Full transparency on payments
- See outstanding balances
- Track payment history

#### Tab 5: Queries
**What Clients See:**
- Form to submit new query
- List of submitted queries
- Query subject and status
- Admin/manager responses

**Submit Query Process:**
1. Click "Submit Query" button
2. Fill form:
   - Subject
   - Priority (high/medium/low)
   - Message
3. Click "Submit"
4. Query appears in list
5. Manager sees and responds
6. Client sees response in portal

---

## 8. API Endpoints

### 8.1 RESTful API Structure

**Base URL:** Relative URLs (e.g., `tables/client_accounts`)

### 8.2 Available Endpoints

| Method | Endpoint | Purpose | Request Body | Response |
|--------|----------|---------|--------------|----------|
| GET | tables/{table} | List records | - | {data: [], total, page, limit} |
| GET | tables/{table}?search={query} | Search records | - | {data: [], total} |
| GET | tables/{table}/{id} | Get single record | - | Single record object |
| POST | tables/{table} | Create record | JSON object | Created record (HTTP 201) |
| PUT | tables/{table}/{id} | Update record (full) | JSON object | Updated record |
| PATCH | tables/{table}/{id} | Update record (partial) | JSON object | Updated record |
| DELETE | tables/{table}/{id} | Delete record | - | No content (HTTP 204) |

### 8.3 Example API Calls

**1. Get All Clients:**
```javascript
const response = await fetch('tables/client_accounts?limit=100');
const data = await response.json();
// Returns: {data: [...], total: 15, page: 1, limit: 100}
```

**2. Create New Service:**
```javascript
const response = await fetch('tables/client_services', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({
        client_id: 'abc-123',
        service_type: 'EB-1A',
        status: 'active',
        progress_percentage: 0
    })
});
const newService = await response.json();
```

**3. Update Service Progress:**
```javascript
const response = await fetch('tables/client_services/service-id-123', {
    method: 'PATCH',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({
        progress_percentage: 60,
        current_milestone: 'Evidence Package Assembly'
    })
});
```

**4. Search Clients by Email:**
```javascript
const response = await fetch('tables/client_accounts?search=john@example.com');
const data = await response.json();
```

---

## 9. System Workflows

### 9.1 Client Onboarding Workflow

```
Step 1: Client Takes Assessment
  ↓ Visits profile-assessment.html
  ↓ Completes all 10 criteria
  ↓ Provides contact info
  ↓
Step 2: Data Saved to Database
  ↓ Stored in profile_assessments table
  ↓ Admin receives notification
  ↓
Step 3: Admin Reviews Assessment
  ↓ Opens admin-dashboard.html
  ↓ Views "Profile Assessments" tab
  ↓ Reviews client score & details
  ↓
Step 4: Admin Assigns Manager (Optional)
  ↓ Clicks "Assign Account Manager"
  ↓ Selects manager from dropdown
  ↓ Confirms assignment
  ↓
Step 5: Client Account Created
  ↓ If doesn't exist: auto-created
  ↓ account_manager_id field set
  ↓ Client receives credentials
  ↓
Step 6: Manager Takes Ownership
  ↓ Manager logs into dashboard
  ↓ Sees new client in "My Clients"
  ↓ Reviews assessment results
  ↓ Contacts client
  ↓
Step 7: Service Begins
  ↓ Admin creates service record
  ↓ Sets progress to 0%
  ↓ Status: Active
  ↓
Step 8: Progress Updates
  ↓ Manager updates progress weekly
  ↓ Milestone updates
  ↓ Client sees updates in portal
  ↓
Step 9: Payment Processing
  ↓ Payment records created
  ↓ Client views in payment tab
  ↓ Manager monitors status
  ↓
Step 10: Query Support
  ↓ Client submits query
  ↓ Manager responds
  ↓ Query marked resolved
```

### 9.2 Service Progress Update Workflow

```
Manager Updates Progress:
  1. Login to manager-dashboard.html
  2. Click "Services" tab
  3. Find client's service
  4. Click "Update" button
  5. Modify:
     - Progress % (0-100)
     - Current Milestone
     - Status if needed
  6. Click "Update Progress"
  7. Changes saved to database

Client Sees Update:
  1. Login to client-dashboard.html
  2. Click "Services" tab
  3. See updated progress bar
  4. See new milestone description
  5. Real-time sync (no refresh needed)
```

### 9.3 Query Resolution Workflow

```
Client Submits Query:
  1. Login to client-dashboard.html
  2. Click "Queries" tab
  3. Click "Submit Query"
  4. Fill subject, priority, message
  5. Click "Submit"
  6. Query saved to client_queries table

Manager Responds:
  1. Login to manager-dashboard.html
  2. Click "Queries" tab
  3. See new query (pending status)
  4. Click "View" to read details
  5. Click "Resolve" button
  6. Confirmation dialog
  7. Query marked as resolved

Client Sees Resolution:
  1. Login to client-dashboard.html
  2. Click "Queries" tab
  3. See query status: "Resolved"
  4. Read manager's response
```

---

## 10. How to Convert This to PDF

### Option 1: Browser Print
1. Open `database-documentation.html` in Chrome/Edge
2. Press **Ctrl+P** (Windows) or **Cmd+P** (Mac)
3. Select **"Save as PDF"**
4. Settings:
   - Paper: A4
   - Margins: Default
   - Background graphics: ON
5. Click **"Save"**

### Option 2: Use This Markdown
1. This markdown file can be converted using:
   - Pandoc: `pandoc database-docs.md -o database-docs.pdf`
   - Online converters (markdown-to-pdf)
   - VS Code extensions

---

## Summary

### Database Tables: 8 Total
1. ✅ profile_assessments (27 fields)
2. ✅ client_accounts (10 fields)
3. ✅ client_services (13 fields)
4. ✅ client_payments (9 fields)
5. ✅ client_queries (10 fields)
6. ✅ account_managers (9 fields)
7. ✅ contact_submissions (7 fields)
8. ✅ appointment_requests (12 fields)

### Key Relationships:
- account_managers → client_accounts (1:N)
- client_accounts → client_services (1:N)
- client_accounts → client_payments (1:N)
- client_accounts → client_queries (1:N)

### User Panels: 3 Total
1. ✅ Admin Panel - View all data, assign managers
2. ✅ Manager Dashboard - Manage clients, update progress
3. ✅ Client Portal - Track services, view payments, submit queries

### Status: ✅ PRODUCTION READY

All documentation complete!

---

**Date:** January 2025  
**Version:** 1.0  
**Project:** ImmigrationPro Complete System