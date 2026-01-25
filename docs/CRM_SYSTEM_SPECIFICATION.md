# 🎯 Complete CRM & Service Management System Specification

## 📋 Executive Summary

This document provides a complete specification for an Immigration Services CRM platform with role-based access control, service management, client portal, payment tracking, and communication features.

---

## 🏗️ System Architecture Overview

### Core Components

1. **Authentication & Authorization System**
   - Multi-role login (Admin, CRM Manager, Lead Handler, Client)
   - Role-based access control (RBAC)
   - Session management
   - Password security (SHA-256 hashing)

2. **Admin Panel**
   - Dashboard with analytics
   - User role management
   - Service catalog management
   - Payment oversight
   - Communication management

3. **CRM Module**
   - Lead management
   - Client assignment
   - Progress tracking
   - Communication history

4. **Client Portal**
   - Service browsing and purchase
   - Progress tracking
   - Payment management
   - Communication tools

5. **Service Management**
   - Service catalog
   - Service lifecycle tracking
   - Progress milestones
   - Document management

6. **Payment System**
   - Payment tracking
   - Installment management
   - Payment reminders
   - Invoice generation

7. **Communication Hub**
   - Client queries/requests
   - Chat system
   - Appointment scheduling
   - Notification system

---

## 🎭 User Roles & Permissions

### 1. **Super Admin**
- Full system access
- Create/manage all user roles
- System configuration
- Analytics and reporting
- Service catalog management

**Permissions:**
- `admin.full_access`
- `users.create`, `users.read`, `users.update`, `users.delete`
- `services.create`, `services.read`, `services.update`, `services.delete`
- `payments.full_access`
- `analytics.view`

### 2. **CRM Manager (Customer Relationship Manager)**
- Manage assigned clients
- Update service progress
- View payment status
- Respond to client queries
- Schedule appointments

**Permissions:**
- `clients.read_assigned`, `clients.update_assigned`
- `services.read_assigned`, `services.update_assigned`
- `payments.read_assigned`
- `queries.read_assigned`, `queries.respond`
- `appointments.manage`

### 3. **Lead Handler**
- View and manage leads
- Initial client assessment
- Lead assignment
- Lead-to-client conversion

**Permissions:**
- `leads.read`, `leads.update`, `leads.assign`
- `assessments.create`, `assessments.read`
- `clients.create_from_lead`

### 4. **Client**
- View own profile
- Purchase services
- Track progress
- Make payments
- Submit queries
- Schedule appointments

**Permissions:**
- `profile.read`, `profile.update`
- `services.browse`, `services.purchase`
- `payments.make`, `payments.view_own`
- `queries.create`, `queries.view_own`
- `appointments.create`, `appointments.view_own`

---

## 🗄️ Database Schema

### Table: `users`
```
id: UUID (PK)
username: VARCHAR(100)
email: VARCHAR(255) UNIQUE
password_hash: VARCHAR(255)
role: ENUM('admin', 'crm_manager', 'lead_handler', 'client')
full_name: VARCHAR(255)
phone: VARCHAR(20)
status: ENUM('active', 'inactive', 'suspended')
created_at: TIMESTAMP
updated_at: TIMESTAMP
last_login: TIMESTAMP
```

### Table: `roles_permissions`
```
id: UUID (PK)
role: VARCHAR(50)
permission: VARCHAR(100)
description: TEXT
created_at: TIMESTAMP
```

### Table: `services_catalog`
```
id: UUID (PK)
service_name: VARCHAR(255)
service_code: VARCHAR(50) UNIQUE
category: VARCHAR(100)
description: TEXT
base_price: DECIMAL(10,2)
duration_days: INT
status: ENUM('active', 'inactive', 'archived')
visible_to_roles: JSON
required_documents: JSON
milestones: JSON
created_by: UUID (FK -> users.id)
created_at: TIMESTAMP
updated_at: TIMESTAMP
```

**Service Examples:**
1. Research Paper Publication Assistance
2. Citation Assistance
3. Keynote Speaker Opportunities
4. EB-1A Petition Preparation
5. Profile Enhancement Consulting

### Table: `client_services`
```
id: UUID (PK)
client_id: UUID (FK -> users.id)
service_id: UUID (FK -> services_catalog.id)
assigned_manager_id: UUID (FK -> users.id)
status: ENUM('purchased', 'in_progress', 'pending_documents', 'completed', 'cancelled')
progress_percentage: INT (0-100)
start_date: DATE
estimated_completion: DATE
actual_completion: DATE
total_amount: DECIMAL(10,2)
paid_amount: DECIMAL(10,2)
payment_status: ENUM('unpaid', 'partial', 'paid', 'refunded')
current_milestone: VARCHAR(255)
notes: TEXT
created_at: TIMESTAMP
updated_at: TIMESTAMP
```

