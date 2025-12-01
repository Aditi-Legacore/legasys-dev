import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";


export async function POST(req: NextRequest) {
  try {
    const data = await req.json();

    const {
      clientName,
      demandDate,
      files = { traffic: [], medical: [], bills: [] },
      internalNotes,
      status,
      createdById = "admin-123", // replace later with auth user
    } = data;

    // 1. Create or find DefendantClient
    const client = await prisma.defendantClient.create({
      data: {
        name: clientName,
      },
    });

    // 2. Create DemandNote
    const demandNote = await prisma.demandNote.create({
      data: {
        clientId: client.id,
        createdById,
        title: `Demand Note - ${clientName}`,
        totalAmount: 0,
        status,
        dueDate: new Date(demandDate),
      },
    });

    // 3. Create Files
    const allFiles = [
      ...files.traffic.map((f: any) => ({ ...f, type: "traffic" })),
      ...files.medical.map((f: any) => ({ ...f, type: "medical" })),
      ...files.bills.map((f: any) => ({ ...f, type: "bills" })),
    ];

    for (const file of allFiles) {
      await prisma.demandFile.create({
        data: {
          demandNoteId: demandNote.id,
          uploadedById: createdById,
          fileName: file.name,
          fileUrl: file.url || "#",
          fileType: file.type,
          size: file.size,
        },
      });
    }

    // 4. Internal Notes
    if (internalNotes?.trim()) {
      await prisma.demandInternalNote.create({
        data: {
          demandNoteId: demandNote.id,
          createdById,
          content: internalNotes,
        },
      });
    }

    // 5. Timeline entry
    await prisma.demandTimeline.create({
      data: {
        demandNoteId: demandNote.id,
        type: "created",
        message: "Demand Note generated",
      },
    });

    // 6. Status History
    await prisma.demandStatusHistory.create({
      data: {
        demandNoteId: demandNote.id,
        changedById: createdById,
        oldStatus: "draft",
        newStatus: status,
      },
    });

    return NextResponse.json(
      { success: true, demandNote },
      { status: 201 }
    );
  } catch (error) {
    console.log("❌ Error creating demand note:", error);
    return NextResponse.json({ error: "Error creating demand note" }, { status: 500 });
  }
}
