# School-Specific Grading Configurations - Complete Guide

## 🎯 Overview

Every school has unique grading policies. The **Grading Configurations** module allows each school to define their own:
- **Category weights** (Assessments, Exams, Assignments percentages)
- **Grading scales** (A-F, 1-7, or custom systems)
- **Calculation methods** (weighted average, total points, category average)
- **Rounding rules** and display preferences

---

## 🚀 Quick Start

### Step 1: Run Migration

```bash
cd c:\Bright\ems\migrations
node run_0021_migration.cjs
```

**Or manually:**
```sql
-- Run the entire SQL in migrations/0021_grading_configurations.sql
```

### Step 2: Access Configuration Page

Navigate to: `http://localhost:3000/academics/grading-configurations`

### Step 3: Create Your First Configuration

1. Click **"+ New Configuration"**
2. Set category weights (must sum to 100%)
3. Define your grading scale (A-F, 1-7, etc.)
4. Mark as **Default** if this is your primary grading system
5. Click **"Save Configuration"**

---

## 📊 How It Works

### Category Weights

Each school defines what percentage each category contributes to the final grade:

**Example 1: Balanced (Default)**
```
Assessments: 40%
Exams:       40%
Assignments: 20%
Total:      100%
```

**Example 2: Exam-Focused**
```
Assessments: 20%
Exams:       60%
Assignments: 20%
Total:      100%
```

**Example 3: Continuous Assessment**
```
Assessments: 50%
Exams:       30%
Assignments: 20%
Total:      100%
```

### Grading Scale

Define your own grade boundaries:

**Standard A-F System:**
```json
[
  {"grade": "A+", "min_percentage": 97, "max_percentage": 100, "grade_point": 5.0},
  {"grade": "A", "min_percentage": 93, "max_percentage": 96.99, "grade_point": 5.0},
  {"grade": "A-", "min_percentage": 90, "max_percentage": 92.99, "grade_point": 4.7},
  ...
  {"grade": "F", "min_percentage": 0, "max_percentage": 59.99, "grade_point": 0.0}
]
```

**1-7 System (IB-style):**
```json
[
  {"grade": "7", "min_percentage": 90, "max_percentage": 100, "grade_point": 5.0},
  {"grade": "6", "min_percentage": 80, "max_percentage": 89.99, "grade_point": 4.5},
  ...
  {"grade": "1", "min_percentage": 0, "max_percentage": 39.99, "grade_point": 0.0}
]
```

### Calculation Formula

The system uses the **weighted average method**:

```
Step 1: Calculate category averages
  Assessments Avg = Σ(assessment_score × assessment_weight) / Σ(assessment_weight)
  Exams Avg = Σ(exam_score × exam_weight) / Σ(exam_weight)
  Assignments Avg = Σ(assignment_score × assignment_weight) / Σ(assignment_weight)

Step 2: Apply category weights
  Final % = (Assessments Avg × assessments_weight%) +
            (Exams Avg × exams_weight%) +
            (Assignments Avg × assignments_weight%)

Step 3: Determine grade letter
  Lookup Final % in grading_scale to get letter grade
```

---

## 🧮 Real-World Example

### School: Sunrise Academy
**Configuration: "Standard 2026" (40/40/20)**

#### Student: John Doe - Grade 5A, Term 1

**Assessments (40%):**
- Quiz 1: 18/20 (90%) × 0.3 weight = 27.0
- Quiz 2: 42/50 (84%) × 0.5 weight = 42.0
- Mid-Test: 27/30 (90%) × 0.8 weight = 72.0
- **Assessments Average:** (27 + 42 + 72) / (0.3 + 0.5 + 0.8) = **88.1%**

**Exams (40%):**
- Mid-Term: 85/100 (85%) × 1.0 weight = 85.0
- Final: 92/100 (92%) × 1.0 weight = 92.0
- **Exams Average:** (85 + 92) / (1.0 + 1.0) = **88.5%**

**Assignments (20%):**
- Homework 1: 48/50 (96%) × 0.5 weight = 48.0
- Project: 88/100 (88%) × 0.8 weight = 70.4
- **Assignments Average:** (48 + 70.4) / (0.5 + 0.8) = **91.1%**

#### Final Calculation
```
Final Grade = (88.1 × 0.40) + (88.5 × 0.40) + (91.1 × 0.20)
            = 35.24 + 35.40 + 18.22
            = 88.86%

Lookup in grading scale:
88.86% is between 87-89.99 → Grade: B+
Grade Point: 4.3
Description: Very Good Plus
```

---

## 🔌 API Endpoints

