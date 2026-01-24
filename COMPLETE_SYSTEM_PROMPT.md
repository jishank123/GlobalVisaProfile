# 🎯 COMPLETE PROMPT FOR CRM & SERVICE MANAGEMENT SYSTEM

---

## 📋 PROJECT OVERVIEW

Create a **comprehensive CRM and Service Management System** for managing research publication services, client relationships, and business operations. The system should have **multi-role access** (Admin, CRM Managers/Lead Handlers, Clients) with complete service lifecycle management, payment tracking, and communication tools.

---

## 👥 USER ROLES & PERMISSIONS

### 1. **ADMIN (Super User)**
**Full System Access with abilities to:**
- Add, edit, delete CRM Managers (Lead Handlers)
- Create, update, delete services
- Assign clients to specific CRM managers
- View all system data (clients, services, payments, appointments)
- Generate reports and analytics
- Manage pricing and discount structures
- Configure system settings
- Override any permissions
- View complete business metrics and revenue

### 2. **CRM MANAGER / LEAD HANDLER**
**Client Management & Service Delivery:**
- View assigned clients only
- Update service progress for their clients (0-100%)
- Track payment status and send payment reminders
- Respond to client queries and chat messages
- Schedule appointments with clients
- Update service milestones and deliverables
- Mark tasks as complete
- Generate client-specific reports
- Cannot see other managers' clients
- Cannot modify pricing or add services

### 3. **CLIENT**
**Self-Service Portal:**
- Browse available services catalog
- Purchase services (add to cart, checkout)
- View purchased services with real-time progress
- Track payment history and outstanding balance
- Receive payment reminders
- Raise support requests/tickets
- Live chat with assigned CRM manager
- Schedule appointments (consultation, review meetings)
- Upload documents (research papers, citations)
- Download deliverables
- Rate services and provide feedback

---

## 🛠️ CORE FEATURES & MODULES

### MODULE 1: CRM MANAGEMENT (Admin Only)

**CRM Manager Registration & Management:**
- Add new CRM manager with:
  - Full Name
  - Email (login username)
  - Phone number
  - Password (secure hash)
  - Specialization (e.g., Research Papers, Citations, Speaking)
  - Assigned territory/field
  - Status (Active/Inactive)
  - Maximum client capacity
  - Commission percentage (if applicable)

**CRM Manager Assignment:**
- View all clients in system
- Assign/reassign clients to CRM managers
- Auto-assignment based on workload balancing
- Transfer clients between managers
- Track assignment history

**CRM Performance Metrics:**
- Number of clients managed
- Total revenue generated
- Average service completion time
- Client satisfaction ratings
- Active vs completed services
- Response time to queries

---

### MODULE 2: SERVICE MANAGEMENT (Admin)

**Service Creation & Configuration:**

**Default Services (Examples - Admin can add more):**
1. **Research Paper Publication Assistance**
   - Description: End-to-end support for publishing research papers
   - Price: $500 - $5000 (based on tier)
   - Duration: 2-6 months
   - Deliverables: Journal submission, peer review support, revisions
   - Milestones: Topic selection, Draft writing, Journal submission, Review response, Publication

2. **Citation Assistance**
   - Description: Increase research paper citations
   - Price: $300 - $2000
   - Duration: 3-12 months
   - Deliverables: Citation strategy, Networking, Conference presentations
   - Milestones: Analysis, Strategy, Execution, Monitoring

3. **Keynote Speaker Opportunities**
   - Description: Secure speaking engagements at conferences
   - Price: $800 - $3000
   - Duration: 1-3 months
   - Deliverables: Conference identification, Abstract submission, Presentation coaching
   - Milestones: Conference research, Proposal submission, Acceptance, Preparation

4. **Journal Selection & Recommendation**
   - Price: $200 - $800
   - Duration: 2-4 weeks

5. **Peer Review Process Management**
   - Price: $400 - $1500
   - Duration: 1-4 months

6. **Academic Profile Building**
   - Price: $600 - $2500
   - Duration: 2-6 months

**Service Attributes:**
- Service Name
- Category (Publications, Citations, Speaking, Consulting, etc.)
- Short Description
- Detailed Description
- Base Price
- Pricing Tiers (Basic, Standard, Premium)
- Estimated Duration
- Deliverables List
- Milestone/Phase Structure
- Required Documents from Client
- Prerequisites (if any)
- Status (Active/Inactive/Coming Soon)
- Featured (Yes/No)
- Maximum Concurrent Clients
- Commission Rate

