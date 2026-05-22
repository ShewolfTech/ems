# Exams Module - Testing Guide

## 🧪 Quick Testing Checklist

### Prerequisites
- ✅ Backend server running on `http://localhost:3001`
- ✅ Frontend server running on `http://localhost:3000`
- ✅ Database migrations applied
- ✅ At least one class with students enrolled
- ✅ At least one subject and term created
- ✅ At least one staff member (for conductors)

---

## 1️⃣ Test: Create Exam

**Steps:**
1. Navigate to `http://localhost:3000/academics/exams`
2. Click **"+ New Exam"** button
3. Fill in the form:
   - **Title:** "Mid-Term Examination 2026"
   - **Class:** Select any class (e.g., "Grade 5A")
   - **Subject:** Select any subject (e.g., "Mathematics")
   - **Term:** Select current term (e.g., "Term 1")
   - **Exam Date:** Select future date
   - **Start Time:** "09:00"
   - **End Time:** "11:00"
   - **Max Score:** 100
   - **Description:** "Comprehensive mid-term exam covering chapters 1-5"
4. Add 1-2 invigilation staff:
   - Select staff member → Click "+ Add"
   - Change role to "Lead" or "Invigilator"
5. (Optional) Add teacher comments:
   - Click "Teacher Comments & Notes"
   - Add comment with key: `general_feedback`
   - Value: "Good preparation expected"
6. Click **"Create Exam"**

**Expected Result:**
- ✅ Success notification
- ✅ Exam appears in the list
- ✅ All details displayed correctly

---

## 2️⃣ Test: View Exam Details

**Steps:**
1. In the exams list, click the **green eye icon** (👁️) next to the exam
2. Review the details page

**Expected Result:**
- ✅ Exam information displayed (date, time, max score)
- ✅ Conductors list with names and roles
- ✅ Teacher comments section (if added)
- ✅ Empty results table with "No Results Yet" message
- ✅ Statistics section not shown (no results yet)

---

## 3️⃣ Test: Edit Exam

**Steps:**
1. In the exams list, click the **blue edit icon** (✏️)
2. Change the exam title to "Mid-Term Examination 2026 (Revised)"
3. Add another conductor
4. Click **"Update Exam"**

**Expected Result:**
- ✅ Success notification
- ✅ Updated title reflected in list
- ✅ Additional conductor visible

---

## 4️⃣ Test: Bulk Results Entry

**Steps:**
1. Go to **"Bulk Results Entry"** tab
2. Select the exam you created from dropdown
3. The class should auto-populate with students
4. Enter scores for 5-10 students:
   - Student 1: 95 → Should auto-calculate A (5.0) "Outstanding"
   - Student 2: 87 → Should auto-calculate B (4.0) "Excellent"
   - Student 3: 76 → Should auto-calculate C (3.0) "Very Good"
   - Student 4: 65 → Should auto-calculate D (2.0) "Good"
   - Student 5: 54 → Should auto-calculate E (1.0) "Satisfactory"
   - Student 6: 42 → Should auto-calculate F (0.0) "Needs Improvement"
5. Verify real-time statistics update:
   - Students Scored: 6/X
   - Average: ~69.8
   - Highest: 95
   - Lowest: 42
   - Pass Rate: 83.3% (5/6 passed)
6. (Optional) Manually edit a grade letter
7. (Optional) Add remarks for a student
8. Check "Final" for 2-3 students
9. Click **"Save All Results"**

**Expected Result:**
- ✅ Grades auto-calculate correctly
- ✅ Grade points auto-calculate
- ✅ Remarks auto-generate
- ✅ Stats update in real-time
- ✅ Success notification: "Successfully saved 6 result(s)"
- ✅ Results persist on page reload

---

## 5️⃣ Test: View Updated Exam Details

**Steps:**
1. Go back to **"Exams Management"** tab
2. Click the **green eye icon** for the exam with results
3. Review the updated details

**Expected Result:**
- ✅ Statistics cards show:
  - Students Scored: 6
  - Average: 69.8%
  - Highest: 95
  - Lowest: 42
  - Pass Rate: 83.3%
- ✅ Grade distribution chart displays
- ✅ Results table shows all 6 students with scores
- ✅ Color-coded grades (green for A, blue for B, etc.)

---

## 6️⃣ Test: Export Results

**Steps:**
1. On the exam details page, click **"Export Results"**
2. Open the downloaded CSV file

**Expected Result:**
- ✅ CSV downloads successfully
- ✅ Contains headers: Student Name, Admission No, Score, Grade, Grade Point, Remarks
- ✅ All 6 students' data present
- ✅ Data matches what was entered

---

## 7️⃣ Test: Analytics Dashboard

**Steps:**
1. Go to **"Exam Analytics"** tab
2. Select the class you've been working with
3. (Optional) Filter by term

