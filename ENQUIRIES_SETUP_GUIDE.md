# Enquiries Management - Setup & Usage Guide

## 📋 Quick Start

### 1. Run Database Migration
```bash
psql -U your_username -d your_database -f migrations/0006_enquiries.sql
```

### 2. Run Seed Data
```bash
psql -U your_username -d your_database -f migrations/99999_enquiries_seed.sql
```

### 3. Start Backend
```bash
cd backend
pnpm dev
```

### 4. Start Frontend
```bash
cd frontend
pnpm dev
```

### 5. Access Enquiries
Navigate to: `http://localhost:5173/admissions/enquiries`

---

## 🔧 Running Generator Scripts Safely

### ⚠️ IMPORTANT: Custom Domain Protection

The **enquiries** domain has a **custom implementation** that should NOT be auto-generated.

### ✅ Safe Scripts (Already Updated)

These scripts are configured to **skip enquiries**:

```bash
# Backend - Safe to run
pnpm ts-node-esm scripts/runBackendAll.ts

# Frontend - Safe to run  
pnpm ts-node-esm scripts/runFrontendAll.ts
```

### 📝 What's Protected

**Backend (Preserved):**
```
backend/src/domains/admissions/enquiries/
├── controller.ts       ✅ Custom
├── service.ts          ✅ Custom
├── routes.ts           ✅ Custom
├── types.ts            ✅ Custom
├── validator.ts        ✅ Custom
├── errors.ts           ✅ Custom
└── index.ts            ✅ Custom
```

**Frontend (Preserved):**
```
frontend/src/domains/admissions/enquiries/
├── components/
│   ├── EnquiriesList.tsx    ✅ Custom
│   └── EnquiryForm.tsx      ✅ Custom
├── hooks/
│   ├── useEnquiries.ts      ✅ Custom
│   └── index.ts             ✅ Custom
├── pages/
│   ├── EnquiriesPage.tsx    ✅ Custom
│   └── index.ts             ✅ Custom
├── controller.ts            ✅ Custom
├── services.ts              ✅ Custom
├── types.ts                 ✅ Custom
├── errors.ts                ✅ Custom
└── index.tsx                ✅ Custom
```

---

## 🚀 If You Need to Regenerate ALL Domains

If you want to regenerate **everything including enquiries** (will overwrite custom files):

### Backup First
```bash
# Backup custom enquiries
xcopy /E /I backend\src\domains\admissions\enquiries backend\src\domains\admissions\enquiries.backup
xcopy /E /I frontend\src\domains\admissions\enquiries frontend\src\domains\admissions\enquiries.backup
```

### Edit runBackendAll.ts
Uncomment these lines:
```typescript
runScript("./gen_Backend_Domain_Types.ts", dryRun);
runScript("./gen_Backend_Domain_Validators.ts", dryRun);
runScript("./gen_Backend_Domain_Services.ts", dryRun);
runScript("./gen_Backend_Domain_Controllers.ts", dryRun);
runScript("./gen_Backend_Domain_Routes.ts", dryRun);
runScript("./gen_Backend_Domain_Errors.ts", dryRun);
runScript("./clean_Backend_Subdomains_Without_Types.ts", dryRun);
```

### Edit runFrontendAll.ts
Uncomment these lines:
```typescript
"./scaffold_Frontend_Domains_From_Backend.ts",
"./generate_Frontend_Domain_Types.ts",
"./generate_Frontend_Domain_Validators.ts",
"./generate_Frontend_Domain_Errors.ts",
"./generate_Frontend_Stack.ts",
"./generate_Frontend_Components_For_Domains.ts",
```

### Run Generators
```bash
pnpm ts-node-esm scripts/runBackendAll.ts
pnpm ts-node-esm scripts/runFrontendAll.ts
```

### Restore Custom Files (If Needed)
```bash
# Restore custom enquiries if you want to keep them
xcopy /E /I /Y backend\src\domains\admissions\enquiries.backup backend\src\domains\admissions\enquiries
xcopy /E /I /Y frontend\src\domains\admissions\enquiries.backup frontend\src\domains\admissions\enquiries
```

---

## 📊 API Endpoints