**Service CRUD Operations:**
- ✅ Create new service
- ✅ View all services (list & detail view)
- ✅ Update service details (name, price, description, milestones)
- ✅ Delete/Archive service
- ✅ Activate/Deactivate service
- ✅ Duplicate service template
- ✅ Bulk pricing updates

**Service Categories & Tags:**
- Organize services by category
- Add tags for filtering
- Featured services promotion
- Popular services ranking

---

### MODULE 3: CLIENT DASHBOARD (Client View)

**Homepage/Overview:**
- Welcome message with client name
- Quick stats: Active services, completed services, pending payments
- Recent activity timeline
- Upcoming appointments
- Unread messages count
- Payment reminders

**Service Catalog (Browse & Purchase):**

**Service Listing:**
- Grid/List view of all available services
- Filter by:
  - Category (Publications, Citations, Speaking, etc.)
  - Price range (slider)
  - Duration
  - Rating
- Sort by:
  - Popularity
  - Price (Low to High, High to Low)
  - Newest
  - Rating

**Service Detail Page:**
- Service name and description
- Pricing tiers with feature comparison
- Expected duration and deliverables
- Milestone breakdown
- Customer testimonials
- FAQ section
- "Add to Cart" or "Buy Now" button

**Shopping Cart & Checkout:**
- Add multiple services to cart
- Apply discount codes
- Select pricing tier (Basic/Standard/Premium)
- Payment method selection:
  - Full payment
  - Installment plan (50% upfront, 50% on milestone)
  - Custom payment schedule
- Order summary and total
- Terms & conditions acceptance
- Place order

**My Services (Purchased):**

**Service Card Display:**
- Service name and type
- Purchase date
- Assigned CRM manager (name, photo, contact)
- **Progress Bar (0-100%)**
- Current status (Not Started, In Progress, On Hold, Completed, Cancelled)
- Current phase/milestone
- Expected completion date
- Actual completion date (when done)

**Service Details Page:**
- Complete service information
- **Phase-by-Phase Timeline:**
  - ✅ Completed phases (with completion date)
  - 🔄 Current phase (with progress %)
  - ⏳ Upcoming phases (grayed out)
- **Deliverables:**
  - List of expected deliverables
  - Download completed deliverables
  - Upload required documents
- **Activity Log:**
  - All updates from CRM manager (with timestamps)
  - Document uploads
  - Milestone completions
  - Payment updates
- **Actions:**
  - Message CRM manager
  - Schedule appointment
  - Raise issue/request
  - Cancel service (with policy)

---

### MODULE 4: PAYMENT MANAGEMENT

**For Admin:**
- View all payments across clients
- Filter by status, date, client, service
- Generate payment reports
- Issue refunds
- Manual payment recording
- Configure payment gateways
- Set up installment plans
- Manage discount codes

**For CRM Manager:**
- View payment status of assigned clients
- Send payment reminders (manual or automated)
- Record offline payments
- View payment history
- Track outstanding balances
- Generate client invoices

**For Client:**

**Payment Dashboard:**
- Total amount paid
- Outstanding balance
- Payment history table:
  - Date
  - Service
  - Amount
  - Payment method
  - Status (Paid, Pending, Overdue, Refunded)
  - Invoice download
- Upcoming payment schedule
- Payment reminders received

**Payment Methods:**
- Credit/Debit Card
- Bank Transfer
- PayPal
- Wire Transfer
- Check

**Payment Reminder System:**
- Automatic reminders:
  - 7 days before due date
  - 3 days before due date
  - On due date
  - 3 days overdue
  - 7 days overdue
- Email + In-app notifications
- SMS reminders (optional)
- Customizable reminder templates

**Payment Plans:**
- Full payment (with discount)
- 50% upfront + 50% at milestone
- Monthly installments (3, 6, 12 months)
- Milestone-based payments
- Custom payment schedule

**Invoice Generation:**
- Auto-generated invoices
- PDF download
- Email invoice
- Payment receipt on completion
- Tax calculation (if applicable)

---

### MODULE 5: COMMUNICATION SYSTEM

**Support Requests/Tickets:**

