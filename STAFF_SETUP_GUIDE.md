# 🚀 Staff Management System - Setup & Run Guide

## Complete Setup in 10 Steps

### Step 1: Run Database Migrations

Run these SQL files in order:

```bash
# 1. Main staff management tables (if not already run)
psql -U your_username -d your_database -f c:\Bright\ems\migrations\0002_staffmgt_complete.sql

# 2. Seed data for permissions and sidebar
psql -U your_username -d your_database -f c:\Bright\ems\migrations\0003_staffmgt_seed_data.sql
```

**Or in PostgreSQL directly:**
```sql
\i c:/Bright/ems/migrations/0002_staffmgt_complete.sql
\i c:/Bright/ems/migrations/0003_staffmgt_seed_data.sql
```

---

### Step 2: Verify Seed Data

Run this query to verify your sidebar will look correct:

```sql
SELECT display_order, display_name, icon, is_menu_item, group_name, resource
FROM route_permissions
WHERE module = 'staffmgt'
ORDER BY display_order;
```

**Expected Output:**
```
display_order | display_name      | icon         | is_menu_item | group_name
--------------|-------------------|--------------|--------------|------------
            1 | Dashboard         | LayoutDashboard | t         | _flat
           10 | Staff Directory   | Users        | t            | _flat
           20 | Attendance        | Clock        | t            | _flat
           30 | Leave Management  | CalendarDays | t            | _flat
           40 | Performance       | TrendingUp   | t            | _flat
           50 | Contracts         | FileSignature| t            | _flat
           60 | Training          | GraduationCap| t            | _flat
           70 | Payroll           | DollarSign   | t            | _flat
           80 | Recruitment       | Briefcase    | t            | _flat
           90 | ID & Access       | Key          | t            | _flat
          100 | Disciplinary      | AlertCircle  | t            | _flat
          110 | Promotions        | Award        | t            | _flat
          210 | Settings          | Settings     | t            | _flat
```

---

### Step 3: Run Backend Setup

```bash
cd c:\Bright\ems\backend

# Install dependencies (if not done)
pnpm install

# Run all backend migrations (if you have a script)
pnpm run migrate

# OR manually run the SQL files as shown in Step 1
```

---

### Step 4: Start Backend

```bash
cd c:\Bright\ems\backend
pnpm dev
```

**Expected Output:**
```
[INFO] Server starting on http://localhost:3000
[INFO] Database connected
[INFO] Routes loaded
```

---

### Step 5: Verify Backend is Running

Test the API:

```bash
# Test staff endpoint
curl http://localhost:3000/api/staffmgt/staff

# Test attendance endpoint
curl http://localhost:3000/api/staffmgt/staff-attendance/today/summary

# Test leave types
curl http://localhost:3000/api/staffmgt/leave-types
```

All should return `{ "success": true, "data": [...] }` or similar.

---

### Step 6: Start Frontend

```bash
cd c:\Bright\ems\frontend
pnpm dev
```

**Expected Output:**
```
VITE v5.x.x  ready in xxx ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

---

### Step 7: Access Staff Management

Open your browser:

```
http://localhost:5173/staffmgt/staff
```

You should see:
- ✅ Staff Management header with teal/cyan gradient icon
- ✅ Statistics dashboard (Total, Active, On Leave, New This Month)
- ✅ Search bar and filter controls
- ✅ Staff list with pagination
- ✅ "Add Staff Member" button

---

### Step 8: Access Attendance Page

Navigate to:

```
http://localhost:5173/staffmgt/attendance
```

You should see:
- ✅ Real-time clock display in header
- ✅ Today's attendance statistics
- ✅ Visual progress bars for attendance breakdown
- ✅ Attendance records table
- ✅ Filter controls for date range, department, status

---

### Step 9: Test the Features

#### Create a Staff Member:
1. Click "Add Staff Member"
2. Fill in required fields (First Name, Last Name, Email, Phone, Hire Date)
3. Optionally fill other sections
4. Click "Create Staff"

#### Test Attendance:
1. Navigate to `/staffmgt/attendance`
2. View today's summary
3. Check attendance records
4. Try filtering by date or status

#### Test Leave Management (when UI is complete):
1. Navigate to `/staffmgt/leave`
2. View leave requests
3. Check leave quotas
4. Approve/reject requests

---

### Step 10: Verify Sidebar Structure

After logging in, your sidebar should show:

```
📊 Dashboard
👥 Staff Directory
⏰ Attendance
📅 Leave Management          ▼ (collapsible)
   ├─ Leave Requests
   ├─ Leave Types
   ├─ Leave Quotas
   └─ Leave Calendar
📈 Performance               ▼ (collapsible)
   ├─ Reviews
   ├─ Templates
📄 Contracts                 ▼ (collapsible)
   ├─ All Contracts
   └─ Expiring Contracts
🎓 Training                  ▼ (collapsible)
   ├─ Courses
   └─ Enrollments
💰 Payroll                   ▼ (collapsible)
   ├─ Process Payroll
   └─ Analytics
