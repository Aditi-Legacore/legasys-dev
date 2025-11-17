# TODO: Implement Draft Choice in NewIntakeModal

## Tasks
- [x] Add a new mode "choice" to the state in NewIntakeModal.tsx
- [x] Modify handleEmailSubmit to set mode to "choice" when draft exists
- [x] Add UI for "choice" mode with "Continue with Draft" and "Create New" buttons
- [x] Update button handlers to transition modes accordingly
- [x] Adjust back buttons in other modes to handle the new flow
- [x] Test the modal flow to ensure correct behavior

## Information Gathered
- NewIntakeModal.tsx is the main component handling the intake modal.
- Currently, if a draft exists for the email, it directly sends OTP and switches to "otp" mode.
- If no draft, it switches to "new" mode with QuickIntakeForm.
- The change requires adding a choice step when draft is found: ask user to continue with draft or create new.
- If continue, send OTP; if new, render new form.

## Plan
- Introduce a new state mode: "choice".
- In handleEmailSubmit, if draft exists, set mode to "choice" instead of sending OTP immediately.
- In "choice" mode, display a message and two buttons: "Continue with Draft" (calls a new function to send OTP and set mode to "otp") and "Create New" (sets mode to "new").
- Ensure back buttons in "otp" and "new" modes go back to "choice" or "email" appropriately.
- No other files need changes as the logic is contained within this component.

## Dependent Files to be edited
- src/components/NewIntakeModal.tsx

## Followup steps
- [x] After implementation, test the modal by entering an email with an existing draft and verify the choice appears.
- [x] Test both options: continuing with draft (should send OTP and proceed) and creating new (should show QuickIntakeForm).
- [x] Ensure error handling and loading states work correctly.
