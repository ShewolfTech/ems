# Grade Aggregation with Weights - Complete Guide

## 🎯 Overview

The EMS uses a **weighted aggregation system** to calculate final student grades from multiple assessment types: **Assessments**, **Exams**, and **Assignments**. Each item has a weight (0.1 to 1.0) that determines its contribution to the final grade.

---

## 📊 How Weights Work

### Weight Range
- **Minimum:** 0.1 (10% impact)
- **Maximum:** 1.0 (100% impact)
- **Default:** 1.0

### What Weight Means
The weight determines **how much an individual item contributes** to the category average, which is then combined across all categories for the final grade.

---

## 🧮 Aggregation Formula

### Step 1: Calculate Item Percentage
```
item_percentage = (student_score / max_score) × 100
```

### Step 2: Apply Item Weight
```
weighted_score = item_percentage × weight
```

### Step 3: Calculate Category Average
For each category (Assessments, Exams, Assignments):
```
category_average = SUM(weighted_scores) / SUM(weights)
```

### Step 4: Combine Categories (if needed)
```
final_grade = (assessments_avg × 0.4) + (exams_avg × 0.4) + (assignments_avg × 0.2)
```

*Note: Category weights can be configured per school policy.*

---

## 📝 Example Calculation

### Student: John Doe - Grade 5A Mathematics

#### Assessments (40% of final grade)
| Assessment | Score | Max | Weight | % | Weighted % |
|------------|-------|-----|--------|---|------------|
| Quiz 1 | 18 | 20 | 0.3 | 90% | 27.0 |
| Quiz 2 | 42 | 50 | 0.5 | 84% | 42.0 |
| Mid-Test | 27 | 30 | 0.8 | 90% | 72.0 |

```
Assessments Average = (27 + 42 + 72) / (0.3 + 0.5 + 0.8) 
                    = 141 / 1.6 
                    = 88.125%
```

#### Exams (40% of final grade)
| Exam | Score | Max | Weight | % | Weighted % |
|------|-------|-----|--------|---|------------|
| Mid-Term | 85 | 100 | 1.0 | 85% | 85.0 |
| Final | 92 | 100 | 1.0 | 92% | 92.0 |

```
Exams Average = (85 + 92) / (1.0 + 1.0) 
              = 177 / 2.0 
              = 88.5%
```

#### Assignments (20% of final grade)
| Assignment | Score | Max | Weight | % | Weighted % |
|------------|-------|-----|--------|---|------------|
| Homework 1 | 48 | 50 | 0.5 | 96% | 48.0 |
| Project | 88 | 100 | 0.8 | 88% | 70.4 |

```
Assignments Average = (48 + 70.4) / (0.5 + 0.8) 
                    = 118.4 / 1.3 
                    = 91.08%
```

#### Final Grade Calculation
```
Final Grade = (88.125 × 0.4) + (88.5 × 0.4) + (91.08 × 0.2)
            = 35.25 + 35.4 + 18.22
            = 88.87%

Grade Letter: B (Excellent)
Grade Point: 4.0
```

---

## 🔍 Why Use Weights?

### 1. **Fair Assessment**
Not all assessments are equal. A comprehensive final exam should weigh more than a quick quiz.

### 2. **Flexibility**
Teachers can adjust importance of different assessments without changing the grading system.

### 3. **Accuracy**
Weighted averages provide a more accurate reflection of student performance.

### 4. **Transparency**
Students and parents can see exactly how grades are calculated.

---

## 💡 Practical Scenarios

### Scenario 1: Equal Importance
All items have weight = 1.0
```
Item 1: 90%
Item 2: 80%
Item 3: 85%

Average = (90 + 80 + 85) / 3 = 85%
```

### Scenario 2: Progressive Weighting
Earlier items weigh less, later items weigh more
```
Quiz 1: 90% × 0.3 = 27
Quiz 2: 80% × 0.6 = 48
Final Exam: 85% × 1.0 = 85

Weighted Avg = (27 + 48 + 85) / (0.3 + 0.6 + 1.0)
             = 160 / 1.9
             = 84.21%
```

### Scenario 3: Emphasizing Exams
High-stakes exams have maximum weight
```
Assessments: weight 0.3-0.5
Assignments: weight 0.5-0.8
Exams: weight 1.0

Result: Exams dominate the final grade calculation
```

---

## 🗄️ Database Schema

### Assessments Table
```sql
CREATE TABLE assessments (
    ...
    weight NUMERIC(5,2) DEFAULT 1.0,
    ...
);
```

### Exams Table (After Migration 0020)
```sql
CREATE TABLE exams (
    ...
    weight NUMERIC(5,2) DEFAULT 1.0 CHECK (weight >= 0.1 AND weight <= 1.0),
    ...
);
```

### Assignments Table
```sql
CREATE TABLE assignments (
    ...
    weight NUMERIC(5,2) DEFAULT 1.0,
    ...
);
```

---

## 🔧 Backend Implementation

### Unified Gradebook Service
```typescript
// assessments/service.ts - getUnifiedGradeBook()

// Fetches all three types with weights
const assessments = await db
  .selectFrom("assessments")
  .select(["id", "title", "max_score", "weight"])
  .execute();

const exams = await db
  .selectFrom("exams")
  .select(["id", "title", "max_score", "weight"])
  .execute();

const assignments = await db
  .selectFrom("assignments")
  .select(["id", "title", "max_score", "weight"])
  .execute();

// Then merges and calculates weighted scores
```

