<<<<<<< HEAD
# TODO: Enhance Reports Page with Dynamic Data and Filtering

## Steps to Complete

- [ ] Add state variables for loading, error, and dynamic data arrays (intakesData, leadsData, documentsData) in reports/page.tsx
- [ ] Implement useEffect to fetch data from /api/intake, /api/leads, /api/documents on mount and activeTab change
- [ ] Add data aggregation logic: Compute summaries for each tab (total counts, status breakdowns, case type distributions)
- [ ] Update filtering logic with useMemo: Filter by searchQuery (name/clientName), filterValue (status/time), sidebar filters (dateFrom/dateTo, caseType)
- [ ] Adjust ReportTable columns and data props based on activeTab (e.g., intakes: ["Client Name", "Status", "Case Type", "Created Date"])
- [ ] Add loading states (spinner) and error handling (error message display)
- [ ] Update FilterSidebar props for caseType and referralSource based on activeTab
- [ ] Test the functionality by running the app and verifying dynamic data, filtering, and search work across all tabs
- [ ] Ensure ReportTable handles new data structures correctly (minor updates if needed)
=======
- [x] Modify buildIntakeData function to include LeadId if present in data
- [x] In POST handler, before creating intake, query Lead by referenceId and set data.LeadId
- [x] Ensure intake creation/update uses the LeadId for association
>>>>>>> 6cfa0ef0921c0a9e72a8fa9f620e189bc9a549b7
