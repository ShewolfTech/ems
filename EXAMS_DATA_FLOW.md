# Exams Module - Data Flow & Integration

## 🔄 System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    EXAMS MODULE                             │
│                                                             │
│  Frontend                    Backend                        │
│  ┌──────────────────┐       ┌──────────────────┐           │
│  │ ExamsPage        │       │ ExamsController  │           │
│  │  ├─ List         │       │  ├─ CRUD         │           │
│  │  ├─ Form         │◄─────►│  ├─ Bulk Results │           │
│  │  ├─ Detail       │ REST  │  └─ Analytics    │           │
│  │  ├─ Bulk Entry   │ API   │                  │           │
│  │  └─ Analytics    │       │ ExamsService     │           │
│  └──────────────────┘       │  ├─ CRUD         │           │
│                              │  ├─ Bulk Create  │           │
│                              │  └─ Analytics    │           │
│                              └────────┬─────────┘           │
│                                       │                      │
│                                       ▼                      │
│                              ┌──────────────────┐           │
│                              │   PostgreSQL DB   │           │
│                              │  ┌────────────┐  │           │
│                              │  │ exams      │  │           │
│                              │  │ exam_results│ │           │
│                              │  │ exam_       │  │           │
│                              │  │ conductors  │  │           │
│                              │  └────────────┘  │           │
│                              └──────────────────┘           │
└─────────────────────────────────────────────────────────────┘
```

## 📊 Data Flow: Exams → Gradebook → Reports

```
┌─────────────────────────────────────────────────────────────────┐
│                   DATA FLOW DIAGRAM                             │
└─────────────────────────────────────────────────────────────────┘

1. EXAM CREATION
   ┌─────────────┐
   │   Teacher   │ Creates exam
   └──────┬──────┘
          │
          ▼
   ┌──────────────────────────────────────┐
   │ ExamsForm.tsx                        │
   │ - Collects exam details              │
   │ - Adds conductors (staff)            │
   │ - Includes teacher comments (JSON)   │
   └──────────┬───────────────────────────┘
              │ POST /academics/exams
              ▼
   ┌──────────────────────────────────────┐
   │ exams table                          │
   │ - school_id, class_id, subject_id    │
   │ - term_id, exam_date, max_score      │
   │ - teacher_comments (JSONB)           │
   └──────────────────────────────────────┘


2. BULK RESULTS ENTRY
   ┌─────────────┐
   │   Teacher   │ Enters scores for class
   └──────┬──────┘
          │
          ▼
   ┌──────────────────────────────────────┐
   │ BulkExamResultsEntry.tsx             │
   │ - Loads class students               │
   │ - Auto-calculates grades             │
   │ - Real-time statistics               │
   └──────────┬───────────────────────────┘
              │ POST /academics/exams/bulk-results
              ▼
   ┌──────────────────────────────────────┐
   │ exam_results table                   │
   │ - student_id, exam_id, score         │
   │ - grade_letter, grade_point          │
   │ - remarks, is_final                  │
   └──────────────────────────────────────┘


3. UNIFIED GRADEBOOK INTEGRATION
   ┌─────────────┐
   │   Teacher   │ Opens gradebook
   └──────┬──────┘
          │
          ▼
   ┌──────────────────────────────────────┐
   │ GradeBookPage.tsx                    │
   │ - Fetches unified gradebook          │
   │ - Merges assessments + exams +       │
   │   assignments                        │
   └──────────┬───────────────────────────┘
              │ GET /academics/assessments/unified-gradebook
              ▼
   ┌──────────────────────────────────────┐
   │ AssessmentsService.getUnifiedGrade   │
   │ Book()                               │
   │                                      │
   │ 1. Gets all students in class        │
   │ 2. Gets assessments (teal)           │
   │ 3. Gets exams (purple) ◄─────────────┼──┐
   │ 4. Gets assignments (blue)           │  │
   │ 5. Merges results                    │  │
   │ 6. Calculates stats                  │  │
   └──────────────────────────────────────┘  │
                                              │
              ┌───────────────────────────────┘
              │
              ▼
   ┌──────────────────────────────────────┐
   │ Gradebook UI                         │
   │ - Color-coded grade cells            │
   │ - Type badges (🎓 Exam = purple)     │
   │ - Charts & analytics                 │
   │ - CSV export                         │
   └──────────────────────────────────────┘


4. STUDENT REPORT INTEGRATION
   ┌─────────────┐
   │  Student/   │ Views report
   │   Parent    │
   └──────┬──────┘
          │
          ▼
   ┌──────────────────────────────────────┐
   │ StudentReportPage.tsx                │
   │ - Fetches student performance        │
   │ - Shows all assessments + exams      │
   └──────────┬───────────────────────────┘
              │ GET /academics/assessments/student-report
              ▼
   ┌──────────────────────────────────────┐
   │ AssessmentsService.getStudentReport  │
   │ ()                                   │
   │                                      │
   │ 1. Gets student info                 │
   │ 2. Gets assessment results           │
   │ 3. Gets exam results ◄───────────────┼──┐
   │ 4. Calculates averages               │  │
   │ 5. Determines trend                  │  │
   └──────────────────────────────────────┘  │
                                              │
              ┌───────────────────────────────┘
              │
              ▼
   ┌──────────────────────────────────────┐
   │ Student Report Card                  │
   │ - All exam scores                    │
   │ - Grade letters & points             │
   │ - Teacher comments from exams        │
   │ - Performance trend                  │
   │ - Overall statistics                 │
   └──────────────────────────────────────┘