### CRUD Operations
```
GET    /academics/grading-configurations              - List all configs
GET    /academics/grading-configurations/:id          - Get by ID
GET    /academics/grading-configurations/default      - Get default config
POST   /academics/grading-configurations              - Create new config
PUT    /academics/grading-configurations/:id          - Update config
DELETE /academics/grading-configurations/:id          - Delete config
```

### Grade Calculation
```
GET    /academics/grading-configurations/calculate-grade?student_id=1&class_id=5&term_id=2
```

**Response:**
```json
{
  "success": true,
  "data": {
    "percentage": 88.86,
    "grade_letter": "B+",
    "grade_point": 4.3,
    "description": "Very Good Plus",
    "category_averages": {
      "assessments": 88.1,
      "exams": 88.5,
      "assignments": 91.1
    },
    "configuration": {
      "id": 1,
      "name": "Standard 2026",
      "assessments_weight": 40,
      "exams_weight": 40,
      "assignments_weight": 20
    }
  }
}
```

---

## 📁 Files Created

### Backend (5 files)
```
backend/src/domains/academics/grading_configurations/
├── validator.ts         # Zod schemas with validation
├── service.ts           # CRUD + grade calculation logic
├── controller.ts        # HTTP request handlers
├── routes.ts            # API endpoints
└── index.ts             # Module export
```

### Frontend (3 files)
```
frontend/src/
├── domains/academics/grading_configurations/
│   └── services.ts                  # API calls
└── components/domains/academics/grading_configurations/
    ├── GradingConfigurationsPage.tsx # Main UI
    └── index.ts                      # Barrel export
```

### Database (1 file)
```
migrations/0021_grading_configurations.sql
```

### Routes (1 update)
```
frontend/src/app/routes/RouteRegistry.ts  # Added route
backend/src/domains/academics/index.ts     # Registered module
```

---

## 🎨 UI Features

### Configuration List
- Card-based layout showing all configurations
- Visual weight indicators (color-coded)
- Default badge highlight
- Edit/Delete actions

### Configuration Form
- **Basic Information**: Name, description, active/default toggles
- **Category Weights**: Three inputs with real-time validation
  - Must sum to exactly 100%
  - Visual feedback (green ✓ when valid, red ✗ when invalid)
- **Grading Scale Table**: Editable grid of grade entries
  - Add/remove grades dynamically
  - Min/Max percentage validation
  - Grade points (0-5 scale)
- **Additional Settings**: Calculation method, decimal places, rounding

---

## 🗄️ Database Schema

### `grading_configurations` Table
```sql
CREATE TABLE grading_configurations (
    id BIGSERIAL PRIMARY KEY,
    school_id BIGINT NOT NULL,
    academic_year_id BIGINT,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    
    -- Category Weights (must sum to 100.0)
    assessments_weight NUMERIC(5,2) DEFAULT 40.0,
    exams_weight NUMERIC(5,2) DEFAULT 40.0,
    assignments_weight NUMERIC(5,2) DEFAULT 20.0,
    
    -- Grading Scale (JSONB)
    grading_scale JSONB NOT NULL,
    
    -- Settings
    calculation_method VARCHAR(50) DEFAULT 'weighted_average',
    round_final_grade BOOLEAN DEFAULT TRUE,
    decimal_places INT DEFAULT 1,
    include_ungraded BOOLEAN DEFAULT FALSE,
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    is_default BOOLEAN DEFAULT FALSE,
    effective_start_date DATE,
    effective_end_date DATE,
    
    -- Audit
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Constraints
    CHECK (assessments_weight + exams_weight + assignments_weight = 100.0)
);
```

### Key Features
1. **Weight Validation**: Database-level CHECK constraint ensures weights sum to 100
2. **JSONB Grading Scale**: Flexible schema for any grading system
3. **Single Default**: Trigger ensures only one default per school
4. **Multi-Tenant**: RLS isolates configurations by school
5. **Time-Bound**: Can set effective date ranges for future changes

---

## 🔒 Security & Multi-Tenancy

All queries are scoped by `school_id`:

```typescript
// Backend ensures school isolation
const config = await db
  .selectFrom("grading_configurations")
  .where("school_id", "=", context.schoolId)
  .execute();
```

**Row Level Security (RLS):**
```sql
CREATE POLICY grading_configs_isolation ON grading_configurations
    FOR ALL TO authenticated
    USING (school_id = current_school_id() AND NOT is_deleted)
    WITH CHECK (school_id = current_school_id() AND NOT is_deleted);
```

---

## 🧪 Testing Guide

### Test 1: Create Configuration
1. Navigate to `/academics/grading-configurations`
2. Click **"+ New Configuration"**
3. Fill in:
   - Name: "Test Config 2026"
   - Assessments: 40, Exams: 40, Assignments: 20
   - Leave default grading scale as-is
   - Check "Set as Default"
