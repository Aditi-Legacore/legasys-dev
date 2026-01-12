import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";


export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await request.json();
    console.log("📥 POST /api/demand-notes - Received data:", data);

    const {
      clientName,
      demandDate,
      status = "draft",
      internalNotes,
      totalAmount = 0,
      description,
      files = {},
    } = data;

    if (!clientName || !demandDate) {
      return NextResponse.json(
        { error: "clientName and demandDate are required" },
        { status: 400 }
      );
    }

    // 🔍 Find or create client
    let client = await prisma.defedantClient.findFirst({
      where: { name: clientName },
    });

    if (!client) {
      client = await prisma.defedantClient.create({
        data: { name: clientName },
      });
    }

    // 📝 Create demand note
    const demandNote = await prisma.demandNote.create({
      data: {
        clientId: client.id,
        createdById: session.user.id,
        title: `Demand Note for ${clientName}`,
        description: description || null,
        totalAmount,
        dueDate: new Date(demandDate),
        status,
      },
      include: {
        client: true,
        createdBy: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
      },
    });

    // 🧾 Internal notes
    if (internalNotes) {
      await prisma.demandInternalNote.create({
        data: {
          demandNoteId: demandNote.id,
          createdById: session.user.id,
          content: internalNotes,
        },
      });
    }

    // 🗂 Save uploaded files into DemandFile table
    const fileCategories = ["traffic", "medical", "bills"];

    for (const category of fileCategories) {
      const fileList = files[category] || [];

      for (const file of fileList) {
        console.log(file);
        
        await prisma.demandFile.create({
          data: {
            demandNoteId: demandNote.id,
            fileCategory: category,        // traffic | medical | bills
            fileName: file.name,
            size: file.size,
            fileUrl: file.fileUrl,        // "/uploads/fileName.pdf"
            uploadedById: session.user.id,
          },
        });
      }
    }

    // 📅 Timeline entry
    await prisma.demandTimeline.create({
      data: {
        demandNoteId: demandNote.id,
        type: "created",
        message: "Demand note created",
      },
    });

    console.log("✅ Demand note created with files:", demandNote);

    return NextResponse.json(demandNote, { status: 201 });
  } catch (err: any) {
    // console.error("❌ POST /api/demand-notes error:", err);
    return NextResponse.json(
      { error: "Failed to create demand note", details: err.message },
      { status: 500 }
    );
  }
}


export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const notes = await prisma.demandNote.findMany({
      where: { createdById: session.user.id },
      include: {
        client: true,
        files: true,
      },
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json(notes);
  } catch (err) {
    console.error("❌ GET /api/demand-notes error:", err);
    return NextResponse.json(
      { error: "Failed to fetch demand notes" },
      { status: 500 }
    );
  }
}