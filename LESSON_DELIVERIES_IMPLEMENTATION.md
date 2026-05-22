# Lesson Delivery Tracker - Implementation Guide

## Overview

The **Lesson Delivery Tracker** feature enables teachers to track when lessons actually happen, record what was covered, note challenges, and manage resources/homework. It separates the **planned schedule** (Timetables) from the **actual delivery** (Lesson Deliveries).

---

## Architecture

### Concept Model

```
Timetables (recurring schedule template)
    ↓ Auto-generate (planned instances)
Lesson Deliveries (individual date-specific records)
    ↓ Teacher marks status
Delivery Record (delivered/cancelled/postponed + metadata)
```

### Key Distinction

| Feature | Purpose |
|---------|---------|
| **Timetables** | When lessons *should* happen (recurring weekly schedule) |
| **Lessons** | Lesson templates/plans (what to teach) |
| **Lesson Deliveries** | What *actually* happened on a specific date |

---

## Database Schema

### New Table: `lesson_deliveries`

Tracks each instance when a lesson was delivered, cancelled, or postponed.

**File**: `migrations/0006_lesson_deliveries.sql`

**Key Columns**:
- `lesson_id` - Links to the lesson template
- `scheduled_date` - When this delivery was planned
- `status` - `planned`, `delivered`, `cancelled`, `postponed`
- `teacher_notes` - Free-form reflection/notes
- `objectives_covered` - Boolean: were lesson objectives met?
- `challenges_faced` - What challenges occurred?
- `follow_up_needed` - Needs follow-up lesson?
- `resources_used` - JSON array: materials actually used
- `homework_assigned` - JSON array: homework/tasks assigned
- `attendance_count` / `total_students` - Attendance tracking

**Enhanced `lessons` Table**:
- Added `lesson_plan` JSONB column for structured lesson plans

### Views

| View | Purpose |
|------|---------|
| `v_todays_lesson_deliveries` | Today's planned/delivered lessons with full details |
| `v_lesson_deliveries_detail` | All deliveries with joined class/subject/teacher data |

---

## Backend API

### Module Structure
```
backend/src/domains/academics/lesson_deliveries/
├── index.ts          # Router export
├── routes.ts         # Express routes
├── controller.ts     # HTTP handlers
├── service.ts        # Business logic + DB queries
├── types.ts          # TypeScript types
├── validator.ts      # Zod schemas
└── errors.ts         # Custom error classes
```

### API Endpoints

**Base Path**: `/api/academics/lesson-deliveries`

| Method | Endpoint | Purpose |
|--------|----------|---------|
| `GET` | `/` | List all deliveries (with filters) |
| `GET` | `/:id` | Get single delivery |
| `POST` | `/` | Create delivery record |
| `PUT` | `/:id` | Update delivery |
| `DELETE` | `/:id` | Soft delete delivery |
| `GET` | `/stats` | Get delivery statistics |
| `GET` | `/today` | Get today's lessons |
| `GET` | `/by-date?date=YYYY-MM-DD` | Get lessons for specific date |
| `POST` | `/generate` | Auto-generate from timetables |
| `GET` | `/lesson/:lessonId/history` | Get delivery history for a lesson |
| `POST` | `/:id/mark-delivered` | Quick-mark as delivered |
| `POST` | `/:id/mark-cancelled` | Quick-mark as cancelled |
| `POST` | `/:id/mark-postponed` | Quick-mark as postponed |

---

## Frontend

### Domain Layer
```
frontend/src/domains/academics/lesson_deliveries/
├── types.ts          # TypeScript types + metadata
├── services.ts       # API client functions
├── controller.ts     # Thin facade over services
├── validator.ts      # Zod schemas
├── errors.ts         # Error classes
└── hooks/
    └── useLessonDeliveries.ts  # React hooks
```

### UI Components
```
frontend/src/components/domains/academics/lesson_deliveries/
├── LessonDeliveriesPage.tsx    # Main page container
├── LessonDeliveriesList.tsx    # Table with status badges + quick actions
├── LessonDeliveryForm.tsx      # Create/Edit form
├── LessonDeliveryModal.tsx     # Quick-mark modal (delivered/cancelled/postponed)
├── TodaysLessons.tsx           # Dashboard widget
├── LessonCalendarView.tsx      # Calendar view by date
└── index.ts                    # Barrel export
```

### Key Features

#### 1. **Today's Lessons Widget**
- Shows on Academics Dashboard
- Displays all lessons planned for today
- One-click actions: ✅ Delivered | ❌ Cancelled | ⏰ Postponed
- Quick status update with minimal clicks

#### 2. **Lesson Calendar View**
- Pick any date to see what was taught
- Shows delivered, cancelled, postponed lessons
- Displays teacher notes, resources used, homework assigned
- Visual status badges for quick scanning

#### 3. **Quick-Mark Modal**
When a teacher marks a lesson, they get a contextual form:

**Mark as Delivered**:
- ✓ Objectives covered checkbox
- Resources used (add/remove list)
- Homework assigned (add/remove list)
- Optional teacher notes

**Mark as Cancelled**:
- Reason for cancellation
- Optional teacher notes

**Mark as Postponed**:
- Follow-up lesson needed checkbox
- Follow-up notes
- Optional teacher notes

#### 4. **Lesson Deliveries List**
- Full table view with pagination
- Status badges (Planned/Delivered/Cancelled/Postponed)
- Quick action buttons for planned lessons
- Search and filter support

