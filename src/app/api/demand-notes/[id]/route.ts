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
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const demandNoteId = params.id;

    const demandNote = await prisma.demandNote.findFirst({
      where: {
        id: demandNoteId,
        createdById: session.user.id,
      },
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
    });

    if (!demandNote) {
      return NextResponse.json({ error: 'Demand note not found' }, { status: 404 });
    }

    return NextResponse.json(demandNote, { status: 200 });
  } catch (err: unknown) {
    console.error("❌ GET /api/demand-notes/[id] error:", err);
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to fetch demand note", details: errorMessage },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const demandNoteId = params.id;
    const data = await request.json();

    // Verify the demand note exists and belongs to the user
    const existingDemandNote = await prisma.demandNote.findFirst({
      where: {
        id: demandNoteId,
        createdById: session.user.id,
      },
    });

    if (!existingDemandNote) {
      return NextResponse.json({ error: 'Demand note not found' }, { status: 404 });
    }

    const { clientName, demandDate, status, internalNotes, totalAmount, description } = data;

    // Find or create client
    let client = await prisma.client.findFirst({
      where: { name: clientName },
    });

    if (!client) {
      client = await prisma.client.create({
        data: { name: clientName },
      });
    }

    // Update demand note
    const updatedDemandNote = await prisma.demandNote.update({
      where: { id: demandNoteId },
      data: {
        clientId: client.id,
        title: `Demand Note for ${clientName}`,
        description: description || null,
        totalAmount: totalAmount || 0,
        dueDate: demandDate ? new Date(demandDate) : existingDemandNote.dueDate,
        status: status || existingDemandNote.status,
      },
      include: {
        client: true,
        createdBy: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
      },
    });

    // If internal notes provided, create a new internal note
    if (internalNotes && internalNotes.trim()) {
      await prisma.demandInternalNote.create({
        data: {
          demandNoteId,
          createdById: session.user.id,
          content: internalNotes.trim(),
        },
      });
    }

    // Add timeline entry for update
    await prisma.demandTimeline.create({
      data: {
        demandNoteId,
        type: 'updated',
        message: 'Demand note updated',
      },
    });

    console.log("✅ Demand note updated:", updatedDemandNote);
    return NextResponse.json(updatedDemandNote, { status: 200 });
  } catch (err: unknown) {
    console.error("❌ PUT /api/demand-notes/[id] error:", err);
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to update demand note", details: errorMessage },
      { status: 500 }
    );
  }
}
