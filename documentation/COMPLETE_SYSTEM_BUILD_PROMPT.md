# 🎯 Complete System Build Prompt

## Project Overview

Build a comprehensive **Immigration Services CRM & Client Portal System** with role-based access control, service management, payment tracking, and communication features.

---

## 🎭 Core Requirements

### 1. Multi-Role Authentication System

**Implement 4 user roles with distinct access levels:**

1. **Super Admin**
   - Full system access
   - Create/manage all users and roles
   - Add/edit/delete services from catalog
   - View all analytics and reports
   - Configure system settings

2. **CRM Manager (Customer Relationship Manager)**
   - View and manage assigned clients only
   - Update service progress for assigned services
   - View payment status (read-only)
   - Respond to client queries
   - Schedule and manage appointments
   - Cannot create new services

3. **Lead Handler**
   - View and manage leads
   - Conduct initial assessments
   - Assign leads to CRM managers
   - Convert qualified leads to clients
   - Cannot access payment information

4. **Client**
   - View own profile and services
   - Browse and purchase new services
   - Track service progress
   - Make payments
   - Submit queries
   - Schedule appointments

**Authentication Features:**
- Secure login with email/password
- Password hashing (SHA-256 or bcrypt)
- Session management
- Remember me option
- Role-based dashboard redirects

---

## 2. Admin Panel (`admin-dashboard.html`)

### Layout:
```
┌─────────────────────────────────────────────────────────────┐
│ Logo    [Dashboard] [Users] [Services] [Clients] [Analytics]│
│                                    [Notifications] [Profile] │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  📊 DASHBOARD STATISTICS                                     │
│  [Revenue: $450K] [Clients: 156] [Leads: 43] [Services: 284]│
│                                                               │
│  ──────────────────────────────────────────────────────────  │
│                                                               │
│  📝 SERVICE MANAGEMENT                                       │
│  [+ Add New Service]                                         │
│                                                               │
│  Service Name           | Category | Price  | Status | Actions│
│  ─────────────────────────────────────────────────────────── │
│  Research Paper Pub...  | Profile  | $5,000 | Active | Edit Del│
│  Citation Assistance    | Academic | $3,000 | Active | Edit Del│
│  Keynote Opportunities  | Speaking | $8,000 | Active | Edit Del│
│                                                               │
│  ──────────────────────────────────────────────────────────  │
│                                                               │
│  👥 USER MANAGEMENT                                          │
│  [+ Add User] [Filter: All Roles ▼]                         │
│                                                               │
│  Name           | Email          | Role        | Status | Actions│
│  ─────────────────────────────────────────────────────────── │
│  Sandeep Kumar  | sandeep@...   | CRM Manager | Active | Edit │
│  Preet Singh    | preet@...     | CRM Manager | Active | Edit │
│  Deepali Sharma | deepali@...   | Lead Handler| Active | Edit │
│                                                               │
│  ──────────────────────────────────────────────────────────  │
│                                                               │
│  🎯 LEADS OVERVIEW                                           │
│  Name         | Score | Status    | Assigned To | Actions    │
│  ─────────────────────────────────────────────────────────── │
│  Rajesh Kumar | 87%   | Qualified | Sandeep     | Convert    │
│  Priya Sharma | 75%   | Contacted | Preet       | View       │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

### Service Management Features:

**Add/Edit Service Form:**
```html
Service Name: [Research Paper Publication Assistance______________]
Service Code: [RPPA-001__________] (auto-generated)
Category: [Profile Enhancement ▼]
Description: [Full support for publishing research papers in high-impact journals...]
             [Rich text editor with formatting]

Base Price: [$5,000_____]
Duration: [90______] days
Payment Plans: ☑ Full Payment  ☑ Installments (3 months)

Status: ◉ Active  ○ Inactive  ○ Archived

Visible to Roles: ☑ Client  ☑ CRM Manager  ☐ Lead Handler

Required Documents:
[CV/Resume                    ] [× Remove]
[Research Background          ] [× Remove]
[Draft Paper (if available)   ] [× Remove]
[+ Add Document Type]

Milestones:
1. [Initial Consultation      ] Duration: [7__] days [× Remove]
2. [Topic Refinement          ] Duration: [14_] days [× Remove]
3. [Manuscript Preparation    ] Duration: [39_] days [× Remove]
4. [Journal Selection         ] Duration: [9__] days [× Remove]
5. [Submission & Follow-up    ] Duration: [21_] days [× Remove]
[+ Add Milestone]

Employees/Team Members Required:
☑ Senior Research Advisor
☑ Publications Specialist
☑ Editor/Proofreader
[+ Add Team Member]

