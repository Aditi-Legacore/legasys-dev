import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id: demandNoteId } = await params;

        // Check if there's an existing combinedSummary in the Job table
        const job = await (prisma.job as any).findUnique({
            where: { demandNoteId }
        });

        if (job?.combinedSummary) {
            return NextResponse.json({ summaries: job.combinedSummary, isExisting: true });
        }

        // Otherwise aggregate from scratch
        const files = await prisma.demandFile.findMany({
            where: { demandNoteId },
            include: {
                tasks: {
                    orderBy: { createdAt: 'desc' },
                    take: 1,
                }
            }
        });

        const summaries = files.map(file => {
            const task = (file as any).tasks[0];
            if (!task) return `### ${file.fileName}\n(No summary available)\n`;
            const summaryText = task.editedSummary || task.outputSummary || "(No summary available)";
            return `### ${file.fileName}\n${summaryText}\n`;
        }).join("\n---\n\n");

        // Save this initial aggregation if a job exists
        if (job) {
            await (prisma.job as any).update({
                where: { id: job.id },
                data: { combinedSummary: summaries }
            });
        }

        return NextResponse.json({ summaries, isExisting: false });
    } catch (err) {
        console.error("❌ GET /api/demand-notes/[id]/draft error:", err);
        return NextResponse.json(
            { error: "Failed to fetch aggregated summaries" },
            { status: 500 }
        );
    }
}

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id: demandNoteId } = await params;
        const { summaries } = await request.json();

        // Update Job table
        const updatedJob = await (prisma.job as any).update({
            where: { demandNoteId },
            data: {
                combinedSummary: summaries,
                publishStatus: 'draft'
            }
        });

        return NextResponse.json({ success: true, combinedSummary: updatedJob.combinedSummary });
    } catch (err) {
        console.error("❌ PUT /api/demand-notes/[id]/draft error:", err);
        return NextResponse.json(
            { error: "Failed to update draft" },
            { status: 500 }
        );
    }
}
