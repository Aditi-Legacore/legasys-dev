import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashReferenceId } from "@/lib/hashReferenceId";

export async function POST(req: NextRequest) {
  const { referenceId } = await req.json();

  // Find lead where hash matches the provided referenceId (which is already hashed)
  const leads = await prisma.lead.findMany();
  const lead = leads.find(l => hashReferenceId(l.referenceId!) === referenceId);

  if (!lead) {
    return NextResponse.json({ error: "Invalid reference ID" }, { status: 404 });
  }

  return NextResponse.json(lead, { status: 200 });
}