### Table: `service_milestones`
```
id: UUID (PK)
client_service_id: UUID (FK -> client_services.id)
milestone_name: VARCHAR(255)
milestone_order: INT
description: TEXT
status: ENUM('pending', 'in_progress', 'completed', 'blocked')
due_date: DATE
completed_date: DATE
completed_by: UUID (FK -> users.id)
notes: TEXT
created_at: TIMESTAMP
updated_at: TIMESTAMP
```

### Table: `payments`
```
id: UUID (PK)
client_id: UUID (FK -> users.id)
service_id: UUID (FK -> client_services.id)
amount: DECIMAL(10,2)
payment_method: VARCHAR(50)
payment_type: ENUM('full', 'installment', 'advance', 'refund')
status: ENUM('pending', 'completed', 'failed', 'refunded')
transaction_id: VARCHAR(255)
payment_date: TIMESTAMP
due_date: DATE
reminder_sent: BOOLEAN
notes: TEXT
created_at: TIMESTAMP
updated_at: TIMESTAMP
```

### Table: `client_queries`
```
id: UUID (PK)
client_id: UUID (FK -> users.id)
service_id: UUID (FK -> client_services.id) NULL
subject: VARCHAR(255)
message: TEXT
priority: ENUM('low', 'medium', 'high', 'urgent')
status: ENUM('new', 'assigned', 'in_progress', 'resolved', 'closed')
assigned_to: UUID (FK -> users.id)
category: VARCHAR(100)
created_at: TIMESTAMP
resolved_at: TIMESTAMP
updated_at: TIMESTAMP
```

### Table: `appointments`
```
id: UUID (PK)
client_id: UUID (FK -> users.id)
manager_id: UUID (FK -> users.id)
appointment_type: VARCHAR(100)
scheduled_date: TIMESTAMP
duration_minutes: INT
meeting_link: VARCHAR(500)
location: VARCHAR(500)
status: ENUM('scheduled', 'confirmed', 'completed', 'cancelled', 'no_show')
notes: TEXT
reminder_sent: BOOLEAN
created_at: TIMESTAMP
updated_at: TIMESTAMP
```

### Table: `chat_messages`
```
id: UUID (PK)
sender_id: UUID (FK -> users.id)
receiver_id: UUID (FK -> users.id)
service_id: UUID (FK -> client_services.id) NULL
message_text: TEXT
is_read: BOOLEAN
attachment_url: VARCHAR(500)
created_at: TIMESTAMP
```

### Table: `leads`
```
id: UUID (PK)
full_name: VARCHAR(255)
email: VARCHAR(255)
phone: VARCHAR(20)
lead_source: VARCHAR(100)
visa_type_interest: VARCHAR(100)
status: ENUM('new', 'contacted', 'qualified', 'converted', 'lost')
assigned_to: UUID (FK -> users.id)
assessment_score: INT
notes: TEXT
converted_to_client_id: UUID (FK -> users.id)
created_at: TIMESTAMP
updated_at: TIMESTAMP
```

---

## 🎨 User Interface Specifications

### 1. **Admin Dashboard**

**Sections:**
- Analytics Cards: Total Revenue, Active Clients, Pending Leads, Services Sold
- Service Management: Add/Edit/Delete services
- User Management: Create CRM Managers, Lead Handlers
- Client Assignment: Assign clients to managers

### 2. **CRM Manager Dashboard**

**Features:**
- My Clients: View assigned clients with service progress
- Services: Update progress, complete milestones
- Payments: Track payments, send reminders
- Queries: Respond to client queries
- Appointments: Schedule and manage meetings

### 3. **Client Portal**

**Features:**
- Browse Services: View available services
- Purchase Services: Select and purchase services
- Track Progress: Real-time progress tracking with milestones
- Payments: View payment history, make payments
- Support: Raise queries, chat with manager
- Appointments: Schedule consultations

---

## 🔄 Key Workflows

### 1. Service Purchase Flow
```
Client selects service → Reviews details → Chooses payment plan → 
Makes payment → Service activated → Assigned to CRM Manager → 
Progress tracking begins
```

### 2. Query Resolution Flow
```
Client raises query → System notifies manager → Manager responds → 
Client receives notification → Follow-up if needed → 
Query resolved → Confirmation
```

### 3. Payment Reminder Flow
```
System checks due dates → 7 days before: First reminder → 
3 days before: Second reminder → 1 day before: Final reminder → 
Overdue: Manager notified → Manual follow-up
```

---

## 📊 Success Metrics

- Monthly Recurring Revenue (MRR)
- Customer Lifetime Value (CLV)
- Lead Conversion Rate
- Service Completion Rate
- Average Query Response Time
- Client Satisfaction Score

---

## 🚀 Implementation Phases

1. **Foundation**: Database, authentication, basic dashboards
2. **CRM Core**: Manager features, client assignment
3. **Client Portal**: Service browsing, purchase, progress tracking
4. **Communication**: Queries, chat, appointments
5. **Payments**: Payment tracking, reminders, gateway integration
6. **Analytics**: Reporting, dashboards, insights

---

*Document Version: 1.0*  
*Last Updated: January 23, 2025*
