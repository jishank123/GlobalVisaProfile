# Form APIs Documentation

This document describes the secure backend APIs created for the three frontend forms: Profile Assessment, Appointment Scheduling, and Contact Form.

## Security Features

All APIs include enterprise-grade security:
- **Rate Limiting**: Prevents spam and abuse
- **Input Validation**: Comprehensive validation using express-validator
- **Data Sanitization**: Automatic sanitization of all inputs
- **IP Tracking**: Logs client IP addresses for security monitoring
- **Activity Logging**: Complete audit trail of all actions
- **Duplicate Prevention**: Prevents duplicate submissions
- **RBAC**: Role-based access control for admin endpoints

## 1. Profile Assessment API

### Submit Profile Assessment
**Endpoint:** `POST /api/profile-assessments`
**Access:** Public (Rate Limited: 3 requests per 15 minutes per IP)

**Request Body:**
```json
{
  "client_name": "John Doe",
  "client_email": "john@example.com",
  "client_phone": "+1234567890",
  "field_of_expertise": "Computer Science",
  "years_of_experience": 10,
  "current_location": "New York, NY",
  "criterion_1_awards": 2,
  "criterion_2_memberships": 3,
  "criterion_3_media": 1,
  "criterion_4_judging": 2,
  "criterion_5_contributions": 3,
  "criterion_6_publications": 2,
  "criterion_7_exhibitions": 0,
  "criterion_8_leadership": 2,
  "criterion_9_salary": 3,
  "criterion_10_commercial": 1,
  "overall_score": 65,
  "profile_strength": "Good Profile Strength",
  "strong_criteria_count": 3,
  "moderate_criteria_count": 4,
  "weak_criteria_count": 3,
  "criteria_met": 7
}
```

**Response:**
```json
{
  "success": true,
  "message": "Profile assessment submitted successfully",
  "data": {
    "id": "assessment_id",
    "overall_score": 65,
    "profile_strength": "Good Profile Strength",
    "criteria_met": 7,
    "eligibility_recommendation": "Close - Needs Strengthening",
    "submission_date": "2024-01-24T10:30:00.000Z"
  }
}
```

### Admin Endpoints (Protected)

#### Get All Assessments
**Endpoint:** `GET /api/profile-assessments`
**Access:** Admin/Manager only

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)
- `status`: Filter by status
- `profile_strength`: Filter by profile strength
- `min_score`: Minimum overall score
- `sort_by`: Field to sort by
- `sort_order`: asc/desc

#### Get Single Assessment
**Endpoint:** `GET /api/profile-assessments/:id`
**Access:** Admin/Manager only

#### Update Assessment
**Endpoint:** `PUT /api/profile-assessments/:id`
**Access:** Admin/Manager only

#### Get Assessment Statistics
**Endpoint:** `GET /api/profile-assessments/stats`
**Access:** Admin/Manager only

## 2. Appointment Request API

### Submit Appointment Request
**Endpoint:** `POST /api/appointments`
**Access:** Public (Rate Limited: 5 requests per hour per IP)

**Request Body:**
```json
{
  "name": "Jane Smith",
  "email": "jane@example.com",
  "phone": "+1234567890",
  "visa_category": "eb1a",
  "timezone": "EST",
  "preferred_date": "2024-02-01",
  "preferred_time": "2:00 PM",
  "consultation_type": "video",
  "details": "I would like to discuss my EB-1A eligibility..."
}
```

**Response:**
```json
{
  "success": true,
  "message": "Appointment request submitted successfully. We will contact you within 24 hours to confirm your appointment.",
  "data": {
    "id": "appointment_id",
    "name": "Jane Smith",
    "email": "jane@example.com",
    "visa_category": "EB-1A (Extraordinary Ability)",
    "status": "Pending",
    "submission_date": "2024-01-24T10:30:00.000Z"
  }
}
```

### Admin Endpoints (Protected)

#### Get All Appointments
**Endpoint:** `GET /api/appointments`
**Access:** Admin/Manager only

**Query Parameters:**
- `page`, `limit`: Pagination
- `status`: Filter by status
- `visa_category`: Filter by visa category
- `priority`: Filter by priority
- `assigned_to`: Filter by assigned user
- `date_from`, `date_to`: Date range filter

#### Schedule Appointment
**Endpoint:** `POST /api/appointments/:id/schedule`
**Access:** Admin/Manager only

