import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendIntakeSubmissionEmail } from "@/lib/email";
import { IntakeFormData } from "@/types/form";

// Helper to convert empty strings to null
const toNullable = (value: string | undefined): string | null => (value === "" || value === undefined ? null : value);

// Helper to build intake data object for Prisma operations
const buildIntakeData = (data: IntakeFormData) => ({
  ...(data.userId && { user: { connect: { id: data.userId } } }),
  ...(data.referenceId && { referenceId: data.referenceId }),

  // Plaintiff Information
  clientName: data.clientName,
  gender: toNullable(data.gender),
  phoneNumber: toNullable(data.phoneNumber),
  email: toNullable(data.email),
  address: toNullable(data.address),
  city: toNullable(data.city),
  zip: toNullable(data.zip),
  dateOfBirth: toNullable(data.dateOfBirth) ? new Date(toNullable(data.dateOfBirth)!) : null,
  ssn: toNullable(data.ssn),

  // Accident Information
  accidentDate: toNullable(data.accidentDate) ? new Date(toNullable(data.accidentDate)!) : null,
  accidentTime: toNullable(data.accidentTime),
  accidentLocation: toNullable(data.accidentLocation),
  accidentDescription: toNullable(data.accidentDescription),
  passenger: toNullable(data.passenger),
  passengerName: toNullable(data.passengerName),
  passengerAge: toNullable(data.passengerAge),
  relationshipToYou: toNullable(data.relationshipToYou),
  injuryDescription: toNullable(data.injuryDescription),
  hospitalized: toNullable(data.hospitalized),
  hospitalName: toNullable(data.hospitalName),
  treatmentDetails: toNullable(data.treatmentDetails),
  seatbeltUsed: toNullable(data.seatbeltUsed),
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

  // Defendant 3
  defendant3Name: toNullable(data.defendant3Name),
  defendant3Address: toNullable(data.defendant3Address),
  defendant3Carrier: toNullable(data.defendant3Carrier),
  defendant3CarrierPhone: toNullable(data.defendant3CarrierPhone),
  defendant3Year: toNullable(data.defendant3Year),
  defendant3Make: toNullable(data.defendant3Make),
  defendant3Model: toNullable(data.defendant3Model),
  defendant3Damage: toNullable(data.defendant3Damage),

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
  // doctorHospital1: toNullable(data.doctorHospital1),
  // address1: toNullable(data.address1),
  // phone1: toNullable(data.phone1),
  // treatmentDate1: toNullable(data.treatmentDate1) ? new Date(data.treatmentDate1) : null,
  // doctorHospital2: toNullable(data.doctorHospital2),
  // address2: toNullable(data.address2),
  // phone2: toNullable(data.phone2),
  // treatmentDate2: toNullable(data.treatmentDate2) ? new Date(data.treatmentDate2) : null,
  // hospitalName: toNullable(data.hospitalName),

  // Prior Injuries
  priorInjuries: toNullable(data.priorInjuries),
  priorDoctorHospital: toNullable(data.priorDoctorHospital),
  priorHospitalAddressPhone: toNullable(data.priorHospitalAddressPhone),
  priorTreatmentDetails: toNullable(data.priorTreatmentDetails),
  priorTreatmentFrom: toNullable(data.priorTreatmentFrom) ? new Date(toNullable(data.priorTreatmentFrom)!) : null,
  priorTreatmentTo: toNullable(data.priorTreatmentTo) ? new Date(toNullable(data.priorTreatmentTo)!) : null,
  priorInsuranceClaims: toNullable(data.priorInsuranceClaims),
  priorAttorneys: toNullable(data.priorAttorneys),

  
  priorDoctorHospital2: toNullable(data.priorDoctorHospital2),
  priorHospitalAddressPhone2: toNullable(data.priorHospitalAddressPhone2),
  priorTreatmentDetails2: toNullable(data.priorTreatmentDetails2),
  priorTreatmentFrom2: toNullable(data.priorTreatmentFrom2) ? new Date(toNullable(data.priorTreatmentFrom2)!) : null,
  priorTreatmentTo2: toNullable(data.priorTreatmentTo2) ? new Date(toNullable(data.priorTreatmentTo2)!) : null,
  priorInsuranceClaims2: toNullable(data.priorInsuranceClaims2),
  priorAttorneys2: toNullable(data.priorAttorneys2),

  priorDoctorHospital3: toNullable(data.priorDoctorHospital3),
  priorHospitalAddressPhone3: toNullable(data.priorHospitalAddressPhone3),
  priorTreatmentDetails3: toNullable(data.priorTreatmentDetails3),
  priorTreatmentFrom3: toNullable(data.priorTreatmentFrom3) ? new Date(toNullable(data.priorTreatmentFrom3)!) : null,
  priorTreatmentTo3: toNullable(data.priorTreatmentTo3) ? new Date(toNullable(data.priorTreatmentTo3)!) : null,
  priorInsuranceClaims3: toNullable(data.priorInsuranceClaims3),
  priorAttorneys3: toNullable(data.priorAttorneys3),

  // Current/OnGoing Injuries
  currentTreatment: toNullable(data.currentTreatment),
  currentDoctorHospital: toNullable(data.currentDoctorHospital),
  currentHospitalAddressPhone: toNullable(data.currentHospitalAddressPhone),
  currentTreatmentDetails: toNullable(data.currentTreatmentDetails),
  currentTreatmentFrom: toNullable(data.currentTreatmentFrom) ? new Date(toNullable(data.currentTreatmentFrom)!) : null,
  currentTreatmentTo: toNullable(data.currentTreatmentTo) ? new Date(toNullable(data.currentTreatmentTo)!) : null,

  currentDoctorHospital2: toNullable(data.currentDoctorHospital),
  currentHospitalAddressPhone2: toNullable(data.currentHospitalAddressPhone),
  currentTreatmentDetails2: toNullable(data.currentTreatmentDetails),
  currentTreatmentFrom2: toNullable(data.currentTreatmentFrom) ? new Date(toNullable(data.currentTreatmentFrom)!) : null,
  currentTreatmentTo2: toNullable(data.currentTreatmentTo) ? new Date(toNullable(data.currentTreatmentTo)!) : null,

  currentDoctorHospital3: toNullable(data.currentDoctorHospital),
  currentHospitalAddressPhone3: toNullable(data.currentHospitalAddressPhone),
  currentTreatmentDetails3: toNullable(data.currentTreatmentDetails),
  currentTreatmentFrom3: toNullable(data.currentTreatmentFrom) ? new Date(toNullable(data.currentTreatmentFrom)!) : null,
  currentTreatmentTo3: toNullable(data.currentTreatmentTo) ? new Date(toNullable(data.currentTreatmentTo)!) : null,

  bodyPartsAffected: toNullable(data.bodyPartsAffected),

  // Referral / Info
  hearAboutUs: toNullable(data.hearAboutUs),
  hearAboutUsDetail: toNullable(data.hearAboutUsDetail),
  isDraft: false, // Set to false since this is a final submission
  ...(data.LeadId && { Lead: { connect: { id: data.LeadId } } }),
});