### Main Enquiries
```
GET    /admissions/enquiries              - List all enquiries
GET    /admissions/enquiries/:id          - Get enquiry by ID
POST   /admissions/enquiries              - Create enquiry
PUT    /admissions/enquiries/:id          - Update enquiry
DELETE /admissions/enquiries/:id          - Delete enquiry
GET    /admissions/enquiries/statistics   - Get statistics
POST   /admissions/enquiries/:id/assign   - Assign to staff
POST   /admissions/enquiries/:id/status   - Update status
POST   /admissions/enquiries/:id/convert  - Convert to student
```

### Enquiry Types
```
GET    /admissions/enquiries/types        - List types
POST   /admissions/enquiries/types        - Create type
PUT    /admissions/enquiries/types/:id    - Update type
DELETE /admissions/enquiries/types/:id    - Delete type
```

### Enquiry Sources
```
GET    /admissions/enquiries/sources      - List sources
POST   /admissions/enquiries/sources      - Create source
PUT    /admissions/enquiries/sources/:id  - Update source
DELETE /admissions/enquiries/sources/:id  - Delete source
```

### Enquiry Notes
```
GET    /admissions/enquiries/:enquiryId/notes     - List notes
POST   /admissions/enquiries/:enquiryId/notes     - Add note
PUT    /admissions/enquiries/notes/:id            - Update note
DELETE /admissions/enquiries/notes/:id            - Delete note
```

---

## 🎯 Default Data

### Enquiry Types (8)
1. Academic Enquiry (Blue)
2. Admission Enquiry (Green)
3. Fee Enquiry (Orange)
4. Transport Enquiry (Purple)
5. Boarding Enquiry (Pink)
6. General Enquiry (Gray)
7. Complaint (Red)
8. Suggestion (Teal)

### Enquiry Sources (8)
1. Website
2. Phone Call
3. Walk-in
4. Email
5. Social Media
6. Referral
7. Education Fair
8. Advertisement

---

## 🔐 Permissions

Add these permissions to roles that need enquiry access:

```
admissions:enquiries:read       - View enquiries
admissions:enquiries:manage     - Full access to enquiries
admissions:enquiry_types:read   - View enquiry types
admissions:enquiry_types:manage - Manage enquiry types
admissions:enquiry_sources:read - View enquiry sources
admissions:enquiry_sources:manage - Manage enquiry sources
```

---

## 📝 Troubleshooting

### Issue: Generators Overwrite Custom Files
**Solution:** Use the updated `runBackendAll.ts` and `runFrontendAll.ts` scripts (already done)

### Issue: Database Tables Missing
**Solution:** Run the migration: `migrations/0006_enquiries.sql`

### Issue: Seed Data Not Loading
**Solution:** Run: `migrations/99999_enquiries_seed.sql`

### Issue: Frontend Can't Find Enquiries Page
**Solution:** 
1. Check route is registered in router
2. Verify `frontend/src/domains/admissions/index.tsx` exports Enquiries
3. Restart frontend dev server

### Issue: Backend 404 on /admissions/enquiries
**Solution:**
1. Check `backend/src/domains/admissions/index.ts` includes enquiries
2. Verify registry includes enquiries domain
3. Restart backend dev server

---

## 📚 Additional Resources

- **Full Implementation Guide:** `ENQUIRIES_IMPLEMENTATION.md`
- **Database Schema:** `migrations/0006_enquiries.sql`
- **Seed Data:** `migrations/99999_enquiries_seed.sql`

---

## ✅ Checklist for New Custom Domains

When creating future custom domains that should NOT be auto-generated:

1. ✅ Create domain structure manually
2. ✅ Add to `SKIP_DOMAINS` in generator scripts (or comment out in run*All.ts)
3. ✅ Register in backend registry (`backend/src/registry/index.ts`)
4. ✅ Add to domain index (`backend/src/domains/*/index.ts`)
5. ✅ Create frontend components
6. ✅ Add to frontend domain index
7. ✅ Run migrations
8. ✅ Test API endpoints
9. ✅ Test frontend UI

---

**Last Updated:** 2026-03-25
**Version:** 1.0.0