**Expected Result:**
- ✅ Summary stats display:
  - Total Exams: 1
  - Students Assessed: [class size]
  - Class Average: 69.8%
  - Pass Rate: 83.3%
- ✅ Grade distribution chart shows entered grades
- ✅ Performance trend chart displays (1 data point)
- ✅ Subject performance section shows
- ✅ Trend indicator: "stable" (need more exams for trend)

---

## 8️⃣ Test: Gradebook Integration

**Steps:**
1. Navigate to `http://localhost:3000/academics/gradebook`
2. Select the same class
3. Look for your exam in the gradebook

**Expected Result:**
- ✅ Exam appears as a column
- ✅ Purple badge with "🎓 [Exam Title]"
- ✅ Student scores visible in cells
- ✅ Color-coded grade cells
- ✅ Filter by type "🎓 Exams" shows only exams

---

## 9️⃣ Test: Student Report Integration

**Steps:**
1. Navigate to `http://localhost:3000/academics/student-report?studentId=[ID]`
2. Use a student ID who has exam results

**Expected Result:**
- ✅ Exam appears in assessment list
- ✅ Score displayed: "95/100"
- ✅ Grade letter: "A"
- ✅ Percentage calculated correctly
- ✅ Teacher comments visible (if added to exam)

---

## 🔟 Test: Search & Filter

**Steps:**
1. Go to **"Exams Management"** tab
2. Use the search box
3. Search for:
   - Exam title (partial match)
   - Class name
   - Subject name
   - Term name

**Expected Result:**
- ✅ Results filter in real-time
- ✅ Case-insensitive search
- ✅ Multiple exams filter correctly

---

## 1️⃣1️⃣ Test: Delete Exam

**Steps:**
1. Create a test exam (or use existing)
2. Click the **red delete icon** (🗑️)
3. Confirm deletion in popup

**Expected Result:**
- ✅ Confirmation dialog appears
- ✅ Success notification after deletion
- ✅ Exam removed from list (soft delete)
- ✅ Exam still in database with `is_deleted = true`

---

## 1️⃣2️⃣ Test: Bulk Update Existing Results

**Steps:**
1. Go to **"Bulk Results Entry"** tab
2. Select the exam with existing results
3. Modify 2-3 scores
4. Add scores for remaining students
5. Click **"Save All Results"**

**Expected Result:**
- ✅ Existing scores update correctly
- ✅ New scores insert successfully
- ✅ Statistics recalculate
- ✅ No duplicate entries

---

## 🐛 Common Issues & Solutions

### Issue 1: "No students found" in bulk entry
**Cause:** Class has no enrolled students  
**Solution:** Add students to class via class management

### Issue 2: Grades not auto-calculating
**Cause:** Max score is 0 or undefined  
**Solution:** Ensure exam has valid max_score > 0

### Issue 3: Exam not appearing in gradebook
**Cause:** Missing required fields  
**Solution:** Verify exam has class_id, subject_id, term_id

### Issue 4: Analytics show no data
**Cause:** No results entered yet  
**Solution:** Enter at least one exam result

### Issue 5: Teacher comments not showing
**Cause:** Not saved as JSON object  
**Solution:** Use the comment form in ExamsForm (key-value pairs)

---

## 📊 Performance Testing

### Large Class Test
1. Create exam for class with 100+ students
2. Enter 50 scores via bulk entry
3. Verify save completes in < 5 seconds
4. Check all stats calculate correctly

### Multiple Exams Analytics
1. Create 5+ exams for same class
2. Enter results for each
3. View analytics
4. Verify trend shows meaningful data

---

## ✅ Success Criteria

All tests pass if:
- ✅ All CRUD operations work
- ✅ Bulk entry saves 100+ results without error
- ✅ Auto-calculation accurate
- ✅ Analytics display correct statistics
- ✅ Gradebook shows exams with purple badges
- ✅ Student reports include exam data
- ✅ Teacher comments flow to reports
- ✅ CSV export works correctly
- ✅ Search and filter function properly
- ✅ No TypeScript/Console errors

---

## 🚀 Next Steps After Testing

1. **Create Real Exams**: Set up actual exams for current term
2. **Train Teachers**: Show bulk entry workflow
3. **Enter Historical Data**: Migrate past exam results
4. **Configure Grading**: Customize grade boundaries if needed
5. **Set Up Reports**: Ensure report cards pull exam data
6. **Monitor Analytics**: Review class performance trends

---

## 📞 Support

If you encounter issues:
1. Check browser console for errors
2. Verify backend logs
3. Check database for data integrity
4. Review this testing guide's troubleshooting section
5. Refer to `EXAMS_MODULE_GUIDE.md` for detailed documentation

---

**Happy Testing! 🎓📊✨**
