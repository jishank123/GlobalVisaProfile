# API Structure Documentation
## Academic & Professional Consultancy ERP System

**Version:** 1.0  
**Last Updated:** January 23, 2025  
**Base URL:** `https://api.academic-erp.com/v1`

---

## Table of Contents

1. [Authentication](#authentication)
2. [User Management](#user-management)
3. [Lead Management](#lead-management)
4. [Client Management](#client-management)
5. [Project Management](#project-management)
6. [Payment Management](#payment-management)
7. [Query Management](#query-management)
8. [Service Management](#service-management)
9. [Analytics & Reports](#analytics--reports)
10. [Document Management](#document-management)

---

## Authentication

### POST /auth/register
Register a new user account.

**Request Body:**
```json
{
  "first_name": "John",
  "last_name": "Smith",
  "email": "john.smith@example.com",
  "password": "securePassword123",
  "company_name": "Academic Solutions Inc",
  "phone": "+1-555-000-0000",
  "country": "US",
  "role": "admin"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user_id": "usr_abc123",
    "email": "john.smith@example.com",
    "role": "admin",
    "created_at": "2025-01-23T10:30:00Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

### POST /auth/login
Authenticate user and get access token.

**Request Body:**
```json
{
  "email": "john.smith@example.com",
  "password": "securePassword123"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user_id": "usr_abc123",
    "email": "john.smith@example.com",
    "first_name": "John",
    "last_name": "Smith",
    "role": "admin",
    "permissions": ["read:leads", "write:leads", "manage:users"]
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expires_in": 86400
}
```

---

### POST /auth/logout
Logout user and invalidate token.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

## User Management

### GET /users
Get all users (Admin only).

**Query Parameters:**
- `page` (integer): Page number (default: 1)
- `limit` (integer): Results per page (default: 20)
- `role` (string): Filter by role (admin, lead_manager, crm_manager, consultant, client)
- `status` (string): Filter by status (active, inactive)
- `search` (string): Search by name or email

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "user_id": "usr_abc123",
      "first_name": "John",
      "last_name": "Smith",
      "email": "john.smith@example.com",
      "role": "lead_manager",
      "status": "active",
      "created_at": "2025-01-15T10:00:00Z",
      "last_login": "2025-01-23T09:30:00Z"
    }
  ],
  "pagination": {
    "total": 45,
    "page": 1,
    "limit": 20,
    "total_pages": 3
  }
}
```

---

### POST /users
Create a new user (Admin only).

**Request Body:**
```json
{
  "first_name": "Emily",
  "last_name": "Roberts",
  "email": "emily.roberts@example.com",
  "role": "crm_manager",
  "phone": "+1-555-111-2222",
  "status": "active"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "User created successfully",
  "data": {
    "user_id": "usr_def456",
    "email": "emily.roberts@example.com",
    "temporary_password": "TempPass123!"
  }
}
```

---

### GET /users/:user_id
Get specific user details.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "user_id": "usr_abc123",
    "first_name": "John",
    "last_name": "Smith",
    "email": "john.smith@example.com",
    "role": "lead_manager",
    "phone": "+1-555-000-0000",
    "company": "Academic Solutions Inc",
    "status": "active",
    "created_at": "2025-01-15T10:00:00Z",
    "updated_at": "2025-01-23T09:30:00Z"
  }
}
```

---

### PATCH /users/:user_id
Update user information.

**Request Body:**
```json
{
  "first_name": "Jonathan",
  "phone": "+1-555-000-1111",
  "status": "inactive"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "User updated successfully",
  "data": {
    "user_id": "usr_abc123",
    "updated_fields": ["first_name", "phone", "status"]
  }
}
```

---

### DELETE /users/:user_id
Delete user (Admin only).

**Response (200):**
```json
{
  "success": true,
  "message": "User deleted successfully"
}
```

---

## Lead Management

### GET /leads
Get all leads.

**Query Parameters:**
- `page`, `limit`: Pagination
- `status`: Filter by status (new, contacted, qualified, converted, lost)
- `priority`: Filter by priority (high, medium, low)
- `source`: Filter by source (website, referral, social_media, cold_call)
- `assigned_to`: Filter by assigned user
- `search`: Search by name, email, or university

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "lead_id": "lead_123",
      "name": "Dr. Sarah Mitchell",
      "email": "sarah.mitchell@stanford.edu",
      "university": "Stanford University",
      "service_interest": "Research Paper Publication",
      "status": "qualified",
      "priority": "high",
      "source": "website",
      "contact_number": "+1-650-555-0143",
      "assigned_to": "usr_abc123",
      "created_at": "2025-01-20T10:00:00Z",
      "last_contact": "2025-01-22T14:30:00Z"
    }
  ],
  "pagination": {
    "total": 247,
    "page": 1,
    "limit": 20,
    "total_pages": 13
  }
}
```

---

### POST /leads
Create a new lead.

**Request Body:**
```json
{
  "name": "Dr. Sarah Mitchell",
  "email": "sarah.mitchell@stanford.edu",
  "university": "Stanford University",
  "service_interest": "Research Paper Publication",
  "contact_number": "+1-650-555-0143",
  "source": "website",
  "priority": "high",
  "notes": "Interested in Q1 2025 publication"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Lead created successfully",
  "data": {
    "lead_id": "lead_123",
    "status": "new",
    "created_at": "2025-01-23T10:30:00Z"
  }
}
```

---

### GET /leads/:lead_id
Get specific lead details.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "lead_id": "lead_123",
    "name": "Dr. Sarah Mitchell",
    "email": "sarah.mitchell@stanford.edu",
    "university": "Stanford University",
    "service_interest": "Research Paper Publication",
    "status": "qualified",
    "priority": "high",
    "source": "website",
    "contact_number": "+1-650-555-0143",
    "assigned_to": "usr_abc123",
    "notes": "Interested in Q1 2025 publication",
    "interactions": [
      {
        "type": "email",
        "date": "2025-01-22T14:30:00Z",
        "note": "Sent initial proposal"
      }
    ],
    "created_at": "2025-01-20T10:00:00Z",
    "updated_at": "2025-01-22T14:30:00Z"
  }
}
```

---

### PATCH /leads/:lead_id
Update lead information.

**Request Body:**
```json
{
  "status": "converted",
  "assigned_to": "usr_def456",
  "notes": "Converted to client - Project #PRJ-2145"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Lead updated successfully"
}
```

---

### DELETE /leads/:lead_id
Delete a lead.

**Response (200):**
```json
{
  "success": true,
  "message": "Lead deleted successfully"
}
```

---

## Client Management

### GET /clients
Get all clients.

**Query Parameters:**
- `page`, `limit`: Pagination
- `status`: Filter by status (active, inactive, vip)
- `crm_manager`: Filter by assigned CRM manager
- `search`: Search by name, email, or university

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "client_id": "client_789",
      "name": "Dr. Sarah Mitchell",
      "email": "sarah.mitchell@stanford.edu",
      "university": "Stanford University",
      "status": "vip",
      "crm_manager": "usr_def456",
      "total_projects": 12,
      "total_spent": 48500.00,
      "satisfaction_rating": 4.9,
      "client_since": "2023-03-15T10:00:00Z",
      "last_interaction": "2025-01-20T14:30:00Z"
    }
  ],
  "pagination": {
    "total": 156,
    "page": 1,
    "limit": 20,
    "total_pages": 8
  }
}
```

---

### POST /clients
Create a new client (usually converted from lead).

**Request Body:**
```json
{
  "name": "Dr. Sarah Mitchell",
  "email": "sarah.mitchell@stanford.edu",
  "university": "Stanford University",
  "phone": "+1-650-555-0143",
  "crm_manager": "usr_def456",
  "status": "active",
  "lead_id": "lead_123"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Client created successfully",
  "data": {
    "client_id": "client_789",
    "created_at": "2025-01-23T10:30:00Z"
  }
}
```

---

### GET /clients/:client_id
Get complete client profile.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "client_id": "client_789",
    "name": "Dr. Sarah Mitchell",
    "email": "sarah.mitchell@stanford.edu",
    "university": "Stanford University",
    "phone": "+1-650-555-0143",
    "status": "vip",
    "crm_manager": {
      "user_id": "usr_def456",
      "name": "Emily Roberts"
    },
    "stats": {
      "total_projects": 12,
      "active_projects": 3,
      "completed_projects": 9,
      "total_spent": 48500.00,
      "outstanding_balance": 1600.00,
      "satisfaction_rating": 4.9
    },
    "client_since": "2023-03-15T10:00:00Z",
    "last_interaction": "2025-01-20T14:30:00Z"
  }
}
```

---

### PATCH /clients/:client_id
Update client information.

**Request Body:**
```json
{
  "status": "vip",
  "crm_manager": "usr_ghi789"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Client updated successfully"
}
```

---

## Project Management

### GET /projects
Get all projects.

**Query Parameters:**
- `page`, `limit`: Pagination
- `status`: Filter by status (active, pending, completed, cancelled, on_hold)
- `client_id`: Filter by client
- `crm_manager`: Filter by CRM manager
- `service`: Filter by service type
- `search`: Search by project ID or client name

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "project_id": "PRJ-2145",
      "client": {
        "client_id": "client_789",
        "name": "Dr. Sarah Mitchell"
      },
      "service": "Research Paper Publication",
      "status": "active",
      "progress": 75,
      "amount": 5500.00,
      "start_date": "2025-01-15",
      "due_date": "2025-02-15",
      "priority": "high",
      "assigned_to": "usr_def456"
    }
  ],
  "pagination": {
    "total": 45,
    "page": 1,
    "limit": 20,
    "total_pages": 3
  }
}
```

---

### POST /projects
Create a new project.

**Request Body:**
```json
{
  "client_id": "client_789",
  "service": "Research Paper Publication",
  "amount": 5500.00,
  "start_date": "2025-01-15",
  "due_date": "2025-02-15",
  "priority": "high",
  "assigned_to": "usr_def456",
  "description": "Research paper on AI in healthcare"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Project created successfully",
  "data": {
    "project_id": "PRJ-2145",
    "status": "active",
    "progress": 0,
    "created_at": "2025-01-23T10:30:00Z"
  }
}
```

---

### GET /projects/:project_id
Get project details.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "project_id": "PRJ-2145",
    "client": {
      "client_id": "client_789",
      "name": "Dr. Sarah Mitchell",
      "email": "sarah.mitchell@stanford.edu"
    },
    "service": "Research Paper Publication",
    "status": "active",
    "progress": 75,
    "amount": 5500.00,
    "paid": 2750.00,
    "outstanding": 2750.00,
    "start_date": "2025-01-15",
    "due_date": "2025-02-15",
    "priority": "high",
    "assigned_to": {
      "user_id": "usr_def456",
      "name": "Emily Roberts"
    },
    "milestones": [
      {
        "title": "Initial Draft",
        "status": "completed",
        "completion_date": "2025-01-25"
      },
      {
        "title": "Peer Review",
        "status": "in_progress",
        "target_date": "2025-02-05"
      }
    ],
    "documents": [
      {
        "document_id": "doc_123",
        "name": "Research_Paper_v3.pdf",
        "size": 2400000,
        "uploaded_at": "2025-01-20T10:00:00Z"
      }
    ]
  }
}
```

---

### PATCH /projects/:project_id
Update project information.

**Request Body:**
```json
{
  "status": "active",
  "progress": 80,
  "notes": "Completed peer review revision"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Project updated successfully"
}
```

---

## Payment Management

### GET /payments
Get all payments.

**Query Parameters:**
- `page`, `limit`: Pagination
- `status`: Filter by status (paid, pending, overdue)
- `client_id`: Filter by client
- `project_id`: Filter by project
- `date_from`, `date_to`: Date range

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "invoice_id": "INV-5023",
      "project_id": "PRJ-2145",
      "client": {
        "client_id": "client_789",
        "name": "Dr. Sarah Mitchell"
      },
      "amount": 2750.00,
      "status": "paid",
      "method": "credit_card",
      "payment_date": "2025-01-15T10:00:00Z",
      "invoice_date": "2025-01-15",
      "due_date": "2025-01-30"
    }
  ],
  "pagination": {
    "total": 89,
    "page": 1,
    "limit": 20,
    "total_pages": 5
  }
}
```

---

### POST /payments
Create a new invoice/payment.

**Request Body:**
```json
{
  "project_id": "PRJ-2145",
  "amount": 2750.00,
  "due_date": "2025-02-15",
  "description": "First installment for Research Paper"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Invoice created successfully",
  "data": {
    "invoice_id": "INV-5024",
    "status": "pending",
    "created_at": "2025-01-23T10:30:00Z"
  }
}
```

---

### PATCH /payments/:invoice_id
Update payment status.

**Request Body:**
```json
{
  "status": "paid",
  "payment_method": "bank_transfer",
  "transaction_id": "TXN-ABC123",
  "payment_date": "2025-01-23T10:30:00Z"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Payment updated successfully"
}
```

---

## Query Management

### GET /queries
Get all client queries.

**Query Parameters:**
- `page`, `limit`: Pagination
- `status`: Filter by status (pending, in_progress, resolved)
- `priority`: Filter by priority (high, medium, low)
- `client_id`: Filter by client
- `crm_manager`: Filter by assigned manager

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "query_id": "query_456",
      "client": {
        "client_id": "client_789",
        "name": "Dr. Sarah Mitchell"
      },
      "subject": "Project Timeline Question",
      "message": "Can we schedule a call to discuss the publication timeline?",
      "status": "pending",
      "priority": "high",
      "assigned_to": "usr_def456",
      "created_at": "2025-01-23T08:30:00Z"
    }
  ],
  "pagination": {
    "total": 7,
    "page": 1,
    "limit": 20,
    "total_pages": 1
  }
}
```

---

### POST /queries
Create a new query.

**Request Body:**
```json
{
  "client_id": "client_789",
  "project_id": "PRJ-2145",
  "subject": "Payment Confirmation",
  "message": "I made the payment yesterday but haven't received confirmation.",
  "priority": "medium"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Query created successfully",
  "data": {
    "query_id": "query_457",
    "status": "pending",
    "created_at": "2025-01-23T10:30:00Z"
  }
}
```

---

### PATCH /queries/:query_id
Update query status or add response.

**Request Body:**
```json
{
  "status": "resolved",
  "response": "Payment confirmed. Receipt sent via email.",
  "resolved_by": "usr_def456"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Query updated successfully"
}
```

---

## Service Management

### GET /services
Get all available services.

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "service_id": "svc_001",
      "name": "Research Paper Publication",
      "price_min": 3500.00,
      "price_max": 8000.00,
      "duration_min": "6 weeks",
      "duration_max": "12 weeks",
      "status": "active",
      "description": "Complete support for research paper preparation and publication",
      "features": [
        "Paper Writing & Editing",
        "Journal Selection",
        "Submission Support",
        "Revision Assistance"
      ]
    }
  ]
}
```

