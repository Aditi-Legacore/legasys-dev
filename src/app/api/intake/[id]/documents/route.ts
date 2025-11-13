import { NextRequest, NextResponse } from "next/server";
import { put, del } from "@vercel/blob";
import { prisma } from "@/lib/prisma";

// for uploading documents to db and uploads/documents folder
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id) return NextResponse.json({ error: "Invalid intake ID" }, { status: 400 });

    const intake = await prisma.intakeInfo.findUnique({ where: { id } });
    if (!intake) return NextResponse.json({ error: "Intake not found" }, { status: 404 });

    const data = await request.formData();
    const files = data.getAll("files") as File[];
    if (!files.length) return NextResponse.json({ error: "No files uploaded" }, { status: 400 });

    const allowedTypes = ["application/pdf", "image/jpeg", "image/png"];
    const totalMaxSize = 5 * 1024 * 1024; // 5MB

    // Calculate total size
    const totalSize = files.reduce((sum, file) => sum + file.size, 0);
    if (totalSize > totalMaxSize) return NextResponse.json({ error: "Total upload size exceeds 5MB" }, { status: 400 });

    const uploadedDocs = [];

    for (const file of files) {
      if (!allowedTypes.includes(file.type)) continue;

      const timestamp = Date.now();
      const storedFileName = `${id}_${timestamp}_${file.name.replace(/\s+/g, "_")}`;

      // Upload to Vercel Blob
      const blob = await put(storedFileName, file, {
        access: 'public',
      });

      const doc = await prisma.document.create({
        data: {
          intakeId: id,
          fileName: file.name,
          filePath: blob.url,
          mimeType: file.type,
        },
      });

      uploadedDocs.push(doc);
    }

    return NextResponse.json(
      { message: "Documents uploaded successfully", uploadedDocs },
      { status: 201 }
    );
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Failed to upload documents" }, { status: 500 });
  }
}

// for viewing the uploaded documents image in page.tsx

// export async function GET(
//   _request: Request,
//   { params }: { params: Promise<{ id: string }> }
// ) {
//   try {
//     const { id } = await params;

//     const documents = await prisma.document.findMany({
//       where: { intakeId: id },
//       select: {
//         id: true,
//         fileName: true,
//         filePath: true,
//         mimeType: true,
//       },
//     });

//     if (!documents || documents.length === 0) {
//       return NextResponse.json([], { status: 200 });
//     }

//     return NextResponse.json(documents);
//   } catch (error) {
//     console.error("Error fetching document files:", error);
//     return NextResponse.json(
//       { error: "Failed to fetch document files" },
//       { status: 500 }
//     );
//   }
// }

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const documents = await prisma.document.findMany({
      where: { intakeId: id },
      select: {
        id: true,
        fileName: true,
        filePath: true,
        mimeType: true,
        uploadedAt: true, // ✅ add this line
        intake: {
          select: {
            clientName: true,
          },
        },
      },
      orderBy: { uploadedAt: "desc" }, // optional, newest first
    });

    return NextResponse.json(documents);
  } catch (error) {
    console.error("Error fetching document files:", error);
    return NextResponse.json(
      { error: "Failed to fetch document files" },
      { status: 500 }
    );
  }
}

// for deleting a document
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { documentId } = await request.json();

    if (!documentId) {
      return NextResponse.json({ error: "Document ID is required" }, { status: 400 });
    }

    // Check if the document belongs to the intake
    const document = await prisma.document.findFirst({
      where: { id: documentId, intakeId: id },
    });

    if (!document) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    // Delete the blob from Vercel Blob
    await del(document.filePath);

    // Delete the document from database
    await prisma.document.delete({
      where: { id: documentId },
    });

    return NextResponse.json({ message: "Document deleted successfully" });
  } catch (error) {
    console.error("Delete error:", error);
    return NextResponse.json({ error: "Failed to delete document" }, { status: 500 });
  }
}
