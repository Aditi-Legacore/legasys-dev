"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import {
  ArrowLeft,
  Download,
  Edit,
  FileText,
  Calendar,
  User,
  Clock,
  Eye,
  Share2,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { StatusBadge, DemandNoteStatus } from "@/components/demand-notes/StatusBadge";
import { Badge } from "@/components/ui/badge";
import { ActivityTimeline } from "@/components/demand-notes/ActivityTimeline";
import { DocumentPreviewModal } from "@/components/demand-notes/DocumentPreviewModal";
import { Avatar } from "@/components/ui/avatar";
import { toast } from "sonner";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

interface UploadedFile {
  id: string;
  name: string;
  size: number;
}

interface DemandNote {
  id: string;
  title: string;
  description: string | null;
  status: DemandNoteStatus;
  totalAmount: number;
  dueDate: string;
  createdAt: string;
  updatedAt: string;
  client: {
    id: string;
    name: string;
  };
  createdBy: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  internalNotes: Array<{
    id: string;
    content: string;
    createdAt: string;
    createdBy: {
      id: string;
      firstName: string;
      lastName: string;
      email: string;
    };
  }>;
  timeline: Array<{
    id: string;
    type: string;
    message: string;
    createdAt: string;
    metadata?: any;
  }>;
}

interface DemandNoteViewProps {
  params: { id: string };
}

