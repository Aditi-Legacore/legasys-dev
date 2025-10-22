import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { name, dateOfBirth } = await req.json();
    const referenceId = `LEG-${Date.now().toString(36).toUpperCase()}`;

    const session = await prisma.intakeSession.create({
      data: {
        name,
        dateOfBirth: new Date(dateOfBirth),
        referenceId
      }
    });

    return NextResponse.json({ referenceId: session.referenceId }, { status: 201 });
  } catch (error) {
    console.error("❌ Error creating session:", error);
    return NextResponse.json({ error: "Failed to create session" }, { status: 500 });
  }
}
