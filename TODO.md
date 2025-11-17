# Intake Flow Modification Tasks

## Completed Tasks
- [x] Analyze current intake modal and related components
- [x] Understand check-draft API and email system
- [x] Create comprehensive plan for OTP-based intake flow
- [x] Add OTP model to Prisma schema
- [x] Run Prisma migration for OTP model
- [x] Update email.ts to add OTP email sending function
- [x] Create /api/send-otp API endpoint
- [x] Create /api/verify-otp API endpoint
- [x] Modify NewIntakeModal.tsx to implement new email-based flow with OTP verification

## Pending Tasks
- [ ] Test the new intake flow (email input, draft check, OTP send/verify, form rendering)
- [ ] Ensure OTP expiration (10 minutes) and cleanup
