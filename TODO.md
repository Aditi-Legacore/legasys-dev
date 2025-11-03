# Leads Implementation Plan

## Information Gathered
- QuickIntakeForm has fields: fullName, phone, email, dateOfLoss, caseType, description, referralSource
- Prisma schema pulled from DB, has IntakeInfo/IntakeSession but no Lead model
- Lead type: id, dueDate, name, caseType, status, contact, phone, matter
- Leads page uses hardcoded data
- LeadsTable displays leads
- Intake API example exists

## Plan
1. ✅ Add Lead model to prisma/schema.prisma
   - Map form fields: fullName->name, email->contact, phone->phone, caseType->caseType
   - Add description, referralSource fields
   - Set dueDate to dateOfLoss, status default "new", matter default "-"

2. ✅ Create src/app/api/leads/route.ts
   - POST: Create new lead from form data
   - GET: Fetch all leads

3. ✅ Update QuickIntakeForm.tsx
   - Change onSubmit to POST to /api/leads
   - Handle success/error responses

4. ✅ Update src/app/leads/page.tsx
   - Replace hardcoded leadsData with API fetch
   - Add loading state

5. ✅ Update src/types/leads.ts if needed
   - Add description, referralSource to Lead interface

6. ✅ Run Prisma migration and generate

## Dependent Files
- prisma/schema.prisma
- src/app/api/leads/route.ts (new)
- src/components/forms/QuickIntakeForm.tsx
- src/app/leads/page.tsx
- src/types/leads.ts

## Followup Steps
- ✅ Run `npx prisma migrate dev --name add_lead_model`
- ✅ Run `npx prisma generate`
- Test form submission
- Test leads display
