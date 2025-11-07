# Standardize Tables Across Pages

## Overview
Standardize all table components and usages to ensure consistent appearance, styling, and behavior across the application.

## Current State Analysis
- Multiple table implementations: shadcn Table components, custom tables, ReportTable, IntakeTable, etc.
- Inconsistent wrapper styles: Card, div with bg-white rounded-lg, border rounded-lg
- Different header backgrounds: bg-muted/50, bg-gray-100, bg-gray-50
- Inconsistent hover effects and borders
- Mixed use of plain <table> vs shadcn components

## Standardization Plan

### 1. Update Table Components
- [ ] Update ReportTable.tsx to use shadcn Table components
- [ ] Update IntakeTable.tsx to use shadcn Table components
- [ ] Update LeadsTable.tsx to use shadcn Table components
- [ ] Update DocumentsTable.tsx to use shadcn Table components

### 2. Consistent Wrapper Styling
- [ ] Use Card component as wrapper for all tables
- [ ] Ensure consistent Card styling across pages

### 3. Consistent Table Styling
- [ ] Use bg-muted/50 for table headers
- [ ] Use hover:bg-muted/20 for table rows
- [ ] Use consistent border and divide classes
- [ ] Ensure responsive design

### 4. Update Page Implementations
- [ ] Ensure all pages use the updated table components
- [ ] Remove inline table styling from pages
- [ ] Standardize pagination and loading states

### 5. Testing
- [ ] Test all table functionalities after changes
- [ ] Ensure dark mode compatibility
- [ ] Verify responsive behavior

## Files to Modify
- src/components/table/ReportTable.tsx
- src/components/table/IntakeTable.tsx
- src/components/table/LeadsTable.tsx
- src/components/table/DocumentsTable.tsx
- src/app/stages/page.tsx (uses inline table)
- Ensure all page components use consistent Card wrappers
