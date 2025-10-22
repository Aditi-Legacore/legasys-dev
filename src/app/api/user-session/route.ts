import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET - Validate user session by uniqueId
// GET - Validate user session by uniqueId
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const uniqueId = searchParams.get('uniqueId');

    console.log("🔍 Validating user session with uniqueId:", uniqueId);

    if (!uniqueId) {
      return NextResponse.json(
        { error: "Unique ID is required" },
        { status: 400 }
      );
    }

    // First, check if the user session exists
    const userSession = await prisma.userSession.findUnique({
      where: { uniqueId },
    });

    console.log("📋 User session found:", userSession);

    if (!userSession) {
      console.log("❌ No user session found for uniqueId:", uniqueId);
      return NextResponse.json(
        { error: "Invalid Unique ID" },
        { status: 404 }
      );
    }

    // Then, find any related intakes (drafts)
    // Use Prisma's proper null checking syntax
    const intakes = await prisma.intakeInfo.findMany({
      where: {
        userSessionId: userSession.id,
        isDraft: true // Only look for draft records
  },
      orderBy: { createdAt: 'desc' },
      take: 1
    });

    console.log("📄 Found intakes/drafts:", intakes.length);

    const responseData = {
      ...userSession,
      intakes
    };

    return NextResponse.json(responseData, { status: 200 });

  } catch (error: any) {
    console.error("❌ Error fetching user session:", error);
    return NextResponse.json(
      { error: "Failed to fetch user session", details: error.message },
      { status: 500 }
    );
  }
}

// POST - Create new user session (keep your existing POST function)
export async function POST(request: NextRequest) {
  try {
    const { name, dateOfBirth } = await request.json();

    console.log("📝 Creating new user session:", { name, dateOfBirth });

    if (!name || !dateOfBirth) {
      return NextResponse.json(
        { error: "Name and date of birth are required" },
        { status: 400 }
      );
    }

    // Generate unique ID
    function generateUniqueId(): string {
      return 'UID-' + Math.random().toString(36).substr(2, 9).toUpperCase();
    }

    const uniqueId = generateUniqueId();
    
    const userSession = await prisma.userSession.create({
      data: {
        uniqueId,
        name,
        dateOfBirth: new Date(dateOfBirth),
      },
    });

    console.log("✅ User session created:", userSession);

    return NextResponse.json(userSession, { status: 201 });
  } catch (error: any) {
    console.error("❌ Error creating user session:", error);
    return NextResponse.json(
      { error: "Failed to create user session", details: error.message },
      { status: 500 }
    );
  }
}