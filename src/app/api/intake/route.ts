import { NextRequest, NextResponse } from "next/server";
// import { prisma } from "../../../lib/prisma";
import { prisma } from "@/lib/prisma";


export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    const newIntake = await prisma.intakeInfo.create({
      data: {
        userId: data.userId,
        clientName: data.clientName,
        gender: data.gender,
        phoneNumber: data.phone,
        email: data.email,
        address: data.address,
        city: data.city,
        zip: data.zip,
        dateOfBirth: data.dob ? new Date(data.dob) : null,
        accidentDate: data.accidentDate ? new Date(data.accidentDate) : null,
        accidentTime: data.accidentTime,
        accidentLocation: data.accidentLocation,
        accidentDescription: data.accidentDescription,
        caseType: data.caseType,
        policeCase: data.policeCase,
        seatBelt: data.seatBelt,
        seatBeltReason: data.seatBeltReason,
        // Defendant 1
        defendant1Name: data.defendant1Name,
        defendant1Phone: data.defendant1Phone,
        defendant1Address: data.defendant1Address,
        defendant1Carrier: data.defendant1Carrier,
        defendant1CarrierPhone: data.defendant1CarrierPhone,
        defendant1Policy: data.defendant1Policy,
        defendant1Claim: data.defendant1Claim,
        defendant1Adjuster: data.defendant1Adjuster,
        defendant1Insured: data.defendant1Insured,
        defendant1Year: data.defendant1Year,
        defendant1Make: data.defendant1Make,
        defendant1Model: data.defendant1Model,
        defendant1Damage: data.defendant1Damage,
        // Defendant 2
        defendant2Name: data.defendant2Name,
        defendant2Phone: data.defendant2Phone,
        defendant2Address: data.defendant2Address,
        defendant2Carrier: data.defendant2Carrier,
        defendant2CarrierPhone: data.defendant2CarrierPhone,
        defendant2Policy: data.defendant2Policy,
        defendant2Claim: data.defendant2Claim,
        defendant2Adjuster: data.defendant2Adjuster,
        defendant2Insured: data.defendant2Insured,
        defendant2Year: data.defendant2Year,
        defendant2Make: data.defendant2Make,
        defendant2Model: data.defendant2Model,
        defendant2Damage: data.defendant2Damage,
        // Auto Insurance
        autoName: data.autoName,
        autoPhone: data.autoPhone,
        autoAddress: data.autoAddress,
        autoCarrier: data.autoCarrier,
        autoAgent: data.autoAgent,
        autoPolicy: data.autoPolicy,
        autoClaim: data.autoClaim,
        autoAdjuster: data.autoAdjuster,
        autoInsured: data.autoInsured,
        // Health Insurance
        healthCarrier: data.healthCarrier,
        healthPhone: data.healthPhone,
        healthType: data.healthType,
        healthAddress: data.healthAddress,
        healthGroup: data.healthGroup,
        healthPolicy: data.healthPolicy,
        medicare: data.medicare,
        medicareNumber: data.medicareNumber,
        medicaid: data.medicaid,
        medicaidNumber: data.medicaidNumber,
        // Medical Treatment
        ambulance: data.ambulance,
        ambulanceCompany: data.ambulanceCompany,
        admitted: data.admitted,
        lengthOfStay: data.lengthOfStay,
        // Doctor/Hospital 1
        doctorHospital1: data.doctorHospital1,
        address1: data.address1,
        phone1: data.phone1,
        treatmentDate1: data.treatmentDate1 ? new Date(data.treatmentDate1) : null,
        // Doctor/Hospital 2
        doctorHospital2: data.doctorHospital2,
        address2: data.address2,
        phone2: data.phone2,
        treatmentDate2: data.treatmentDate2 ? new Date(data.treatmentDate2) : null,
        // Doctor/Hospital 3
        doctorHospital3: data.doctorHospital3,
        address3: data.address3,
        phone3: data.phone3,
        treatmentDate3: data.treatmentDate3 ? new Date(data.treatmentDate3) : null,
        // Injuries
        bodyPartsAffected: data.bodyPartsAffected,
        priorInjuries: data.priorInjuries,
        priorInsuranceClaims: data.priorInsuranceClaims,
        priorAttorneys: data.priorAttorneys,
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