export async function POST(request: NextRequest) {
  try {
    const data: IntakeFormData = await request.json();
    console.log("📥 POST /api/intake - Received data:", data);

    // Validate userId if provided
    if (data.userId) {
      const userExists = await prisma.user.findUnique({ where: { id: data.userId }, select: { id: true } });
      if (!userExists) {
        data.userId = undefined; // Set to undefined if user doesn't exist
      }
    }

    // Set LeadId if referenceId is provided
    if (data.referenceId) {
      const lead = await prisma.lead.findUnique({
        where: { referenceId: data.referenceId },
        select: { id: true },
      });
      if (lead) {
        data.LeadId = lead.id;
      }
    }

    let intake;
    if (data.referenceId) {
      const existingIntake = await prisma.intakeInfo.findFirst({
        where: { referenceId: data.referenceId },
      });

      console.log("existingIntake", existingIntake);

      if (existingIntake) {
        intake = await prisma.intakeInfo.update({
          where: { id: existingIntake.id },
          data: buildIntakeData(data),
        });
      } else {
        intake = await prisma.intakeInfo.create({
          data: buildIntakeData(data),
        });
      }
    } else {
      intake = await prisma.intakeInfo.create({
        data: buildIntakeData(data),
      });
    }

    console.log("data", data);

    // Update lead status to completed if referenceId exists
    if (data.referenceId) {
      try {
        await prisma.lead.updateMany({
          where: { referenceId: data.referenceId },
          data: { status: "completed" },
        });
        console.log(`✅ Updated lead status to completed for referenceId: ${data.referenceId}`);
      } catch (leadUpdateError) {
        console.error("Failed to update lead status:", leadUpdateError);
        // Don't fail the submission if lead update fails
      }
    }

    // Send email notification after successful submission
    try {
      await sendIntakeSubmissionEmail(data);
    } catch (emailError) {
      console.error("Failed to send email notification:", emailError);
      // Don't fail the submission if email fails
    }

    return NextResponse.json(intake, { status: 201 });
  } catch (err: unknown) {
    console.error("❌ POST /api/intake error:", err);
    if (err instanceof Error && 'code' in err && err.code === 'EROFS') {
      return NextResponse.json({ error: "File system is read-only. Please try again later." }, { status: 500 });
    }
    return NextResponse.json({ error: "Failed to save intake info", details: err instanceof Error ? err.message : "Unknown error" }, { status: 500 });
  }
}

// for fetching all intakes and showing in Intaketable

export async function GET() {
  try {

    const allIntakes = await prisma.intakeInfo.findMany({
      // where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      include: {
        Lead: {
          select: {
            caseType: true,
          },
        },
      },
    });
    return NextResponse.json(allIntakes, { status: 200 });
  } catch (err) {
    console.error(err);
    if (err instanceof Error && 'code' in err && err.code === 'EROFS') {
      return NextResponse.json({ error: "File system is read-only. Please try again later." }, { status: 500 });
    }
    return NextResponse.json({ error: "Failed to fetch intake info" }, { status: 500 });
  }
}
