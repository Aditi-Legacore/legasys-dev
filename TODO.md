# TODO: Fix "Failed to save intake info" Error

## Steps to Complete
- [x] Update prisma/schema.prisma to add missing fields from form schema (e.g., ssn, passenger, autoClaim, medicare, priorDoctorHospital, currentTreatment, hearAboutUs, bodyPartsAffected, etc.)
- [x] Update src/app/api/intake/route.ts to correctly map form data to database fields (fix field name mismatches like defendant1Phone vs defendant1CarrierPhone)
- [x] Add missing fields to form components (e.g., add bodyPartsAffected to MedicalTreatmentStep, add phone fields to DefendantInfoStep)
- [x] Run prisma generate and migrate to apply schema changes
- [x] Test the form submission to ensure no more errors
