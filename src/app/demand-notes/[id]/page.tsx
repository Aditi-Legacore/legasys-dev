"use client";

import { useState, useRef, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { format, isValid, parseISO } from "date-fns";
import {
  ArrowLeft,
  Download,
  Edit,
  FileText,
  Calendar,
  User,
  Clock,
  Eye,
  Loader2,
  Upload,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { StatusBadge, DemandNoteStatus } from "@/components/demand-notes/StatusBadge";
import { Badge } from "@/components/ui/badge";
import { ActivityTimeline } from "@/components/demand-notes/ActivityTimeline";
import { DocumentPreviewModal } from "@/components/demand-notes/DocumentPreviewModal";
import { toast } from "sonner";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";


interface FileType {
  createdAt: string | null;
  id: string;
  fileName: string;
  size: number;
  fileCategory: string;
  fileUrl: string;
  uploadedAt: string | null; // Changed to nullable
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
  files: FileType[];
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
  params: Promise<{ id: string }>;
}

export default function DemandNoteView({ params }: DemandNoteViewProps) {
  const router = useRouter();
  const { id } = use(params);
  const contentRef = useRef<HTMLDivElement | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [demandNote, setDemandNote] = useState<DemandNote | null>(null);
  const [timeline, setTimeline] = useState<any[]>([]);
  const [notes, setNotes] = useState<any[]>([]);
  const [previewFile, setPreviewFile] = useState<{ name: string; url: string } | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("traffic");
  // const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadFiles, setUploadFiles] = useState<File[]>([]);

  const [isUploadOpen, setIsUploadOpen] = useState(false);


  // Safe date formatting function
  const formatDate = (dateString: string | null | undefined, formatStr: string = 'MM/dd/yyyy') => {
    if (!dateString) return "Unknown date";
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return "Invalid date";
      }
      return format(date, formatStr);
    } catch (error) {
      console.error("Date formatting error:", error, dateString);
      return "Invalid date";
    }
  };

  // Fetch demand note data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        const [demandResponse, timelineResponse, notesResponse] = await Promise.all([
          fetch(`/api/demand-notes/${id}`),
          fetch(`/api/demand-notes/${id}/timeline`),
          fetch(`/api/demand-notes/${id}/notes`),
        ]);

        if (!demandResponse.ok) {
          throw new Error('Failed to fetch demand note');
        }

        const demandData = await demandResponse.json();
        
        // Ensure files array exists and has proper uploadedAt dates
        const processedData = {
          ...demandData,
          files: (demandData.files || []).map((file: FileType) => ({
            ...file,
            uploadedAt: file.uploadedAt || file.createdAt || new Date().toISOString(),
          }))
        };
        
        setDemandNote(processedData);

        if (timelineResponse.ok) {
          const timelineData = await timelineResponse.json();
          setTimeline(timelineData);
        }

        if (notesResponse.ok) {
          const notesData = await notesResponse.json();
          setNotes(notesData);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load demand note');
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchData();
    }
  }, [id]);

  // Convert timeline to activity events format with safe date formatting
  const activityEvents = timeline.map((event) => ({
    id: event.id,
    type: event.type as any,
    description: event.message,
    timestamp: formatDate(event.createdAt, 'yyyy-MM-dd HH:mm'),
    user: 'System',
  }));

  // Group files by category
  const groupedFiles = {
    traffic: demandNote?.files?.filter((f: FileType) => f.fileCategory === "traffic") || [],
    medical: demandNote?.files?.filter((f: FileType) => f.fileCategory === "medical") || [],
    bills: demandNote?.files?.filter((f: FileType) => f.fileCategory === "bills") || [],
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  // Handle file upload
  const handleFileUpload = async () => {
    if (!uploadFiles.length || !demandNote) {
      toast.error("Please select files to upload");
      return;
    }
  
    setIsUploading(true);
  
    try {
      const uploadedFiles: any[] = [];
  
      for (const file of uploadFiles) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("demandNoteId", demandNote.id);
        formData.append("fileCategory", selectedCategory);
  
        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });
  
        if (!response.ok) {
          throw new Error(`Failed to upload ${file.name}`);
        }
  
        const result = await response.json();
        uploadedFiles.push(result.file);
      }
  
      // Update demand note files once
      setDemandNote((prev) =>
        prev
          ? {
              ...prev,
              files: [...prev.files, ...uploadedFiles],
            }
          : null
      );
  
      // Refresh timeline once
      const timelineResponse = await fetch(
        `/api/demand-notes/${id}/timeline`
      );
      if (timelineResponse.ok) {
        const timelineData = await timelineResponse.json();
        setTimeline(timelineData);
      }
  
      setUploadFiles([]);
      setIsUploadOpen(false); // ✅ close modal
      toast.success("Files uploaded successfully");
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload one or more files");
    } finally {
      setIsUploading(false);
    }
  };

  // remove (✕) button per file so users can delete selected files before upload.
  const handleRemoveFile = (index: number) => {
    setUploadFiles((prev) => prev.filter((_, i) => i !== index));
  };
  
  

  // Handle file delete
  const handleDeleteFile = async (fileId: string) => {
    if (!confirm("Are you sure you want to delete this file?")) return;

    try {
      const response = await fetch(`/api/upload?fileId=${fileId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Delete failed");
      }

      // Remove file from state
      setDemandNote(prev => prev ? {
        ...prev,
        files: prev.files.filter(f => f.id !== fileId)
      } : null);

      // Refresh timeline
      const timelineResponse = await fetch(`/api/demand-notes/${id}/timeline`);
      if (timelineResponse.ok) {
        const timelineData = await timelineResponse.json();
        setTimeline(timelineData);
      }

      toast.success("File deleted successfully");
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Failed to delete file");
    }
  };

  // Handle file download
  const handleDownloadFile = (fileUrl: string, fileName: string) => {
    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Handle file preview
  const handlePreviewFile = (fileUrl: string, fileName: string) => {
    setPreviewFile({ name: fileName, url: fileUrl });
  };

  const handleExportPDF = async () => {
    setIsExporting(true);
    try {
      const element = document.getElementById("demand-note-content") || contentRef.current;
      if (!element) throw new Error("Content element not found");

      const canvas = await html2canvas(element as HTMLElement, {
        scale: 2,
        useCORS: true,
        logging: false,
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = 210;
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      if (pdfHeight <= 297) {
        pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      } else {
        let remainingHeight = canvas.height;
        const pageCanvas = document.createElement("canvas");
        const pageCtx = pageCanvas.getContext("2d")!;
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

      pdf.save(`demand_note_${demandNote?.id}.pdf`);
      toast.success("Demand note exported as PDF.");
    } catch (err) {
      console.error(err);
      toast.error("Failed to export PDF. Try again.");
    } finally {
      setIsExporting(false);
    }
  };

  const handleBack = () => {
    router.back();
  };


  const getInitials = (name: string) =>
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();

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
                        <span>{formatDate(demandNote.dueDate, 'MM/dd/yyyy')}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        <span>Updated {formatDate(demandNote.updatedAt, 'MM/dd/yyyy HH:mm')}</span>
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
              <Button onClick={() => setIsUploadOpen(true)}>
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
                      {formatDate(demandNote.dueDate, 'MM/dd/yyyy')}
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


            {/* File Upload Section */}
            <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
              <DialogContent className="max-w-lg p-0">
                {/* REQUIRED for accessibility */}
                <DialogHeader className="sr-only">
                  <DialogTitle>Upload New Document</DialogTitle>
                </DialogHeader>

                {/* Your existing Card UI */}
                <Card>
                  <CardHeader>
                    <CardTitle>Upload New Document</CardTitle>
                  </CardHeader>

                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Category</Label>
                          <Select
                            value={selectedCategory}
                            onValueChange={setSelectedCategory}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="traffic">Traffic Reports</SelectItem>
                              <SelectItem value="medical">Medical Reports</SelectItem>
                              <SelectItem value="bills">Medical Bills</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label>File</Label>
                          <Input
                            id="file"
                            type="file"
                            multiple
                            onChange={(e) =>
                              setUploadFiles(e.target.files ? Array.from(e.target.files) : [])
                            }
                            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                          />
                            { uploadFiles.length > 0 && (
                              <ul className="space-y-2">
                                {uploadFiles.map((file, idx) => (
                                  <li
                                    key={`${file.name}-${idx}`}
                                    className="flex items-center justify-between rounded-md border px-3 py-2 text-sm"
                                  >
                                    <span className="truncate text-muted-foreground">
                                      📄 {file.name}
                                    </span>

                                    <button
                                      type="button"
                                      onClick={() => handleRemoveFile(idx)}
                                      className="ml-2 rounded-full p-1 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                      aria-label={`Remove ${file.name}`}
                                    >
                                      ✕
                                    </button>
                                  </li>
                                ))}
                              </ul>
                            )}

                        </div>
                      </div>

                      <Button
                        onClick={handleFileUpload}
                        disabled={uploadFiles.length === 0 || isUploading}

                        className="w-full"
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        {isUploading ? "Uploading..." : "Upload Document"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </DialogContent>
            </Dialog>


            {/* Documents */}
            <div className="space-y-6">
              {Object.entries(groupedFiles).map(([group, files]) => (
                <Card key={group}>
                  <CardHeader>
                    <CardTitle className="capitalize">
                      {group === "traffic" && "Traffic Reports"}
                      {group === "medical" && "Medical Reports"}
                      {group === "bills" && "Medical Bills"}
                      <Badge variant="secondary" className="ml-2">
                        {(files as FileType[]).length} files
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {(files as FileType[]).length === 0 ? (
                      <p className="text-sm text-gray-500">No files uploaded.</p>
                    ) : (
                      <div className="space-y-3">
                        {(files as FileType[]).map((file) => (
                          <div
                            key={file.id}
                            className="p-3 border rounded-lg flex items-center justify-between hover:bg-gray-50"
                          >
                            <div className="flex items-center gap-3">
                              <FileText className="h-5 w-5 text-blue-600" />
                              <div>
                                <p className="font-medium">{file.fileName}</p>
                                <p className="text-xs text-gray-500">
                                  {formatFileSize(file.size)} • 
                                  Uploaded {formatDate(file.uploadedAt, 'MM/dd/yyyy')}
                                </p>
                              </div>
                            </div>

                            <div className="flex gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handlePreviewFile(file.fileUrl, file.fileName)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDownloadFile(file.fileUrl, file.fileName)}
                              >
                                <Download className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDeleteFile(file.id)}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
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
                    {Object.entries(groupedFiles).map(([group, files]) => (
                      <div key={group}>
                        <p className="text-muted-foreground mb-1.5 font-sans capitalize">
                          {group} Reports:
                        </p>
                        <ul className="list-disc list-inside text-foreground space-y-1">
                          {(files as FileType[]).length === 0 ? (
                            <li className="text-muted-foreground">No files</li>
                          ) : (
                            (files as FileType[]).map((file) => (
                              <li key={file.id}>{file.fileName}</li>
                            ))
                          )}
                        </ul>
                        <Separator className="my-2" />
                      </div>
                    ))}
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
                    <p className="text-sm">{formatDate(demandNote.createdAt, 'MM/dd/yyyy HH:mm')}</p>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground mb-1">Last Updated</p>
                  <div className="flex items-center gap-2">
                    <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                    <p className="text-sm">{formatDate(demandNote.updatedAt, 'MM/dd/yyyy HH:mm')}</p>
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
                          <span>{formatDate(note.createdAt, 'MM/dd/yyyy HH:mm')}</span>
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