[Cancel] [Save Service]
```

**Service Examples to Implement:**
1. Research Paper Publication Assistance ($5,000, 90 days)
2. Citation Assistance ($3,000, 60 days)
3. Keynote Speaker Opportunities ($8,000, 120 days)
4. EB-1A Petition Preparation ($15,000, 180 days)
5. Profile Enhancement Consulting ($4,000, 45 days)

### User Management Features:

**Add User Form:**
```html
Full Name: [Sandeep Kumar____________________________]
Email: [sandeep@immigrationpro.com________________]
Phone: [+91-98765-43210__________________________]
Role: [CRM Manager ▼]

Initial Password: [Generate Random] or [●●●●●●●●]
☑ Send welcome email with login credentials

Permissions (based on role):
☑ View assigned clients
☑ Update service progress
☑ Respond to queries
☑ Schedule appointments
☐ View all clients (Admin only)
☐ Create/edit services (Admin only)

[Cancel] [Create User]
```

---

## 3. CRM Manager Dashboard (`crm-dashboard.html`)

### Layout:
```
┌─────────────────────────────────────────────────────────────┐
│ Welcome, Sandeep Kumar                    🔔 (7) [Logout]   │
├─────────────────────────────────────────────────────────────┤
│ [My Clients] [Services] [Payments] [Queries] [Appointments] │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  MY CLIENTS (23)                                             │
│  [Total: 23] [Active Services: 45] [Queries: 7] [Revenue: $345K]│
│                                                               │
│  [Search clients...] [Filter: All Statuses ▼]               │
│                                                               │
│  Client Name    | Service               | Progress | Payment | Actions│
│  ──────────────────────────────────────────────────────────── │
│  Rajesh Kumar   | Research Paper Pub... | ████░ 75%| Partial | View│
│  Anita Desai    | Citation Assistance   | ██░░░ 40%| Paid    | View│
│  Michael Chen   | EB-1A Petition Prep...| ██████ 90%| Due    | View│
│                                                               │
│  ──────────────────────────────────────────────────────────  │
│                                                               │
│  CLIENT DETAILS: Rajesh Kumar                                │
│  ┌─────────────────────────────────────────────────────────┐│
│  │ 📧 rajesh.kumar@techcorp.com   📱 +91-98765-43210       ││
│  │ 🎓 AI/Machine Learning          📍 Bangalore, India     ││
│  │                                                          ││
│  │ SERVICE: Research Paper Publication Assistance          ││
│  │ Progress: ████████░ 75% (3 of 4 milestones completed)   ││
│  │                                                          ││
│  │ TIMELINE:                                                ││
│  │ ✓ Initial Consultation (Jan 20, 2025)                   ││
│  │ ✓ Topic Refinement (Feb 3, 2025)                        ││
│  │ ✓ Manuscript Preparation (Mar 10, 2025 - Completed)     ││
│  │ ◉ Journal Selection (In Progress - Due: Mar 20, 2025)   ││
│  │ ○ Submission & Follow-up (Pending)                      ││
│  │                                                          ││
│  │ PAYMENTS:                                                ││
│  │ Total: $5,000 | Paid: $3,750 | Due: $1,250              ││
│  │ Next payment due: March 30, 2025                        ││
│  │                                                          ││
│  │ RECENT ACTIVITY:                                         ││
│  │ • Mar 12: Manuscript draft reviewed and approved         ││
│  │ • Mar 10: Client uploaded revised manuscript             ││
│  │ • Mar 5: Requested changes to introduction section       ││
│  │                                                          ││
│  │ [Update Progress] [Add Note] [Send Message] [Schedule]  ││
│  └─────────────────────────────────────────────────────────┘│
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

### Service Update Interface:

**Update Progress Modal:**
```html
┌─────────────────────────────────────────────────┐
│ Update Service Progress                          │
├─────────────────────────────────────────────────┤
│                                                  │
│ Client: Rajesh Kumar                             │
│ Service: Research Paper Publication Assistance   │
│                                                  │
│ Current Progress: 75%                            │
│ New Progress: [────────●──] 80%                  │
│                                                  │
│ Current Milestone:                               │
│ [Journal Selection ▼]                            │
│                                                  │
│ Milestone Status:                                │
│ ○ Pending                                        │
│ ◉ In Progress                                    │
│ ○ Completed                                      │
│ ○ Blocked                                        │
│                                                  │
│ Update Notes:                                    │
│ [Identified 3 suitable journals with high        │
│  impact factors. Preparing submission materials  │
│  for Journal of AI Research (IF: 8.5)...]       │
│                                                  │
│ Notify Client: ☑ Send progress update email     │
│                                                  │
│ [Cancel] [Save & Update]                        │
└─────────────────────────────────────────────────┘
```

### Queries Tab:

