import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const { referenceId } = await req.json();

  const session = await prisma.intakeSession.findUnique({
    where: { referenceId },
    include: { intakeInfo: true },
  });

  if (!session) {
    return NextResponse.json({ error: "Invalid reference ID" }, { status: 404 });
  }

  return NextResponse.json(session, { status: 200 });
}

