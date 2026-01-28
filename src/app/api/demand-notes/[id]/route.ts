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
        files: {
          include: {
            tasks: true,
          },
        },
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

    const { clientName, demandDate, status, internalNotes, totalAmount, description, title } = data;

    // Find the current client to update or create a new one
    const currentDemandNote = await prisma.demandNote.findUnique({
      where: { id: demandNoteId },
      include: { client: true }
    });

    if (!currentDemandNote) {
      return NextResponse.json({ error: 'Demand note not found' }, { status: 404 });
    }

    let clientId = currentDemandNote.clientId;

    if (clientName && clientName !== currentDemandNote.client.name) {
      // Update the client name directly
      const updatedClient = await prisma.defedantClient.update({
        where: { id: currentDemandNote.clientId },
        data: { name: clientName },
      });
      clientId = updatedClient.id;
    }

    // Update demand note
    const updatedDemandNote = await prisma.demandNote.update({
      where: { id: demandNoteId },
      data: {
        clientId: clientId,
        title: title || currentDemandNote.title,
        description: description !== undefined ? description : currentDemandNote.description,
        totalAmount: totalAmount !== undefined ? totalAmount : currentDemandNote.totalAmount,
        dueDate: demandDate ? new Date(demandDate) : currentDemandNote.dueDate,
        status: status || currentDemandNote.status,
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

    // Update associated Job records to set publishStatus to 'draft'
    await (prisma.job as any).updateMany({
      where: { demandNoteId: demandNoteId },
      data: { publishStatus: 'draft' }
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

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const demandNoteId = params.id;

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

    // Delete the demand note (cascade delete should handle related records)
    await prisma.demandNote.delete({
      where: { id: demandNoteId },
    });

    console.log("✅ Demand note deleted:", demandNoteId);
    return NextResponse.json({ message: 'Demand note deleted successfully' }, { status: 200 });
  } catch (err: unknown) {
    console.error("❌ DELETE /api/demand-notes/[id] error:", err);
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to delete demand note", details: errorMessage },
      { status: 500 }
    );
  }
}
