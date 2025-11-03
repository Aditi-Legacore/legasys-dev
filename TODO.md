# Consolidation of IntakeSession into Lead Model

## Overview
Consolidate IntakeSession functionality into Lead model, remove IntakeSession entirely, and move resend email logic to reuse existing sendmail functionality.

## Completed Tasks
- [x] Update Prisma schema: Add referenceId and dateOfBirth to Lead, remove IntakeSession
- [x] Generate and run migration

## Completed Tasks
- [x] Update QuickIntakeForm to set referenceId and dateOfBirth on Lead
- [x] Modify /api/session to create/update Lead instead of IntakeSession
- [x] Update /api/session/validate to query Lead
- [x] Update /api/intake/draft to work with Lead
- [x] Remove IntakeSession deletion from /api/intake
- [x] Update LeadsTable to use existing sendIntakeReferenceEmail and lead.referenceId
- [x] Update types and any other references

## Pending Tasks
- [ ] Test the changes
