# TODO: Make Search Bar and Filters Functional in Documents Page

## Steps to Complete

- [x] Add state variables for additional filters (caseTypeFilter, dateFromFilter, dateToFilter) in documents/page.tsx
- [x] Import and add FilterSidebar component to documents/page.tsx
- [x] Add onMoreFilters prop to FilterBar to open the sidebar
- [x] Compute unique case types from documents data for filter options
- [x] Update filteredDocuments useMemo to include filtering by case type, date range, and status
- [x] Add resetFilters function and integrate with FilterSidebar
- [x] Ensure pagination resets on filter changes (if needed, but currently no pagination)
- [x] Test the functionality by running the app and verifying search and filters work
- [x] Fix DocumentsTable to update when filtered documents change
