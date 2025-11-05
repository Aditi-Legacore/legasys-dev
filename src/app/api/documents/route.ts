import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { unlink } from "fs/promises";
import { join } from "path";

// for fetching uploaded documents in table

// export async function GET() {
//   try {
//     const intakes = await prisma.intakeInfo.findMany({
//       include: {
//         Document: true,
//       },
//       orderBy: { createdAt: "desc" },
//     });

//     const result = intakes.map((intake) => ({
//       id: intake.id,
//       clientName: intake.clientName,
//       caseType: "Personal Injury", // as it is not in intakeinfo table
//       status: intake.isDraft ? "Draft" : "Hired", // example
//       documentStatus: intake.Document.length > 0 ? "submitted" : "pending",
//       createdDate: intake.createdAt.toISOString(),
//       files: intake.Document.map((doc) => doc.fileName),
//     }));

//     return NextResponse.json(result);
//   } catch (error) {
//     console.error("Error fetching documents:", error);
//     return NextResponse.json({ error: "Failed to fetch documents" }, { status: 500 });
//   }
// }

export async function GET() {
  try {
    const intakes = await prisma.intakeInfo.findMany({
      include: {
        Document: true, // ✅ Use uppercase — matches schema
        Lead: {
          select: {
            caseType: true, // ✅ Fetch caseType from Lead
          },
        },
        user: true,
      },
      orderBy: { createdAt: "desc" },
    });

    const result = intakes.map((intake) => ({
      id: intake.id,
      clientName: intake.clientName,
      caseType: intake.Lead?.caseType || "N/A",
      status: intake.isDraft ? "Draft" : "Hired",
      documentStatus: intake.Document.length > 0 ? "submitted" : "pending",
      createdDate: intake.createdAt.toISOString(),
      files: intake.Document.map((doc) => doc.fileName),
    }));

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching documents:", error);
    return NextResponse.json(
      { error: "Failed to fetch documents" },
      { status: 500 }
    );
  }
}


// 🗑️ DELETE entire intake + related documents
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Intake ID required" }, { status: 400 });
    }

    // 🧾 Find intake and associated documents
    const intake = await prisma.intakeInfo.findUnique({
      where: { id },
      include: { Document: true },
    });

    if (!intake) {
      return NextResponse.json({ error: "Intake not found" }, { status: 404 });
    }

    // 🗂️ Try deleting physical files (if filePath exists)
    for (const doc of intake.Document) {
      if (doc.filePath) {
        const filePath = join(process.cwd(), doc.filePath);
        try {
          await unlink(filePath);
        } catch (err) {
          console.warn(`⚠️ File ${filePath} not found, skipping.`);
        }
      }
    }

    // 🗑️ Delete all associated documents
    await prisma.document.deleteMany({ where: { intakeId: id } });

    // 🧾 Finally, delete intake record
    await prisma.intakeInfo.delete({ where: { id } });

    return NextResponse.json({ message: "Intake and related documents deleted successfully." });
  } catch (error) {
    console.error("Error deleting intake & documents:", error);
    return NextResponse.json({ error: "Failed to delete intake" }, { status: 500 });
  }
}

// Working on this ....
export async function PUT(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Document ID required" }, { status: 400 });
    }

    const body = await request.json();
    const { fileName } = body;

    if (!fileName) {
      return NextResponse.json({ error: "fileName is required" }, { status: 400 });
    }

    const updatedDoc = await prisma.document.update({
      where: { id },
      data: { fileName },
    });

    return NextResponse.json({
      message: "Document updated successfully",
      updatedDoc,
    });
  } catch (error) {
    console.error("Error updating document:", error);
    return NextResponse.json({ error: "Failed to update document" }, { status: 500 });
  }
}
