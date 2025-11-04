import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { prisma } from "@/lib/prisma";

// for upload document
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    if (!id) return NextResponse.json({ error: "Invalid intake ID" }, { status: 400 });

    const intake = await prisma.intakeInfo.findUnique({ where: { id } });
    if (!intake) return NextResponse.json({ error: "Intake not found" }, { status: 404 });

    const data = await request.formData();
    const files = data.getAll("files") as File[];
    if (!files.length) return NextResponse.json({ error: "No files uploaded" }, { status: 400 });

    const allowedTypes = ["application/pdf", "image/jpeg", "image/png"];
    const maxSize = 600 * 1024; // 600KB
    const uploadsDir = join(process.cwd(), "uploads", "documents");
    await mkdir(uploadsDir, { recursive: true });

    const uploadedDocs = [];

    for (const file of files) {
      if (!allowedTypes.includes(file.type)) continue;
      if (file.size > maxSize) continue;

      const timestamp = Date.now();
      const ext = file.name.split(".").pop();
      const storedFileName = `${id}_${timestamp}_${file.name.replace(/\s+/g, "_")}`;
      const filePath = join(uploadsDir, storedFileName);

      const buffer = Buffer.from(await file.arrayBuffer());
      await writeFile(filePath, buffer);

      const doc = await prisma.document.create({
        data: {
          intakeId: id,
          fileName: file.name,
          filePath: `/uploads/documents/${storedFileName}`,
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



