# Complete Admissions Workflow - Implementation Plan

## Phase 1: Application Dashboard (Kanban Board) ✅

**File**: `frontend/src/components/domains/admissions/applications/pages/ApplicationsDashboard.tsx`

### Features:
- Kanban board with columns: Applied → Under Review → Interview → Offered → Enrolled
- Drag & drop to change status
- Quick stats per column
- Click card to view/edit application

### Backend Needed:
```typescript
// Add to applications/service.ts
async getKanbanData(context: UserContext) {
  const applications = await this.findAllApplications(context);
  
  // Group by status
  const columns = {
    applied: [],
    under_review: [],
    interview_scheduled: [],
    interviewed: [],
    offered: [],
    waitlisted: [],
    enrolled: [],
    rejected: []
  };
  
  applications.data.forEach(app => {
    const statusCode = app.statusCode?.toLowerCase();
    if (columns[statusCode]) {
      columns[statusCode].push({
        id: app.id,
        title: `${app.applicantFirstName} ${app.applicantLastName}`,
        subtitle: app.applying_for_grade,
        meta: {
          email: app.applicantEmail,
          phone: app.applicantPhone,
          date: app.submission_date,
          assigned_to: app.assigned_to_name
        }
      });
    }
  });
  
  return columns;
}
```

---

## Phase 2: Interview Scheduling

**File**: `frontend/src/components/domains/admissions/interviews/`

### Features:
- Calendar view of scheduled interviews
- Schedule interview modal
- Interview assessment form
- Mark as completed with outcome

### Database (already exists):
```sql
-- interviews table exists
-- Fields: scheduled_date, interviewer_ids, interview_notes, 
--         interview_score, interview_outcome, is_completed
```

### Backend Endpoints:
```typescript
// interviews/service.ts
async scheduleInterview(context, data) {
  return await db.insertInto('interviews').values({
    ...data,
    school_id: context.schoolId,
    created_by: context.userId
  }).returningAll().execute();
}

async completeInterview(context, id, outcome) {
  return await db.updateTable('interviews')
    .set({
      is_completed: true,
      completed_at: new Date(),
      interview_outcome: outcome
    })
    .where('id', '=', id)
    .returningAll()
    .execute();
}
```

---

## Phase 3: Decision Making (Offer/Waitlist/Reject)

**File**: `backend/src/domains/admissions/decisions/`

### Database (already created):
```sql
-- application_decisions table exists
-- Fields: decision_type, offer_details, waitlist_position,
--         rejection_reason, applicant_response
```

### Backend Service:
```typescript
// decisions/service.ts
async makeDecision(context, applicationId, decisionData) {
  const { decision_type, offer_details, rejection_reason } = decisionData;
  
  // Create decision record
  const decision = await db.insertInto('application_decisions')
    .values({
      school_id: context.schoolId,
      application_id: applicationId,
      decision_type,
      offer_details: decision_type === 'offered' ? offer_details : null,
      rejection_reason: decision_type === 'rejected' ? rejection_reason : null,
      decision_by: context.userId
    })
    .returningAll()
    .execute();
  
  // Update application status
  const statusCode = decision_type === 'offered' ? 'OFFERED' :
                     decision_type === 'waitlisted' ? 'WAITLISTED' : 'REJECTED';
  
  await db.updateTable('applications')
    .set({ admission_status_id: statusCode })
    .where('id', '=', applicationId)
    .execute();
  
  // TODO: Send notification email
  await sendDecisionEmail(applicationId, decision);
  
  return decision;
}
```

### Decision Templates:
```typescript
const decisionTemplates = {
  offered: {
    subject: 'Admission Offer - {school_name}',
    body: `Dear {applicant_name},
    
We are pleased to offer you admission to {school_name} for Grade {grade}...
Offer valid until: {valid_until}
Next steps: {enrollment_steps}
`
  },
  waitlisted: {
    subject: 'Application Status Update - {school_name}',
    body: `Dear {applicant_name},

Your application has been placed on our waiting list...
Current position: {position}
`
  },
  rejected: {
    subject: 'Application Decision - {school_name}',
    body: `Dear {applicant_name},

Thank you for your interest in {school_name}...
Decision: {reason}
`
  }
};
```

---

## Phase 4: Enrollment Conversion

**File**: `backend/src/domains/admissions/enrollments/`

### Database (already created):
```sql
-- enrollments table exists
-- Fields: student_id, enrollment_date, grade_id, stream_id,
--         enrollment_status, documents_submitted, fees_paid
```

