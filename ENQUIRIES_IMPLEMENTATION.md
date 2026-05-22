# Enquiries Management System - Implementation Guide

## Overview
A comprehensive Enquiries Management System for tracking, managing, and converting enquiries into admissions.

## Features

### Core Capabilities
- **Enquiry Tracking**: Full lifecycle from creation to conversion/closure
- **Classification**: By type (Academic, Admission, Fee, etc.) and source (Web, Phone, Walk-in, etc.)
- **Assignment**: Assign enquiries to staff members
- **Status Management**: New → In Progress → Waiting Response → Converted/Closed/Rejected
- **Priority Levels**: Low, Medium, High, Urgent
- **Notes & Attachments**: Add notes and attach files to enquiries
- **Statistics & Reporting**: Dashboard with enquiry metrics
- **Student Conversion**: Link enquiries to students upon admission

### Database Schema
Located in: `migrations/0006_enquiries.sql`

**Tables Created:**
- `enquiries` - Main enquiry records
- `enquiry_types` - Categories of enquiries
- `enquiry_sources` - Sources of enquiries
- `enquiry_notes` - Notes/comments on enquiries
- `enquiry_attachments` - File attachments

### Backend Implementation

#### Location
`backend/src/domains/admissions/enquiries/`

#### Files
- `validator.ts` - Zod schemas for validation
- `types.ts` - TypeScript types
- `service.ts` - Business logic layer
- `controller.ts` - HTTP request handlers
- `routes.ts` - API route definitions
- `errors.ts` - Custom error classes
- `index.ts` - Domain barrel file

#### API Endpoints

**Main Enquiries:**
```
GET    /admissions/enquiries              - List all enquiries
GET    /admissions/enquiries/:id          - Get enquiry by ID
POST   /admissions/enquiries              - Create new enquiry
PUT    /admissions/enquiries/:id          - Update enquiry
DELETE /admissions/enquiries/:id          - Delete enquiry
GET    /admissions/enquiries/statistics   - Get enquiry statistics
POST   /admissions/enquiries/:id/assign   - Assign enquiry to staff
POST   /admissions/enquiries/:id/status   - Update enquiry status
POST   /admissions/enquiries/:id/convert  - Convert to student
```

**Enquiry Types:**
```
GET    /admissions/enquiries/types        - List enquiry types
POST   /admissions/enquiries/types        - Create type
PUT    /admissions/enquiries/types/:id    - Update type
DELETE /admissions/enquiries/types/:id    - Delete type
```

**Enquiry Sources:**
```
GET    /admissions/enquiries/sources      - List enquiry sources
POST   /admissions/enquiries/sources      - Create source
PUT    /admissions/enquiries/sources/:id  - Update source
DELETE /admissions/enquiries/sources/:id  - Delete source
```

**Enquiry Notes:**
```
GET    /admissions/enquiries/:enquiryId/notes     - List notes
POST   /admissions/enquiries/:enquiryId/notes     - Add note
PUT    /admissions/enquiries/notes/:id            - Update note
DELETE /admissions/enquiries/notes/:id            - Delete note
```

**Enquiry Attachments:**
```
GET    /admissions/enquiries/:enquiryId/attachments   - List attachments
POST   /admissions/enquiries/:enquiryId/attachments   - Add attachment
DELETE /admissions/enquiries/attachments/:id          - Delete attachment
```

### Frontend Implementation

#### Location
`frontend/src/domains/admissions/enquiries/`

#### Files
- `types.ts` - TypeScript types
- `services.ts` - API service functions
- `controller.ts` - API controller functions
- `errors.ts` - Error classes
- `index.tsx` - Domain barrel file
- `hooks/useEnquiries.ts` - React hooks
- `components/EnquiriesList.tsx` - List view component
- `components/EnquiryForm.tsx` - Create/Edit form
- `pages/EnquiriesPage.tsx` - Main page

#### React Hooks
```typescript
useEnquiries(filters)        - List enquiries with pagination
useEnquiry(id)               - Get single enquiry
useEnquiryStatistics()       - Get statistics
useEnquiryTypes()            - Get enquiry types
useEnquirySources()          - Get enquiry sources
useEnquiryNotes(enquiryId)   - Get notes for enquiry
```

#### Components
```typescript
<EnquiriesList />            - Main list view with filters
<EnquiryForm />              - Create/Edit form
```

## Installation Steps

### 1. Run Database Migration
```bash
# Run the migration in your database
psql -U your_user -d your_database -f migrations/0006_enquiries.sql
```

### 2. Run Seed Data
```bash
psql -U your_user -d your_database -f migrations/99999_enquiries_seed.sql
```

### 3. Sync Backend Registry
The enquiry domain is already registered in:
- `backend/src/registry/index.ts`
- `backend/src/domains/admissions/index.ts`

### 4. Build & Run
```bash
# Backend
cd backend
pnpm build
pnpm dev

# Frontend
cd frontend
pnpm dev
```

## Usage Examples

### Creating an Enquiry (API)
```javascript
POST /admissions/enquiries
{
  "subject": "Inquiry about Grade 10 Admission",
  "description": "Parent inquiring about admission process for Grade 10",
  "enquirer_name": "John Doe",
  "enquirer_email": "john@example.com",
  "enquirer_phone": "+256700000000",
  "enquirer_type": "parent",
  "enquiry_type_id": 2,
  "enquiry_source_id": 1,
  "priority": "high",
  "status": "new",
  "interested_grade": "10",
  "academic_year": "2026"
}
```

### Assigning Enquiry
```javascript
POST /admissions/enquiries/123/assign
{
  "assigned_to": 456
}
```

### Updating Status
```javascript
POST /admissions/enquiries/123/status
{
  "status": "in_progress"
}
```

### Converting to Student
```javascript
POST /admissions/enquiries/123/convert
{
  "student_id": 789
}
```

## Enquiry Types (Default)
1. Academic Enquiry
2. Admission Enquiry
3. Fee Enquiry
4. Transport Enquiry
5. Boarding Enquiry
6. General Enquiry
7. Complaint
8. Suggestion

## Enquiry Sources (Default)
1. Website
2. Phone Call
3. Walk-in
4. Email
5. Social Media
6. Referral
7. Education Fair
8. Advertisement

## Enquiry Status Flow
```
New → In Progress → Waiting Response → [Converted | Closed | Rejected]
```

## Key Features

### 1. Multi-tenant Support
All enquiries are scoped to `school_id` for data isolation.

### 2. Soft Deletes
Uses `is_deleted` flag for data retention.

### 3. Audit Trail
Automatic tracking of `created_by`, `updated_by`, timestamps.

### 4. Auto-generated Reference Numbers
Format: `ENQ-YYYYMMDD-00001`

### 5. Permission-based Access
Integrated with existing permissions system.

## Future Enhancements

- [ ] Email notifications on status changes
- [ ] Automated assignment rules
- [ ] SLA tracking for response times
- [ ] Email templates for common responses
- [ ] Bulk actions (assign, status update)
- [ ] Export to CSV/PDF
- [ ] Dashboard widgets
- [ ] Advanced filtering and search
- [ ] Timeline view of enquiry activities
- [ ] Integration with communication channels (WhatsApp, SMS)

## Support

For issues or questions, refer to the main EMS documentation or contact the development team.
