import { z } from "zod";

export const intakeFormSchema = z.object({
  // Step 1 - Plaintiff Info
  clientName: z.string().min(1, "Client name is required"),
//   gender: z.enum(["Male", "Female"], { required_error: "Gender is required" }),
  gender: z.enum(["Male", "Female"])
  .refine((val) => val !== undefined, { message: "Gender is required" }),
  dob: z.string().min(1, "Date of birth is required"),
  phone: z.string().min(10, "Enter a valid phone number"),
  email: z.string().email("Invalid email address"),
  address: z.string().min(1, "Address required"),
  city: z.string().min(1, "City required"),
  zip: z.string().min(1, "Zip required"),

  // Step 2 - Accident Info
  accidentDate: z.string().min(1, "Accident date required"),
  accidentTime: z.string().min(1, "Accident time required"),
  caseType: z.enum(["Auto Accident", "Slip & Fall", "Other"]).optional().refine(Boolean, { message: "Case type is required" }),
  policeCase: z.string().optional(),
  accidentLocation: z.string().min(1, "Accident location required"),
  seatBelt: z.enum(["Yes", "No"]).optional().refine(Boolean, { message: "Seat belt selection is required" }),
  seatBeltReason: z.string().optional(),
  accidentDescription: z.string().min(10, "Description required"),
  autoInsurance: z.string().min(1, "Auto insurance required"),
  healthInsurance: z.string().optional(),

  // Step 3 - Defendant Information (already optional in your UI, so not mandatory)
  // Add fields here if needed.

  // Step 4 - Client Automobile & Health Insurance
  autoName: z.string().min(1, "Auto Name is required"),
  autoPhone: z.string().min(1, "Auto Phone is required"),
  autoAddress: z.string().min(1, "Auto Address is required"),
  autoCarrier: z.string().min(1, "Carrier is required"),
  autoAgent: z.string().min(1, "Agent is required"),
  autoPolicy: z.string().min(1, "Policy # is required"),
  autoClaim: z.string().min(1, "Claim # is required"),
  autoAdjuster: z.string().min(1, "Adjuster is required"),
  autoInsured: z.string().min(1, "Insured name is required"),

  healthCarrier: z.string().min(1, "Health carrier is required"),
  healthPhone: z.string().min(1, "Health phone # is required"),
  healthType: z.string().min(1, "Health insurance type is required"),
  healthAddress: z.string().min(1, "Health address is required"),
  healthGroup: z.string().min(1, "Group # is required"),
  healthPolicy: z.string().min(1, "Policy # is required"),
  medicare: z.enum(["Yes", "No"]).optional(),
  medicareNumber: z.string().optional(),
  medicaid: z.enum(["Yes", "No"]).optional(),
  medicaidNumber: z.string().optional(),

  // Step 5 - Medical Treatment
  ambulance: z.enum(["Yes", "No"]).optional().refine(Boolean, { message: "Ambulance selection required" }),
  admitted: z.enum(["Yes", "No"]).optional().refine(Boolean, { message: "Admitted selection required" }),
  ambulanceCompany: z.string().optional(),
 
  lengthOfStay: z.string().optional(),

  doctorHospital1: z.string().min(1, "Doctor/Hospital name is required"),
  address1: z.string().min(1, "Address is required"),
  phone1: z.string().min(1, "Phone number is required"),
  treatmentDate1: z.string().min(1, "Treatment date is required"),

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

  // already existing
  doctorHospital: z.string().min(1, "Doctor/Hospital required"),
  injuries: z.string().min(1, "Please describe injuries"),
});

export type IntakeFormData = z.infer<typeof intakeFormSchema>;