**For Client:**
- Raise new request:
  - Subject
  - Category (Technical, Billing, Service Issue, General Query)
  - Priority (Low, Medium, High, Urgent)
  - Detailed message
  - Attach files (screenshots, documents)
- View all my requests:
  - Status (Open, In Progress, Waiting for Response, Resolved, Closed)
  - Last updated
  - Assigned CRM manager
- Reply to CRM manager responses
- Close resolved requests
- Reopen closed requests
- Rate resolution quality

**For CRM Manager:**
- View all requests from assigned clients
- Filter by status, priority, date
- Respond to requests
- Update status
- Add internal notes (not visible to client)
- Escalate to admin
- Set priority
- Mark as resolved

**For Admin:**
- View all system requests
- Override any action
- Reassign requests
- View resolution metrics
- Generate reports on common issues

---

**Live Chat System:**

**Real-Time 1-on-1 Chat:**
- Client ↔ Assigned CRM Manager
- Features:
  - Text messages
  - File sharing (documents, images)
  - Emoji support
  - Read receipts
  - Typing indicators
  - Message timestamps
  - Chat history (searchable)
  - Unread message count
  - Desktop/Email notifications for new messages

**Chat Interface:**
- Sidebar showing:
  - CRM manager name, photo, online status
  - Client name (for manager view)
  - Quick actions (schedule appointment, view service)
- Main chat area:
  - Message bubbles (different colors for client/manager)
  - Date separators
  - File preview
- Input area:
  - Text input with character count
  - Attach file button
  - Emoji picker
  - Send button

**Automated Responses:**
- Away message when CRM manager offline
- Business hours message
- Auto-reply with expected response time
- Quick replies/templates for common questions

---

### MODULE 6: APPOINTMENT SCHEDULING

**For Client:**

**Schedule Appointment:**
- Select appointment type:
  - Initial Consultation
  - Progress Review
  - Document Review
  - Strategy Discussion
  - Final Delivery Review
- Select service (if multiple active)
- Choose date from calendar
- Select time slot (show available slots only)
- Select duration (30 min, 1 hour, 2 hours)
- Choose meeting type:
  - Video Call (Zoom/Google Meet link auto-generated)
  - Phone Call (enter phone number)
  - In-Person (enter location)
- Add notes/agenda
- Confirm appointment

**Manage Appointments:**
- View all appointments (upcoming, past, cancelled)
- Calendar view (monthly/weekly)
- Appointment reminders:
  - Email: 24 hours before, 1 hour before
  - In-app notification
  - SMS (optional)
- Reschedule appointment
- Cancel appointment (with reason)
- Join video meeting (1-click join)
- View meeting notes (added by CRM manager)

**For CRM Manager:**
- View all appointments with assigned clients
- Availability management:
  - Set working hours
  - Block dates/times
  - Set buffer time between meetings
- Confirm/reject appointment requests
- Reschedule with client approval
- Add meeting notes after appointment
- Mark appointment as completed
- Calendar integration (Google Calendar, Outlook)

**For Admin:**
- View all system appointments
- Calendar overview of all managers
- Appointment analytics:
  - Total appointments
  - Completion rate
  - Average duration
  - No-show rate
- Export calendar data

**Calendar Features:**
- Color-coded by appointment type
- Drag-and-drop rescheduling
- Recurring appointments
- Time zone support
- Automated meeting reminders
- Post-meeting feedback request

---

### MODULE 7: DOCUMENT MANAGEMENT

**For Client:**
- Upload documents:
  - Research papers (draft, final)
  - Citations list
  - Conference proposals
  - Presentation slides
  - Supporting documents
- Organize in folders by service
- Version control (track document versions)
- Download deliverables from CRM manager
- Preview documents (PDF, Word, Images)
- Share documents with CRM manager
- Set document permissions
- Document upload progress indicator
- File size limit warnings

**For CRM Manager:**
- View client-uploaded documents
- Upload deliverables for client
- Add comments/annotations to documents
- Request specific documents from client
- Version comparison
- Document approval workflow
- Bulk download

**For Admin:**
- Storage usage monitoring
- File type restrictions
- Maximum file size configuration
- Automatic backup
- Document retention policies

---

### MODULE 8: REPORTING & ANALYTICS

**Admin Analytics Dashboard:**