---

### POST /services
Create a new service (Admin only).

**Request Body:**
```json
{
  "name": "Conference Paper Assistance",
  "price_min": 1500.00,
  "price_max": 4000.00,
  "duration_min": "3 weeks",
  "duration_max": "6 weeks",
  "description": "Support for conference paper preparation",
  "features": ["Paper Writing", "Abstract Preparation", "Presentation Support"]
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Service created successfully",
  "data": {
    "service_id": "svc_005",
    "status": "active"
  }
}
```

---

## Analytics & Reports

### GET /analytics/dashboard
Get dashboard analytics.

**Query Parameters:**
- `date_from`, `date_to`: Date range
- `user_id`: Specific user analytics (for CRM managers)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "leads": {
      "total": 247,
      "new": 68,
      "converted": 23,
      "conversion_rate": 15.2
    },
    "clients": {
      "total": 156,
      "active": 134,
      "vip": 28,
      "new_this_month": 12
    },
    "projects": {
      "total": 450,
      "active": 45,
      "completed": 389,
      "completion_rate": 86.4
    },
    "revenue": {
      "total": 2450000.00,
      "this_month": 245000.00,
      "pending": 87500.00,
      "growth_rate": 18.5
    }
  }
}
```

---

### GET /analytics/revenue
Get detailed revenue analytics.

**Query Parameters:**
- `date_from`, `date_to`: Date range
- `group_by`: Group by (day, week, month, quarter, year)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "total_revenue": 245000.00,
    "paid": 188150.00,
    "pending": 41350.00,
    "overdue": 15500.00,
    "breakdown_by_service": [
      {
        "service": "Research Paper Publication",
        "revenue": 125000.00,
        "percentage": 51.0
      },
      {
        "service": "Thesis/Dissertation Help",
        "revenue": 85000.00,
        "percentage": 34.7
      }
    ],
    "timeline": [
      {
        "period": "2025-01",
        "revenue": 245000.00,
        "projects": 12
      }
    ]
  }
}
```

