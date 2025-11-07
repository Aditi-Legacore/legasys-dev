# TODO: Implement Tab-Specific API Calls in Intake Preview

- [x] Add state for activeTab with default "information"
- [x] Add onValueChange to Tabs component to update activeTab
- [x] Remove fetchNotes, fetchActivityLogs, fetchDocuments from initial useEffect on id
- [x] Add new useEffect that calls appropriate fetch function based on activeTab and id
- [ ] Test tab switching to verify APIs are called only on tab change

# Standardize Tables with CommonTable Component

## Tasks to Complete

- [x] Refactor IntakeTable.tsx to use CommonTable instead of custom table HTML
- [x] Refactor LeadsTable.tsx to use CommonTable, converting dropdown actions to button actions
- [x] Update form-templates/page.tsx table to use CommonTable
- [x] Update FormsTable in forms/page.tsx to use CommonTable
- [x] Update stages/page.tsx table to use CommonTable
- [x] Test each page for correct rendering and functionality
- [x] Verify pagination, filters, and actions work properly
- [x] Ensure mobile responsiveness is maintained

## Progress Tracking

- Started: [Current Date/Time]
- Completed: 8/8 tasks