**Business Metrics:**
- Total revenue (daily, weekly, monthly, yearly)
- Revenue by service type
- Revenue by CRM manager
- Number of active clients
- Number of completed services
- Average service value
- Customer lifetime value
- Conversion rate (leads to clients)

**Service Performance:**
- Most popular services
- Service completion rates
- Average service duration
- Service profitability
- Service ratings and reviews

**CRM Manager Performance:**
- Clients per manager
- Revenue per manager
- Average response time
- Client satisfaction score
- Service completion rate
- Outstanding payments managed

**Client Insights:**
- New clients (growth rate)
- Client retention rate
- Churned clients
- Average services per client
- Client acquisition cost
- Client satisfaction trends

**Payment Analytics:**
- Total payments received
- Outstanding payments
- Overdue payments
- Payment method distribution
- Refunds issued
- Average payment time

**Visual Reports:**
- Line charts (revenue over time)
- Bar charts (service comparison)
- Pie charts (payment methods, service distribution)
- Heat maps (appointment density)
- Funnel charts (sales pipeline)

**Export Options:**
- PDF reports
- Excel/CSV exports
- Email scheduled reports
- Dashboard screenshots

---

**CRM Manager Dashboard Analytics:**
- My clients count
- My active services
- My revenue contribution
- My response time average
- My client satisfaction score
- Pending tasks
- Upcoming appointments
- Payment reminders to send

---

**Client Reports:**
- My spending summary
- Services history
- Payment history
- Appointment history
- Download statements

---

### MODULE 9: NOTIFICATION SYSTEM

**Notification Types:**

**For Client:**
- Service progress updates
- Payment reminders (before due date, overdue)
- Payment confirmation
- Appointment reminders (24hr, 1hr before)
- Appointment confirmations/changes
- New message from CRM manager
- Document uploaded by CRM manager
- Request response received
- Service milestone completed
- Service completed
- Promotional offers
- System announcements

**For CRM Manager:**
- New client assigned
- New message from client
- New support request
- Appointment scheduled by client
- Document uploaded by client
- Payment received from client
- Payment overdue alert
- Service milestone deadline approaching
- Client feedback received

**For Admin:**
- New client registration
- New payment received
- Payment failed
- Service cancelled
- High-priority support request
- System alerts
- CRM manager performance alerts
- Revenue milestones reached

**Notification Delivery Channels:**
- In-app notifications (bell icon with count)
- Email notifications
- SMS notifications (optional)
- Push notifications (browser/mobile)

**Notification Settings:**
- User can enable/disable each type
- Choose delivery channels per notification type
- Set quiet hours (no notifications)
- Batch notifications (digest mode)
- Mark as read/unread
- Notification history

---

### MODULE 10: ADDITIONAL FEATURES

**Client Onboarding:**
- Welcome email with login credentials
- System tutorial/walkthrough
- FAQ section
- Knowledge base
- Video tutorials
- Demo service flow

**Rating & Review System:**
- Rate completed services (1-5 stars)
- Write detailed review
- Public/private review option
- Display on service pages
- CRM manager ratings
- Testimonial showcase

**Discount & Coupon System:**
- Admin creates discount codes
- Percentage or fixed amount discount
- Expiry date
- Usage limits (per user, total)
- Applicable services (specific or all)
- First-time client discount
- Referral discounts
- Bulk purchase discounts

**Referral Program:**
- Client gets unique referral code
- Share with friends
- Track referrals
- Earn credits/discounts
- Leaderboard of top referrers

**Email Templates:**
- Welcome email
- Service purchase confirmation
- Payment receipt
- Payment reminder
- Appointment confirmation
- Appointment reminder
- Service completion
- Review request
- Newsletter
- Custom templates

**Search Functionality:**
- Global search (services, clients, documents)
- Advanced filters
- Recent searches
- Search suggestions
- Search history

**Activity Timeline:**
- Chronological list of all activities
- Service updates
- Payments made
- Appointments attended
- Messages exchanged
- Documents uploaded
- Filter by date range
- Filter by activity type

**Security Features:**
- Password strength requirements
- Two-factor authentication (2FA)
- Session timeout
- Login history
- IP restriction (optional)
- Role-based access control (RBAC)
- Data encryption
- GDPR compliance
- Privacy policy
- Terms of service

**Mobile Responsiveness:**
- Fully responsive design
- Works on desktop, tablet, mobile
- Touch-friendly interface
- Mobile app consideration

