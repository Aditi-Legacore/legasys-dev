# Standardize Tables Across Pages

## Overview
Standardize all table components and usages to ensure consistent appearance, styling, and behavior across the application, keeping styling similar to LeadsTable.

## Current State Analysis
- Multiple table implementations: shadcn Table components, custom tables.
- Inconsistent wrapper styles: Some use Card, some don't.
- Different header backgrounds: bg-muted/50 (LeadsTable), bg-gray-50, bg-gray-100.
- Inconsistent hover effects: hover:bg-primary-light/50 (LeadsTable), hover:bg-gray-50.
- Mixed use of shadcn vs custom tables.

## Standardization Plan

### 1. Fix JSX Parsing Error in IntakeTable.tsx
- [ ] Fix JSX parsing error around line 257 in IntakeTable.tsx

### 2. Update Table Components
- [ ] Update DocumentsTable.tsx: Add Card wrapper, change header bg to bg-muted/50, hover to hover:bg-primary-light/50
- [ ] Update stages/page.tsx: Change header bg to bg-muted/50, hover to hover:bg-primary-light/50
- [ ] Update forms/page.tsx: Convert from shadcn Table to custom HTML table with Card wrapper, bg-muted/50 header, hover:bg-primary-light/50 rows
- [ ] Update form-templates/page.tsx: Convert from shadcn Table to custom HTML table with Card wrapper, bg-muted/50 header, hover:bg-primary-light/50 rows

### 3. Consistent Styling
- [ ] Use Card component as wrapper for all tables
- [ ] Use bg-muted/50 for table headers
- [ ] Use hover:bg-primary-light/50 for table rows
- [ ] Ensure dark mode compatibility
- [ ] Consistent border and divide classes

### 4. Testing
- [ ] Test all table functionalities after changes
- [ ] Ensure dark mode compatibility
- [ ] Verify responsive behavior

## Files to Modify
- src/components/table/IntakeTable.tsx
- src/components/table/DocumentsTable.tsx
- src/app/stages/page.tsx
- src/app/forms/page.tsx
- src/app/form-templates/page.tsx