export default function DemandNoteView({ params }: DemandNoteViewProps) {
  const router = useRouter();
  const { id } = params;

  // Loading and data states
  const [isLoading, setIsLoading] = useState(true);
  const [demandNote, setDemandNote] = useState<DemandNote | null>(null);
  const [timeline, setTimeline] = useState<any[]>([]);
  const [notes, setNotes] = useState<any[]>([]);
  const [documents, setDocuments] = useState<any[]>([]);

  // Modal / preview state
  const [previewFile, setPreviewFile] = useState<{ name: string; url: string } | null>(
    null
  );

  // Exporting state
  const [isExporting, setIsExporting] = useState(false);

  // Fetch demand note data
  useEffect(() => {
    const fetchDemandNote = async () => {
      try {
        const response = await fetch(`/api/demand-notes/${id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch demand note');
        }
        const data = await response.json();
        setDemandNote(data);
      } catch (error) {
        console.error('Error fetching demand note:', error);
        toast.error('Failed to load demand note');
      } finally {
        setIsLoading(false);
      }
    };

    const fetchTimeline = async () => {
      try {
        const response = await fetch(`/api/demand-notes/${id}/timeline`);
        if (response.ok) {
          const data = await response.json();
          setTimeline(data);
        }
      } catch (error) {
        console.error('Error fetching timeline:', error);
      }
    };

    const fetchNotes = async () => {
      try {
        const response = await fetch(`/api/demand-notes/${id}/notes`);
        if (response.ok) {
          const data = await response.json();
          setNotes(data);
        }
      } catch (error) {
        console.error('Error fetching notes:', error);
      }
    };

    const fetchDocuments = async () => {
      try {
        const response = await fetch(`/api/documents?demandNoteId=${id}`);
        if (response.ok) {
          const data = await response.json();
          setDocuments(data);
        }
      } catch (error) {
        console.error('Error fetching documents:', error);
      }
    };

    if (id) {
      fetchDemandNote();
      fetchTimeline();
      fetchNotes();
      fetchDocuments();
    }
  }, [id]);

  // Convert timeline to activity events format
  const activityEvents = timeline.map((event) => ({
    id: event.id,
    type: event.type as any,
    description: event.message,
    timestamp: format(new Date(event.createdAt), 'yyyy-MM-dd HH:mm'),
    user: 'System', // You can enhance this to show actual user
  }));

  // Categorize documents based on file names or types
  const trafficFiles: UploadedFile[] = documents.filter(doc =>
    doc.fileName.toLowerCase().includes('traffic') ||
    doc.fileName.toLowerCase().includes('accident') ||
    doc.fileName.toLowerCase().includes('police')
  ).map(doc => ({
    id: doc.id,
    name: doc.fileName,
    size: doc.fileSize || 0
  }));

  const medicalFiles: UploadedFile[] = documents.filter(doc =>
    doc.fileName.toLowerCase().includes('medical') ||
    doc.fileName.toLowerCase().includes('hospital') ||
    doc.fileName.toLowerCase().includes('doctor') ||
    doc.fileName.toLowerCase().includes('report')
  ).map(doc => ({
    id: doc.id,
    name: doc.fileName,
    size: doc.fileSize || 0
  }));

  const billFiles: UploadedFile[] = documents.filter(doc =>
    doc.fileName.toLowerCase().includes('bill') ||
    doc.fileName.toLowerCase().includes('invoice') ||
    doc.fileName.toLowerCase().includes('receipt')
  ).map(doc => ({
    id: doc.id,
    name: doc.fileName,
    size: doc.fileSize || 0
  }));

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading demand note...</span>
        </div>
      </div>
    );
  }

  if (!demandNote) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Demand note not found</h2>
          <Button onClick={() => router.push('/demand-notes')}>
            Back to Demand Notes
          </Button>
        </div>
      </div>
    );
  }

  const contentRef = useRef<HTMLDivElement | null>(null);

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  // Exports the element with id 'demand-note-content' into a PDF.
  const handleExportPDF = async () => {
    setIsExporting(true);
    try {
      const element = document.getElementById("demand-note-content") || contentRef.current;
      if (!element) throw new Error("Content element not found");

      // Take canvas (high DPI)
      const canvas = await html2canvas(element as HTMLElement, {
        scale: 2,
        useCORS: true,
        logging: false,
        windowWidth: document.documentElement.scrollWidth,
        windowHeight: document.documentElement.scrollHeight,
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");

      const pdfWidth = 210; // mm A4
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      // If content fits one page
      if (pdfHeight <= 297) {
        pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      } else {
        // Multi-page handling: split by page height
        let remainingHeight = canvas.height;
        const pageCanvas = document.createElement("canvas");
        const pageCtx = pageCanvas.getContext("2d")!;
        const pxPerMm = canvas.height / (pdfHeight); // approximate scaling
        const pageHeightPx = Math.floor((297 * canvas.width) / pdfWidth);

        let offsetY = 0;
        while (remainingHeight > 0) {
          pageCanvas.width = canvas.width;
          pageCanvas.height = Math.min(pageHeightPx, remainingHeight);

          pageCtx.clearRect(0, 0, pageCanvas.width, pageCanvas.height);
          pageCtx.drawImage(
            canvas,
            0,
            offsetY,
            pageCanvas.width,
            pageCanvas.height,
            0,
            0,
            pageCanvas.width,
            pageCanvas.height
          );

          const pageData = pageCanvas.toDataURL("image/png");
          const h = (pageCanvas.height * pdfWidth) / pageCanvas.width;

          if (offsetY > 0) pdf.addPage();
          pdf.addImage(pageData, "PNG", 0, 0, pdfWidth, h);

          remainingHeight -= pageCanvas.height;
          offsetY += pageCanvas.height;
        }
      }

      pdf.save(`demand_note_${demandNote.id}.pdf`);
      toast.success("Demand note exported as PDF.");
    } catch (err) {
      console.error(err);
      toast.error("Failed to export PDF. Try again.");
    } finally {
      setIsExporting(false);
    }
  };

  const handlePreviewFile = (fileName: string) => {
    // Replace with your real file URL logic
    const fileUrl = `https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf`;
    setPreviewFile({ name: fileName, url: fileUrl });
  };

  const handleDownloadFile = (file: UploadedFile) => {
    // Replace with real download logic. For demo, open preview and user can download.
    handlePreviewFile(file.name);
    toast.success("Opened preview — use the preview modal to download.");
  };

  const handleBack = () => {
    router.back();
  };

  const handleEdit = () => {
    router.push(`/demand-notes/${demandNote.id}/edit`);
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard.");
    } catch {
      toast.error("Could not copy link.");
    }
  };

  const getInitials = (name: string) =>
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();

  // render file list helper
  const renderFileList = (files: UploadedFile[], title: string) => (
    <Card key={title}>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <FileText className="h-4 w-4 text-muted-foreground" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {files.length === 0 ? (
          <p className="text-sm text-muted-foreground">No files uploaded</p>
        ) : (
          <div className="space-y-2">
            {files.map((file) => (
              <div
                key={file.id}
                className="flex items-center justify-between p-2 rounded-md bg-muted/50 hover:bg-muted transition-colors"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span className="text-sm truncate">{file.name}</span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs text-muted-foreground">
                    {formatFileSize(file.size)}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => handlePreviewFile(file.name)}
                    title="Preview document"
                  >
                    <Eye className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => handleDownloadFile(file)}
                    title="Download document"
                  >
                    <Download className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <Button
                variant="ghost"
                onClick={handleBack}
                className="mb-2"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Demand Notes
              </Button>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="font-bold">{getInitials(demandNote.client.name)}</span>
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-foreground">
                      {demandNote.client.name}
                    </h1>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <Badge variant="outline" className="font-mono text-xs">
                        {demandNote.id}
                      </Badge>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        <span>{format(new Date(demandNote.dueDate), 'MM/dd/yyyy')}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        <span>Updated {format(new Date(demandNote.updatedAt), 'MM/dd/yyyy HH:mm')}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="ml-auto">
                  <StatusBadge status={demandNote.status} />
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={handleExportPDF} disabled={isExporting}>
                <Download className="h-4 w-4 mr-2" />
                {isExporting ? "Exporting..." : "Export PDF"}
              </Button>
              <Button onClick={handleEdit}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div
          id="demand-note-content"
          ref={contentRef}
          className="grid grid-cols-1 lg:grid-cols-3 gap-6"
        >
          {/* Main */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Info Card */}
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Client Name</p>
                    <p className="text-sm font-medium">{demandNote.client.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Demand Date</p>
                    <p className="text-sm font-medium">
                      {format(new Date(demandNote.dueDate), 'MM/dd/yyyy')}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Demand Note ID</p>
                    <p className="text-sm font-medium font-mono">{demandNote.id}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Title</p>
                    <p className="text-sm font-medium">{demandNote.title}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Documents */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Uploaded Documents</h2>
              {renderFileList(trafficFiles, "Traffic Reports")}
              {renderFileList(medicalFiles, "Medical Reports")}
              {renderFileList(billFiles, "Medical Bills")}
            </div>

            {/* Generated Summary */}
            {demandNote.status === "generated" && (
              <Card className="border-success/20 bg-success/5">
                <CardHeader>
                  <CardTitle className="text-base">Generated Document Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 font-mono text-xs">
                    <div>
                      <p className="text-muted-foreground mb-1.5 font-sans">Traffic Reports:</p>
                      <ul className="list-disc list-inside text-foreground space-y-1">
                        {trafficFiles.map((file) => (
                          <li key={file.id}>{file.name}</li>
                        ))}
                      </ul>
                    </div>
                    <Separator />
                    <div>
                      <p className="text-muted-foreground mb-1.5 font-sans">Medical Reports:</p>
                      <ul className="list-disc list-inside text-foreground space-y-1">
                        {medicalFiles.map((file) => (
                          <li key={file.id}>{file.name}</li>
                        ))}
                      </ul>
                    </div>
                    <Separator />
                    <div>
                      <p className="text-muted-foreground mb-1.5 font-sans">Medical Bills:</p>
                      <ul className="list-disc list-inside text-foreground space-y-1">
                        {billFiles.map((file) => (
                          <li key={file.id}>{file.name}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Timeline */}
            <ActivityTimeline events={activityEvents} />

            {/* System Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">System Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Status</p>
                  <StatusBadge status={demandNote.status} />
                </div>

                <Separator />

                <div>
                  <p className="text-sm text-muted-foreground mb-1">Created By</p>
                  <div className="flex items-center gap-2">
                    <User className="h-3.5 w-3.5 text-muted-foreground" />
                    <p className="text-sm font-medium">{demandNote.createdBy.firstName} {demandNote.createdBy.lastName}</p>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground mb-1">Created At</p>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                    <p className="text-sm">{format(new Date(demandNote.createdAt), 'MM/dd/yyyy HH:mm')}</p>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground mb-1">Last Updated</p>
                  <div className="flex items-center gap-2">
                    <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                    <p className="text-sm">{format(new Date(demandNote.updatedAt), 'MM/dd/yyyy HH:mm')}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Internal Notes */}
            {demandNote.internalNotes && demandNote.internalNotes.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Internal Notes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {demandNote.internalNotes.map((note) => (
                      <div key={note.id} className="border-l-2 border-muted pl-3">
                        <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                          {note.content}
                        </p>
                        <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                          <User className="h-3 w-3" />
                          <span>{note.createdBy.firstName} {note.createdBy.lastName}</span>
                          <span>•</span>
                          <span>{format(new Date(note.createdAt), 'MM/dd/yyyy HH:mm')}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Document Preview Modal */}
      <DocumentPreviewModal
        isOpen={!!previewFile}
        onClose={() => setPreviewFile(null)}
        fileName={previewFile?.name || ""}
        fileUrl={previewFile?.url || ""}
      />
    </div>
  );
}