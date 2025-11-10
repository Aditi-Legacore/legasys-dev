<<<<<<< HEAD
<<<<<<< HEAD
# TODO: Implement Sliding Plaintiff Info Card

## Overview
Modify the mobile "Plaintiff Info" button functionality in NotesTab, ActivityLogTab, and DocumentsTab to slide a card from the right side with half screen size, smooth animation, and a close button.

## Tasks
- [x] Update NotesTab.tsx: Change mobile card to slide from right, half screen width, add smooth transition animation
- [x] Update ActivityLogTab.tsx: Change mobile card to slide from right, half screen width, add smooth transition animation
- [x] Update DocumentsTab.tsx: Change mobile card to slide from right, half screen width, add smooth transition animation

## Details
- Current: Centered modal on mobile
- Target: Sliding card from right, 50% screen width, smooth animation, close button (already present)
- Animation: Use CSS transform and transition for smooth slide in/out
- Files to edit: src/components/intake-preview/NotesTab.tsx, src/components/intake-preview/ActivityLogTab.tsx, src/components/intake-preview/DocumentsTab.tsx
=======
- [ ] Modify GET /api/leads to accept referenceId query param and return single lead if provided
- [ ] Update IntakeForm to fetch lead data if no draft exists and populate form fields
- [ ] Test the flow from QuickIntakeForm to IntakeForm to ensure data is populated
>>>>>>> 6a4b2b0865722b198ad509304c44eff279989328
=======
# TODO: Update Intake Preview Page to Match DB Fields and Add Activity Log Sidebar

## 1. Update actualIntake Object
- Add city, zip to contact info.
- Add accidentTime, ambulance, ambulanceCompany, admitted, lengthOfStay to incident details.
- Add fields for medical treatment (doctorHospital1/2/3, addresses, phones, treatmentDates).
- Add defendant1 and defendant2 fields.
- Add plaintiff auto insurance fields.
- Add health insurance fields.
- Add prior history fields.
- Remove non-DB fields from insurance section.

## 2. Update Contact Information Card
- Add city and zip fields.

## 3. Update Incident Details Card
- Add accident time, ambulance details, admission status, length of stay.

## 4. Add Medical Treatment Card
- Display doctor/hospital 1,2,3 with addresses, phones, treatment dates.

## 5. Add Defendant Information Card
- Display defendant 1 and 2 details (name, address, carrier, policy, vehicle info).

## 6. Add Plaintiff Auto Insurance Card
- Display plaintiff's own auto insurance details.

## 7. Add Health Insurance Card
- Display health insurance details.

## 8. Add Prior History Card
- Display prior injuries, claims, attorneys.

## 9. Update Insurance & Legal Information Card
- Remove estimated damages, police report number, witnesses, police report filed.
- Keep insurance company and policy number.

## 10. Change Layout to Include Sidebar
- Wrap main content in grid: 2/3 for content, 1/3 for sidebar.

## 11. Add Activity Log Quick View Sidebar
- Display last 5 activity logs with short description, created at, created by.
- Add "View All" link to switch to activity tab.

## 12. Test Changes
- Verify all fields render correctly.
- Check sidebar displays activity logs.
- Ensure responsive design.
>>>>>>> satya-merge-v3