**Request Body:**
```json
{
  "scheduled_date": "2024-02-01T14:00:00.000Z",
  "scheduled_time": "2:00 PM EST",
  "meeting_link": "https://zoom.us/j/123456789",
  "duration_minutes": 30
}
```

#### Add Communication
**Endpoint:** `POST /api/appointments/:id/communications`
**Access:** Admin/Manager only

## 3. Contact Form API

### Submit Contact Form
**Endpoint:** `POST /api/contact`
**Access:** Public (Rate Limited: 3 requests per 15 minutes per IP)

**Request Body:**
```json
{
  "name": "Bob Johnson",
  "email": "bob@example.com",
  "phone": "+1234567890",
  "visa_type": "eb2-niw",
  "message": "I am interested in learning more about the EB-2 NIW process..."
}
```

**Response:**
```json
{
  "success": true,
  "message": "Thank you for your inquiry! We will respond within 24-48 hours.",
  "data": {
    "id": "contact_id",
    "name": "Bob Johnson",
    "email": "bob@example.com",
    "visa_type": "EB-2 NIW (National Interest Waiver)",
    "inquiry_type": "consultation",
    "priority": "medium",
    "response_deadline": "2024-01-26T10:30:00.000Z",
    "submission_date": "2024-01-24T10:30:00.000Z"
  }
}
```

### Admin Endpoints (Protected)

#### Get All Contact Forms
**Endpoint:** `GET /api/contact`
**Access:** Admin/Manager only

**Query Parameters:**
- `page`, `limit`: Pagination
- `status`: Filter by status
- `visa_type`: Filter by visa type
- `priority`: Filter by priority
- `inquiry_type`: Filter by inquiry type
- `response_status`: overdue/pending/responded
- `search`: Text search across name, email, message

#### Respond to Contact Form
**Endpoint:** `POST /api/contact/:id/respond`
**Access:** Admin/Manager only

**Request Body:**
```json
{
  "response_message": "Thank you for your inquiry. We would be happy to help you with your EB-2 NIW case..."
}
```

#### Convert to Lead
**Endpoint:** `POST /api/contact/:id/convert-to-lead`
**Access:** Admin/Manager only

## Data Models

### ProfileAssessment Model
- Client information (name, email, phone, field, experience, location)
- 10 EB-1A criteria scores (0-3 scale)
- Assessment results (overall score, profile strength, criteria counts)
- Status tracking and follow-up management
- Security fields (IP address, user agent)

### AppointmentRequest Model
- Client information and contact details
- Appointment preferences (date, time, timezone, type)
- Visa category and consultation details
- Status management and scheduling information
- Communication history
- Meeting details (link, duration, notes)

### ContactForm Model
- Contact information and inquiry details
- Automatic categorization and priority assignment
- Response tracking and deadline management
- Communication history
- Lead conversion capabilities
- UTM tracking and source attribution

## Security Measures

1. **Rate Limiting**: Different limits for each endpoint
2. **Input Validation**: Comprehensive validation rules
3. **Duplicate Prevention**: Prevents spam submissions
4. **IP Tracking**: Logs all client IPs for security
5. **Activity Logging**: Complete audit trail
6. **Data Sanitization**: Automatic cleaning of inputs
7. **Error Handling**: Secure error responses
8. **Authentication**: JWT-based auth for admin endpoints
9. **Authorization**: Role-based access control
10. **Data Protection**: Sensitive data exclusion in responses

## Error Responses

All APIs return consistent error responses:

```json
{
  "success": false,
  "message": "Error description",
  "code": "ERROR_CODE",
  "errors": [
    {
      "field": "email",
      "message": "Please provide a valid email address"
    }
  ]
}
```

## Rate Limiting

- **Profile Assessment**: 3 requests per 15 minutes per IP
- **Appointment Request**: 5 requests per hour per IP  
- **Contact Form**: 3 requests per 15 minutes per IP
- **General API**: 100 requests per 15 minutes per IP

## Frontend Integration

The frontend forms should submit to these endpoints using the exact field names specified. All responses include success/error status and appropriate messages for user feedback.

Example frontend integration:
```javascript
// Profile Assessment Form
const response = await fetch('/api/profile-assessments', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(assessmentData)
});

const result = await response.json();
if (result.success) {
  // Show success message
  console.log('Assessment submitted:', result.data);
} else {
  // Show error message
  console.error('Error:', result.message);
}
```

## Database Collections

The APIs create three new MongoDB collections:
- `profileassessments`
- `appointmentrequests` 
- `contactforms`

All collections include proper indexing for performance and security tracking fields for audit purposes.