# 🚀 Staff Management System - Quick Start Guide

## Getting Started in 5 Minutes

### Prerequisites
- PostgreSQL database running
- Node.js 18+ installed
- pnpm package manager

---

## Step 1: Database Setup

Run the staff management migration:

```bash
cd c:\Bright\ems
psql -U your_username -d your_database -f migrations/0002_staffmgt_complete.sql
```

This creates all necessary tables:
- `staff` - Core staff records
- `staff_attendance` - Attendance tracking
- `leave_requests` - Leave applications
- `leave_types` - Leave categories
- `staff_leave_quotas` - Annual leave balances
- `staff_contracts` - Employment contracts
- `performance_reviews` - Performance tracking
- `training_courses` - Training catalog
- `staff_payroll` - Payroll records
- And more...

---

## Step 2: Start Backend

```bash
cd c:\Bright\ems\backend
pnpm install
pnpm dev
```

Backend will start on `http://localhost:3000` (or your configured port)

### Verify Backend is Running:
```bash
curl http://localhost:3000/api/staffmgt/staff/permissions-meta
```

Expected response:
```json
{
  "success": true,
  "permissions_meta": [...]
}
```

---

## Step 3: Start Frontend

```bash
cd c:\Bright\ems\frontend
pnpm install
pnpm dev
```

Frontend will start on `http://localhost:5173`

---

## Step 4: Access Staff Management

Open your browser and navigate to:

```
http://localhost:5173/staffmgt/staff
```

You should see:
- Staff Management header with teal/cyan icon
- Statistics dashboard (if data exists)
- Search and filter controls
- Staff list with pagination

---

## Step 5: Add Your First Staff Member

1. Click **"Add Staff Member"** button (top right)
2. Fill in required fields:
   - First Name
   - Last Name
   - Email
   - Phone
   - Hire Date
   - Employment Type
   - Employment Status
3. Optionally fill other sections:
   - Personal Information
   - Contact Details
   - Employment Details
   - Professional Info
   - Account Details
4. Click **"Create Staff"**

---

## 📖 Code Examples

### Using Staff Hooks in Components

```typescript
import { useStaff, useStaffStatistics } from "@/domains/staffmgt/staff/hooks/useStaff";

function MyComponent() {
  // Get staff list with filters
  const { staff, loading, refresh } = useStaff({
    autoFetch: true,
    filters: {
      department_id: 1,
      employment_status: 'active',
      page: 1,
      limit: 20
    }
  });

  // Get statistics
  const { statistics } = useStaffStatistics({ autoFetch: true });

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <p>Total: {statistics?.total_staff}</p>
      {staff.map(s => <div key={s.id}>{s.first_name} {s.last_name}</div>)}
    </div>
  );
}
```

### Using Attendance Hooks

```typescript
import { useAttendance, useTodaySummary } from "@/domains/staffmgt/staff_attendance/hooks/useAttendance";

function AttendanceComponent() {
  const { records, refresh } = useAttendance({
    filters: {
      date_from: '2026-04-01',
      date_to: '2026-04-15',
      status: 'present'
    }
  });

  const { summary } = useTodaySummary();

  return (
    <div>
      <p>Today: {summary?.present} present, {summary?.absent} absent</p>
      {records.map(r => (
        <div key={r.id}>
          {r.staff_name} - {r.status}
        </div>
      ))}
    </div>
  );
}
```

### Using Leave Management Hooks

```typescript
import { useLeaveRequests, useLeaveTypes, useLeaveQuotas } from "@/domains/staffmgt/leave_management/hooks/useLeave";

function LeaveComponent() {
  const { requests, approve, reject } = useLeaveRequests({
    filters: { status: 'pending' }
  });
  
  const { leaveTypes } = useLeaveTypes();
  const { quotas } = useLeaveQuotas({ staffId: 123, year: 2026 });

  const handleApprove = async (id: number) => {
    await approve(id, currentUserId);
    refresh();
  };

  return (
    <div>
      <h3>Pending Leave Requests</h3>
      {requests.map(req => (
        <div key={req.id}>
          <p>{req.staff_name} - {req.leave_type_name}</p>
          <p>{req.start_date} to {req.end_date} ({req.total_days} days)</p>
          <button onClick={() => handleApprove(req.id)}>Approve</button>
        </div>
      ))}
    </div>
  );
}
```

---

## 🔧 API Usage Examples

### Create Staff Member

```typescript
import { saveStaff } from "@/domains/staffmgt/staff/services";

const newStaff = {
  first_name: "John",
  last_name: "Doe",
  email: "john.doe@school.edu",
  phone: "+1234567890",
  hire_date: "2026-04-15",
  employment_type: "full_time",
  employment_status: "active",
  department_id: 1,
  role_id: 2,
  is_active: true
};

const result = await saveStaff(newStaff);
console.log("Created staff ID:", result.data.staff.id);
```

### Clock In/Out

```typescript
import { clockIn, clockOut } from "@/domains/staffmgt/staff_attendance/services";

// Clock in
await clockIn({
  staff_id: 123,
  device_id: "main-entrance",
  location: "Main Office"
});

// Clock out
await clockOut({
  staff_id: 123
});
```

### Submit Leave Request

```typescript
import { saveLeaveRequest } from "@/domains/staffmgt/leave_management/services";

await saveLeaveRequest({
  staff_id: 123,
  leave_type_id: 1, // Annual leave
  start_date: "2026-05-01",
  end_date: "2026-05-05",
  reason: "Family vacation",
  contact_during_leave: "+1234567890",
  work_coverage: "Jane Smith will cover my classes"
});
```