💼 Recruitment               ▼ (collapsible)
   ├─ Job Postings
   └─ Applications
🔑 ID & Access               ▼ (collapsible)
⚠️ Disciplinary              ▼ (collapsible)
🏆 Promotions                ▼ (collapsible)
⚙️ Settings
```

---

## 🔧 Troubleshooting

### Issue: Sidebar not showing correct structure
**Solution:**
```sql
-- Verify seed data was inserted
SELECT COUNT(*) FROM route_permissions WHERE module = 'staffmgt';
-- Should return 40+ records

-- Check for conflicts
SELECT resource, group_name, display_order 
FROM route_permissions 
WHERE module = 'staffmgt' 
ORDER BY display_order;
```

### Issue: Backend won't start
**Common causes:**
1. **Database not running** - Start PostgreSQL
2. **Port already in use** - Change port in `.env`
3. **Missing dependencies** - Run `pnpm install`
4. **Migration errors** - Run migrations manually

### Issue: Frontend shows errors
**Check:**
1. Backend is running and accessible
2. API URL is correct in frontend config
3. Authentication is working
4. Browser console for specific errors

### Issue: Permissions not working
**Solution:**
```sql
-- Verify permissions exist
SELECT * FROM permissions WHERE module = 'staffmgt';

-- Check role assignments
SELECT * FROM role_permissions WHERE permission_id IN (
  SELECT id FROM permissions WHERE module = 'staffmgt'
);
```

---

## 📊 Quick Test Commands

### Database Queries

```sql
-- Count staff members
SELECT COUNT(*) FROM staff WHERE is_deleted = false;

-- View today's attendance
SELECT COUNT(*), status 
FROM staff_attendance 
WHERE date = CURRENT_DATE 
GROUP BY status;

-- View leave requests by status
SELECT status, COUNT(*) 
FROM leave_requests 
WHERE is_deleted = false 
GROUP BY status;

-- View all staffmgt permissions
SELECT COUNT(*) FROM permissions WHERE module = 'staffmgt';
```

### API Endpoints to Test

```bash
# Staff
GET http://localhost:3000/api/staffmgt/staff
GET http://localhost:3000/api/staffmgt/staff/statistics

# Attendance
GET http://localhost:3000/api/staffmgt/staff-attendance
GET http://localhost:3000/api/staffmgt/staff-attendance/today/summary

# Leave
GET http://localhost:3000/api/staffmgt/leave-requests
GET http://localhost:3000/api/staffmgt/leave-types
GET http://localhost:3000/api/staffmgt/leave-quotas

# Performance
GET http://localhost:3000/api/staffmgt/performance

# Contracts
GET http://localhost:3000/api/staffmgt/contracts

# Training
GET http://localhost:3000/api/staffmgt/training/courses

# Payroll
GET http://localhost:3000/api/staffmgt/payroll
```

---

## 🎯 What to Expect

### After Running Successfully:

✅ **Backend**:
- All routes loaded
- Database queries working
- Statistics endpoints returning data
- Pagination functional

✅ **Frontend**:
- Staff page loads with teal/cyan branding
- Statistics dashboard shows data
- Form opens with 6 collapsible sections
- List shows avatars and status badges
- Detail view has 5 tabs
- Attendance page shows real-time clock
- Filters work correctly

✅ **Sidebar**:
- Clean, organized structure
- Main items visible
- Sub-items grouped under collapsible menus
- Proper icons for each section
- Correct display order

---

## 🚀 Next Steps After Setup

1. **Add Test Data**: Create sample staff members
2. **Test Workflows**: Try complete staff lifecycle
3. **Customize**: Adjust form fields and filters
4. **Train Team**: Show key features to users
5. **Monitor**: Check logs and performance
6. **Extend**: Build remaining module UIs

---

## 📝 Important Notes

- **Always run migrations in order**: 0002 → 0003
- **Backup database** before running migrations
- **Check logs** if something doesn't work
- **Test incrementally** - one module at a time
- **Verify permissions** after seed data insertion

---

## 💡 Pro Tips

### Speed Up Development:
```bash
# Run backend with auto-reload
pnpm dev

# Run frontend with hot reload
pnpm dev

# Clear frontend cache if needed
rm -rf node_modules/.vite
pnpm dev
```

### Database Debugging:
```sql
-- See all staffmgt tables
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE '%staff%' OR table_name LIKE '%leave%' OR table_name LIKE '%attendance%';

-- Check row counts
SELECT 'staff' as table_name, COUNT(*) FROM staff
UNION ALL
SELECT 'staff_attendance', COUNT(*) FROM staff_attendance
UNION ALL
SELECT 'leave_requests', COUNT(*) FROM leave_requests
UNION ALL
SELECT 'leave_types', COUNT(*) FROM leave_types;
```

---

**You're all set! Run the commands and enjoy your new Staff Management System!** 🎉

*If you encounter any issues, check the logs and verify each step was completed successfully.*
