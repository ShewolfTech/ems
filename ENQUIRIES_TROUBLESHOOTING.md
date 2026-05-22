# Enquiries - Troubleshooting & Testing

## Issue: Can't See Enquiries Page

### Possible Causes & Solutions

### 1. **Database Not Migrated**
**Problem:** Tables don't exist yet.

**Solution:**
```bash
psql -U your_username -d your_database -f migrations/0006_enquiries.sql
psql -U your_username -d your_database -f migrations/99999_enquiries_seed.sql
```

### 2. **Backend Not Running**
**Problem:** API endpoints not accessible.

**Solution:**
```bash
cd backend
pnpm dev
```
Check: `http://localhost:3000/health` or similar health endpoint.

### 3. **Missing Permissions**
**Problem:** User doesn't have `enquiries` permission.

**Solution:** Grant permissions to your role:
```sql
-- Find your role ID (example for admin role)
SELECT id, name FROM roles WHERE name ILIKE '%admin%';

-- Add permissions (replace ROLE_ID with actual ID)
INSERT INTO role_permissions (role_id, resource, action, is_allowed)
VALUES 
  (ROLE_ID, 'enquiries', 'read', true),
  (ROLE_ID, 'enquiries', 'manage', true),
  (ROLE_ID, 'enquiry_types', 'read', true),
  (ROLE_ID, 'enquiry_sources', 'read', true)
ON CONFLICT DO NOTHING;
```

### 4. **Frontend Not Showing in Sidebar**
**Problem:** Enquiries not appearing in navigation.

**Cause:** Sidebar is permission-based. If you don't have the permission, it won't show.

**Quick Test:** Navigate directly to:
```
http://localhost:5173/admissions/enquiries
```

If the page loads but isn't in sidebar → Permission issue
If page shows 404 → Route not registered or backend issue

### 5. **API 404 Error**
**Problem:** `/admissions/enquiries` returns 404.

**Solution:** Check backend domain registration:
- `backend/src/domains/admissions/index.ts` should include enquiries
- `backend/src/registry/index.ts` should have enquiries registered

### 6. **Console Errors**
**Check Browser Console (F12)** for:
- Network errors → Backend not running
- Permission errors → Need to grant access
- Import errors → Frontend build issue

---

## Manual Testing Steps

### Step 1: Verify Backend
```bash
# Test API directly
curl http://localhost:3000/admissions/enquiries/permissions-meta
```

Expected response:
```json
{
  "success": true,
  "permissions_meta": [...]
}
```

### Step 2: Verify Frontend Route
1. Login to the application
2. Open browser console (F12)
3. Navigate to: `http://localhost:5173/admissions/enquiries`
4. Check console for errors

### Step 3: Check Permissions
```javascript
// In browser console (while logged in)
// Check if enquiries capability exists
console.log(window.__AUTH_CONTEXT__?.capabilities?.enquiries);
// or however your auth context is exposed
```

### Step 4: Create Test Enquiry via API
```bash
curl -X POST http://localhost:3000/admissions/enquiries \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "subject": "Test Enquiry",
    "description": "Testing the enquiries system",
    "enquirer_name": "Test User",
    "enquirer_email": "test@example.com",
    "enquirer_phone": "+256700000000",
    "enquirer_type": "external",
    "status": "new",
    "priority": "medium"
  }'
```

---

## Quick Fix Script

Run this to verify everything:

```bash
#!/bin/bash
echo "=== Enquiries System Check ==="

echo "1. Checking database tables..."
psql -U postgres -d ems -c "\dt enquiries" || echo "❌ Tables missing!"

echo "2. Checking backend..."
curl -s http://localhost:3000/admissions/enquiries/permissions-meta > /dev/null && echo "✅ Backend OK" || echo "❌ Backend not running"

echo "3. Checking frontend files..."
test -f frontend/src/components/domains/admissions/enquiries/EnquiriesPage.tsx && echo "✅ Frontend components exist" || echo "❌ Frontend files missing"

echo "4. Checking registry..."
grep -q "enquiries" backend/src/registry/index.ts && echo "✅ Backend registry OK" || echo "❌ Registry missing"
grep -q "enquiries" frontend/src/app/routes/RouteRegistry.ts && echo "✅ Frontend registry OK" || echo "❌ Registry missing"

echo "=== Check Complete ==="
```

---

## Common Error Messages

### "Route not found"
→ Backend server not running or domain not registered

### "Unauthorized" or "Forbidden"
→ Login issue or missing permissions

### "Table 'enquiries' does not exist"
→ Migration not run

### "Cannot read property 'hasPage' of undefined"
→ Permissions not loaded, refresh page or re-login

### Blank page / Infinite loading
→ API error, check browser console network tab

---

## Contact Support

If none of these solutions work:
1. Check logs: `backend/logs/` and browser console
2. Verify all files exist in `backend/src/domains/admissions/enquiries/`
3. Verify all files exist in `frontend/src/domains/admissions/enquiries/`
4. Try clearing browser cache and hard refresh (Ctrl+Shift+R)
5. Restart both backend and frontend dev servers
