import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    // Validate email presence and format
    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Email is required and must be a string" }, { status: 400 });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "Invalid email format" }, { status: 400 });
    }

    // Query the database for a draft with the given email (no auth required for embed)
    const draft = await prisma.intakeInfo.findFirst({
      where: {
        email: email,
        isDraft: true,
      },
    });

    if (draft) {
      return NextResponse.json({
        exists: true,
        draft: draft,
      });
    } else {
      return NextResponse.json({
        exists: false,
      });
    }
  } catch (error) {
    console.error("Error checking draft:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
