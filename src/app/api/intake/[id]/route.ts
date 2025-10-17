import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    if (!id) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    const intake = await prisma.intakeInfo.findUnique({
      where: { id },
    });

    if (!intake) {
      return NextResponse.json({ error: "Intake not found" }, { status: 404 });
    }

    return NextResponse.json(intake, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to fetch intake" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    await prisma.intakeInfo.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Intake deleted successfully" }, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to delete intake" }, { status: 500 });
  }
}

// export async function PUT(
//   request: NextRequest,
//   { params }: { params: { id: string } }
// ) {
//   try {
//     const id = params.id;
//     const body = await request.json();

//     const updatedIntake = await prisma.intakeInfo.update({
//       where: { id },
//       data: body,
//     });

//     return NextResponse.json(updatedIntake, { status: 200 });
//   } catch (err) {
//     console.error(err);
//     return NextResponse.json({ error: "Failed to update intake" }, { status: 500 });
//   }
// }


export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const data = await req.json();

    console.log("📝 PUT /api/intake ID:", id);
    console.log("📦 PUT body:", data);

    const updated = await prisma.intakeInfo.update({
      where: { id },
      data,
    });

    return NextResponse.json(updated, { status: 200 });
  } catch (error: any) {
    console.error("❌ Error updating intake:", error);
    return NextResponse.json(
      { error: "Failed to update intake", details: error.message },
      { status: 500 }
    );
  }
}