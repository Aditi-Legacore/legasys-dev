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
    console.log("Upload request for intake ID:", id);
    if (!id) return NextResponse.json({ error: "Invalid intake ID" }, { status: 400 });

    const intake = await prisma.intakeInfo.findUnique({ where: { id } });
    if (!intake) return NextResponse.json({ error: "Intake not found" }, { status: 404 });

    const data = await request.formData();
    const files = data.getAll("files") as File[];
    console.log("Files received:", files.length);
    if (!files.length) return NextResponse.json({ error: "No files uploaded" }, { status: 400 });

    const allowedTypes = ["application/pdf", "image/jpeg", "image/png"];
    const totalMaxSize = 5 * 1024 * 1024; // 5MB

    // Calculate total size
    const totalSize = files.reduce((sum, file) => sum + file.size, 0);
    console.log("Total file size:", totalSize);
    if (totalSize > totalMaxSize) return NextResponse.json({ error: "Total upload size exceeds 5MB" }, { status: 400 });

    const uploadedDocs = [];

    for (const file of files) {
      console.log("Processing file:", file.name, "Type:", file.type, "Size:", file.size);
      if (!allowedTypes.includes(file.type)) {
        console.log("Skipping file due to invalid type:", file.type);
        continue;
      }

      const timestamp = Date.now();
      const storedFileName = `${id}_${timestamp}_${file.name.replace(/\s+/g, "_")}`;

      // Upload to Vercel Blob
      const blob = await put(storedFileName, file, {
        access: 'public',
        token: process.env.legasys_dev_blob_READ_WRITE_TOKEN,
      });

      console.log("Creating document record in database...");
      const doc = await prisma.document.create({
        data: {
          intakeId: id,
          fileName: file.name,
          filePath: blob.url,
          mimeType: file.type,
        },
      });
      console.log("Document record created:", doc.id);

      uploadedDocs.push(doc);
    }

    console.log("Upload completed successfully for", uploadedDocs.length, "files");
    return NextResponse.json(
      { message: "Documents uploaded successfully", uploadedDocs },
      { status: 201 }
    );
  } catch (error) {
    console.error("Upload error:", error);
    if (error instanceof Error) {
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
      if ('code' in error) {
        console.error("Error code:", error.code);
      }
    }
    if (error instanceof Error && 'code' in error && error.code === 'EROFS') {
      return NextResponse.json({ error: "File system is read-only. Please try again later." }, { status: 500 });
    }
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

// for viewing the uploaded documents image in page.tsx


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
