import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { referenceId } = await req.json();

    const session = await prisma.intakeSession.findUnique({
      where: { referenceId },
      include: { intakeInfo: true } // make sure relation is set in prisma schema
    });

    if (!session) {
      return NextResponse.json({ error: "Invalid reference ID" }, { status: 404 });
    }

    return NextResponse.json(session, { status: 200 });
  } catch (error) {
    console.error("❌ Error validating session:", error);
    return NextResponse.json({ error: "Failed to validate session" }, { status: 500 });
  }
}
