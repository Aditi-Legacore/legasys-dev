import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    console.log("📥 POST /api/leads - Received data:", data);

    const lead = await prisma.lead.create({
      data: {
        name: data.fullName,
        phone: data.phone,
        contact: data.email,
        email: data.email,
        dueDate: new Date(data.dateOfLoss),
        caseType: data.caseType,
        description: data.description,
        referralSource: data.referralSource,
        status: "new",
        matter: "-",
      },
    });

    console.log("✅ Lead created:", lead);
    return NextResponse.json(lead, { status: 201 });
  } catch (err: any) {
    console.error("❌ POST /api/leads error:", err);
    return NextResponse.json({ error: "Failed to create lead", details: err.message }, { status: 500 });
  }
}

export async function GET() {
  try {
    const leads = await prisma.lead.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(leads, { status: 200 });
  } catch (err) {
    console.error("❌ GET /api/leads error:", err);
    return NextResponse.json({ error: "Failed to fetch leads" }, { status: 500 });
  }
}
