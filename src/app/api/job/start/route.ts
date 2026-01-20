import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { spawn } from "child_process";
import path from "path";

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { demandNoteId, demandFileId } = body;

        if (!demandNoteId) {
            return NextResponse.json(
                { error: "Missing required field: demandNoteId" },
                { status: 400 }
            );
        }

        // Check if demand note exists
        const demandNote = await prisma.demandNote.findFirst({
            where: {
                id: demandNoteId,
                createdById: session.user.id,
            },
        });

        if (!demandNote) {
            return NextResponse.json(
                { error: "Demand note not found" },
                { status: 404 }
            );
        }

        // Get files for this demand note
        // If demandFileId is provided, filter for that specific file
        const files = await prisma.demandFile.findMany({
            where: {
                demandNoteId,
                id: demandFileId || undefined, // undefined means ignore this filter
            },
        });

        if (files.length === 0) {
            return NextResponse.json(
                { error: "No files found" },
                { status: 400 }
            );
        }

        // Create Job
        const job = await prisma.job.create({
            data: {
                demandNoteId,
                demandFileId, // Save file ID
                createdById: session.user.id,
                status: "pending",
                numTasks: files.length,
            },
        });

        // Create Tasks
        const tasksData = files.map((file) => ({
            jobId: job.id,
            fileName: file.fileName,
            filePath: file.filePath || "", // fallback if empty
            status: "pending",
        }));

        await prisma.task.createMany({
            data: tasksData,
        });

        // Spawn Python Process
        const pythonScriptPath = path.join(process.cwd(), "scripts", "process_job.py");

        // Using 'python' or 'python3' depending on environment. modifying to be configurable or generic?
        // For now assuming python is available.
        const pythonProcess = spawn("python", [pythonScriptPath, job.id], {
            detached: true,
            stdio: "ignore", // "ignore" so we don't wait for it
        });

        pythonProcess.unref(); // Allow node process to complete without waiting for python child

        return NextResponse.json({
            success: true,
            jobId: job.id,
            message: "Job started successfully",
        });

    } catch (error) {
        console.error("❌ Job start error:", error);
        return NextResponse.json(
            { error: "Failed to start job", details: error instanceof Error ? error.message : "Unknown error" },
            { status: 500 }
        );
    }
}
