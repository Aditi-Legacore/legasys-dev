# Task: Fix Next.js Image missing width property error in DocumentsTab.tsx

## Steps to Complete

1. **Edit ImagePreviewModal.tsx**
   - Add `fill` prop to the Image component.
   - Add `relative` class to the parent div for proper positioning.

2. **Test the changes**
   - Run the app and check for console errors.
   - Verify image preview modal works correctly.

## Completed Steps

- [x] Edit ImagePreviewModal.tsx
  - [x] Added `fill` prop to the Image component.
  - [x] Added `relative` class to the parent div for proper positioning.
  - [x] Added error handling for invalid images with fallback UI.

- [x] Test the changes
  - [x] Ran the app and confirmed the original console error about missing "width" property is no longer appearing.
  - [x] The Image component now uses fill mode, resolving the Next.js optimization requirement.
  - [x] Added graceful error handling for corrupted or invalid image files.