### Weight Calculation
```typescript
// For each student and item
const percentage = (result.score / item.max_score) * 100;
const weightedScore = percentage * item.weight;

// Category average
const categoryAverage = totalWeightedScores / totalWeights;
```

---

## 🎨 Frontend Implementation

### Display in Forms
```tsx
<div>
  <label className="block text-sm font-semibold mb-2">
    Weight for Grade Aggregation
    <Info className="w-4 h-4" /> {/* Tooltip on hover */}
  </label>
  <input
    type="number"
    min="0.1"
    max="1.0"
    step="0.1"
    defaultValue="1.0"
  />
  <p className="text-xs text-slate-500">Range: 0.1 to 1.0 (default: 1.0)</p>
</div>
```

### Display in Gradebook
```tsx
// Shows weight in column header
<th>
  <span className="badge">{item.item_title}</span>
  <span className="text-[10px] text-gray-400">
    /{item.max_score} (w: {item.weight})
  </span>
</th>
```

---

## 📋 Migration Guide

### Running Migration 0020
```bash
# Using psql
psql -U postgres -d ems_db -f migrations/0020_exams_add_weight_fix_teacher_id.sql

# Or manually run:
ALTER TABLE exams ALTER COLUMN teacher_id DROP NOT NULL;
ALTER TABLE exams ADD COLUMN IF NOT EXISTS weight NUMERIC(5,2) DEFAULT 1.0 
  CHECK (weight >= 0.1 AND weight <= 1.0);
UPDATE exams SET weight = 1.0 WHERE weight IS NULL;
```

### Backward Compatibility
- All existing exams automatically get `weight = 1.0`
- No data loss occurs
- Existing grades remain unchanged

---

## ✅ Best Practices

### For Teachers
1. **Start with 1.0** for all items until you understand the impact
2. **Use higher weights (0.8-1.0)** for major exams and projects
3. **Use lower weights (0.2-0.5)** for quizzes and homework
4. **Be consistent** within each assessment type
5. **Communicate weights** to students so they know what matters most

### For Administrators
1. **Set school-wide weight policies**
2. **Provide training** on weight usage
3. **Monitor grade distributions** after implementing weights
4. **Review and adjust** category weights annually

### For Students/Parents
1. **Check weights** to understand what's most important
2. **Focus effort** on high-weight items
3. **Track progress** using the weighted gradebook
4. **Ask teachers** if unsure about weight assignments

---

## 🐛 Common Issues

### Issue 1: Grade dropped after adding weight
**Cause:** Student performed poorly on high-weight items  
**Solution:** Review item scores and consider if weights are appropriate

### Issue 2: All items same weight
**Cause:** Using default 1.0 for everything  
**Solution:** Differentiate importance of assessments

### Issue 3: Weight > 1.0 or < 0.1
**Cause:** Database constraint prevents this  
**Solution:** Keep weights in valid range (0.1 - 1.0)

### Issue 4: Weighted average seems wrong
**Cause:** Forgetting to divide by sum of weights  
**Solution:** Use formula: `SUM(score × weight) / SUM(weight)`

---

## 📊 Visual Example

```
┌────────────────────────────────────────────────────────┐
│           STUDENT GRADE CALCULATION                    │
│                                                        │
│  ASSESSMENTS (40%)                                     │
│  ├─ Quiz 1: 18/20 (90%) × 0.3 = 27.0                 │
│  ├─ Quiz 2: 42/50 (84%) × 0.5 = 42.0                 │
│  └─ Mid-Test: 27/30 (90%) × 0.8 = 72.0               │
│  Category Average: 141 / 1.6 = 88.1%                  │
│                                                        │
│  EXAMS (40%)                                           │
│  ├─ Mid-Term: 85/100 (85%) × 1.0 = 85.0              │
│  └─ Final: 92/100 (92%) × 1.0 = 92.0                 │
│  Category Average: 177 / 2.0 = 88.5%                  │
│                                                        │
│  ASSIGNMENTS (20%)                                     │
│  ├─ Homework: 48/50 (96%) × 0.5 = 48.0               │
│  └─ Project: 88/100 (88%) × 0.8 = 70.4               │
│  Category Average: 118.4 / 1.3 = 91.1%                │
│                                                        │
│  ═══════════════════════════════════════════           │
│  FINAL GRADE: 88.9% = B (Excellent)                    │
│  ═══════════════════════════════════════════           │
└────────────────────────────────────────────────────────┘
```

---

## 🎓 Summary

- **Weights** allow fine-tuned control over grade calculations
- **Range:** 0.1 to 1.0 (default 1.0)
- **Formula:** `Weighted Average = Σ(score × weight) / Σ(weight)`
- **Categories:** Assessments, Exams, Assignments each have their own average
- **Final Grade:** Weighted combination of all category averages
- **Migration:** 0020 adds weight to exams and fixes teacher_id constraint

---

**Weights empower teachers to create fair, accurate, and meaningful grade calculations that truly reflect student performance!** 📊✨
