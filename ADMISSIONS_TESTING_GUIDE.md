# ✅ Admissions Testing Guide

## What's Working Now:

### 1. Applications ✅
- List with pagination (100 per page)
- Filter by status
- Search by name
- Edit, Delete actions
- Statistics cards (Total, Pending, Interviews, Offers)

### 2. Interviews ✅
- Schedule interviews
- Complete interviews with outcomes
- View all scheduled interviews

### 3. Decisions API ✅
- **Endpoint**: `/api/admissions/decisions/make-decision`
- **Method**: POST
- **Body**:
```json
{
  "application_id": 1,
  "decision_type": "offered",
  "offer_details": {
    "grade_offered": "S5",
    "stream_offered": "Science",
    "academic_year": "2026",
    "fees_category": "regular"
  },
  "rejection_reason": "",
  "waitlist_position": 1
}
```

### 4. Exams API ✅ (NEW!)
- **Create Exam**: `POST /api/admissions/exams`
- **Get Exams**: `GET /api/admissions/exams/application/:applicationId`
- **Update Exam**: `PUT /api/admissions/exams/:id`
- **Delete Exam**: `DELETE /api/admissions/exams/:id`

**Exam Body**:
```json
{
  "application_id": 1,
  "exam_name": "Mathematics",
  "exam_date": "2026-04-02",
  "total_marks": 100,
  "marks_obtained": 85,
  "grade": "A",
  "remarks": "Excellent performance"
}
```

---

## 🧪 Testing Steps:

### Test 1: Create Application
1. Go to `/admissions/applications`
2. Click "+ New Application"
3. Fill in details
4. **Check "Interview Required"** if needed
5. Submit

### Test 2: Schedule Interview
1. Go to `/admissions/interviews`
2. Click "+ Schedule Interview"
3. Select application
4. Select interviewers (staff)
5. Set date, time, location
6. Save

### Test 3: Add Exam Results
**Using API (Postman/cURL):**

```bash
curl -X POST http://localhost:4000/api/admissions/exams \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "application_id": 1,
    "exam_name": "Mathematics",
    "exam_date": "2026-04-02",
    "total_marks": 100,
    "marks_obtained": 75,
    "grade": "B",
    "remarks": "Good"
  }'
```

**Expected Response**:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "application_id": 1,
    "exam_name": "Mathematics",
    "marks_obtained": 75,
    "total_marks": 100,
    "percentage": 75.00,
    "grade": "B"
  }
}
```

### Test 4: Make Decision
**Using API:**

```bash
curl -X POST http://localhost:4000/api/admissions/decisions/make-decision \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "application_id": 1,
    "decision_type": "offered",
    "offer_details": {
      "grade_offered": "S5",
      "stream_offered": "Science",
      "academic_year": "2026",
      "fees_category": "regular"
    }
  }'
```

**Decision Types**:
- `offered` - Include `offer_details`
- `waitlisted` - Include `waitlist_position`
- `rejected` - Include `rejection_reason`

### Test 5: Create Enrollment
**Using API:**

```bash
curl -X POST http://localhost:4000/api/admissions/decisions/enroll \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "application_id": 1,
    "academic_year": "2026",
    "fees_category": "regular"
  }'
```

---

## 📊 Verify Data:

Run these SQL queries to verify:

```sql
-- Check exam results
SELECT 
  e.application_id,
  a.application_no,
  e.exam_name,
  e.marks_obtained,
  e.total_marks,
  e.percentage,
  e.grade
FROM entrance_exams e
JOIN applications a ON e.application_id = a.id
ORDER BY e.exam_date DESC;

-- Check decisions
SELECT 
  application_id,
  decision_type,
  offer_details,
  decision_date
FROM application_decisions
ORDER BY decision_date DESC;

-- Check enrollments
SELECT 
  application_id,
  enrollment_date,
  enrollment_status,
  academic_year
FROM enrollments
ORDER BY enrollment_date DESC;
```

---

## 🎯 Next Steps:

1. ✅ Test Decisions API (with exam results)
2. ✅ Test Enrollments API
3. ⏳ Build Student Auto-Creation (when enrolled)
4. ⏳ Add UI buttons for Exams & Decisions in ApplicationsList

---

## Current Status:

- ✅ Applications - Working
- ✅ Interviews - Working
- ✅ Exams - API Ready (need UI buttons)
- ✅ Decisions - API Ready (need UI buttons)
- ✅ Enrollments - API Ready
- ⏳ Student Conversion - To be built
