import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashReferenceId } from "@/lib/hashReferenceId";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ referenceId: string }> }
) {
  try {
    const { referenceId } = await params;
    if (!referenceId) {
      return NextResponse.json({ error: "Invalid reference ID" }, { status: 400 });
    }

    // Fetch all intakes and find the one where hash matches
    const intakes = await prisma.intakeInfo.findMany();
    const intake = intakes.find(i => hashReferenceId(i.referenceId!) === referenceId);

    if (!intake) {
      return NextResponse.json({ error: "Intake not found" }, { status: 404 });
    }

    return NextResponse.json(intake, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to fetch intake" }, { status: 500 });
  }
}