---

## 🗄️ DATABASE STRUCTURE (Tables Required)

### Core Tables:

1. **users**
   - id, name, email, password_hash, role (admin/crm/client), phone, status, created_at, updated_at

2. **crm_managers**
   - id, user_id (FK), specialization, territory, max_clients, commission_rate, status

3. **clients**
   - id, user_id (FK), assigned_crm_manager_id (FK), registration_date, status, company, industry

4. **services**
   - id, name, category, description, base_price, pricing_tiers (JSON), duration_estimate, status, created_by, created_at, updated_at

5. **service_milestones**
   - id, service_id (FK), milestone_name, description, order_number, deliverables

6. **client_services** (purchased services)
   - id, client_id (FK), service_id (FK), crm_manager_id (FK), purchase_date, status, progress_percentage, current_milestone, start_date, expected_completion, actual_completion, notes

7. **service_progress_updates**
   - id, client_service_id (FK), updated_by (FK), update_text, progress_before, progress_after, milestone_completed, update_date

8. **payments**
   - id, client_id (FK), service_id (FK), amount, payment_date, payment_method, status, invoice_number, transaction_id, due_date

9. **payment_reminders**
   - id, payment_id (FK), reminder_date, sent_status, reminder_type

10. **support_requests**
    - id, client_id (FK), crm_manager_id (FK), subject, category, priority, status, message, response, created_at, updated_at, resolved_at

11. **chat_messages**
    - id, sender_id (FK), receiver_id (FK), message_text, file_attachment, read_status, sent_at

12. **appointments**
    - id, client_id (FK), crm_manager_id (FK), service_id (FK), appointment_type, appointment_date, duration, meeting_type, meeting_link, status, notes, created_at

13. **documents**
    - id, uploaded_by (FK), related_to (client_service_id), document_name, file_path, file_type, file_size, upload_date, folder, version

14. **notifications**
    - id, user_id (FK), notification_type, title, message, read_status, created_at, action_link

15. **reviews**
    - id, client_id (FK), service_id (FK), crm_manager_id (FK), rating, review_text, is_public, created_at

16. **discount_codes**
    - id, code, discount_type, discount_value, expiry_date, usage_limit, used_count, applicable_services, created_by

17. **referrals**
    - id, referrer_client_id (FK), referred_email, status, referral_code, created_at, converted_at

---

## 🎯 USER STORIES & WORKFLOWS

### Workflow 1: Admin Adds New Service

1. Admin logs in
2. Navigate to "Service Management"
3. Click "Add New Service"
4. Fill form:
   - Service Name: "Conference Paper Writing"
   - Category: Research Publications
   - Description: (detailed)
   - Base Price: $1200
   - Pricing Tiers: Basic ($1200), Standard ($2000), Premium ($3500)
   - Duration: 3 months
   - Add Milestones:
     - Topic Finalization (Week 1)
     - Literature Review (Weeks 2-4)
     - Draft Writing (Weeks 5-8)
     - Revision (Weeks 9-11)
     - Final Submission (Week 12)
5. Set as Active
6. Save service
7. Service appears in client catalog immediately

---

### Workflow 2: Admin Assigns CRM Manager to Client

1. Admin navigates to "Client Management"
2. Selects client "Dr. Rajesh Kumar"
3. Clicks "Assign CRM Manager"
4. Dropdown shows:
   - Sandeep Kumar (5 clients, Tech specialization)
   - Preet Singh (8 clients, Life Sciences)
   - Deepali Sharma (6 clients, Business)
5. Selects "Sandeep Kumar"
6. Confirms assignment
7. System:
   - Updates client_accounts.assigned_crm_manager_id
   - Sends notification to Sandeep
   - Sends email to client introducing Sandeep

---

### Workflow 3: Client Purchases Service

1. Client logs in
2. Browses service catalog
3. Clicks on "Research Paper Publication Assistance"
4. Reviews details, pricing tiers, milestones
5. Selects "Premium Tier" ($5000)
6. Clicks "Add to Cart"
7. Goes to checkout
8. Reviews order
9. Selects payment plan: "50% now, 50% at milestone"
10. Enters payment details
11. Places order
12. System:
    - Creates record in client_services
    - Creates payment schedule in payments table
    - Sends confirmation email to client
    - Notifies assigned CRM manager
    - Generates invoice