```
QUERIES (7 Pending)

[All ▼] [High Priority ▼] [Search queries...]

Priority | Subject                      | Client      | Status      | Date    | Actions
─────────────────────────────────────────────────────────────────────────────────────
🔴 High  | Document clarification       | Rajesh K.   | In Progress | Mar 13  | View
🟡 Med   | Timeline extension request   | Anita D.    | Pending     | Mar 12  | View
🟢 Low   | General inquiry             | Michael C.  | Resolved    | Mar 10  | View

QUERY DETAIL:

From: Rajesh Kumar
Subject: Document clarification needed
Priority: High
Status: In Progress
Date: March 13, 2025

Message:
Hi Sandeep, I need clarification on which version of my CV to submit.
Should I include my recent conference presentations? Also, the research
background template seems to be missing section 4. Can you please advise?

Response History:
─────────────────────────────────────────────────────────────────────
Mar 13, 10:30 AM - Sandeep Kumar (You):
Hi Rajesh, thank you for reaching out. Please include your most recent
CV with all conference presentations from the past 5 years. I'm sending
you the updated template with section 4 included.

Mar 13, 2:45 PM - Rajesh Kumar:
Perfect, thank you! I'll upload the updated CV today.
─────────────────────────────────────────────────────────────────────

Add Response:
[I've reviewed your CV and it looks great. The conference presentations
 add significant value to your profile. Let me know once you've uploaded
 the research background document and I'll review it within 24 hours.]

[Mark as Resolved] [Send Response]
```

---

## 4. Lead Handler Dashboard (`lead-handler-dashboard.html`)

