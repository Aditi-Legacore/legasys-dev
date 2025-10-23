# TODO: Fix Draft Saving Error in IntakeForm.tsx

- [x] Update handleSaveDraft to check if referenceId is null and show error toast if so
- [x] Modify handleSaveDraft to use methods.getValues() for current form data instead of stale formData
- [x] Improve error handling: log response status and text, and provide specific error messages
