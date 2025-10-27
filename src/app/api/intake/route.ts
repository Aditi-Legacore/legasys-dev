import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendIntakeSubmissionEmail } from "@/lib/email";

// Helper to convert empty strings to null
const toNullable = (value: string | undefined): string | null => (value === "" || value === undefined ? null : value);

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    console.log("📥 POST /api/intake - Received data:", data);

    // Validate userId if provided
    if (data.userId) {
      const user = await prisma.user.findUnique({ where: { id: data.userId } });
      if (!user) {
        data.userId = null; // Set to null if user doesn't exist
      }
    }

    const newIntake = await prisma.intakeInfo.create({
  data: {
    ...(data.userId && { user: { connect: { id: data.userId } } }),

    // Plaintiff Information
    clientName: data.clientName,
    gender: toNullable(data.gender),
    phoneNumber: toNullable(data.phoneNumber),
    email: toNullable(data.email),
    address: toNullable(data.address),
    city: toNullable(data.city),
    zip: toNullable(data.zip),
    dateOfBirth: toNullable(data.dateOfBirth) ? new Date(data.dateOfBirth) : null,
    ssn: toNullable(data.ssn),

    // Accident Information
    accidentDate: toNullable(data.accidentDate) ? new Date(data.accidentDate) : null,
    accidentTime: toNullable(data.accidentTime),
    accidentLocation: toNullable(data.accidentLocation),
    accidentDescription: toNullable(data.accidentDescription),
    passenger: toNullable(data.passenger),
    passengerName: toNullable(data.passengerName),
    workAtAccident: toNullable(data.workAtAccident),

    // Defendant 1
    defendant1Name: toNullable(data.defendant1Name),
    defendant1Address: toNullable(data.defendant1Address),
    defendant1Carrier: toNullable(data.defendant1Carrier),
    defendant1CarrierPhone: toNullable(data.defendant1CarrierPhone),
    defendant1Year: toNullable(data.defendant1Year),
    defendant1Make: toNullable(data.defendant1Make),
    defendant1Model: toNullable(data.defendant1Model),
    defendant1Damage: toNullable(data.defendant1Damage),

    // Defendant 2
    defendant2Name: toNullable(data.defendant2Name),
    defendant2Address: toNullable(data.defendant2Address),
    defendant2Carrier: toNullable(data.defendant2Carrier),
    defendant2CarrierPhone: toNullable(data.defendant2CarrierPhone),
    defendant2Year: toNullable(data.defendant2Year),
    defendant2Make: toNullable(data.defendant2Make),
    defendant2Model: toNullable(data.defendant2Model),
    defendant2Damage: toNullable(data.defendant2Damage),

    // Auto Insurance
    autoName: toNullable(data.autoName),
    autoPhone: toNullable(data.autoPhone),
    autoAddress: toNullable(data.autoAddress),
    autoAgent: toNullable(data.autoAgent),
    autoPolicy: toNullable(data.autoPolicy),
    autoClaim: toNullable(data.autoClaim),
    autoAdditionalinfo: toNullable(data.autoAdditionalinfo),

    // Health Insurance
    healthCarrier: toNullable(data.healthCarrier),
    healthPhone: toNullable(data.healthPhone),
    healthAddress: toNullable(data.healthAddress),
    healthAgent: toNullable(data.healthAgent),
    healthAdjuster: toNullable(data.healthAdjuster),
    healthPolicy: toNullable(data.healthPolicy),
    healthClaim: toNullable(data.healthClaim),
    medicare: toNullable(data.medicare),
    medicareNumber: toNullable(data.medicareNumber),
    medicaid: toNullable(data.medicaid),
    medicaidNumber: toNullable(data.medicaidNumber),
    healthAdditionalinfo: toNullable(data.healthAdditionalinfo),

    // Medical Treatment
    ambulance: toNullable(data.ambulance),
    ambulanceCompany: toNullable(data.ambulanceCompany),
    admitted: toNullable(data.admitted),
    lengthOfStay: toNullable(data.lengthOfStay),
    doctorHospital1: toNullable(data.doctorHospital1),
    address1: toNullable(data.address1),
    phone1: toNullable(data.phone1),
    treatmentDate1: toNullable(data.treatmentDate1) ? new Date(data.treatmentDate1) : null,
    doctorHospital2: toNullable(data.doctorHospital2),
    address2: toNullable(data.address2),
    phone2: toNullable(data.phone2),
    treatmentDate2: toNullable(data.treatmentDate2) ? new Date(data.treatmentDate2) : null,

    // Injuries
   
    priorInjuries: toNullable(data.priorInjuries),
    priorDoctorHospital: toNullable(data.priorDoctorHospital),
    priorHospitalAddressPhone: toNullable(data.priorHospitalAddressPhone),
    priorTreatmentDetails: toNullable(data.priorTreatmentDetails),
    priorTreatmentFrom: toNullable(data.priorTreatmentFrom) ? new Date(data.priorTreatmentFrom) : null,
    priorTreatmentTo: toNullable(data.priorTreatmentTo) ? new Date(data.priorTreatmentTo) : null,
    priorInsuranceClaims: toNullable(data.priorInsuranceClaims),
    priorAttorneys: toNullable(data.priorAttorneys),
    currentTreatment: toNullable(data.currentTreatment),
    currentDoctorHospital: toNullable(data.currentDoctorHospital),
    currentHospitalAddressPhone: toNullable(data.currentHospitalAddressPhone),
    currentTreatmentDetails: toNullable(data.currentTreatmentDetails),
    currentTreatmentFrom: toNullable(data.currentTreatmentFrom) ? new Date(data.currentTreatmentFrom) : null,
    currentTreatmentTo: toNullable(data.currentTreatmentTo) ? new Date(data.currentTreatmentTo) : null,
    bodyPartsAffected: toNullable(data.bodyPartsAffected),
    // Referral / Info
    hearAboutUs: toNullable(data.hearAboutUs),
    hearAboutUsDetail: toNullable(data.hearAboutUsDetail),
  },
});


    // Send email notification after successful submission
    try {
      await sendIntakeSubmissionEmail(data);
    } catch (emailError) {
      console.error("Failed to send email notification:", emailError);
      // Don't fail the submission if email fails
    }

    return NextResponse.json(newIntake, { status: 201 });
  } catch (err: any) {
    console.error("❌ POST /api/intake error:", err);
    return NextResponse.json({ error: "Failed to save intake info", details: err.message }, { status: 500 });
  }
}

export async function GET() {
  try {
    const allIntakes = await prisma.intakeInfo.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(allIntakes, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to fetch intake info" }, { status: 500 });
  }
}
      