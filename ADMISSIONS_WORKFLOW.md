# Admissions Domain - Complete Workflow Implementation

## Overview
This document outlines the complete admissions workflow from initial enquiry to enrolled student.

## Workflow Stages

```
┌─────────────┐
│   ENQUIRY   │ ← Initial interest (web form, phone, visit)
└──────┬──────┘
       │ Convert
       ▼
┌─────────────┐
│  APPLICANT  │ ← Person details captured (may apply multiple times)
└──────┬──────┘
       │ Create
       ▼
┌─────────────┐
│ APPLICATION │ ← Formal application submitted with documents
└──────┬──────┘
       │ Schedule
       ▼
┌─────────────┐
│  INTERVIEW  │ ← Assessment process (entrance exam, parent meeting)
└──────┬──────┘
       │ Complete
       ▼
┌─────────────┐
│   DECISION  │ ← Offered / Waitlisted / Rejected
└──────┬──────┘
       │ Accept Offer
       ▼
┌─────────────┐
│  ENROLLMENT │ ← Accept offer, pay fees, submit documents
└──────┬──────┘
       │ Convert
       ▼
┌─────────────┐
│   STUDENT   │ ← Enrolled in students table
└─────────────┘
```

## Database Schema Additions

### 1. Application Workflow States
```sql
-- Enhanced admission_statuses (already exists)
-- Statuses: applied, under_review, interview_scheduled, interviewed, 
--           offered, waitlisted, rejected, enrolled, withdrawn
```

### 2. Interviews Table (already exists)
```sql
CREATE TABLE interviews (
  id BIGSERIAL PRIMARY KEY,
  school_id BIGINT NOT NULL,
  application_id BIGINT NOT NULL REFERENCES applications(id),
  
  interview_type VARCHAR(50),  -- entrance_exam, student_interview, parent_interview
  scheduled_date TIMESTAMPTZ,
  scheduled_end_time TIMESTAMPTZ,
  location VARCHAR(200),
  interviewer_ids BIGINT[],  -- Array of staff user IDs
  
  interview_notes TEXT,
  interview_score NUMERIC(5,2),
  interview_outcome VARCHAR(50),  -- passed, failed, pending, no_show
  outcome_notes TEXT,
  
  is_completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by BIGINT,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  is_deleted BOOLEAN DEFAULT FALSE
);
```

### 3. Application Documents (already exists)
```sql
CREATE TABLE application_documents (
  id BIGSERIAL PRIMARY KEY,
  school_id BIGINT NOT NULL,
  application_id BIGINT NOT NULL,
  
  document_type VARCHAR(100),  -- birth_certificate, report_card, transcript, etc.
  document_name VARCHAR(200),
  file_path VARCHAR(500),
  file_name VARCHAR(255),
  file_type VARCHAR(50),
  file_size BIGINT,
  
  is_verified BOOLEAN DEFAULT FALSE,
  verified_by BIGINT,
  verified_at TIMESTAMPTZ,
  
  uploaded_at TIMESTAMPTZ DEFAULT NOW(),
  uploaded_by BIGINT,
  is_deleted BOOLEAN DEFAULT FALSE
);
```

### 4. Application Decisions (NEW)
```sql
CREATE TABLE application_decisions (
  id BIGSERIAL PRIMARY KEY,
  school_id BIGINT NOT NULL,
  application_id BIGINT NOT NULL REFERENCES applications(id),
  
  decision_type VARCHAR(50) NOT NULL,  -- offered, waitlisted, rejected
  decision_date TIMESTAMPTZ DEFAULT NOW(),
  decision_by BIGINT,  -- User who made decision
  
  offer_details JSONB,  -- { grade_offered, stream_offered, academic_year, fees_category }
  offer_valid_until DATE,
  
  waitlist_position INTEGER,
  waitlist_notes TEXT,
  
  rejection_reason TEXT,
  
  applicant_response VARCHAR(50),  -- accepted, declined, pending
  response_date TIMESTAMPTZ,
  response_notes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 5. Enrollment Records (links to students)
```sql
CREATE TABLE enrollments (
  id BIGSERIAL PRIMARY KEY,
  school_id BIGINT NOT NULL,
  application_id BIGINT NOT NULL REFERENCES applications(id),
  student_id BIGINT NOT NULL REFERENCES students(id),
  
  enrollment_date DATE NOT NULL,
  academic_year VARCHAR(20) NOT NULL,
  grade_id BIGINT,
  stream_id BIGINT,
  
  enrollment_status VARCHAR(50),  -- pending_documents, fees_pending, completed
  fees_category VARCHAR(50),
  
  documents_submitted JSONB,  -- Checklist of required documents
  fees_paid BOOLEAN DEFAULT FALSE,
  fees_amount NUMERIC(10,2),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by BIGINT,
  completed_at TIMESTAMPTZ,
  completed_by BIGINT
);
```

## API Endpoints

### Applicants
```
GET    /api/admissions/applicants              - List all applicants
GET    /api/admissions/applicants/:id          - Get applicant details
POST   /api/admissions/applicants              - Create new applicant
PUT    /api/admissions/applicants/:id          - Update applicant
DELETE /api/admissions/applicants/:id          - Soft delete applicant
```

### Applications
```
GET    /api/admissions/applications            - List applications (with filters)
GET    /api/admissions/applications/:id        - Get application with full details
POST   /api/admissions/applications            - Create application
PUT    /api/admissions/applications/:id        - Update application
DELETE /api/admissions/applications/:id        - Soft delete