### Layout:
```
┌─────────────────────────────────────────────────────────────┐
│ Lead Management Dashboard                          [Logout]  │
├─────────────────────────────────────────────────────────────┤
│ [Leads] [Assessments] [Conversions] [Reports]               │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  LEAD STATISTICS                                             │
│  [New: 15] [Qualified: 28] [Converted: 12] [Lost: 5]        │
│  Conversion Rate: 42%                                        │
│                                                               │
│  [Search leads...] [Filter: All Statuses ▼] [Export CSV]    │
│                                                               │
│  Name         | Email            | Score | Status    | Assigned | Actions│
│  ──────────────────────────────────────────────────────────────────────│
│  Priya Sharma | priya@email.com | 87%   | Qualified | Sandeep | Convert│
│  David Wilson | david@email.com | 65%   | Contacted | -       | Assign │
│  Sarah Johnson| sarah@email.com | 45%   | New       | -       | Contact│
│                                                               │
│  ──────────────────────────────────────────────────────────  │
│                                                               │
│  LEAD DETAIL: Priya Sharma                                   │
│  ┌─────────────────────────────────────────────────────────┐│
│  │ Contact: priya.sharma@email.com | +91-99999-88888        ││
│  │ Lead Source: Website Assessment Form                     ││
│  │ Date: January 15, 2025                                   ││
│  │                                                          ││
│  │ ASSESSMENT SCORE: 87% (Strong Candidate)                ││
│  │                                                          ││
│  │ Criteria Breakdown:                                      ││
│  │ ✓ Awards & Prizes: 3/3 (Met)                            ││
│  │ ✓ Publications: 2/3 (Strong)                            ││
│  │ ✓ Citations: 2/3 (Strong)                               ││
│  │ ✓ Media Coverage: 2/3 (Moderate)                        ││
│  │ ✓ Judging Experience: 3/3 (Met)                         ││
│  │                                                          ││
│  │ INTERACTION TIMELINE:                                    ││
│  │ Jan 15: Assessment submitted                             ││
│  │ Jan 16: Initial contact email sent                       ││
│  │ Jan 17: Follow-up call scheduled                         ││
│  │ Jan 18: Consultation completed                           ││
│  │ Jan 20: Assigned to Sandeep Kumar                        ││
│  │                                                          ││
│  │ NOTES:                                                   ││
│  │ [PhD in Computer Science from IIT Delhi. Currently      ││
│  │  working as Senior Research Scientist. Strong publication││
│  │  record with 500+ citations. Excellent candidate for    ││
│  │  EB-1A visa. Recommended services: Research Paper       ││
│  │  Publication + Citation Enhancement.]                    ││
│  │                                                          ││
│  │ [Contact Lead] [Assign to CRM] [Convert to Client]      ││
│  │ [Mark as Lost]                                           ││
│  └─────────────────────────────────────────────────────────┘│
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

### Convert to Client Flow:

```html
┌─────────────────────────────────────────────────┐
│ Convert Lead to Client                           │
├─────────────────────────────────────────────────┤
│                                                  │
│ Lead: Priya Sharma (Score: 87%)                 │
│                                                  │
│ Client Information:                              │
│ Full Name: [Priya Sharma________________]       │
│ Email: [priya.sharma@email.com_________]        │
│ Phone: [+91-99999-88888_________________]       │
│                                                  │
│ Create Account:                                  │
│ Username: [priya.sharma@email.com_______]       │
│ Initial Password: [Generate] [Show]             │
│ ☑ Send welcome email with login credentials     │
│                                                  │
│ Assign CRM Manager:                              │
│ [Sandeep Kumar ▼]                                │
│                                                  │
│ Recommended Services:                            │
│ ☑ Research Paper Publication Assistance ($5,000)│
│ ☑ Citation Assistance ($3,000)                  │
│ ☐ Keynote Speaker Opportunities ($8,000)        │
│                                                  │
│ Initial Consultation:                            │
│ Date: [March 25, 2025 ▼]                        │
│ Time: [10:00 AM ▼]                               │
│ Type: ◉ Video Call  ○ Phone  ○ In-Person        │
│                                                  │
│ Notes:                                           │
│ [Strong candidate with excellent publication     │
│  record. Priority client.]                       │
│                                                  │
│ [Cancel] [Create Client Account]                │
└─────────────────────────────────────────────────┘
```

---

## 5. Client Portal (`client-portal.html`)

### Layout:
```
┌─────────────────────────────────────────────────────────────┐
│ ImmigrationPro   [Home] [Services] [Payments] [Support]     │
│                                          Hi, Rajesh [Logout] │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  WELCOME BACK, RAJESH KUMAR                                  │
│  Your immigration journey at a glance                        │
│                                                               │
│  [Active Services: 2] [Progress: 75%] [Due: $1,250] [Messages: 3]│
│                                                               │
│  ──────────────────────────────────────────────────────────  │
│                                                               │
│  MY SERVICES                                                 │
│                                                               │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ 📄 Research Paper Publication Assistance               │ │
│  │ Status: In Progress                                     │ │
│  │ Progress: ████████░░ 75%                               │ │
│  │                                                         │ │
│  │ Current Phase: Journal Selection                        │ │
│  │ Assigned Manager: Sandeep Kumar                         │ │
│  │ Started: January 20, 2025                               │ │
│  │ Expected Completion: April 20, 2025                     │ │
│  │                                                         │ │
│  │ [View Details] [Contact Manager] [Upload Documents]    │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                               │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ 📊 Citation Assistance                                  │ │
│  │ Status: Completed ✓                                     │ │
│  │ Progress: ██████████ 100%                              │ │
│  │                                                         │ │
│  │ Completion Date: February 28, 2025                      │ │
│  │ Result: Successfully increased citations to 500+        │ │
│  │                                                         │ │
│  │ [View Report] [Download Certificate]                   │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                               │
│  ──────────────────────────────────────────────────────────  │
│                                                               │
│  BROWSE SERVICES                                             │
│  [Search services...] [Category: All ▼] [Price: All ▼]      │
│                                                               │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐        │
│  │ 🎤 Keynote   │ │ 📝 EB-1A     │ │ 💼 Profile   │        │
│  │ Speaker Opp. │ │ Petition Prep│ │ Enhancement  │        │
│  │              │ │              │ │              │        │
│  │ $8,000       │ │ $15,000      │ │ $4,000       │        │
│  │ 120 days     │ │ 180 days     │ │ 45 days      │        │
│  │              │ │              │ │              │        │
│  │ [View] [Buy] │ │ [View] [Buy] │ │ [View] [Buy] │        │
│  └──────────────┘ └──────────────┘ └──────────────┘        │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

### Service Detail View:

