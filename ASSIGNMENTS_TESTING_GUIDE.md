# Assignments Module - Testing Guide

## Quick Start

### 1. **Access the Module**
Navigate to: `http://localhost:3000/academics/assignments`

### 2. **Verify Backend is Running**
Ensure your backend server is running on port 4000 (or your configured port).

---

## Testing Checklist

### ✅ Phase 1: Basic Functionality

#### 1. Page Loads Successfully
- [ ] Navigate to `/academics/assignments`
- [ ] Page loads without 500 errors
- [ ] Three tabs are visible:
  - Assignments Management
  - Bulk Submissions Entry
  - Assignment Analytics
- [ ] Header shows "Assignments Center" title
- [ ] "Calendar" and "New Assignment" buttons are visible

#### 2. Assignments List (Tab 1)
- [ ] List displays assignments (or shows empty state)
- [ ] Columns are visible:
  - Title, Class, Subject, Term, Due Date
  - Max Score, Submissions, Status, Actions
- [ ] Search box filters assignments
- [ ] Pagination works (if > 100 records)
- [ ] Hover actions appear (View/Edit/Delete icons)

#### 3. Create Assignment
- [ ] Click "New Assignment" button
- [ ] Form opens with all fields:
  - Title (required)
  - Due Date (required)
  - Class, Subject, Term, Teacher dropdowns
  - Max Score (default 100)
  - Description textarea
  - Status dropdown
  - Is Active checkbox
- [ ] Fill in required fields
- [ ] Click "Create Assignment"
- [ ] Assignment is created and appears in list
- [ ] Success message shown

#### 4. Edit Assignment
- [ ] Hover over an assignment row
- [ ] Click Edit icon (pencil)
- [ ] Form opens with pre-filled data
- [ ] Modify a field (e.g., title)
- [ ] Click "Update Assignment"
- [ ] Changes are saved
- [ ] Updated data appears in list

#### 5. Delete Assignment
- [ ] Hover over an assignment row
- [ ] Click Delete icon (trash)
- [ ] Confirmation dialog appears
- [ ] Click "OK"
- [ ] Assignment is soft-deleted
- [ ] Assignment disappears from list

---

### ✅ Phase 2: Bulk Submissions

#### 6. Access Bulk Submissions Tab
- [ ] Click "Bulk Submissions Entry" tab
- [ ] Selection panel shows:
  - Assignment dropdown
  - Class dropdown (disabled until assignment selected)
- [ ] Assignment dropdown lists all assignments

#### 7. Select Assignment & Class
- [ ] Select an assignment from dropdown
- [ ] Assignment info card appears showing:
  - Max Score
  - Due Date
  - Term
  - Current submissions count
- [ ] Class dropdown auto-populates with correct class
- [ ] Select the class
- [ ] Students table loads with all students

#### 8. Enter Scores
- [ ] Table shows all students in the class
- [ ] Enter a score in the Score column:
  - Type a number (e.g., 85)
  - Grade auto-calculates (A/B/C/D/E/F)
  - Grade point auto-calculates
  - Remarks auto-generate
- [ ] Try entering score exceeding max:
  - Red warning appears
  - "Score exceeds max (X)" message shown
- [ ] Try entering 0:
  - Grade calculates as "F"
  - Remarks show "Needs Improvement"

#### 9. Save Submissions
- [ ] Enter scores for at least 3 students
- [ ] Click "Save All Submissions"
- [ ] If updating existing submissions:
  - Warning dialog appears
  - Shows count of existing submissions
  - Click OK to confirm overwrite
- [ ] Success message shows:
  - "Successfully saved X submission(s)"
  - Failed count (if any)
- [ ] Stats cards update with new data

#### 10. Export CSV
- [ ] Click "Export CSV" button
- [ ] CSV file downloads
- [ ] Open CSV and verify:
  - Headers: Student Name, Admission No, Score, Grade, Grade Point, Remarks
  - All students with scores are included
  - Data is correct

---

### ✅ Phase 3: Analytics

#### 11. Access Analytics Tab
- [ ] Click "Assignment Analytics" tab
- [ ] Filters panel shows:
  - Class dropdown (required)
  - Term dropdown (optional)
- [ ] Select a class
- [ ] Analytics dashboard loads

#### 12. Summary Stats
- [ ] Four stat cards display:
  - Total Assignments
  - Students Tracked
  - Submission Rate (%)
  - Average Score (%)
- [ ] Numbers are accurate

#### 13. Overdue & Upcoming
- [ ] Two cards show:
  - Overdue Assignments (red)
  - Upcoming Assignments (blue)
- [ ] Counts are accurate

#### 14. Grade Distribution Chart
- [ ] Bar chart shows grade distribution (A/B/C/D/E/F)
- [ ] Bars are color-coded
- [ ] Counts and percentages shown

#### 15. Submission Status
- [ ] Horizontal bars show:
  - Submitted count/percentage
  - Not Submitted count/percentage
- [ ] Data is accurate

#### 16. Performance Trend
- [ ] Bar chart shows submission rate per assignment
- [ ] Overdue assignments marked
- [ ] Color coding based on performance

#### 17. Subject Performance
- [ ] List of subjects with average scores
- [ ] Progress bars show performance
- [ ] Submission and student counts shown

---

### ✅ Phase 4: Calendar View