### Backend Service:
```typescript
// enrollments/service.ts
async createEnrollment(context, applicationId, enrollmentData) {
  // Verify application has accepted offer
  const decision = await getDecisionForApplication(applicationId);
  if (!decision || decision.applicant_response !== 'accepted') {
    throw new Error('Cannot enroll - offer not accepted');
  }
  
  // Create student record first
  const applicant = await getApplicant(application.applicant_id);
  const student = await db.insertInto('students')
    .values({
      school_id: context.schoolId,
      first_name: applicant.first_name,
      last_name: applicant.last_name,
      date_of_birth: applicant.date_of_birth,
      gender: applicant.gender,
      admission_no: generateAdmissionNumber(),
      // ... other fields
    })
    .returningAll()
    .execute();
  
  // Create enrollment record
  const enrollment = await db.insertInto('enrollments')
    .values({
      school_id: context.schoolId,
      application_id: applicationId,
      student_id: student.id,
      enrollment_date: new Date(),
      grade_id: enrollmentData.grade_id,
      stream_id: enrollmentData.stream_id,
      enrollment_status: 'pending_documents'
    })
    .returningAll()
    .execute();
  
  // Update application status
  await db.updateTable('applications')
    .set({
      admission_status_id: 'ENROLLED',
      enrolled_student_id: student.id
    })
    .where('id', '=', applicationId)
    .execute();
  
  return { enrollment, student };
}

async completeEnrollment(context, enrollmentId) {
  return await db.updateTable('enrollments')
    .set({
      enrollment_status: 'completed',
      completed_at: new Date()
    })
    .where('id', '=', enrollmentId)
    .returningAll()
    .execute();
}
```

---

## Phase 5: Notifications

**File**: `backend/src/domains/communications/admissions-notifications.ts`

### Email Templates:
```typescript
const notifications = {
  application_submitted: {
    to: 'applicant',
    subject: 'Application Received - {application_no}',
    trigger: 'on application create'
  },
  interview_scheduled: {
    to: 'applicant',
    subject: 'Interview Scheduled - {date}',
    trigger: 'on interview create'
  },
  decision_made: {
    to: 'applicant',
    subject: 'Admission Decision',
    trigger: 'on decision create'
  },
  offer_accepted: {
    to: 'admissions_team',
    subject: 'Offer Accepted - {student_name}',
    trigger: 'on applicant respond'
  },
  enrollment_complete: {
    to: 'applicant',
    subject: 'Welcome to {school_name}!',
    trigger: 'on enrollment complete'
  }
};
```

---

## Phase 6: Reports

**File**: `frontend/src/components/domains/admissions/reports/`

### Reports:
1. **Application Funnel** - Conversion rates at each stage
2. **Source Analysis** - Where applications come from
3. **Timeline Report** - Applications over time
4. **Status Breakdown** - Current pipeline
5. **Enrollment Rate** - Offers vs Enrollments

### Backend:
```typescript
// reports/service.ts
async getApplicationFunnel(context, academicYear) {
  const stats = await db.selectFrom('applications')
    .leftJoin('admission_statuses', 'applications.admission_status_id', 'admission_statuses.id')
    .select([
      'admission_statuses.name as status',
      db.fn.count('applications.id').as('count')
    ])
    .where('applications.school_id', '=', context.schoolId)
    .groupBy('admission_statuses.name')
    .execute();
  
  // Calculate conversion rates
  const total = stats.reduce((sum, s) => sum + Number(s.count), 0);
  const enrolled = stats.find(s => s.status === 'Enrolled')?.count || 0;
  
  return {
    by_status: stats,
    conversion_rate: total > 0 ? (Number(enrolled) / total * 100).toFixed(1) : 0,
    total_applications: total
  };
}
```

---

## Implementation Order:

1. ✅ **Fix Application Form** (Done - "+ New Applicant" working)
2. **Application Dashboard** (Kanban) - 1-2 days
3. **Interview Scheduling** - 1-2 days
4. **Decision Making** - 1-2 days
5. **Enrollment Conversion** - 1-2 days
6. **Notifications** - 1 day
7. **Reports** - 1-2 days

**Total: ~7-10 days for complete workflow**

---

## Want Me To Build This?

I can implement these one by one. Which should we start with?

**Recommended order:**
1. **Application Dashboard** - Visual workflow, see all applications
2. **Decision Making** - Core workflow (offer/waitlist/reject)
3. **Enrollment Conversion** - Convert to students
4. **Interview Scheduling** - Add interview tracking
5. **Notifications** - Email at each stage
6. **Reports** - Analytics and insights

Shall I start with the **Application Dashboard (Kanban Board)**? 🚀
