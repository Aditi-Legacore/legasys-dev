# TODO: Separate APIs for Embedded Form and Restore Auth

## Step 1: Restore Auth to Existing APIs
- [x] Add session check to `/api/intake/route.ts` POST method
- [x] Restore auth check to `/api/intake/[id]/documents/route.ts` POST method

## Step 2: Create New Embed APIs (No Auth)
- [x] Create `/api/embed/intake/route.ts` (POST) - copy from intake/route.ts without auth
- [x] Create `/api/embed/draft/route.ts` (GET/POST) - copy from intake/draft/route.ts without auth
- [x] Create `/api/embed/documents/route.ts` (POST) - copy from intake/[id]/documents/route.ts without auth
- [x] Create `/api/embed/check-draft/route.ts` (POST) - copy from check-draft/route.ts
- [x] Create `/api/embed/reference/[referenceId]/route.ts` (GET) - copy from intake/reference/[referenceId]/route.ts without auth
- [x] Create `/api/embed/leads/route.ts` (GET) - copy from leads/route.ts without auth

## Step 3: Update Embedded Form
- [ ] Modify `IntakeForm.tsx` to detect embedded context and call embed APIs instead of regular ones

## Step 4: Testing
- [ ] Test embedded form functionality
- [ ] Verify regular form still works with auth