---

## Workflow

### Typical Usage

1. **Setup** (Admin/Teacher):
   - Create Timetables (recurring weekly schedule)
   - Create Lesson templates (what to teach)

2. **Auto-Generate** (System/Teacher):
   - Call `POST /academics/lesson-deliveries/generate` to create planned instances
   - Or run nightly job (see Auto-Generation section)

3. **Daily Teacher Workflow**:
   - Open Academics Dashboard
   - See "Today's Lessons" widget
   - Click ✅, ❌, or ⏰ for each lesson
   - Fill in required details (resources, homework, notes)
   - Done!

4. **Review/Reporting** (Admin/Teacher):
   - Use Calendar View to check any date
   - Filter by teacher, class, subject, status
   - View statistics and attendance tracking

---

## Auto-Generation Service

### Database Function
`generate_lesson_deliveries_from_timetables(start_date, end_date, class_id, teacher_id)`

- Loops through date range
- Matches timetable entries by day of week
- Creates `planned` delivery records
- Skips if delivery already exists for that date

### How to Use

**Manual Trigger**:
```bash
POST /api/academics/lesson-deliveries/generate
{
  "start_date": "2026-04-08",
  "end_date": "2026-04-14",
  "class_id": 1,  // optional
  "teacher_id": 5  // optional
}
```

**Nightly Job** (Recommended):
Set up a cron job to run daily:
```typescript
// Example: backend/scripts/generateLessonDeliveries.ts
import { db } from "../config/infra/database.js";

const today = new Date().toISOString().split('T')[0];
const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

await db.fn("generate_lesson_deliveries_from_timetables", [
  today,
  nextWeek,
  null,  // all classes
  null   // all teachers
]);
```

Add to crontab:
```bash
0 1 * * * cd /path/to/ems && pnpm run generate:lesson-deliveries
```

---

## Permissions

Added to `permissionsEnum.ts`:

```typescript
ACADEMICS_LESSON_DELIVERIES_LESSON_DELIVERIES_MANAGE = "academics:lesson_deliveries:lesson_deliveries.manage"
ACADEMICS_LESSON_DELIVERIES_LESSON_DELIVERIES_READ = "academics:lesson_deliveries:lesson_deliveries.read"
ACADEMICS_LESSON_DELIVERIES_LESSON_DELIVERIES_CREATE = "academics:lesson_deliveries:lesson_deliveries.create"
ACADEMICS_LESSON_DELIVERIES_LESSON_DELIVERIES_UPDATE = "academics:lesson_deliveries:lesson_deliveries.update"
ACADEMICS_LESSON_DELIVERIES_LESSON_DELIVERIES_DELETE = "academics:lesson_deliveries:lesson_deliveries.delete"
```

---

## Files Created/Modified

### New Files Created (27 files)

**Migration**:
- `migrations/0006_lesson_deliveries.sql`

**Backend** (6 files):
- `backend/src/domains/academics/lesson_deliveries/{types,validator,errors,service,controller,routes,index}.ts`

**Frontend Domain Layer** (6 files):
- `frontend/src/domains/academics/lesson_deliveries/{types,validator,errors,services,controller}.ts`
- `frontend/src/domains/academics/lesson_deliveries/hooks/useLessonDeliveries.ts`

**Frontend UI Components** (7 files):
- `frontend/src/components/domains/academics/lesson_deliveries/{LessonDeliveriesPage,LessonDeliveriesList,LessonDeliveryForm,LessonDeliveryModal,TodaysLessons,LessonCalendarView,index}.tsx`

### Files Modified (6 files)

**Backend**:
- `backend/src/domains/academics/index.ts` - Added lesson_deliveries route
- `backend/src/registry/index.ts` - Added lessonDeliveries registry entry
- `backend/src/registries/permissions/permissionsEnum.ts` - Added permissions

**Frontend**:
- `frontend/src/app/routes/RouteRegistry.ts` - Added route entry
- `frontend/src/components/domains/academics/dashboard/AcademicsDashboard.tsx` - Added widgets + nav card

---

## Next Steps

### 1. Run Migration
```bash
pnpm run migrate
```

### 2. Regenerate Kysely Types
```bash
pnpm run sync:db
```

### 3. Set Up Auto-Generation (Optional)
Create a scheduled job to generate lesson deliveries weekly from timetables.

### 4. Test the Workflow
1. Navigate to `/academics` dashboard
2. See "Today's Lessons" widget
3. Click action buttons to mark lessons
4. Use Calendar View to check any date
5. Navigate to `/academics/lesson-deliveries` for full management

---

## Design Decisions

### Why Separate Table?
- **Lessons** = template/plan (what to teach)
- **Lesson Deliveries** = actual event (what happened)
- Allows re-teaching same lesson multiple times to different classes
- Tracks history and evolution of lesson delivery

### Why JSONB for Resources/Homework?
- Flexible structure (text, URLs, file references, etc.)
- Easy to extend without schema changes
- PostgreSQL native support with indexing

### Why Database Functions?
- Complex logic (date range generation, joins) handled in DB
- Reduces network calls
- Can be called from anywhere (API, scripts, triggers)

---

## Support

For issues or questions:
- Check migration ran successfully: `SELECT * FROM lesson_deliveries LIMIT 5;`
- Verify API endpoints: `GET /api/academics/lesson-deliveries/today`
- Check frontend routing: Navigate to `/academics/lesson-deliveries`
