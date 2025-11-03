import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const serverSession = await getServerSession(authOptions);
  if (!serverSession || !serverSession.user.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const data = await req.json();
  const { referenceId, ...draftFields } = data;

  if (!referenceId) {
    return NextResponse.json({ error: "Reference ID required" }, { status: 400 });
  }

  try {
    const lead = await prisma.lead.findUnique({
      where: { referenceId },
    });

    if (!lead) {
      return NextResponse.json({ error: "Invalid reference ID" }, { status: 404 });
    }

    const existingIntake = await prisma.intakeInfo.findFirst({
      where: { LeadId: lead.id },
    });

    // Define allowed fields based on Prisma schema
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
      'hearAboutUs', 'hearAboutUsDetail', 'referenceId'
    ];

    // Date fields that need to be converted to Date objects
    const dateFields = [
      'dateOfBirth', 'accidentDate', 'treatmentDate1', 'treatmentDate2',
      'priorTreatmentFrom', 'priorTreatmentTo', 'currentTreatmentFrom', 'currentTreatmentTo'
    ];

    // Transform draftFields to match schema field names and filter allowed fields
    const transformedFields: any = {};
    for (const field of allowedFields) {
      if (field === 'phoneNumber') {
        transformedFields[field] = draftFields.phone;
      } else if (field === 'dateOfBirth') {
        transformedFields[field] = draftFields.dob ? new Date(draftFields.dob) : null;
      }
      else if (field === 'referenceId') {
        transformedFields[field] = referenceId
      }
      else if (dateFields.includes(field) && draftFields[field]) {
        transformedFields[field] = new Date(draftFields[field]);
      } else if (draftFields[field] !== undefined) {
        transformedFields[field] = draftFields[field];
      }
    }

    console.log("transformedFields", transformedFields);


    if (existingIntake) {
      await prisma.intakeInfo.update({
        where: { id: existingIntake.id },
        data: {
          ...transformedFields,
          user: { connect: { id: serverSession.user.id } },
        },
      });
    } else {
      await prisma.intakeInfo.create({
        data: {
          ...transformedFields,
          LeadId: lead.id,
          user: { connect: { id: serverSession.user.id } },
        },
      });
    }

    return NextResponse.json({ message: "Draft saved" });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to save draft" }, { status: 500 });
  }
}