4. Click **"Save Configuration"**

**Expected:** ✅ Configuration saved and appears in list

### Test 2: Invalid Weights
1. Try to create config with: Assessments 50, Exams 50, Assignments 20
2. Total = 120%

**Expected:** ❌ Red warning: "Weights must sum to 100%"

### Test 3: Custom Grading Scale
1. Edit a configuration
2. Change grading scale to 1-7 system
3. Add entries:
   - Grade "7": 90-100, 5.0
   - Grade "6": 80-89.99, 4.5
   - ... (continue pattern)
4. Save

**Expected:** ✅ Custom scale saved successfully

### Test 4: Calculate Grade
```bash
curl "http://localhost:4000/api/academics/grading-configurations/calculate-grade?student_id=1&class_id=5&term_id=2"
```

**Expected:** ✅ Returns calculated grade with breakdown

---

## 📋 Sample Configurations Included

The migration includes 3 sample configurations:

### 1. Standard Grading (Default)
- **Weights:** 40/40/20
- **Scale:** A+ to F (13 grades)
- **Method:** Weighted Average
- **Best for:** Most schools, balanced approach

### 2. Exam-Focused Grading
- **Weights:** 20/60/20
- **Scale:** A to F (6 grades)
- **Method:** Weighted Average
- **Best for:** Exam-heavy curricula

### 3. Continuous Assessment Focus
- **Weights:** 50/30/20
- **Scale:** 1-7 (7 grades)
- **Method:** Weighted Average
- **Best for:** Progressive assessment models

---

## 🔧 Integration Points

### 1. Gradebook Integration
The gradebook automatically uses the school's default configuration:

```typescript
// assessments/service.ts - getUnifiedGradeBook()
const config = await gradingConfigurationsService.getDefaultConfig(context);
// Uses config weights to calculate final grades
```

### 2. Student Reports
Report cards use the grading configuration for final grade calculation:

```typescript
// report_cards/service.ts
const finalGrade = await gradingConfigurationsService.calculateFinalGrade(
  context, studentId, classId, termId
);
// Returns: { percentage, grade_letter, grade_point, description }
```

### 3. Exams Module
Exams feed into the gradebook which uses the school's configuration for aggregation.

---

## 💡 Best Practices

### For School Administrators
1. **Start with a sample config** - Use one of the included templates
2. **Set ONE as default** - Mark your primary configuration as default
3. **Plan ahead** - Use effective dates for future term changes
4. **Document your policy** - Add clear descriptions
5. **Test before using** - Create test students and verify calculations

### For Teachers
1. **Check the config** - Understand your school's grading policy
2. **Use item weights wisely** - They combine with category weights
3. **Enter all grades** - Missing grades skew the averages
4. **Review calculations** - Verify student grades make sense

### For Students/Parents
1. **Understand the formula** - Know what counts most
2. **Focus on high-weight items** - Exams vs quizzes
3. **Track progress** - Use the gradebook to monitor performance
4. **Ask questions** - Teachers can explain the breakdown

---

## 🐛 Troubleshooting

### Issue: "Weights must sum to 100%"
**Cause:** Category weights don't add up to exactly 100  
**Solution:** Adjust values until total = 100%

### Issue: "No grading configuration found"
**Cause:** School has no configurations created  
**Solution:** Create at least one configuration and mark as default

### Issue: Grade calculation seems wrong
**Cause:** Missing graded items or incorrect item weights  
**Solution:** Verify all assessments, exams, and assignments have results

### Issue: Can't delete default config
**Cause:** System requires at least one default  
**Solution:** Mark another config as default first, then delete

---

## 📚 Related Documentation

- **Weight Aggregation Guide:** `WEIGHT_AGGREGATION_GUIDE.md`
- **Exams Module Guide:** `EXAMS_MODULE_GUIDE.md`
- **Exams Fixes Summary:** `EXAMS_FIXES_SUMMARY.md`

---

## 🎓 Summary

The **Grading Configurations** module provides:

✅ **School-specific customization** - Each school defines their own rules  
✅ **Flexible grading scales** - Support any grading system (A-F, 1-7, custom)  
✅ **Category weights** - Control what matters most  
✅ **Automatic calculation** - System handles all the math  
✅ **Validation** - Database and UI prevent invalid configurations  
✅ **Multi-tenant secure** - Schools only see their own configs  
✅ **Default system** - One active config per school at any time  
✅ **Time-bound configs** - Plan changes for future terms  

**Navigate to `/academics/grading-configurations` to set up your school's grading policy!** 🚀📊

---

**Built for flexibility, accuracy, and transparency in student assessment!** ✨