---

## 🎨 Customization Guide

### Change Brand Colors

Edit Tailwind config or use CSS variables:

```css
:root {
  --primary-teal: #14b8a6;
  --primary-cyan: #06b6d4;
}

/* Or modify tailwind.config.js */
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0fdfa',
          500: '#14b8a6',
          600: '#0d9488',
        }
      }
    }
  }
}
```

### Add Custom Leave Types

```sql
INSERT INTO leave_types (school_id, name, code, category, max_days_per_year, is_paid)
VALUES 
  (1, 'Marriage Leave', 'MARRIAGE', 'personal', 10, true),
  (1, 'Exam Leave', 'EXAM', 'study', 5, true);
```

### Configure Working Hours

Update the `DefaultWorkingHours` in types:

```typescript
export const DefaultWorkingHours: WorkingHoursConfig = {
  start_time: '09:00',  // Changed from 08:00
  end_time: '18:00',    // Changed from 17:00
  late_grace_minutes: 10, // Changed from 15
  minimum_hours_per_day: 8,
  working_days: [1, 2, 3, 4, 5], // Mon-Fri
};
```

---

## 🐛 Troubleshooting

### Issue: No data showing in staff list
**Solution:** Ensure you have:
1. Run the migration
2. Created at least one staff member
3. School context is set in authentication

### Issue: Statistics showing zeros
**Solution:** Statistics calculate from existing data. Add staff records to see non-zero values.

### Issue: Form save failing
**Solution:** Check:
1. All required fields are filled (marked with *)
2. Email format is valid
3. Dates are in correct format (YYYY-MM-DD)
4. Browser console for specific error messages

### Issue: Attendance not recording
**Solution:** Verify:
1. Staff member exists
2. Not already clocked in for the day
3. Backend service is running
4. Check backend logs for SQL errors

---

## 📊 Database Queries

### View All Staff with Details

```sql
SELECT 
  s.id,
  s.employee_no,
  u.first_name,
  u.last_name,
  u.email,
  u.phone,
  d.name as department,
  sr.name as role,
  s.hire_date,
  s.is_active
FROM staff s
JOIN users u ON u.id = s.user_id
LEFT JOIN departments d ON d.id = s.department_id
LEFT JOIN staffmgt_roles sr ON sr.id = s.role_id
WHERE s.school_id = 1 
  AND s.is_deleted = false
ORDER BY s.created_at DESC;
```

### Today's Attendance Summary

```sql
SELECT 
  COUNT(*) as total_records,
  COUNT(*) FILTER (WHERE status = 'present') as present,
  COUNT(*) FILTER (WHERE status = 'absent') as absent,
  COUNT(*) FILTER (WHERE status = 'late') as late,
  COUNT(*) FILTER (WHERE status = 'excused') as excused
FROM staff_attendance
WHERE date = CURRENT_DATE
  AND school_id = 1
  AND is_deleted = false;
```

### Leave Balance for Staff Member

```sql
SELECT 
  lt.name as leave_type,
  lq.total_days,
  lq.used_days,
  lq.remaining_days,
  lq.year
FROM staff_leave_quotas lq
JOIN leave_types lt ON lt.id = lq.leave_type_id
WHERE lq.staff_id = 123
  AND lq.year = 2026
  AND lq.is_deleted = false;
```

---

## 🚀 Next Steps

### 1. Explore Other Modules
- `/staffmgt/staff-attendance` - Attendance tracking
- `/staffmgt/leave-management` - Leave requests (needs UI completion)
- `/staffmgt/contracts` - Contract management (needs UI)
- `/staffmgt/performance` - Performance reviews (needs UI)

### 2. Customize for Your School
- Add your school's departments
- Configure leave types and quotas
- Set working hours and policies
- Customize form fields as needed

### 3. Import Existing Data
- Use CSV import functionality (coming soon)
- Or write custom migration scripts
- Contact support for bulk import assistance

### 4. Train Your Team
- Share the implementation guide
- Demo the key features
- Create user role-specific guides

---

## 📚 Additional Resources

- **Full Implementation Guide**: `STAFF_MANAGEMENT_GUIDE.md`
- **Innovation Highlights**: `STAFF_INNOVATIONS.md`
- **API Documentation**: Backend Swagger at `/api/docs` (if enabled)
- **Database Schema**: `migrations/0002_staffmgt_complete.sql`

---

## 💬 Support

### Documentation
- Check the comprehensive guides in the repository
- Review code comments for implementation details
- Examine type definitions for data structures

### Common Questions

**Q: How do I add a new department?**
A: Use the departments API or add directly to database:
```sql
INSERT INTO departments (school_id, name, code, is_active)
VALUES (1, 'Mathematics', 'MATH', true);
```

**Q: Can I export staff data?**
A: Export functionality is in development. For now, use direct SQL queries or database admin tools.

**Q: How do I grant permissions to users?**
A: Permissions are managed through the roles system. Assign roles to staff members during creation.

**Q: Can I customize the form fields?**
A: Yes! Modify `StaffMetadata` in `types.ts` to add/remove/configure fields.

---

**You're all set! Start managing your staff efficiently! 🎉**

*For advanced customization and support, refer to the comprehensive documentation or contact the development team.*