```html
┌─────────────────────────────────────────────────────────────┐
│ ← Back to Services                                           │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  RESEARCH PAPER PUBLICATION ASSISTANCE                       │
│                                                               │
│  Progress: 75% Complete                                      │
│  ████████████████████░░░░░                                   │
│                                                               │
│  ──────────────────────────────────────────────────────────  │
│                                                               │
│  TIMELINE & MILESTONES                                       │
│                                                               │
│  ✓  1. Initial Consultation                                  │
│      Completed: January 27, 2025                             │
│      Discussed research interests and publication goals      │
│                                                               │
│  ✓  2. Topic Refinement                                      │
│      Completed: February 10, 2025                            │
│      Finalized topic: "Novel Approaches in Machine Learning" │
│                                                               │
│  ✓  3. Manuscript Preparation                                │
│      Completed: March 10, 2025                               │
│      Draft manuscript completed and reviewed                 │
│                                                               │
│  ◉  4. Journal Selection (In Progress)                       │
│      Due: March 20, 2025                                     │
│      Current Status: Identified 3 high-impact journals       │
│      Next Step: Finalize journal choice by March 18          │
│                                                               │
│  ○  5. Submission & Follow-up                                │
│      Due: April 20, 2025                                     │
│      Pending completion of Journal Selection                 │
│                                                               │
│  ──────────────────────────────────────────────────────────  │
│                                                               │
│  YOUR MANAGER                                                │
│  ┌─────────────────────────────────────────────────────────┐│
│  │ [Photo] Sandeep Kumar                                    ││
│  │         CRM Manager                                      ││
│  │         sandeep@immigrationpro.com                       ││
│  │         +1-555-0123                                      ││
│  │                                                          ││
│  │         [Send Message] [Schedule Call]                   ││
│  └─────────────────────────────────────────────────────────┘│
│                                                               │
│  ──────────────────────────────────────────────────────────  │
│                                                               │
│  DOCUMENTS                                                   │
│  [Upload New Document ▼]                                     │
│                                                               │
│  Document Name              | Status    | Date       | Actions│
│  ────────────────────────────────────────────────────────────│
│  CV_Updated_2025.pdf        | Approved  | Jan 22     | View   │
│  Research_Background.pdf    | Approved  | Jan 25     | View   │
│  Draft_Manuscript_v3.pdf    | Approved  | Mar 10     | View   │
│  Recommendation_Letter_1... | Pending   | Mar 12     | View   │
│                                                               │
│  ──────────────────────────────────────────────────────────  │
│                                                               │
│  RECENT UPDATES                                              │
│  • Mar 13: Manager updated progress to 75%                   │
│  • Mar 12: You uploaded Recommendation Letter 1              │
│  • Mar 10: Manuscript draft approved                         │
│  • Mar 5: Manager requested revisions to introduction        │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

### Payment Section:

```html
PAYMENTS

Payment Summary:
┌─────────────────────────────────────────────────┐
│ Total Services Value:        $8,000             │
│ Total Paid:                  $6,750             │
│ Balance Due:                 $1,250             │
└─────────────────────────────────────────────────┘

Payment History:
Date       | Service                      | Amount  | Method | Status | Receipt
───────────────────────────────────────────────────────────────────────────────
Jan 20     | Research Paper Pub... (Advance) | $2,500  | Card   | Paid   | View
Feb 20     | Research Paper Pub... (Inst 1)  | $1,250  | Card   | Paid   | View
Mar 20     | Research Paper Pub... (Inst 2)  | $1,250  | Card   | Paid   | View
Feb 15     | Citation Assistance (Full)      | $3,000  | Bank   | Paid   | View

Upcoming Payments:
Due Date   | Service                      | Amount Due | [Action]
─────────────────────────────────────────────────────────────
Mar 30     | Research Paper Publication   | $1,250     | [Pay Now]

[Payment Methods] [Download All Receipts]
```

### Service Purchase Flow:

```html
┌─────────────────────────────────────────────────┐
│ Purchase Service                                 │
├─────────────────────────────────────────────────┤
│                                                  │
│ 🎤 KEYNOTE SPEAKER OPPORTUNITIES                │
│                                                  │
│ Description:                                     │
│ Connect with international conferences and       │
│ events seeking expert speakers in your field.    │
│ Includes profile promotion, application support, │
│ and booking assistance.                          │
│                                                  │
│ Duration: 120 days                               │
│ Price: $8,000                                    │
│                                                  │
│ Milestones:                                      │
│ 1. Profile Assessment & Enhancement (2 weeks)    │
│ 2. Conference Research & Selection (3 weeks)     │
│ 3. Application Preparation (4 weeks)             │
│ 4. Submission & Follow-up (8 weeks)              │
│ 5. Booking Confirmation (1 week)                 │
│                                                  │
│ Required Documents:                              │
│ • CV/Resume                                      │
│ • Speaking Portfolio                             │
│ • Previous Presentation Videos                   │
│ • Topic Proposals                                │
│                                                  │
│ Payment Options:                                 │
│ ◉ Full Payment ($8,000) - Save 10%              │
│ ○ Installments (3 months) - $2,667/month        │
│                                                  │
│ Assigned Manager (Auto-assigned):                │
│ [Preet Singh - CRM Manager]                      │
│                                                  │
│ Start Date: [March 25, 2025 ▼]                  │
│                                                  │
│ ☑ I agree to the Terms of Service               │
│                                                  │
│ Total: $8,000                                    │
│                                                  │
│ [Cancel] [Proceed to Payment]                   │
└─────────────────────────────────────────────────┘
```

### Support/Queries Section:

```html
SUPPORT

Raise New Query:
┌─────────────────────────────────────────────────┐
│ Subject: [_________________________________]     │
│ Category: [Service-Related ▼]                   │
│ Related Service: [Research Paper Publication ▼] │
│ Priority: [Medium ▼]                             │
│                                                  │
│ Your Message:                                    │
│ [____________________________________________    │
│  ____________________________________________    │
│  ____________________________________________]   │
│                                                  │
│ Attach Files: [Choose Files] (Max 10MB)         │
│                                                  │
│ [Submit Query]                                   │
└─────────────────────────────────────────────────┘