---

### Workflow 4: CRM Manager Updates Service Progress

1. CRM Manager (Sandeep) logs in
2. Views "My Clients" tab
3. Selects client "Dr. Rajesh Kumar"
4. Clicks on service "Research Paper Publication"
5. Current progress: 40% (Milestone: Literature Review)
6. Clicks "Update Progress"
7. Updates:
   - Progress: 60%
   - Current Milestone: Draft Writing (Phase 3)
   - Add note: "Literature review completed. Started writing introduction and methodology sections. Expected draft completion by March 15."
8. Saves update
9. System:
   - Updates client_services table
   - Creates entry in service_progress_updates
   - Sends notification to client
   - Client sees updated progress bar in dashboard

---

### Workflow 5: Payment Reminder Flow

**Scenario:** Client has $2500 payment due in 3 days

1. **Day -7 (7 days before):**
   - System auto-generates first reminder
   - Email sent: "Friendly reminder: Payment of $2500 due in 7 days"
   - In-app notification appears
   - SMS sent (if enabled)

2. **Day -3 (3 days before):**
   - Second reminder sent
   - Email: "Reminder: Payment of $2500 due in 3 days"
   - Push notification

3. **Day 0 (Due date):**
   - Final reminder: "Payment of $2500 is due today"
   - Highlighted in client dashboard (red badge)

4. **Client makes payment:**
   - Clicks "Pay Now" in dashboard
   - Completes payment
   - System:
     - Updates payment status to "Paid"
     - Stops reminder sequence
     - Sends payment confirmation
     - Notifies CRM manager
     - Generates receipt

5. **If payment overdue (Day +3):**
   - Overdue alert to client
   - Notification to CRM manager
   - CRM manager can manually reach out
   - Service may be put on hold

---

### Workflow 6: Client Raises Support Request

1. Client navigates to "Support" section
2. Clicks "Raise Request"
3. Fills form:
   - Subject: "Need clarification on citation strategy"
   - Category: Service Issue
   - Priority: Medium
   - Message: "I'm confused about the citation strategy you proposed. Can we schedule a call to discuss?"
   - Attaches document (optional)
4. Submits request
5. System:
   - Creates ticket in support_requests table
   - Assigns to client's CRM manager (Sandeep)
   - Sends notification to Sandeep
   - Sends confirmation to client
6. Sandeep sees request in his dashboard
7. Sandeep responds: "Sure! I'll clarify via chat and schedule a call. Let me know your availability."
8. Client receives notification
9. Client marks as resolved
10. Client rates resolution (5 stars)

---

### Workflow 7: Appointment Scheduling

1. Client opens "Appointments" section
2. Clicks "Schedule New Appointment"
3. Fills form:
   - Type: Progress Review
   - Service: Research Paper Publication
   - Date: March 25, 2025 (calendar picker)
   - Time: Available slots shown (2:00 PM, 3:00 PM, 4:00 PM)
   - Selects: 3:00 PM
   - Duration: 1 hour
   - Meeting Type: Video Call
   - Notes: "Want to review draft and discuss next steps"
4. Submits request
5. System:
   - Creates appointment (status: Pending)
   - Sends to CRM manager for confirmation
   - Blocks time slot temporarily
6. CRM manager receives notification
7. CRM manager confirms appointment
8. System:
   - Updates status to Confirmed
   - Generates meeting link (Zoom/Google Meet)
   - Sends confirmation to client
   - Adds to both calendars
   - Sets up reminders (24hr and 1hr before)
9. Day of appointment:
   - 24-hour reminder sent
   - 1-hour reminder sent
   - Client clicks "Join Meeting" in dashboard
   - Redirects to video call
10. After meeting:
    - CRM manager adds notes
    - Client receives summary
    - Option to rate meeting

---

### Workflow 8: Document Upload & Review

1. Client navigates to service "Research Paper Publication"
2. Clicks "Documents" tab
3. Clicks "Upload Document"
4. Selects file: "Research_Paper_Draft_v1.docx"
5. Adds note: "First draft for review"
6. Uploads
7. System:
   - Saves to documents table
   - Links to client_service
   - Notifies CRM manager
