import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const activityLogs = await prisma.activityLog.findMany({
      where: { intakeId: id },
      orderBy: { createdAt: 'desc' },
    });
    const transformedLogs = activityLogs.map(log => ({
      id: log.id,
      action: log.action,
      details: log.details,
      createdAt: log.createdAt,
      createdBy: log.createdBy,
    }));
    return NextResponse.json(transformedLogs);
  } catch (error) {
    console.error("Error fetching activity logs:", error);
    return NextResponse.json({ error: "Failed to fetch activity logs" }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { action, details, createdBy } = await request.json();

    if (!action || !createdBy) {
      return NextResponse.json({ error: "Action and createdBy are required" }, { status: 400 });
    }

    const activityLog = await prisma.activityLog.create({
      data: {
        intakeId: id,
        action,
        details,
        createdBy,
      },
    });

    return NextResponse.json(activityLog, { status: 201 });
  } catch (error) {
    console.error("Error creating activity log:", error);
    return NextResponse.json({ error: "Failed to create activity log" }, { status: 500 });
  }
}
