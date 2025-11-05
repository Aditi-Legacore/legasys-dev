# TODO: Add Step 7 Document Upload to IntakeForm

## Approved Plan Breakdown
1. Update the `steps` array to include "DOCUMENT UPLOAD" as the 7th step.
2. Add an empty array to `stepFields` for step 7 (no validation needed).
3. Modify `renderStep` to return `<IntakeDocuments submittedIntakeId={submittedIntakeId} />` for case 6.
4. In `onSubmit`, after successful submission, set `setStep(6)` to navigate to step 7.
5. Change the "Next" button on step 5 (Submit) to "Submit" and call `handleFinalSubmit`.
6. Remove the conditional rendering of IntakeDocuments outside the form; integrate it into the step flow.
7. Ensure `submittedIntakeId` is available for the upload and update step indicators accordingly.

## Progress Tracking
- [x] Step 1: Update steps array
- [x] Step 2: Update stepFields array
- [x] Step 3: Modify renderStep for case 6
- [x] Step 4: Update onSubmit to setStep(6) after submission
- [x] Step 5: Adjust button logic for Submit step
- [x] Step 6: Remove conditional IntakeDocuments rendering
- [x] Step 7: Verify integration and test flow
