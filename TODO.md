# TODO: Implement Tab-Specific API Calls in Intake Preview

- [x] Add state for activeTab with default "information"
- [x] Add onValueChange to Tabs component to update activeTab
- [x] Remove fetchNotes, fetchActivityLogs, fetchDocuments from initial useEffect on id
- [x] Add new useEffect that calls appropriate fetch function based on activeTab and id
- [ ] Test tab switching to verify APIs are called only on tab change
