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
  ssn: z.string().optional(),

  // Step 2 - Accident Info
  accidentDate: z.string().min(1, "Accident date required"),
  accidentTime: z.string().optional(),
  accidentLocation: z.string().min(1, "Accident location required"),
  accidentDescription: z.string().min(10, "Description required"),
  passenger: z.enum(["Yes", "No"]).optional(),
  passengerName: z.string().optional(),
  workAtAccident: z.string().optional(),

  // Step 3 - Defendant Information (optional)
  defendant1Name: z.string().optional(),
  defendant1Address: z.string().optional(),
  defendant1Carrier: z.string().optional(),
  defendant1CarrierPhone: z.string().optional(),
  defendant1Policy: z.string().optional(),
  defendant1Year: z.string().optional(),
  defendant1Make: z.string().optional(),
  defendant1Model: z.string().optional(),
  defendant1Damage: z.string().optional(),
  defendant2Name: z.string().optional(),
  defendant2Address: z.string().optional(),
  defendant2Carrier: z.string().optional(),
  defendant2CarrierPhone: z.string().optional(),
  defendant2Policy: z.string().optional(),
  defendant2Year: z.string().optional(),
  defendant2Make: z.string().optional(),
  defendant2Model: z.string().optional(),
  defendant2Damage: z.string().optional(),

  // Step 4 - Client Automobile & Health Insurance
  autoName: z.string().optional(),
  autoPhone: z.string().optional(),
  autoAddress: z.string().optional(),
  autoAgent: z.string().optional(),
  autoPolicy: z.string().optional(),
  autoClaim: z.string().optional(),
  autoAdditionalinfo: z.string().optional(),

  healthCarrier: z.string().optional(),
  healthPhone: z.string().optional(),
  healthAddress: z.string().optional(),
  healthAgent: z.string().optional(),
  healthPolicy: z.string().optional(),
  healthClaim: z.string().optional(),
  healthAdjuster: z.string().optional(),
  medicare: z.enum(["Yes", "No"]).optional(),
  medicareNumber: z.string().optional(),
  medicaid: z.enum(["Yes", "No"]).optional(),
  medicaidNumber: z.string().optional(),
  healthAdditionalinfo: z.string().optional(),

  // Step 5 - Medical Treatment
  ambulance: z.enum(["Yes", "No"]).optional(),
  admitted: z.enum(["Yes", "No"]).optional(),
  ambulanceCompany: z.string().optional(),
  lengthOfStay: z.string().optional(),
  priorInjuries: z.enum(["Yes", "No"]).optional(),
  priorDoctorHospital: z.string().optional(),
  priorHospitalAddressPhone: z.string().optional(),
  priorTreatmentDetails: z.string().optional(),
  priorTreatmentFrom: z.string().optional(),
  priorTreatmentTo: z.string().optional(),
  priorInsuranceClaims: z.string().optional(),
  priorAttorneys: z.string().optional(),
  currentTreatment: z.enum(["Yes", "No"]).optional(),
  currentDoctorHospital: z.string().optional(),
  currentHospitalAddressPhone: z.string().optional(),
  currentTreatmentDetails: z.string().optional(),
  currentTreatmentFrom: z.string().optional(),
  currentTreatmentTo: z.string().optional(),

  // Step 6 - Submit
  hearAboutUs: z.string().optional(),
  hearAboutUsDetail: z.string().optional(),
});

export type IntakeFormData = z.infer<typeof intakeFormSchema>;

