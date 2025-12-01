import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    console.log("📥 POST /api/demand-notes - Received data:", data);

    const { clientName, demandDate, status = 'draft', internalNotes, totalAmount = 0, description } = data;

    if (!clientName || !demandDate) {
      return NextResponse.json({ error: 'clientName and demandDate are required' }, { status: 400 });
    }

    // Find or create client
    let client = await prisma.client.findFirst({
      where: { name: clientName },
    });

    if (!client) {
      client = await prisma.client.create({
        data: { name: clientName },
      });
    }

    // Create demand note
    const demandNote = await prisma.demandNote.create({
      data: {
        clientId: client.id,
        createdById: session.user.id,
        title: `Demand Note for ${clientName}`,
        description: description || null,
        totalAmount: totalAmount,
        dueDate: new Date(demandDate),
        status: status,
      },
      include: {
        client: true,
        createdBy: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
      },
    });

    // Create internal note if provided
    if (internalNotes) {
      await prisma.demandInternalNote.create({
        data: {
          demandNoteId: demandNote.id,
          createdById: session.user.id,
          content: internalNotes,
        },
      });
    }

    // Create timeline entry
    await prisma.demandTimeline.create({
      data: {
        demandNoteId: demandNote.id,
        type: 'created',
        message: 'Demand note created',
      },
    });

    console.log("✅ Demand note created:", demandNote);
    return NextResponse.json(demandNote, { status: 201 });
  } catch (err: unknown) {
    console.error("❌ POST /api/demand-notes error:", err);
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to create demand note", details: errorMessage },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const demandNotes = await prisma.demandNote.findMany({
      where: { createdById: session.user.id },
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
          orderBy: { createdAt: 'desc' },
        },
        timeline: {
          orderBy: { createdAt: 'desc' },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(demandNotes, { status: 200 });
  } catch (err: unknown) {
    console.error("❌ GET /api/demand-notes error:", err);
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to fetch demand notes", details: errorMessage },
      { status: 500 }
    );
  }
}
