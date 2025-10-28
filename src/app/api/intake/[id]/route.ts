import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    const intake = await prisma.intakeInfo.findUnique({
      where: { id },
    });

    if (!intake) {
      return NextResponse.json({ error: "Intake not found" }, { status: 404 });
    }

    return NextResponse.json(intake, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to fetch intake" }, { status: 500 });
  }
}


export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    const existing = await prisma.intakeInfo.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Intake not found" }, { status: 404 });
    }

    await prisma.intakeInfo.delete({
      where: { id },
    });

    return NextResponse.json(
      { message: "Intake deleted successfully" },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("❌ Delete error:", err);
    return NextResponse.json(
      { error: "Failed to delete intake", details: err.message },
      { status: 500 }
    );
  }
}


export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const data = await req.json();

    console.log("📝 PUT /api/intake ID:", id);
    // console.log("📦 PUT body:", data);

    // Define allowed fields for IntakeInfo update
    const allowedFields = [
      'clientName', 'gender', 'phoneNumber', 'email', 'address', 'city', 'zip', 'dateOfBirth', 'ssn',
      'accidentDate', 'accidentTime', 'accidentLocation', 'accidentDescription', 'passenger', 'passengerName', 'workAtAccident',
      'defendant1Name', 'defendant1Address', 'defendant1Carrier', 'defendant1CarrierPhone', 'defendant1Year', 'defendant1Make', 'defendant1Model', 'defendant1Damage',
      'defendant2Name', 'defendant2Address', 'defendant2Carrier', 'defendant2CarrierPhone', 'defendant2Year', 'defendant2Make', 'defendant2Model', 'defendant2Damage',
      'autoName', 'autoPhone', 'autoAddress', 'autoAgent', 'autoPolicy', 'autoClaim', 'autoAdditionalinfo',
      'healthCarrier', 'healthPhone', 'healthAddress', 'healthPolicy', 'healthClaim', 'healthAdjuster', 'healthAgent', 'healthAdditionalinfo',
      'medicare', 'medicareNumber', 'medicaid', 'medicaidNumber',
      'ambulance', 'ambulanceCompany', 'admitted', 'lengthOfStay',
      'doctorHospital1', 'address1', 'phone1', 'treatmentDate1',
      'doctorHospital2', 'address2', 'phone2', 'treatmentDate2',
      'bodyPartsAffected', 'priorInjuries', 'priorDoctorHospital', 'priorHospitalAddressPhone', 'priorTreatmentDetails', 'priorTreatmentFrom', 'priorTreatmentTo', 'priorInsuranceClaims', 'priorAttorneys',
      'currentTreatment', 'currentDoctorHospital', 'currentHospitalAddressPhone', 'currentTreatmentDetails', 'currentTreatmentFrom', 'currentTreatmentTo',
      'hearAboutUs', 'hearAboutUsDetail', 'isDraft'
    ];

    // Filter data to only include allowed fields
    const updateData: any = {};
    for (const field of allowedFields) {
      if (data[field] !== undefined) {
        updateData[field] = data[field];
      }
    }

    // Handle user relation separately
    if (data.userId) {
      const user = await prisma.user.findUnique({ where: { id: data.userId } });
      if (user) {
        updateData.user = { connect: { id: data.userId } };
      }
    }

    const updated = await prisma.intakeInfo.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(updated, { status: 200 });
  } catch (error: any) {
    console.error("❌ Error updating intake:", error);
    return NextResponse.json(
      { error: "Failed to update intake", details: error.message },
      { status: 500 }
    );
  }
}
