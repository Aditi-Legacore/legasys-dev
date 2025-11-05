<<<<<<< HEAD
- [x] Modify buildIntakeData function to include LeadId if present in data
- [x] In POST handler, before creating intake, query Lead by referenceId and set data.LeadId
- [x] Ensure intake creation/update uses the LeadId for association
=======
# TODO: Add Date Range Filter to Reports Page

## Steps to Complete
- [x] Update src/app/reports/page.tsx to add state for FilterSidebar (showFiltersSidebar, dateFromFilter, dateToFilter, etc.)
- [x] Add onMoreFilters prop to FilterBar in reports page
- [x] Import and add FilterSidebar component to reports page
- [x] Implement resetFilters function
- [x] Hide case type and referral source filters in reports page
- [ ] Add filtering logic for summarizedReports based on date range (note: current data is static, may need to add date fields or make data dynamic)
- [ ] Test the filter functionality
>>>>>>> 99d03f31caea4658f9052d3f9f59709b633422cc