8. CRM manager downloads document
9. Reviews and adds comments
10. Uploads revised version: "Research_Paper_Draft_v2_reviewed.docx"
11. Adds note: "Added comments in track changes mode. Please review sections 3 and 5."
12. Client receives notification
13. Client downloads revised document
14. Views version history (v1, v2)

---

## 🎨 UI/UX REQUIREMENTS

### Design Guidelines:

**Color Scheme:**
- Primary: Blue (#2563eb)
- Secondary: Purple (#7c3aed)
- Success: Green (#10b981)
- Warning: Orange (#f59e0b)
- Danger: Red (#ef4444)
- Info: Light Blue (#3b82f6)

**Typography:**
- Headings: Bold, 24-36px
- Body: Regular, 14-16px
- Small text: 12px
- Font: Inter, Segoe UI, or similar modern sans-serif

**Layout:**
- Sidebar navigation (collapsible)
- Top bar with user profile, notifications, search
- Main content area (white background)
- Cards for each section (rounded corners, shadow)
- Responsive grid system (desktop, tablet, mobile)

**Interactive Elements:**
- Buttons: Rounded, hover effects, loading states
- Forms: Clear labels, inline validation, help text
- Tables: Sortable columns, pagination, filters
- Progress bars: Smooth animations, color-coded
- Charts: Interactive (hover for details)
- Modals: Centered, backdrop blur
- Tooltips: On hover for icons/complex terms

**Accessibility:**
- WCAG 2.1 AA compliance
- Keyboard navigation
- Screen reader friendly
- High contrast mode option
- Font size adjustment
- Alt text for images

---

## 🔧 TECHNICAL REQUIREMENTS

### Frontend:
- HTML5, CSS3, JavaScript
- Framework: React.js or Vue.js (or vanilla JS for simplicity)
- Styling: Tailwind CSS or Bootstrap
- Charts: Chart.js or ECharts
- Icons: Font Awesome
- Date Picker: Flatpickr or similar
- Rich Text Editor: TinyMCE or Quill
- File Upload: Dropzone.js

### Backend (If not static):
- Node.js + Express (or Python Flask/Django)
- RESTful API architecture
- JWT for authentication
- bcrypt for password hashing

### Database:
- MySQL, PostgreSQL, or MongoDB
- 17+ tables (as listed above)
- Proper indexing for performance
- Foreign key relationships
- Triggers for automated actions

### File Storage:
- Local storage or cloud (AWS S3, Google Cloud Storage)
- File size limits
- Allowed file types (PDF, DOC, DOCX, JPG, PNG)
- Virus scanning

### Real-Time Features:
- WebSockets for chat
- Socket.io or Pusher
- Real-time notifications

### Email System:
- SMTP configuration (SendGrid, Mailgun, or similar)
- Email templates (HTML)
- Queue system for bulk emails

### Payment Integration:
- Stripe, PayPal, or Razorpay API
- Secure payment processing
- PCI compliance
- Webhook handlers for payment status

### Security:
- HTTPS (SSL certificate)
- CSRF protection
- SQL injection prevention
- XSS protection
- Rate limiting
- Session management
- Regular security audits

---

## 📦 DELIVERABLES

### Phase 1 - Core Setup (Weeks 1-2):
- Database schema design
- User authentication (Login/Register)
- Admin dashboard skeleton
- CRM manager dashboard skeleton
- Client dashboard skeleton

### Phase 2 - CRM & Service Management (Weeks 3-4):
- CRM manager CRUD operations
- Service CRUD operations
- Client assignment system
- Service catalog display
- Shopping cart & checkout

### Phase 3 - Service Delivery (Weeks 5-6):
- Service progress tracking
- Milestone management
- Document upload/download
- Progress updates by CRM manager
- Client service dashboard

### Phase 4 - Payment System (Week 7):
- Payment recording
- Payment history
- Payment reminder system
- Invoice generation
- Payment plans

### Phase 5 - Communication (Week 8):
- Support request system
- Live chat implementation
- Notification system
- Email templates

### Phase 6 - Appointments (Week 9):
- Appointment scheduling
- Calendar view
- Availability management
- Meeting reminders
- Video call integration

### Phase 7 - Reporting & Analytics (Week 10):
- Admin analytics dashboard
- CRM manager reports
- Client reports
- Chart visualizations
- Export functionality

### Phase 8 - Polish & Testing (Weeks 11-12):
- UI/UX refinement
- Mobile responsiveness
- Performance optimization
- Security testing
- User acceptance testing
- Bug fixes
- Documentation

---

## 🚀 DEPLOYMENT & MAINTENANCE

### Hosting:
- Web hosting (AWS, DigitalOcean, Heroku)
- Domain name
- SSL certificate
- CDN for static assets

### Monitoring:
- Error logging (Sentry)
- Performance monitoring
- Uptime monitoring
- User analytics (Google Analytics)

### Backup:
- Daily automated backups
- Database backups
- File storage backups
- Disaster recovery plan

### Updates:
- Regular security patches
- Feature updates
- Bug fixes
- Performance improvements

---

## 📝 ADDITIONAL CONSIDERATIONS

### Scalability:
- Database indexing
- Query optimization
- Caching (Redis)
- Load balancing
- CDN for media files

### Multi-Language Support (Future):
- i18n implementation
- Translation management
- RTL support

### White-Label Options (Future):
- Customizable branding
- Logo upload
- Color theme customization
- Domain mapping

### Mobile App (Future):
- React Native or Flutter
- iOS and Android
- Push notifications
- Offline mode

---

## ✅ SUCCESS METRICS

### For Admin:
- Total clients onboarded
- Total revenue generated
- Service completion rate
- Client satisfaction score
- CRM manager utilization rate

### For CRM Manager:
- Client retention rate
- Average response time < 2 hours
- Service completion time vs estimate
- Client satisfaction > 4.5/5
- Revenue per client

### For Client:
- Service progress visibility
- Payment transparency
- Communication response time
- Easy appointment scheduling
- Overall satisfaction > 4.5/5

---

## 🎯 SUMMARY

This system is a **comprehensive business management solution** that:

1. ✅ Allows admins to manage CRM managers and services completely
2. ✅ Enables CRM managers to handle their clients efficiently
3. ✅ Provides clients a self-service portal to purchase, track, and manage services
4. ✅ Includes complete payment management with reminders
5. ✅ Facilitates communication through chat and support tickets
6. ✅ Enables appointment scheduling with calendar integration
7. ✅ Tracks service progress with real-time updates
8. ✅ Provides document management
9. ✅ Includes robust reporting and analytics
10. ✅ Scalable, secure, and user-friendly

---

## 📋 FINAL CHECKLIST

**Admin Features:**
- [ ] Add/Edit/Delete CRM Managers
- [ ] Add/Edit/Delete Services
- [ ] Assign clients to CRM managers
- [ ] View all system data
- [ ] Generate reports
- [ ] Manage payments and discounts
- [ ] System configuration

**CRM Manager Features:**
- [ ] View assigned clients
- [ ] Update service progress (0-100%)
- [ ] Send payment reminders
- [ ] Respond to support requests
- [ ] Live chat with clients
- [ ] Schedule/manage appointments
- [ ] Upload/download documents
- [ ] View performance metrics

**Client Features:**
- [ ] Browse service catalog
- [ ] Add services to cart
- [ ] Checkout and purchase
- [ ] View service progress (real-time)
- [ ] Track payments
- [ ] Receive payment reminders
- [ ] Raise support requests
- [ ] Live chat with CRM manager
- [ ] Schedule appointments
- [ ] Upload/download documents
- [ ] Rate services
- [ ] View reports

**System Features:**
- [ ] User authentication (3 roles)
- [ ] Payment processing
- [ ] Email notifications
- [ ] In-app notifications
- [ ] Document storage
- [ ] Search functionality
- [ ] Mobile responsive
- [ ] Security features
- [ ] Analytics dashboard
- [ ] Appointment calendar
- [ ] Real-time chat
- [ ] File upload/download

---

## 🎬 READY TO BUILD!

This comprehensive prompt covers **ALL aspects** of the CRM and Service Management System. Use this to:

1. **Hand to developer team** with complete requirements
2. **Break into sprints** using the phased approach
3. **Create user stories** from workflows
4. **Design database** using table structure
5. **Build MVP** starting with Phase 1-3
6. **Scale gradually** adding remaining phases

**Total Features:** 100+  
**Estimated Timeline:** 12 weeks for full system  
**Complexity:** High (Enterprise-level)  
**Value:** Complete business automation

---

**END OF PROMPT**

Save this document and use it as your **complete specification** for building the system! 🚀