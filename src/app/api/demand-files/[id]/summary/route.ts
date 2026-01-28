import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id: fileId } = await params;

        if (!fileId) {
            return NextResponse.json(
                { error: "File ID is required" },
                { status: 400 }
            );
        }

        const task = await prisma.task.findFirst({
            where: {
                demandFileId: fileId,
                job: {
                    createdById: session.user.id
                }
            },
            orderBy: {
                createdAt: 'desc'
            },
            select: {
                id: true,
                outputSummary: true,
                editedSummary: true,
                editedSummaryTs: true,
                endTs: true,
            }
        });


        if (!task) {
            return NextResponse.json({
                success: true,
                summary: null,
                editedSummary: null,
                message: "No summary found for this file"
            });
        }

        return NextResponse.json({
            success: true,
            summary: (task as any).outputSummary,
            editedSummary: (task as any).editedSummary,
            editedSummaryTs: (task as any).editedSummaryTs,
            summaryTs: (task as any).endTs,
        });

    } catch (error) {
        console.error("❌ File summary fetch error:", error);
        return NextResponse.json(
            { error: "Failed to fetch file summary", details: error instanceof Error ? error.message : "Unknown error" },
            { status: 500 }
        );
    }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id: fileId } = await params;
        const body = await request.json();
        const { summary } = body;

        if (!fileId) {
            return NextResponse.json({ error: "File ID is required" }, { status: 400 });
        }

        if (typeof summary !== 'string') {
            return NextResponse.json({ error: "Summary content is required" }, { status: 400 });
        }

        const task = await prisma.task.findFirst({
            where: {
                demandFileId: fileId,
                job: {
                    createdById: session.user.id
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        if (!task) {
            return NextResponse.json({ error: "Task not found" }, { status: 404 });
        }

        const updatedTask = await prisma.task.update({
            where: { id: task.id },
            data: {
                editedSummary: summary,
                editedSummaryTs: new Date()
            }
        });

        // Update Job publishStatus to 'draft'
        const file = await prisma.demandFile.findUnique({
            where: { id: fileId },
            select: { demandNoteId: true }
        });

        if (file) {
            await (prisma.job as any).updateMany({
                where: { demandNoteId: file.demandNoteId },
                data: { publishStatus: 'draft' }
            });
        }

        return NextResponse.json({
            success: true,
            message: "Summary updated successfully",
            editedSummary: (updatedTask as any).editedSummary,
            editedSummaryTs: (updatedTask as any).editedSummaryTs
        });

    } catch (error) {
        console.error("❌ File summary update error:", error);
        return NextResponse.json(
            { error: "Failed to update file summary", details: error instanceof Error ? error.message : "Unknown error" },
            { status: 500 }
        );
    }
}