My Queries:
Status    | Subject                    | Date    | Last Response | Actions
──────────────────────────────────────────────────────────────────────────
Resolved  | Document clarification     | Mar 13  | Mar 13, 3:00 PM | View
Pending   | Extension request          | Mar 15  | Awaiting reply  | View
In Prog.  | Additional requirements    | Mar 14  | Mar 15, 10:00 AM| View

[Filter: All ▼] [Export]

QUERY DETAIL:

Subject: Document clarification needed
Category: Service-Related
Related Service: Research Paper Publication Assistance
Status: Resolved ✓
Created: March 13, 2025, 9:00 AM
Resolved: March 13, 2025, 3:00 PM

Conversation:
─────────────────────────────────────────────────────────────
March 13, 9:00 AM - You:
Hi Sandeep, I need clarification on which version of my CV to submit.
Should I include my recent conference presentations?

March 13, 10:30 AM - Sandeep Kumar:
Hi Rajesh, thank you for reaching out. Please include your most recent
CV with all conference presentations from the past 5 years.

March 13, 2:45 PM - You:
Perfect, thank you! I've uploaded the updated CV.

March 13, 3:00 PM - Sandeep Kumar:
Great! I've reviewed your CV and it looks excellent. Marked as resolved.
─────────────────────────────────────────────────────────────

[Reopen Query] [Mark as Resolved]
```

### Appointments Section:

```html
APPOINTMENTS

Schedule New Appointment:
┌─────────────────────────────────────────────────┐
│ Purpose: [Service Discussion ▼]                 │
│ Related Service: [Research Paper Publication ▼] │
│ With: [Sandeep Kumar - My Manager]              │
│                                                  │
│ Preferred Date: [March 20, 2025 ▼]              │
│ Preferred Time: [10:00 AM ▼]                    │
│ Duration: [30 minutes ▼]                         │
│                                                  │
│ Meeting Type:                                    │
│ ◉ Video Call  ○ Phone Call  ○ In-Person         │
│                                                  │
│ Additional Notes:                                │
│ [I'd like to discuss the journal selection       │
│  process and get your recommendations...]        │
│                                                  │
│ [Cancel] [Request Appointment]                  │
└─────────────────────────────────────────────────┘

Upcoming Appointments:
Date & Time           | With            | Type       | Status    | Actions
─────────────────────────────────────────────────────────────────────────
Mar 20, 10:00 AM     | Sandeep Kumar   | Video Call | Confirmed | Join | Cancel
Mar 27, 2:00 PM      | Preet Singh     | Phone      | Scheduled | View | Cancel

Past Appointments:
Date & Time           | With            | Type       | Notes
──────────────────────────────────────────────────────────────
Jan 22, 11:00 AM     | Sandeep Kumar   | Video Call | Initial consultation, discussed goals
Feb 5, 3:00 PM       | Sandeep Kumar   | Phone      | Progress update on manuscript
```

---

## 🗄️ Database Tables Required

### 1. `users`
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY,
  username VARCHAR(100),
  email VARCHAR(255) UNIQUE,
  password_hash VARCHAR(255),
  role ENUM('admin', 'crm_manager', 'lead_handler', 'client'),
  full_name VARCHAR(255),
  phone VARCHAR(20),
  status ENUM('active', 'inactive', 'suspended') DEFAULT 'active',
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  last_login TIMESTAMP
);
```

