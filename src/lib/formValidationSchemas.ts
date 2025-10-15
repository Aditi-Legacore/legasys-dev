import { z } from "zod";

export const intakeFormSchema = z.object({
  // Step 1 - Plaintiff Info
  clientName: z.string().min(1, "Client name is required"),
  gender: z.enum(["Male", "Female"]).refine((val) => val !== undefined, { message: "Gender is required" }),
  dob: z.string().optional(),
  phone: z.string().min(10, "Enter a valid phone number"),
  email: z.string().email("Invalid email address"),
  address: z.string().optional(),
  city: z.string().optional(),
  zip: z.string().optional(),

  // Step 2 - Accident Info
  accidentDate: z.string().min(1, "Accident date required"),
  accidentTime: z.string().optional(),
  caseType: z.string().optional(),
  policeCase: z.string().optional(),
  accidentLocation: z.string().min(1, "Accident location required"),
  seatBelt: z.string().optional(),
  seatBeltReason: z.string().optional(),
  accidentDescription: z.string().min(10, "Description required"),

  // Step 3 - Defendant Information (optional)
  defendant1Name: z.string().optional(),
  defendant1Phone: z.string().optional(),
  defendant1Address: z.string().optional(),
  defendant1Carrier: z.string().optional(),
  defendant1CarrierPhone: z.string().optional(),
  defendant1Policy: z.string().optional(),
  defendant1Claim: z.string().optional(),
  defendant1Adjuster: z.string().optional(),
  defendant1Insured: z.string().optional(),
  defendant1Year: z.string().optional(),
  defendant1Make: z.string().optional(),
  defendant1Model: z.string().optional(),
  defendant1Damage: z.string().optional(),
  defendant2Name: z.string().optional(),
  defendant2Phone: z.string().optional(),
  defendant2Address: z.string().optional(),
  defendant2Carrier: z.string().optional(),
  defendant2CarrierPhone: z.string().optional(),
  defendant2Policy: z.string().optional(),
  defendant2Claim: z.string().optional(),
  defendant2Adjuster: z.string().optional(),
  defendant2Insured: z.string().optional(),
  defendant2Year: z.string().optional(),
  defendant2Make: z.string().optional(),
  defendant2Model: z.string().optional(),
  defendant2Damage: z.string().optional(),

  // Step 4 - Client Automobile & Health Insurance
  autoName: z.string().optional(),
  autoPhone: z.string().optional(),
  autoAddress: z.string().optional(),
  autoCarrier: z.string().optional(),
  autoAgent: z.string().optional(),
  autoPolicy: z.string().optional(),
  autoClaim: z.string().optional(),
  autoAdjuster: z.string().optional(),
  autoInsured: z.string().optional(),

  healthCarrier: z.string().optional(),
  healthPhone: z.string().optional(),
  healthType: z.string().optional(),
  healthAddress: z.string().optional(),
  healthGroup: z.string().optional(),
  healthPolicy: z.string().optional(),
  medicare:z.string().optional(),
  medicareNumber: z.string().optional(),
  medicaid:z.string().optional(),
  medicaidNumber: z.string().optional(),

  // Step 5 - Medical Treatment
  ambulance: z.string().optional(),
  admitted: z.string().optional(),
  ambulanceCompany: z.string().optional(),
  lengthOfStay: z.string().optional(),

  doctorHospital1: z.string().min(1, "Doctor/Hospital name is required"),
  address1: z.string().optional(),
  phone1: z.string().optional(),
  treatmentDate1: z.string().optional(),

  doctorHospital2: z.string().optional(),
  address2: z.string().optional(),
  phone2: z.string().optional(),
  treatmentDate2: z.string().optional(),

  doctorHospital3: z.string().optional(),
  address3: z.string().optional(),
  phone3: z.string().optional(),
  treatmentDate3: z.string().optional(),

  // Step 6 - Injuries
  bodyPartsAffected: z.string().min(1, "Please describe affected body parts"),
  priorInjuries: z.string().optional(),
  priorInsuranceClaims: z.string().optional(),
  priorAttorneys: z.string().optional(),
});

export type IntakeFormData = z.infer<typeof intakeFormSchema>;

