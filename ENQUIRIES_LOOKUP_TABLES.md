# Enquiries Management - Enhanced with Lookup Tables

## 📋 New Lookup Tables Added

### **1. Enquiry Status Types** (`enquiry_status_types`)
Replaces hardcoded status enum with customizable status types.

**Fields:**
- `id`, `school_id`
- `name`, `code`, `description`
- `color` (for UI display)
- `display_order` (for custom sorting)
- `is_default` (marks default status)
- `is_active`, `is_deleted`

**Default Values:**
- New (Blue)
- In Progress (Orange)
- Waiting Response (Purple)
- Converted (Green)
- Closed (Gray)
- Rejected (Red)

---

### **2. Enquiry Priority Levels** (`enquiry_priority_levels`)
Replaces hardcoded priority enum with customizable priority levels.

**Fields:**
- `id`, `school_id`
- `name`, `code`, `description`
- `color` (for UI display)
- `display_order` (for custom sorting)
- `is_default` (marks default priority)
- `is_active`, `is_deleted`

**Default Values:**
- Low (Gray)
- Medium (Blue) - Default
- High (Orange)
- Urgent (Red)

---

### **3. Enquiry Subjects** (`enquiry_subjects`)
Hierarchical categorization of enquiry topics/subjects.

**Fields:**
- `id`, `school_id`
- `name`, `code`, `description`
- `parent_id` (for hierarchical structure)
- `display_order`
- `is_active`, `is_deleted`

**Default Structure:**
```
├── Academic
│   ├── Admission Process
│   ├── Curriculum
│   └── Examinations
├── Fees
│   ├── Fee Structure
│   ├── Payment Plans
│   └── Scholarships
├── Transport
│   ├── Bus Routes
│   └── Transport Fees
├── Boarding
│   ├── Hostel Facilities
│   └── Boarding Fees
├── General
│   ├── School Policies
│   └── Extracurricular
├── Complaints
└── Suggestions
```

---

## 🗄️ Database Changes

### **Migration File:** `0007_enquiries_lookup_tables.sql`

**New Tables:**
- `enquiry_status_types`
- `enquiry_priority_levels`
- `enquiry_subjects`

**Enquiries Table Updates:**
```sql
ALTER TABLE enquiries 
  ADD COLUMN enquiry_status_id BIGINT REFERENCES enquiry_status_types(id),
  ADD COLUMN enquiry_priority_id BIGINT REFERENCES enquiry_priority_levels(id),
  ADD COLUMN enquiry_subject_id BIGINT REFERENCES enquiry_subjects(id);
```

**Backward Compatibility:**
- Old `status` and `priority` enum fields are kept for compatibility
- New code should use the lookup table IDs

---

## 🔌 API Endpoints Added

### **Status Types**
```
GET    /api/admissions/enquiries/status-types       - List all status types
POST   /api/admissions/enquiries/status-types       - Create status type
PUT    /api/admissions/enquiries/status-types/:id   - Update status type
DELETE /api/admissions/enquiries/status-types/:id   - Delete status type
```

### **Priority Levels**
```
GET    /api/admissions/enquiries/priority-levels     - List all priority levels
POST   /api/admissions/enquiries/priority-levels     - Create priority level
PUT    /api/admissions/enquiries/priority-levels/:id - Update priority level
DELETE /api/admissions/enquiries/priority-levels/:id - Delete priority level
```

### **Subjects**
```
GET    /api/admissions/enquiries/subjects       - List all subjects (hierarchical)
POST   /api/admissions/enquiries/subjects       - Create subject
PUT    /api/admissions/enquiries/subjects/:id   - Update subject
DELETE /api/admissions/enquiries/subjects/:id   - Delete subject
```

---

## 📦 Frontend Integration

### **Updated Form Fields:**

**Before:**
```typescript
{
  status: 'new',           // string enum
  priority: 'medium'       // string enum
}
```

**After:**
```typescript
{
  enquiry_status_id: 1,      // lookup table ID
  enquiry_priority_id: 2,    // lookup table ID
  enquiry_subject_id: 5      // lookup table ID (optional)
}
```

### **New API Calls:**
```javascript
// Load dropdowns
const [statusTypes, setStatusTypes] = useState([]);
const [priorityLevels, setPriorityLevels] = useState([]);
const [subjects, setSubjects] = useState([]);

useEffect(() => {
  const loadLookups = async () => {
    const [statuses, priorities, subjects] = await Promise.all([
      getEnquiryStatusTypes(),
      getEnquiryPriorityLevels(),
      getEnquirySubjects()
    ]);
    setStatusTypes(statuses.data);
    setPriorityLevels(priorities.data);
    setSubjects(subjects.data);
  };
  loadLookups();
}, []);
```

---

## 🎨 UI Benefits

### **Customizable Status Workflow:**
Schools can now define their own enquiry workflow:
```
Lead → Contacted → Interested → Applied → Converted
```

### **Custom Priority Definitions:**
Each school can define what priorities mean to them:
```
Normal → Important → Critical → Emergency
```

### **Subject Categorization:**
- Hierarchical structure for better organization
- Easy to filter and report by subject
- Helps identify common enquiry patterns

---

## 📊 Reporting Enhancements

With lookup tables, you can now:

1. **Track Status Distribution:**
   ```sql
   SELECT est.name, COUNT(*) 
   FROM enquiries e
   JOIN enquiry_status_types est ON e.enquiry_status_id = est.id
   GROUP BY est.name;
   ```

2. **Priority Analysis:**
   ```sql
   SELECT epl.name, AVG(EXTRACT(EPOCH FROM (resolved_date - enquiry_date))/3600) as avg_hours
   FROM enquiries e
   JOIN enquiry_priority_levels epl ON e.enquiry_priority_id = epl.id
   WHERE e.resolved_date IS NOT NULL
   GROUP BY epl.name;
   ```

3. **Subject Trends:**
   ```sql
   SELECT es.name, COUNT(*) as enquiry_count
   FROM enquiries e
   JOIN enquiry_subjects es ON e.enquiry_subject_id = es.id
   GROUP BY es.name
   ORDER BY enquiry_count DESC;
   ```

---

## ✅ Setup Steps

1. **Run Migration:**
   ```bash
   psql -U your_user -d your_db -f migrations/0007_enquiries_lookup_tables.sql
   ```

2. **Restart Backend:**
   ```bash
   cd backend && pnpm dev
   ```

3. **Test Endpoints:**
   ```bash
   curl http://localhost:4000/api/admissions/enquiries/status-types
   curl http://localhost:4000/api/admissions/enquiries/priority-levels
   curl http://localhost:4000/api/admissions/enquiries/subjects
   ```

4. **Update Frontend Forms** to use new lookup tables

---

## 🔄 Migration from Old Fields

If you have existing enquiries with old `status`/`priority` enums:

```sql
-- Map old status to new status types
UPDATE enquiries e
SET enquiry_status_id = est.id
FROM enquiry_status_types est
WHERE est.code = UPPER(e.status)
  AND e.enquiry_status_id IS NULL;

-- Map old priority to new priority levels
UPDATE enquiries e
SET enquiry_priority_id = epl.id
FROM enquiry_priority_levels epl
WHERE epl.code = UPPER(e.priority)
  AND e.enquiry_priority_id IS NULL;
```

---

**This enhancement makes the Enquiries system fully customizable per school!** 🎉
