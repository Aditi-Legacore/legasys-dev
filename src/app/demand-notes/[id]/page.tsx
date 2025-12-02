"use client";

import { useState, useRef, useEffect, use } from "react";
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
import { toast } from "sonner";

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
  files: Array<{
    id: string;
    fileName: string;
    fileUrl: string;
    fileType?: string;
    fileCategory?: string;
    size?: number;
    uploadedBy: {
      id: string;
      firstName: string;
      lastName: string;
    };
  }>;
}

interface DemandNoteViewProps {
  params: Promise<{ id: string }>;
}

export default function DemandNoteView({ params }: DemandNoteViewProps) {
  const router = useRouter();
  const { id } = use(params);
  const contentRef = useRef<HTMLDivElement | null>(null);

  // Loading and data states
  const [isLoading, setIsLoading] = useState(true);
  const [demand, setDemand] = useState<any>(null);
  const [demandNote, setDemandNote] = useState<DemandNote | null>(null);
  const [timeline, setTimeline] = useState<any[]>([]);
  const [notes, setNotes] = useState<any[]>([]);
  const [documents, setDocuments] = useState<any[]>([]);
  const [selectedFile, setSelectedFile] = useState<any>(null);
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
        const res = await fetch(`/api/demand-notes/${id}`);
        const data = await res.json();
        setDemandNote(data);
      } catch (err) {
        console.error("Error fetching demand note:", err);
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

    if (id) {
      fetchDemandNote();
      fetchTimeline();
      fetchNotes();
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
  const trafficFiles: UploadedFile[] = (demandNote?.files || []).filter(file =>
    file.fileName && (
      file.fileName.toLowerCase().includes('traffic') ||
      file.fileName.toLowerCase().includes('accident') ||
      file.fileName.toLowerCase().includes('police')
    )
  ).map(file => ({
    id: file.id,
    name: file.fileName || '',
    size: file.size || 0
  }));

  const medicalFiles: UploadedFile[] = (demandNote?.files || []).filter(file =>
    file.fileName && (
      file.fileName.toLowerCase().includes('medical') ||
      file.fileName.toLowerCase().includes('hospital') ||
      file.fileName.toLowerCase().includes('doctor') ||
      file.fileName.toLowerCase().includes('report')
    )
  ).map(file => ({
    id: file.id,
    name: file.fileName || '',
    size: file.size || 0
  }));

  const billFiles: UploadedFile[] = (demandNote?.files || []).filter(file =>
    file.fileName && (
      file.fileName.toLowerCase().includes('bill') ||
      file.fileName.toLowerCase().includes('invoice') ||
      file.fileName.toLowerCase().includes('receipt')
    )
  ).map(file => ({
    id: file.id,
    name: file.fileName || '',
    size: file.size || 0
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

  const groupedFiles = {
    traffic: demandNote.files?.filter((f: any) => f.fileCategory === "traffic") || [],
    medical: demandNote.files?.filter((f: any) => f.fileCategory === "medical") || [],
    bills: demandNote.files?.filter((f: any) => f.fileCategory === "bills") || [],
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  // Exports the element with id 'demand-note-content' into a PDF.
  const handleExportPDF = async () => {
    // Ensure this only runs on the client side
    if (typeof window === 'undefined') {
      toast.error("PDF export is not available on server-side rendering.");
      return;
    }

    setIsExporting(true);
    try {
      const { jsPDF } = await import('jspdf');

      // Create PDF directly with structured content
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'in',
        format: 'letter',
      });

      let yPosition = 1;
      const lineHeight = 0.25;
      const pageHeight = 10.5;
      const margin = 0.5;
      const maxWidth = 7.5;

      // Helper function to add text and handle page breaks
      const addText = (text: string, fontSize = 12, fontWeight: 'normal' | 'bold' = 'normal') => {
        if (fontWeight === 'bold') {
          pdf.setFont('helvetica', 'bold');
        } else {
          pdf.setFont('helvetica', 'normal');
        }
        pdf.setFontSize(fontSize);

        const lines = pdf.splitTextToSize(text, maxWidth);
        lines.forEach((line: string) => {
          if (yPosition > pageHeight) {
            pdf.addPage();
            yPosition = 1;
          }
          pdf.text(line, margin, yPosition);
          yPosition += lineHeight;
        });
      };

      // Add title
      addText(`Demand Note - ${demandNote.title}`, 16, 'bold');
      yPosition += 0.2;

      // Basic Information
      addText('Basic Information', 14, 'bold');
      yPosition += 0.1;

      addText(`Client Name: ${demandNote.client.name}`);
      addText(`Demand Date: ${format(new Date(demandNote.dueDate), 'MM/dd/yyyy')}`);
      addText(`Demand Note ID: ${demandNote.id}`);
      addText(`Status: ${demandNote.status}`);
      addText(`Created By: ${demandNote.createdBy.firstName} ${demandNote.createdBy.lastName}`);
      addText(`Created At: ${format(new Date(demandNote.createdAt), 'MM/dd/yyyy HH:mm')}`);
      addText(`Last Updated: ${format(new Date(demandNote.updatedAt), 'MM/dd/yyyy HH:mm')}`);
      yPosition += 0.2;

      // Files section
      if (demandNote.files && demandNote.files.length > 0) {
        addText('Attached Files', 14, 'bold');
        yPosition += 0.1;

        demandNote.files.forEach((file) => {
          addText(`• ${file.fileName} (${formatFileSize(file.size || 0)})`);
        });
        yPosition += 0.2;
      }

      // Internal Notes
      if (demandNote.internalNotes && demandNote.internalNotes.length > 0) {
        addText('Internal Notes', 14, 'bold');
        yPosition += 0.1;

        demandNote.internalNotes.forEach((note) => {
          addText(`Note by ${note.createdBy.firstName} ${note.createdBy.lastName} (${format(new Date(note.createdAt), 'MM/dd/yyyy HH:mm')}):`);
          addText(note.content);
          yPosition += 0.1;
        });
      }

      // Timeline
      if (timeline && timeline.length > 0) {
        addText('Activity Timeline', 14, 'bold');
        yPosition += 0.1;

        timeline.forEach((event) => {
          addText(`${format(new Date(event.createdAt), 'MM/dd/yyyy HH:mm')}: ${event.message}`);
        });
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

  const handlePreviewFile = (file: UploadedFile) => {
    const fileData = demandNote?.files.find(f => f.id === file.id);
    if (fileData) {
      setPreviewFile({ name: fileData.fileName, url: fileData.fileUrl });
    }
  };

  const handleDownloadFile = (file: UploadedFile) => {
    const fileData = demandNote?.files.find(f => f.id === file.id);
    if (fileData) {
      // Create a temporary link to download the file
      const link = document.createElement('a');
      link.href = fileData.fileUrl;
      link.download = fileData.fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("File download started.");
    }
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
                    onClick={() => handlePreviewFile(file)}
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
            <div className="space-y-6">
              {Object.entries(groupedFiles).map(([group, files]) => (
                <Card key={group}>
                  <CardHeader>
                    <CardTitle className="capitalize">{group} Reports</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {files.length === 0 ? (
                      <p className="text-sm text-gray-500">No files uploaded.</p>
                    ) : (
                      <div className="space-y-3">
                        {files.map((file: any) => (
                          <div
                            key={file.id}
                            className="p-3 border rounded-lg flex items-center justify-between"
                          >
                            <div className="flex items-center gap-3">
                              <FileText className="h-5 w-5 text-blue-600" />
                              <div>
                                <p>{file.fileName}</p>
                                <p className="text-xs text-gray-500">
                                  {(file.size / 1024).toFixed(1)} KB
                                </p>
                              </div>
                            </div>

                            <div className="flex gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setSelectedFile(file)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>

                              <a
                                href={file.fileUrl}
                                download
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <Button variant="ghost" size="icon">
                                  <Download className="h-4 w-4" />
                                </Button>
                              </a>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
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