#### 18. Access Calendar
- [ ] Click "Calendar" button in header
- [ ] Calendar page loads
- [ ] Current month is displayed
- [ ] Header shows "Assignment Calendar"

#### 19. Calendar Navigation
- [ ] Click left arrow → goes to previous month
- [ ] Click right arrow → goes to next month
- [ ] Click "Today" → jumps to current month
- [ ] Month name and year update correctly

#### 20. Calendar Display
- [ ] Assignments appear on their due dates
- [ ] Assignment count badge shows on dates with assignments
- [ ] Hover over assignment shows full title
- [ ] Overdue assignments have red background
- [ ] Today's date is highlighted in indigo

#### 21. Summary Stats
- [ ] Three cards at bottom show:
  - Total Assignments
  - This Month count
  - Overdue count
- [ ] Numbers are accurate

---

## 🐛 Troubleshooting

### Issue: 500 Error on Page Load
**Error**: `Failed to load resource: the server responded with a status of 500`

**Solutions**:
1. Check backend server is running
2. Check backend console for error messages
3. Verify database connection
4. Check that `assignments` table exists
5. Verify `assignment_submissions` table exists

### Issue: FileSpreadsheet is not defined
**Error**: `Uncaught ReferenceError: FileSpreadsheet is not defined`

**Solution**: ✅ **FIXED** - Import added to BulkSubmissionEntry.tsx

### Issue: Dropdowns Not Loading
**Symptom**: Class/Subject/Term dropdowns are empty

**Solutions**:
1. Verify you have data in classes/subjects/terms tables
2. Check API endpoints are accessible
3. Check browser console for errors
4. Verify user has permissions to view these resources

### Issue: Students Not Loading
**Symptom**: "No Students Found" message

**Solutions**:
1. Verify class has students enrolled
2. Check `class_students` table has entries for this class
3. Ensure students are marked as `is_active = true`
4. Verify students are not soft-deleted

### Issue: Analytics Not Showing
**Symptom**: Analytics tab is empty or shows "Select a Class"

**Solutions**:
1. Select a class from the dropdown
2. Ensure assignments exist for that class
3. Ensure submissions have been entered
4. Check `/academics/assignments/analytics` endpoint returns data

---

## 🔍 Backend API Testing

### Test Endpoints with cURL or Postman

```bash
# 1. List all assignments
curl http://localhost:4000/api/academics/assignments \
  -H "Authorization: Bearer YOUR_TOKEN"

# 2. Get single assignment with submissions
curl http://localhost:4000/api/academics/assignments/1 \
  -H "Authorization: Bearer YOUR_TOKEN"

# 3. Create assignment
curl -X POST http://localhost:4000/api/academics/assignments \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Assignment",
    "class_id": 1,
    "subject_id": 1,
    "term_id": 1,
    "due_date": "2026-04-30",
    "max_score": 100,
    "is_active": true
  }'

# 4. Bulk create submissions
curl -X POST http://localhost:4000/api/academics/assignments/bulk-submissions \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "assignment_id": 1,
    "max_score": 100,
    "submissions": [
      {
        "student_id": 1,
        "score": 85,
        "submission_date": "2026-04-11"
      }
    ]
  }'

# 5. Get analytics
curl "http://localhost:4000/api/academics/assignments/analytics?class_id=1" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 📊 Expected Behavior

### Normal Flow
1. User navigates to `/academics/assignments`
2. Page loads with assignments list (or empty state)
3. User creates new assignment
4. User navigates to "Bulk Submissions Entry" tab
5. User selects assignment and class
6. User enters scores for students
7. User saves submissions
8. User navigates to "Assignment Analytics" tab
9. User selects class and views insights
10. User clicks "Calendar" to see due dates

### Error Handling
- Invalid scores (exceeding max) show red warning
- Missing required fields show validation errors
- Network errors show error messages in console
- Empty states show helpful messages
- Confirmation dialogs for destructive actions

---

## 🎯 Success Criteria

The module is working correctly when:
- ✅ Page loads without errors
- ✅ Assignments can be created, edited, deleted
- ✅ Bulk submissions entry works end-to-end
- ✅ Grades auto-calculate correctly
- ✅ Analytics display accurate data
- ✅ Calendar view shows assignments correctly
- ✅ All API endpoints return 200 status
- ✅ No console errors (except warnings)

---

## 📝 Notes

- The backend uses **Kysely** ORM for database queries
- Submissions are tracked per assignment per student
- Analytics require at least one assignment with submissions
- Calendar shows all assignments regardless of submission status
- Soft deletes are used (data is not permanently removed)
- All queries are scoped to `school_id` for multi-tenancy

---

## 🚀 Next Steps After Testing

1. **Add File Attachments** - Allow teachers to attach resources
2. **Student Portal** - Let students submit assignments
3. **Email Notifications** - Remind students of upcoming due dates
4. **Rubric Grading** - Multi-criteria grading rubrics
5. **Plagiarism Detection** - Integration with plagiarism APIs
6. **Peer Review** - Student peer review workflows
7. **Mobile App** - Mobile-friendly interface

---

## 📞 Support

If you encounter issues:
1. Check browser console for errors
2. Check backend server logs
3. Verify database tables exist
4. Ensure all migrations have run
5. Check user permissions
6. Verify API endpoints are accessible

**Common fixes**:
- Restart backend server
- Clear browser cache
- Check environment variables
- Verify database connection string
- Run pending migrations

---

**Happy Testing!** 🎉
