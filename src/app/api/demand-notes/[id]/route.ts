import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const demandNote = await prisma.demandNote.findUnique({
      where: { id: params.id },
      include: {
        client: true,
        createdBy: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
        internalNotes: {
          include: {
            createdBy: {
              select: { id: true, firstName: true, lastName: true, email: true },
            },
          },
          orderBy: { createdAt: "desc" },
        },
        timeline: {
          orderBy: { createdAt: "desc" },
        },
        files: true,
      },
    });

    if (!demandNote) {
      return NextResponse.json(
        { error: "Demand note not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(demandNote);
  } catch (err) {
    console.error("❌ GET /api/demand-notes/[id] error:", err);
    return NextResponse.json(
      { error: "Failed to fetch demand note" },
      { status: 500 }
    );
  }
}