### 2. `services_catalog`
```sql
CREATE TABLE services_catalog (
  id UUID PRIMARY KEY,
  service_name VARCHAR(255),
  service_code VARCHAR(50) UNIQUE,
  category VARCHAR(100),
  description TEXT,
  base_price DECIMAL(10,2),
  duration_days INT,
  status ENUM('active', 'inactive', 'archived'),
  visible_to_roles JSON,
  required_documents JSON,
  milestones JSON,
  team_members JSON,
  created_by UUID,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

### 3. `client_services`
```sql
CREATE TABLE client_services (
  id UUID PRIMARY KEY,
  client_id UUID,
  service_id UUID,
  assigned_manager_id UUID,
  status ENUM('purchased', 'in_progress', 'pending_documents', 'completed', 'cancelled'),
  progress_percentage INT DEFAULT 0,
  start_date DATE,
  estimated_completion DATE,
  actual_completion DATE,
  total_amount DECIMAL(10,2),
  paid_amount DECIMAL(10,2),
  payment_status ENUM('unpaid', 'partial', 'paid'),
  current_milestone VARCHAR(255),
  notes TEXT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

### 4. `service_milestones`
```sql
CREATE TABLE service_milestones (
  id UUID PRIMARY KEY,
  client_service_id UUID,
  milestone_name VARCHAR(255),
  milestone_order INT,
  description TEXT,
  status ENUM('pending', 'in_progress', 'completed', 'blocked'),
  due_date DATE,
  completed_date DATE,
  completed_by UUID,
  notes TEXT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

### 5. `payments`
```sql
CREATE TABLE payments (
  id UUID PRIMARY KEY,
  client_id UUID,
  service_id UUID,
  amount DECIMAL(10,2),
  payment_method VARCHAR(50),
  payment_type ENUM('full', 'installment', 'advance'),
  status ENUM('pending', 'completed', 'failed'),
  transaction_id VARCHAR(255),
  payment_date TIMESTAMP,
  due_date DATE,
  reminder_sent BOOLEAN DEFAULT FALSE,
  notes TEXT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

### 6. `client_queries`
```sql
CREATE TABLE client_queries (
  id UUID PRIMARY KEY,
  client_id UUID,
  service_id UUID,
  subject VARCHAR(255),
  message TEXT,
  priority ENUM('low', 'medium', 'high', 'urgent'),
  status ENUM('new', 'assigned', 'in_progress', 'resolved', 'closed'),
  assigned_to UUID,
  category VARCHAR(100),
  created_at TIMESTAMP,
  resolved_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

### 7. `query_responses`
```sql
CREATE TABLE query_responses (
  id UUID PRIMARY KEY,
  query_id UUID,
  responder_id UUID,
  response_text TEXT,
  is_internal_note BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP
);
```

### 8. `appointments`
```sql
CREATE TABLE appointments (
  id UUID PRIMARY KEY,
  client_id UUID,
  manager_id UUID,
  appointment_type VARCHAR(100),
  scheduled_date TIMESTAMP,
  duration_minutes INT,
  meeting_link VARCHAR(500),
  location VARCHAR(500),
  status ENUM('scheduled', 'confirmed', 'completed', 'cancelled'),
  notes TEXT,
  reminder_sent BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

### 9. `leads`
```sql
CREATE TABLE leads (
  id UUID PRIMARY KEY,
  full_name VARCHAR(255),
  email VARCHAR(255),
  phone VARCHAR(20),
  lead_source VARCHAR(100),
  visa_type_interest VARCHAR(100),
  status ENUM('new', 'contacted', 'qualified', 'converted', 'lost'),
  assigned_to UUID,
  assessment_score INT,
  notes TEXT,
  converted_to_client_id UUID,
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  converted_at TIMESTAMP
);
```

### 10. `documents`
```sql
CREATE TABLE documents (
  id UUID PRIMARY KEY,
  client_id UUID,
  service_id UUID,
  document_type VARCHAR(100),
  document_name VARCHAR(255),
  file_url VARCHAR(500),
  file_size_bytes INT,
  uploaded_by UUID,
  status ENUM('pending_review', 'approved', 'rejected'),
  notes TEXT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

---

## 🎨 Design Requirements

### Color Scheme:
- Primary: #2563eb (Blue)
- Secondary: #1e40af (Dark Blue)
- Success: #10b981 (Green)
- Warning: #f59e0b (Orange)
- Danger: #ef4444 (Red)
- Neutral: #6b7280 (Gray)
- Background: #f9fafb (Light Gray)

### Typography:
- Font: Inter, system-ui, sans-serif
- Headings: 600-700 weight
- Body: 400 weight

### Components:
- Buttons: Rounded (8px), shadow on hover
- Cards: White background, subtle shadow
- Tables: Striped rows, hover effect
- Forms: Clear labels, inline validation
- Progress Bars: Animated, color-coded
- Badges: Rounded pills, status colors
- Modals: Centered, 50% width max

### Responsive:
- Mobile: < 768px (single column)
- Tablet: 768px - 1024px (2 columns)
- Desktop: > 1024px (3+ columns)

---

## ⚡ Key Features to Implement

### 1. Role-Based Access Control
- Admin sees all data and controls
- CRM managers see only assigned clients
- Lead handlers see only leads
- Clients see only their own data

### 2. Service Management
- Admin can CRUD services
- Services have milestones
- Progress tracking (0-100%)
- Document requirements
- Team member assignments

### 3. Client Assignment
- Admin assigns clients to CRM managers
- Automatic assignment on lead conversion
- Manager workload balancing

### 4. Progress Tracking
- Visual progress bars
- Milestone completion tracking
- Timeline visualization
- Automated notifications

### 5. Payment System
- Full payment or installments
- Payment due date tracking
- Automated reminders (7, 3, 1 days before)
- Payment history

### 6. Communication
- Query submission system
- Threaded responses
- Priority tagging
- Status tracking (new → resolved)

### 7. Appointments
- Schedule requests
- Calendar integration
- Video call links
- Reminders

### 8. Notifications
- In-app notifications
- Email notifications
- Real-time updates

### 9. Analytics Dashboard
- Revenue metrics
- Client statistics
- Service performance
- Conversion rates

---

## 📝 Demo Data Requirements

### Users:
1. **Admin:** admin@immigrationpro.com / Admin@123
2. **CRM Managers:**
   - sandeep@immigrationpro.com / Sandeep@123
   - preet@immigrationpro.com / Preet@123
3. **Lead Handler:** deepali@immigrationpro.com / Deepali@123
4. **Clients:**
   - rajesh.kumar@techcorp.com / Client@123
   - anita.desai@university.edu / Client@123
   - michael.chen@company.com / Client@123

### Services:
1. Research Paper Publication Assistance ($5,000, 90 days)
2. Citation Assistance ($3,000, 60 days)
3. Keynote Speaker Opportunities ($8,000, 120 days)
4. EB-1A Petition Preparation ($15,000, 180 days)
5. Profile Enhancement Consulting ($4,000, 45 days)

### Client Services (with realistic progress):
1. Rajesh Kumar: Research Paper Publication (75% complete)
2. Rajesh Kumar: Citation Assistance (100% complete)
3. Anita Desai: EB-1A Petition Preparation (40% complete)
4. Michael Chen: Profile Enhancement (90% complete)

### Queries:
1. Rajesh: "Document clarification" - Resolved
2. Anita: "Timeline extension request" - Pending
3. Michael: "Additional requirements" - In Progress

### Payments:
- Mix of paid, partial, and pending
- Upcoming payment due dates
- Payment history records

### Leads:
1. Priya Sharma (Score: 87%, Status: Qualified)
2. David Wilson (Score: 65%, Status: Contacted)
3. Sarah Johnson (Score: 45%, Status: New)

---

## ✅ Acceptance Criteria

The system is complete when:

1. ✅ All 4 roles can log in and see appropriate dashboards
2. ✅ Admin can create/edit/delete services with milestones
3. ✅ Admin can create users and assign roles
4. ✅ Admin can assign clients to CRM managers
5. ✅ CRM managers see only assigned clients
6. ✅ CRM managers can update service progress
7. ✅ CRM managers can respond to queries
8. ✅ Lead handlers can view/manage leads
9. ✅ Lead handlers can convert leads to clients
10. ✅ Clients can browse and purchase services
11. ✅ Clients see real-time progress updates
12. ✅ Clients can make payments
13. ✅ Clients can submit queries
14. ✅ Clients can schedule appointments
15. ✅ Payment reminders are sent automatically
16. ✅ All workflows function end-to-end
17. ✅ UI is responsive on mobile/tablet/desktop
18. ✅ Demo data is realistic and tells a story
19. ✅ All tables have foreign key relationships
20. ✅ System is secure and role-based

---

## 🚀 Development Notes

### Technology Stack:
- Frontend: HTML5, CSS3, JavaScript (ES6+)
- Styling: Tailwind CSS (via CDN)
- Icons: Font Awesome 6
- Fonts: Google Fonts (Inter)
- Backend: RESTful Table API (provided)
- Database: Relational (SQL schema provided)

### File Structure:
```
/
├── index.html (Landing/Home)
├── admin-login.html
├── admin-dashboard.html
├── crm-login.html
├── crm-dashboard.html
├── lead-handler-login.html
├── lead-handler-dashboard.html
├── client-login.html
├── client-signup.html
├── client-portal.html
├── css/
│   ├── style.css
│   ├── admin.css
│   ├── crm.css
│   └── client.css
├── js/
│   ├── auth.js
│   ├── admin.js
│   ├── crm.js
│   ├── lead-handler.js
│   ├── client.js
│   └── utils.js
└── README.md
```

### JavaScript Utilities Needed:
- Authentication functions
- API call wrappers (fetch)
- Form validation
- Date formatting
- Progress bar updates
- Modal/popup handlers
- Notification toasts
- Session management

### Security:
- Password hashing (SHA-256 client-side, bcrypt recommended server-side)
- Session timeout (30 minutes)
- CSRF protection
- Input sanitization
- XSS prevention

---

## 📋 Priority Order

1. **Phase 1:** Authentication & user roles
2. **Phase 2:** Admin dashboard & service management
3. **Phase 3:** CRM manager dashboard & client management
4. **Phase 4:** Lead handler dashboard
5. **Phase 5:** Client portal & service browsing
6. **Phase 6:** Purchase flow & payments
7. **Phase 7:** Queries & appointments
8. **Phase 8:** Notifications & reminders
9. **Phase 9:** Analytics & reporting
10. **Phase 10:** Testing & polish

---

*This prompt provides complete specifications for building a production-ready CRM & client portal system. All requirements, workflows, UI mockups, database schemas, and acceptance criteria are included.*

**Ready to build? Start with Phase 1! 🚀**