---

## Document Management

### GET /documents
Get all documents.

**Query Parameters:**
- `client_id`: Filter by client
- `project_id`: Filter by project
- `type`: Filter by type (pdf, docx, xlsx, etc.)

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "document_id": "doc_123",
      "name": "Research_Paper_v3.pdf",
      "type": "pdf",
      "size": 2400000,
      "client_id": "client_789",
      "project_id": "PRJ-2145",
      "uploaded_by": "usr_def456",
      "uploaded_at": "2025-01-20T10:00:00Z",
      "download_url": "https://cdn.academic-erp.com/docs/doc_123.pdf"
    }
  ]
}
```

---

### POST /documents/upload
Upload a new document.

**Request (multipart/form-data):**
```
file: <binary>
client_id: client_789
project_id: PRJ-2145
description: Research paper draft version 3
```

**Response (201):**
```json
{
  "success": true,
  "message": "Document uploaded successfully",
  "data": {
    "document_id": "doc_124",
    "name": "Research_Paper_v3.pdf",
    "size": 2400000,
    "download_url": "https://cdn.academic-erp.com/docs/doc_124.pdf"
  }
}
```

---

### DELETE /documents/:document_id
Delete a document.

**Response (200):**
```json
{
  "success": true,
  "message": "Document deleted successfully"
}
```

---

## Error Responses

All endpoints may return these error responses:

### 400 Bad Request
```json
{
  "success": false,
  "error": {
    "code": "INVALID_REQUEST",
    "message": "Invalid request parameters",
    "details": [
      {
        "field": "email",
        "message": "Invalid email format"
      }
    ]
  }
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Authentication required"
  }
}
```

### 403 Forbidden
```json
{
  "success": false,
  "error": {
    "code": "FORBIDDEN",
    "message": "Insufficient permissions"
  }
}
```

### 404 Not Found
```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Resource not found"
  }
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "An unexpected error occurred",
    "request_id": "req_abc123"
  }
}
```

---

## Rate Limiting

- **Standard Plan:** 1000 requests per hour
- **Premium Plan:** 5000 requests per hour
- **Enterprise Plan:** Unlimited

Rate limit headers:
```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 998
X-RateLimit-Reset: 1706004000
```

---

## Webhooks

Subscribe to events:

- `lead.created`
- `lead.converted`
- `client.created`
- `project.created`
- `project.completed`
- `payment.received`
- `query.created`

Configure webhooks in Settings → Integrations → Webhooks

---

## Support

- **Documentation:** https://docs.academic-erp.com
- **API Status:** https://status.academic-erp.com
- **Support Email:** support@academic-erp.com
- **Developer Discord:** https://discord.gg/academic-erp

---

*Last Updated: January 23, 2025 | Version 1.0*