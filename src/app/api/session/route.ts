import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendIntakeReferenceEmail } from "@/lib/sendEmail";

export async function POST(req: NextRequest) {
  try {
    const { name, dateOfBirth, caseType, email } = await req.json();

    if (!name || !dateOfBirth || !caseType || !email) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Determine prefix based on caseType
    let prefix = "LEG";
    if (caseType.toLowerCase().includes("auto")) prefix = "MVA";
    else if (caseType.toLowerCase().includes("premises")) prefix = "PRE";
    else if (caseType.toLowerCase().includes("dog")) prefix = "SLF";

    const referenceId = `${prefix}-${Date.now().toString(36).toUpperCase()}`;

    // Save session
    const session = await prisma.intakeSession.create({
      data: {
        name,
        email,
        dateOfBirth: new Date(dateOfBirth),
        caseType,
        referenceId,
      },
    });

    // Send email (optional, skip if email fails)
    try {
      await sendIntakeReferenceEmail(email, name, caseType, referenceId);
    } catch (emailError) {
      console.warn("Email sending failed:", emailError);
      // Continue without failing the session creation
    }

    return NextResponse.json(
      { message: "Session created successfully", referenceId: session.referenceId },
      { status: 201 }
    );
  } catch (error) {
    console.error("❌ Error creating session:", error);
    return NextResponse.json({ error: "Failed to create session" }, { status: 500 });
  }
}