5. ANALYTICS DASHBOARD
   ┌─────────────┐
   │  Teacher/   │ Views analytics
   │   Admin     │
   └──────┬──────┘
          │
          ▼
   ┌──────────────────────────────────────┐
   │ ExamAnalytics.tsx                    │
   │ - Class-level metrics                │
   │ - Grade distribution                 │
   │ - Performance trends                 │
   └──────────┬───────────────────────────┘
              │ GET /academics/exams/analytics
              ▼
   ┌──────────────────────────────────────┐
   │ ExamsService.getAnalytics()          │
   │                                      │
   │ 1. Gets all exams for class          │
   │ 2. Gets all exam results             │
   │ 3. Calculates:                       │
   │    - Average score                   │
   │    - Pass rate                       │
   │    - Grade distribution              │
   │    - Subject performance             │
   │    - Trend analysis                  │
   └──────────────────────────────────────┘
```

## 🔗 Integration Points Detail

### 1. Gradebook Integration

**File:** `backend/src/domains/academics/assessments/service.ts`

```typescript
// Exams are fetched alongside assessments and assignments
const exams = await db
  .selectFrom("exams as e")
  .select([
    sql<string>`'exam'`.as("item_type"),      // Type identifier
    "e.id as item_id",
    "e.title as item_title",
    "e.subject_id",
    "e.exam_date as item_date",
    "e.max_score",
    sql<number>`1`.as("weight"),
  ])
  .where("e.class_id", "=", classId)
  .where("e.school_id", "=", context.schoolId)
  .where("e.is_deleted", "=", false)
  .execute();

// Then merged in the final response
return {
  gradedItems: [...assessments, ...exams, ...assignments],
  students: [...],
  stats: {...}
};
```

**Frontend Display:**
```typescript
// GradeBookPage.tsx
const TYPE_ICONS = {
  assessment: { icon: <BookOpen />, color: "bg-teal-100 text-teal-700" },
  exam: { icon: <Award />, color: "bg-purple-100 text-purple-700" },  // ← Exams
  assignment: { icon: <FileCheck />, color: "bg-blue-100 text-blue-700" },
};
```

### 2. Student Report Integration

**File:** `backend/src/domains/academics/assessments/service.ts`

```typescript
// Exam results are included in student report
const examResults = await db
  .selectFrom("exam_results as er")
  .innerJoin("exams as e", "e.id", "er.exam_id")
  .select([
    "er.id",
    "er.score",
    "er.grade_letter",
    "er.grade_point",
    "er.remarks",
    "e.title",
    "e.exam_date as date",
    "e.max_score",
  ])
  .where("er.student_id", "=", studentId)
  .execute();

// Merged with assessment results
return {
  assessments: [...assessmentResults, ...examResults],
  overall_average: calculatedAverage,
  trend: trendAnalysis,
};
```

### 3. Teacher Comments Flow

**Exam Creation:**
```typescript
// ExamsForm.tsx
teacher_comments: {
  general_feedback: "Great effort this term",
  improvement_areas: "Focus on algebra",
  next_steps: "Practice more problems"
}
```

**Stored in DB:**
```sql
-- exams.teacher_comments (JSONB column)
{
  "general_feedback": "Great effort this term",
  "improvement_areas": "Focus on algebra",
  "next_steps": "Practice more problems"
}
```

**Appears in Report Card:**
```typescript
// StudentReportPage.tsx
{exam.teacher_comments?.general_feedback && (
  <div className="comment">
    <strong>Teacher's Note:</strong> 
    {exam.teacher_comments.general_feedback}
  </div>
)}
```

## 📈 Real-Time Statistics Flow

```
┌──────────────────────────────────────────────────────┐
│          BULK RESULTS ENTRY - LIVE STATS             │
└──────────────────────────────────────────────────────┘

User types score: 85/100
         │
         ▼
┌─────────────────────────────┐
│ handleScoreChange()         │
│ 1. Updates local state      │
│ 2. Calls calculateGrade()   │
│ 3. Calls calculateRemarks() │
└──────────┬──────────────────┘
           │
           ▼
┌─────────────────────────────┐
│ Stats Recalculation         │
│ - Total scored: 45/50       │
│ - Average: 76.3%            │
│ - Highest: 95               │
│ - Lowest: 42                │
│ - Pass Rate: 84.4%          │
└──────────┬──────────────────┘
           │
           ▼
┌─────────────────────────────┐
│ UI Updates (React)          │
│ - Stats cards refresh       │
│ - Grade cell shows "B"      │
│ - Remarks shows "Very Good" │
└─────────────────────────────┘
```

## 🎯 Key Integration Benefits

1. **Automatic Sync**: Exams automatically appear in gradebook once created
2. **Unified View**: Students see exams + assessments + assignments in one place
3. **Consistent Grading**: Same grade scale across all assessment types
4. **Teacher Commentss**: Flow from exams to report cards automatically
5. **Real-Time Analytics**: Class performance updates as grades are entered
6. **Multi-Role Access**: Teachers enter, students view, admins analyze

## 🔐 Security & Multi-Tenancy

All queries are scoped by `school_id`:

```typescript
// Every backend service method includes:
.where("e.school_id", "=", context.schoolId)
.where("er.school_id", "=", context.schoolId)

// Context extracted from JWT token:
const context = { 
  schoolId: Number(user.schoolId), 
  userId: Number(user.userId) 
};
```

This ensures schools only see their own data!

---

**The Exams module is fully integrated and feeds seamlessly into Gradebook and Student Reports!**