POST   /api/admissions/applications/:id/submit - Submit application (lock for editing)
POST   /api/admissions/applications/:id/convert-to-student - Convert to student
```

### Interviews
```
GET    /api/admissions/interviews              - List interviews (with filters)
GET    /api/admissions/interviews/:id          - Get interview details
POST   /api/admissions/interviews              - Schedule interview
PUT    /api/admissions/interviews/:id          - Update interview
DELETE /api/admissions/interviews/:id          - Cancel interview
POST   /api/admissions/interviews/:id/complete - Mark as completed with outcome
POST   /api/admissions/interviews/:id/reschedule - Reschedule interview
```

### Decisions
```
GET    /api/admissions/decisions               - List decisions
GET    /api/admissions/applications/:id/decision - Get decision for application
POST   /api/admissions/applications/:id/decide - Make decision (offer/waitlist/reject)
POST   /api/admissions/decisions/:id/respond   - Applicant responds to offer
```

### Enrollment
```
GET    /api/admissions/enrollments             - List enrollments
GET    /api/admissions/enrollments/:id         - Get enrollment details
POST   /api/admissions/enrollments             - Create enrollment from accepted offer
PUT    /api/admissions/enrollments/:id         - Update enrollment
POST   /api/admissions/enrollments/:id/complete - Complete enrollment (all requirements met)
```

## Frontend Pages

### 1. Applicants Management
```
/admissions/applicants
  - List all applicants with search/filter
  - Create new applicant
  - View applicant profile
  - See application history
```

### 2. Applications Dashboard
```
/admissions/applications
  - Kanban board by status (Applied → Review → Interview → Decision → Enrolled)
  - List view with advanced filters
  - Create new application
  - Bulk actions (schedule interviews, send emails)
```

### 3. Application Detail
```
/admissions/applications/:id
  - Tab 1: Application Form
  - Tab 2: Applicant Information
  - Tab 3: Documents (upload/verify)
  - Tab 4: Interviews (schedule/view)
  - Tab 5: Decision & Offer
  - Tab 6: Enrollment Status
  - Activity Timeline
```

### 4. Interview Management
```
/admissions/interviews
  - Calendar view of scheduled interviews
  - List view by date/type
  - Schedule new interview
  - Mark interviews as completed
  - Interview assessment forms
```

### 5. Decisions Dashboard
```
/admissions/decisions
  - Pending decisions (needs review)
  - Offers awaiting response
  - Accepted offers (ready for enrollment)
  - Declined/Rejected applications
```

### 6. Enrollment Management
```
/admissions/enrollments
  - Pending enrollments (documents/fees)
  - Completed enrollments
  - Generate enrollment numbers
  - Bulk convert to students
```

## Status Transitions

```
applied
  ↓ (auto)
under_review
  ↓ (staff action)
interview_scheduled
  ↓ (interview completed)
interviewed
  ↓ (decision made)
offered | waitlisted | rejected
  ↓ (if offered + accepted)
enrolled
  ↓ (enrollment complete)
converted_to_student
```

## Business Rules

### Applicant Rules
- One applicant can have multiple applications (different academic years)
- Applicant email must be unique per school
- Applicant can be linked to multiple enquiries

### Application Rules
- Application must have unique application_no per school
- Cannot submit application without required documents
- Cannot schedule interview before application is submitted
- Cannot make decision before interview is completed

### Interview Rules
- Must have at least one interviewer
- Cannot schedule in past
- Must be completed before decision can be made

### Decision Rules
- Only one decision per application
- Offer must include: grade, stream, academic year, fees category
- Offer must have validity date
- Waitlist must have position number

### Enrollment Rules
- Can only enroll if offer was accepted
- Must have all required documents before converting to student
- Student ID generated upon enrollment completion

## Next Steps

1. **Database Migration** - Create `application_decisions` and `enrollments` tables
2. **Seed Data** - Add all admission_statuses for all schools
3. **Backend Services** - Implement decision and enrollment services
4. **Frontend Components** - Build interview scheduler, decision forms, enrollment wizard
5. **Workflow Automation** - Email notifications, status change triggers
6. **Reports** - Application funnel, conversion rates, interview success rates
