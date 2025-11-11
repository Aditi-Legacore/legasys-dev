# Task: Include intakeInfo table in GET() to fetch ClientName and add "Uploaded by" column in DocumentsTab.tsx

## Steps to Complete

1. **Update API GET() in route.ts**
   - Modify the Prisma query to include the intake relation with clientName in the select.

2. **Update Document interface in DocumentsTab.tsx**
   - Add `uploadedBy: string;` to the Document interface.

3. **Update parent component (page.tsx)**
   - In `fetchDocuments`, map the API response to include `uploadedBy: doc.intake.clientName`.

4. **Add "Uploaded by" column to the table in DocumentsTab.tsx**
   - Add the column header and body cell in the Table component.

5. **Test the changes**
   - Verify the API returns clientName.
   - Check the table displays the new column correctly.
   - Ensure no TypeScript errors.
