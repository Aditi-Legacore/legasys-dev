import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Helper to convert empty strings to null
const toNullable = (value: string | undefined): string | null => (value === "" || value === undefined ? null : value);

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    const newIntake = await prisma.intakeInfo.create({
      data: {
        userId: toNullable(data.userId),
        clientName: data.clientName,
        gender: data.gender ?? null,
        phoneNumber: data.phone ?? null,
        email: data.email,
        address: data.address ?? null,
        city: data.city ?? null,
        zip: data.zip ?? null,
        
        dateOfBirth: toNullable(data.dob) ? new Date(data.dob) : null,
        accidentDate: toNullable(data.accidentDate) ? new Date(data.accidentDate) : null,
        accidentTime: toNullable(data.accidentTime),
        accidentLocation: toNullable(data.accidentLocation),
        accidentDescription: toNullable(data.accidentDescription),
        // caseType: toNullable(data.caseType),
        // policeCase: toNullable(data.policeCase),
        // seatBelt: toNullable(data.seatBelt),
        // seatBeltReason: toNullable(data.seatBeltReason),

        // Defendant 1
        defendant1Name: toNullable(data.defendant1Name),
        // defendant1Phone: toNullable(data.defendant1Phone),
        defendant1Address: toNullable(data.defendant1Address),
        defendant1Carrier: toNullable(data.defendant1Carrier),
        defendant1CarrierPhone: toNullable(data.defendant1CarrierPhone),
        defendant1Policy: toNullable(data.defendant1Policy),
        // defendant1Claim: toNullable(data.defendant1Claim),
        // defendant1Adjuster: toNullable(data.defendant1Adjuster),
        // defendant1Insured: toNullable(data.defendant1Insured),
        defendant1Year: toNullable(data.defendant1Year),
        defendant1Make: toNullable(data.defendant1Make),
        defendant1Model: toNullable(data.defendant1Model),
        defendant1Damage: toNullable(data.defendant1Damage),

        // Defendant 2
        defendant2Name: toNullable(data.defendant2Name),
        defendant2Phone: toNullable(data.defendant2Phone),
        defendant2Address: toNullable(data.defendant2Address),
        defendant2Carrier: toNullable(data.defendant2Carrier),
        defendant2CarrierPhone: toNullable(data.defendant2CarrierPhone),
        defendant2Policy: toNullable(data.defendant2Policy),
        // defendant2Claim: toNullable(data.defendant2Claim),
        // defendant2Adjuster: toNullable(data.defendant2Adjuster),
        // defendant2Insured: toNullable(data.defendant2Insured),
        defendant2Year: toNullable(data.defendant2Year),
        defendant2Make: toNullable(data.defendant2Make),
        defendant2Model: toNullable(data.defendant2Model),
        defendant2Damage: toNullable(data.defendant2Damage),

        // Auto Insurance
        autoName: toNullable(data.autoName),
        autoPhone: toNullable(data.autoPhone),
        autoAddress: toNullable(data.autoAddress),
        autoCarrier: toNullable(data.autoCarrier),
        autoAgent: toNullable(data.autoAgent),
        autoPolicy: toNullable(data.autoPolicy),
        // autoClaim: toNullable(data.autoClaim),
        // autoAdjuster: toNullable(data.autoAdjuster),
        // autoInsured: toNullable(data.autoInsured),

        // Health Insurance
        healthCarrier: toNullable(data.healthCarrier),
        healthPhone: toNullable(data.healthPhone),
        healthType: toNullable(data.healthType),
        healthAddress: toNullable(data.healthAddress),
        healthGroup: toNullable(data.healthGroup),
        healthPolicy: toNullable(data.healthPolicy),
        // medicare: toNullable(data.medicare),
        // medicareNumber: toNullable(data.medicareNumber),
        // medicaid: toNullable(data.medicaid),
        // medicaidNumber: toNullable(data.medicaidNumber),

        // Medical Treatment
        ambulance: data.ambulance,
        ambulanceCompany: toNullable(data.ambulanceCompany),
        admitted: data.admitted,
        lengthOfStay: toNullable(data.lengthOfStay),

        // Doctor/Hospital
        doctorHospital1: data.doctorHospital1,
        address1: data.address1,
        phone1: data.phone1,
        treatmentDate1: toNullable(data.treatmentDate1) ? new Date(data.treatmentDate1) : null,

        doctorHospital2: toNullable(data.doctorHospital2),
        address2: toNullable(data.address2),
        phone2: toNullable(data.phone2),
        treatmentDate2: toNullable(data.treatmentDate2) ? new Date(data.treatmentDate2) : null,

        // doctorHospital3: toNullable(data.doctorHospital3),
        // address3: toNullable(data.address3),
        // phone3: toNullable(data.phone3),
        // treatmentDate3: toNullable(data.treatmentDate3) ? new Date(data.treatmentDate3) : null,

        // Injuries
        bodyPartsAffected: data.bodyPartsAffected,
        priorInjuries: toNullable(data.priorInjuries),
        priorInsuranceClaims: toNullable(data.priorInsuranceClaims),
        priorAttorneys: toNullable(data.priorAttorneys),
      },
    });

    return NextResponse.json(newIntake, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to save intake info" }, { status: 500 });
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
      