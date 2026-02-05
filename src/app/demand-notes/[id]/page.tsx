"use client";

import { useState, useRef, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { format, isValid, parseISO, formatDistanceToNow } from "date-fns";
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
  Pencil,
  Upload,
  Trash2,
  Sparkles,
  Copy,
  X,
  ChevronDown,
  ChevronUp,
  GripVertical,
  Save,
  FileDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { StatusBadge, DemandNoteStatus } from "@/components/demand-notes/StatusBadge";
import { Badge } from "@/components/ui/badge";
import { DocumentPreviewModal } from "@/components/demand-notes/DocumentPreviewModal";
import { SummarizeJobModal } from "@/components/demand-notes/SummarizeJobModal";
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
import { HorizontalScrollContainer } from "@/components/ui/HorizontalScrollContainer";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DefaultCardComponent from "@/components/default-card-component";
import { Textarea } from "@/components/ui/textarea";

interface FileType {
  createdAt: string | null;
  id: string;
  fileName: string;
  size: number;
  fileCategory: string;
  fileUrl: string;
  uploadedAt: string | null;
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
  const [uploadFiles, setUploadFiles] = useState<File[]>([]);

  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [summarizeFileId, setSummarizeFileId] = useState<string | null>(null);
  const [editingSummaryId, setEditingSummaryId] = useState<string | null>(null);
  const [summaryText, setSummaryText] = useState<string>("");
  const [dragActive, setDragActive] = useState(false);
  const [isEditingBasicInfo, setIsEditingBasicInfo] = useState(false);
  const [editedBasicInfo, setEditedBasicInfo] = useState({
    clientName: "",
    demandDate: "",
    title: "",
  });
  const [showAllActivities, setShowAllActivities] = useState(false);
  const [summaryPanelFileId, setSummaryPanelFileId] = useState<string | null>(null);
  const [panelSummaryText, setPanelSummaryText] = useState<string>("");

  // New state for collapse/expand
  const [isActivityTimelineOpen, setIsActivityTimelineOpen] = useState(false);
  const [isSystemInfoOpen, setIsSystemInfoOpen] = useState(false);

  // New state for summary loading
  const [isSummaryLoading, setIsSummaryLoading] = useState(false);
  const [summaryLoadingFileId, setSummaryLoadingFileId] = useState<string | null>(null);

  // New state for summary modes
  const [summaryMode, setSummaryMode] = useState<"ai" | "edited">("ai");
  const [aiSummary, setAiSummary] = useState<string>("");
  const [editedSummary, setEditedSummary] = useState<string>("");
  const [aiSummaryTs, setAiSummaryTs] = useState<string | null>(null);
  const [editedSummaryTs, setEditedSummaryTs] = useState<string | null>(null);

  // Right column ordering state
  const [rightColumnSections, setRightColumnSections] = useState(['timeline', 'info', 'summary', 'notes']);
  const [draggedSection, setDraggedSection] = useState<string | null>(null);

  // Draft tab states
  const [draftContent, setDraftContent] = useState<string>("");
  const [isPublishing, setIsPublishing] = useState(false);
  const [isDraftLoading, setIsDraftLoading] = useState(false);
  const [isPublishable, setIsPublishable] = useState(false);
  const [publishDetails, setPublishDetails] = useState<any>(null);
  const [showFloatingDownload, setShowFloatingDownload] = useState(false);
  const [job, setJob] = useState<any>(null);
  const [isDraftEdited, setIsDraftEdited] = useState(false);

  // Indexing and Summary states
  const [isIndexing, setIsIndexing] = useState(false);
  const [indexingProgress, setIndexingProgress] = useState<'idle' | 'indexing' | 'in-progress' | 'complete'>('idle');
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [summaryStatuses, setSummaryStatuses] = useState<Record<string, 'pending' | 'in-progress' | 'complete'>>({});
  const [expandedSummaries, setExpandedSummaries] = useState<Record<string, boolean>>({});
  const [isProcessingDisabled, setIsProcessingDisabled] = useState(false);
  const [summaryModalFileId, setSummaryModalFileId] = useState<string | null>(null);
  const [summarizationJobId, setSummarizationJobId] = useState<string | null>(null);
  const [summarizationProgress, setSummarizationProgress] = useState<string>('0%');

  // NEW: Summary Modal States
  const [isSummaryModalOpen, setIsSummaryModalOpen] = useState(false);
  const [summaryModalFile, setSummaryModalFile] = useState<{ id: string; name: string } | null>(null);
  const [modalAiSummary, setModalAiSummary] = useState<string>("");
  const [modalEditedSummary, setModalEditedSummary] = useState<string>("");
  const [modalSummaryMode, setModalSummaryMode] = useState<"ai" | "edited">("ai");
  const [isModalLoading, setIsModalLoading] = useState(false);
  const [isSavingSummary, setIsSavingSummary] = useState(false);

  // Dynamic import for ReactQuill to avoid SSR issues
  const [ReactQuill, setReactQuill] = useState<any>(null);
  useEffect(() => {
    import('react-quill-new').then((mod) => {
      setReactQuill(() => mod.default);
    });
    import('react-quill-new/dist/quill.snow.css');
  }, []);

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

  // Fetch demand note data with polling
  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    const fetchData = async (silent = false) => {
      try {
        if (!silent && !demandNote) setIsLoading(true);

        const [demandResponse, timelineResponse, notesResponse, draftResponse] = await Promise.all([
          fetch(`/api/demand-notes/${id}`),
          fetch(`/api/demand-notes/${id}/timeline`),
          fetch(`/api/demand-notes/${id}/notes`),
          fetch(`/api/demand-notes/${id}/draft`),
        ]);

        if (!demandResponse.ok) {
          throw new Error('Failed to fetch demand note');
        }

        const demandData = await demandResponse.json();

        const processedData = {
          ...demandData,
          files: Array.from(
            new Map(
              (demandData.files || []).map((file: FileType) => [
                file.id,
                {
                  ...file,
                  uploadedAt: file.uploadedAt || file.createdAt || new Date().toISOString(),
                },
              ])
            ).values()
          ),
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

        // Load draft summaries if available
        if (draftResponse.ok) {
          const draftData = await draftResponse.json();
          if (draftData.summaries) {
            setDraftContent(draftData.summaries);
            setJob({ publishStatus: draftData.publishStatus || "draft" });
            setIsDraftEdited(false);
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        if (!silent) toast.error('Failed to load demand note');
      } finally {
        if (!silent) setIsLoading(false);
      }
    };

    if (id) {
      fetchData();
      intervalId = setInterval(() => {
        fetchData(true);
      }, 5000);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [id]);

  const allActivityEvents = timeline.map((event) => ({
    id: event.id,
    type: event.type as any,
    description: event.message,
    timestamp: formatDate(event.createdAt, 'yyyy-MM-dd HH:mm'),
    user: 'System',
  }));

  const activityEvents = showAllActivities
    ? allActivityEvents
    : allActivityEvents.slice(0, 3);

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

      setDemandNote((prev) =>
        prev
          ? {
            ...prev,
            files: [...prev.files, ...uploadedFiles],
          }
          : null
      );

      const timelineResponse = await fetch(
        `/api/demand-notes/${id}/timeline`
      );
      if (timelineResponse.ok) {
        const timelineData = await timelineResponse.json();
        setTimeline(timelineData);
      }

      setUploadFiles([]);
      setIsUploadOpen(false);
      setJob((prev: any) => ({ ...prev, publishStatus: "draft" }));
      toast.success("Files uploaded successfully");
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload one or more files");
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveFile = (index: number) => {
    setUploadFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleDeleteFile = async (fileId: string) => {
    if (!confirm("Are you sure you want to delete this file?")) return;

    try {
      const response = await fetch(`/api/upload?fileId=${fileId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Delete failed");
      }

      setDemandNote(prev => prev ? {
        ...prev,
        files: prev.files.filter(f => f.id !== fileId)
      } : null);

      const timelineResponse = await fetch(`/api/demand-notes/${id}/timeline`);
      if (timelineResponse.ok) {
        const timelineData = await timelineResponse.json();
        setTimeline(timelineData);
      }

      setJob((prev: any) => ({ ...prev, publishStatus: "draft" }));
      toast.success("File deleted successfully");
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Failed to delete file");
    }
  };

  const handleDownloadFile = (fileUrl: string, fileName: string) => {
    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const files = Array.from(e.dataTransfer.files);
      setUploadFiles(prev => [...prev, ...files]);
    }
  };

  const handleSaveSummary = async (fileId: string) => {
    try {
      toast.success("Summary saved successfully");
      setEditingSummaryId(null);
      setSummaryText("");
    } catch (error) {
      toast.error("Failed to save summary");
    }
  };

  const handleEditBasicInfo = () => {
    if (demandNote) {
      setEditedBasicInfo({
        clientName: demandNote.client.name,
        demandDate: demandNote.dueDate,
        title: demandNote.title,
      });
      setIsEditingBasicInfo(true);
    }
  };

  const handleSaveBasicInfo = async () => {
    try {
      const response = await fetch(`/api/demand-notes/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          clientName: editedBasicInfo.clientName,
          demandDate: editedBasicInfo.demandDate,
          title: editedBasicInfo.title,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update demand note");
      }

      const updatedData = await response.json();

      setDemandNote(prev => prev ? {
        ...prev,
        client: { ...prev.client, name: updatedData.client.name },
        dueDate: updatedData.dueDate,
        title: updatedData.title,
      } : null);

      setJob((prev: any) => ({ ...prev, publishStatus: "draft" }));
      toast.success("Basic information updated successfully");
      setIsEditingBasicInfo(false);
    } catch (error) {
      console.error("Error updating basic info:", error);
      toast.error("Failed to update basic information");
    }
  };

  const handleCancelEditBasicInfo = () => {
    setIsEditingBasicInfo(false);
    setEditedBasicInfo({
      clientName: "",
      demandDate: "",
      title: "",
    });
  };

  // NEW: Open Summary Modal
  const handleOpenSummaryModal = async (fileId: string, fileName: string) => {
    setSummaryModalFile({ id: fileId, name: fileName });
    setIsSummaryModalOpen(true);
    setIsModalLoading(true);
    setModalSummaryMode("ai");

    try {
      const response = await fetch(`/api/demand-files/${fileId}/summary`);

      if (response.ok) {
        const data = await response.json();
        const ai = data.summary || "";
        const edited = data.editedSummary || "";

        setModalAiSummary(ai);
        setModalEditedSummary(edited);
      } else {
        // Fallback to existing summary if API fails
        const file = demandNote?.files.find(f => f.id === fileId);
        const task = (file as any)?.tasks?.[0];
        const existingSummary = task?.outputSummary || "";
        const existingEdited = task?.editedSummary || "";

        setModalAiSummary(existingSummary);
        setModalEditedSummary(existingEdited);
      }
    } catch (error) {
      console.error("Error fetching summary:", error);
      // Fallback to existing summary
      const file = demandNote?.files.find(f => f.id === fileId);
      const task = (file as any)?.tasks?.[0];
      const existingSummary = task?.outputSummary || "";
      const existingEdited = task?.editedSummary || "";

      setModalAiSummary(existingSummary);
      setModalEditedSummary(existingEdited);
    } finally {
      setIsModalLoading(false);
    }
  };

  // NEW: Close Summary Modal
  const handleCloseSummaryModal = () => {
    setIsSummaryModalOpen(false);
    setSummaryModalFile(null);
    setModalAiSummary("");
    setModalEditedSummary("");
    setModalSummaryMode("ai");
  };

  // NEW: Save Edited Summary
  const handleSaveEditedSummary = async () => {
    if (!summaryModalFile) return;

    setIsSavingSummary(true);
    try {
      const response = await fetch(`/api/demand-files/${summaryModalFile.id}/summary`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ summary: modalEditedSummary })
      });

      if (!response.ok) throw new Error("Failed to save");

      const data = await response.json();
      setModalEditedSummary(data.editedSummary);

      setJob((prev: any) => ({ ...prev, publishStatus: "draft" }));
      toast.success("Summary saved successfully");
    } catch (error) {
      toast.error("Failed to save summary");
    } finally {
      setIsSavingSummary(false);
    }
  };

  // NEW: Copy Summary to Clipboard
  const handleCopySummaryModal = () => {
    const textToCopy = modalSummaryMode === "ai" ? modalAiSummary : modalEditedSummary;
    navigator.clipboard.writeText(textToCopy);
    toast.success("Summary copied to clipboard");
  };

  // NEW: Export Summary
  const handleExportSummaryModal = () => {
    const textToExport = modalSummaryMode === "ai" ? modalAiSummary : modalEditedSummary;
    const fileName = summaryModalFile ? `summary_${summaryModalFile.name}.txt` : 'summary.txt';

    const blob = new Blob([textToExport], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast.success("Summary exported successfully");
  };

  const handleOpenSummaryPanel = async (fileId: string, fileName: string) => {
    // Use the new modal instead
    handleOpenSummaryModal(fileId, fileName);
  };

  const handleCloseSummaryPanel = () => {
    setSummaryPanelFileId(null);
    setPanelSummaryText("");
    setIsSummaryLoading(false);
    setSummaryLoadingFileId(null);
  };

  const handleSavePanelSummary = async () => {
    try {
      if (!summaryPanelFileId) return;

      const response = await fetch(`/api/demand-files/${summaryPanelFileId}/summary`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ summary: panelSummaryText })
      });

      if (!response.ok) throw new Error("Failed to save");

      const data = await response.json();
      setEditedSummary(data.editedSummary);
      setEditedSummaryTs(data.editedSummaryTs);

      // If we were in AI mode, switch to edited mode
      if (summaryMode === "ai") {
        setSummaryMode("edited");
      }

      setJob((prev: any) => ({ ...prev, publishStatus: "draft" }));
      toast.success("Summary saved successfully");
    } catch (error) {
      toast.error("Failed to save summary");
    }
  };

  const handleCopySummary = () => {
    navigator.clipboard.writeText(panelSummaryText);
    toast.success("Summary copied to clipboard");
  };

  const handleExportSummary = () => {
    const currentFile = demandNote?.files.find(f => f.id === summaryPanelFileId);
    const fileName = currentFile ? `summary_${currentFile.fileName}.txt` : 'summary.txt';

    const blob = new Blob([panelSummaryText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast.success("Summary exported successfully");
  };

  const handleFetchDraftSummary = async (useDummy = false) => {
    setIsDraftLoading(true);
    try {
      const url = `/api/demand-notes/${id}/draft`;
      let response;

      if (useDummy) {
        response = await fetch(url, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ useDummy: true, status: "draft" })
        });
      } else {
        response = await fetch(url);
      }

      if (response.ok) {
        const data = await response.json();
        if (useDummy) {
          // After setting dummy, we need to fetch the updated content
          const getResponse = await fetch(url);
          if (getResponse.ok) {
            const newData = await getResponse.json();
            setDraftContent(newData.summaries || "");
            setJob({ publishStatus: newData.publishStatus || "draft" });
            setIsDraftEdited(false);
            toast.success("Draft updated with uploaded files summary");
          }
        } else {
          setDraftContent(data.summaries || "");
          setJob({ publishStatus: data.publishStatus || "draft" });
          setIsDraftEdited(false);
          if (data.isExisting) {
            toast.success("Draft loaded from previous save");
          } else {
            toast.success("All summaries aggregated");
          }
        }
      } else {
        throw new Error("Failed to fetch draft");
      }
    } catch (error) {
      console.error("Error fetching draft:", error);
      toast.error("Failed to fetch summaries");
    } finally {
      setIsDraftLoading(false);
    }
  };

  const handleSaveDraft = async () => {
    setIsDraftLoading(true);
    try {
      const response = await fetch(`/api/demand-notes/${id}/draft`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ summaries: draftContent, status: "draft" })
      });

      if (response.ok) {
        setJob((prev: any) => ({ ...prev, publishStatus: "draft" }));
        setIsDraftEdited(false);
        toast.success("Draft saved successfully");
      } else {
        throw new Error("Failed to save draft");
      }
    } catch (error) {
      console.error("Error saving draft:", error);
      toast.error("Failed to save draft");
    } finally {
      setIsDraftLoading(false);
    }
  };

  const handleCheckPublishStatus = async () => {
    try {
      const response = await fetch(`/api/demand-notes/${id}/publish/status`);
      if (response.ok) {
        const data = await response.json();
        setIsPublishable(data.isPublishable);
        setPublishDetails(data.details);
      }
    } catch (error) {
      console.error("Error checking publish status:", error);
    }
  };

  const handleSectionDragStart = (e: React.DragEvent, sectionId: string) => {
    setDraggedSection(sectionId);
    e.dataTransfer.setData('text/plain', sectionId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleSectionDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleSectionDrop = (e: React.DragEvent, targetSectionId: string) => {
    e.preventDefault();
    if (!draggedSection || draggedSection === targetSectionId) return;

    const newOrder = [...rightColumnSections];
    const draggedIdx = newOrder.indexOf(draggedSection);
    const targetIdx = newOrder.indexOf(targetSectionId);

    newOrder.splice(draggedIdx, 1);
    newOrder.splice(targetIdx, 0, draggedSection);

    setRightColumnSections(newOrder);
    setDraggedSection(null);
  };

  const handleExportDraft = async () => {
    try {
      const blob = new Blob([draftContent], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `demand_note_draft_${id}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success("Draft exported successfully");
    } catch (error) {
      toast.error("Export failed");
    }
  };

  const handlePublish = async () => {
    setIsPublishing(true);
    try {
      // 1. Update DemandNote status
      const response = await fetch(`/api/demand-notes/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "sent"
        })
      });

      if (response.ok) {
        // 2. Update Job publishStatus to "published"
        await fetch(`/api/demand-notes/${id}/draft`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ summaries: draftContent, status: "published" })
        });

        setJob((prev: any) => ({ ...prev, publishStatus: "published" }));
        setDemandNote(prev => prev ? { ...prev, status: "sent" as any } : null);
        toast.success("Demand note published successfully");
        setShowFloatingDownload(true);
        handleCheckPublishStatus(); // Refresh status
      } else {
        throw new Error("Publish failed");
      }
    } catch (error) {
      console.error("Error publishing:", error);
      toast.error("Failed to publish");
    } finally {
      setIsPublishing(false);
    }
  };

  const handleDownloadDoc = () => {
    if (!draftContent) return;

    // Simple HTML to Word conversion using blob
    const header = "<html xmlns:o='urn:schemas-microsoft-com:office:office' " +
      "xmlns:w='urn:schemas-microsoft-com:office:word' " +
      "xmlns='http://www.w3.org/TR/REC-html40'>" +
      "<head><meta charset='utf-8'><title>Export HTML to Word</title></head><body>";
    const footer = "</body></html>";
    const sourceHTML = header + draftContent + footer;

    const source = 'data:application/vnd.ms-word;charset=utf-8,' + encodeURIComponent(sourceHTML);
    const fileLink = document.createElement("a");
    document.body.appendChild(fileLink);
    fileLink.href = source;
    fileLink.download = `demand_note_${id}.doc`;
    fileLink.click();
    document.body.removeChild(fileLink);
    toast.success("Document downloaded as .doc");
  };

  const getInitials = (name: string) =>
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();

  // Handle common indexing operation
  const handleCommonIndexing = async () => {
    setIsIndexing(true);
    setIsProcessingDisabled(true);
    setIndexingProgress('indexing');

    try {
      // Simulate indexing process
      await new Promise(resolve => setTimeout(resolve, 1000));
      setIndexingProgress('in-progress');

      await new Promise(resolve => setTimeout(resolve, 2000));
      setIndexingProgress('complete');

      toast.success("Indexing completed successfully");

      // Reset after 2 seconds
      setTimeout(() => {
        setIndexingProgress('idle');
        setIsIndexing(false);
        setIsProcessingDisabled(false);
      }, 2000);
    } catch (error) {
      console.error("Indexing error:", error);
      toast.error("Failed to complete indexing");
      setIndexingProgress('idle');
      setIsIndexing(false);
      setIsProcessingDisabled(false);
    }
  };

  // Handle common summary operation
  const handleCommonSummary = async () => {
    if (!demandNote?.files || demandNote.files.length === 0) {
      toast.error("No files to summarize");
      return;
    }

    setIsSummarizing(true);
    setIsProcessingDisabled(true);
    setSummarizationProgress('0%');

    try {
      // Start a job for all files
      const response = await fetch("/api/job/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          demandNoteId: demandNote.id,
          demandFileIds: demandNote.files.map(f => f.id)
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to start summarization job");
      }

      const data = await response.json();
      setSummarizationJobId(data.jobId);

      // Poll for job status
      const pollInterval = setInterval(async () => {
        try {
          const statusResponse = await fetch(`/api/job/status?jobId=${data.jobId}`);
          if (!statusResponse.ok) throw new Error("Failed to fetch status");

          const statusData = await statusResponse.json();
          const jobStatus = statusData.job.status;

          // Update progress based on job status
          if (jobStatus === "pending") {
            setSummarizationProgress('5%'); // 0-10% range, using 5%
          } else if (jobStatus === "in_progress") {
            setSummarizationProgress('45%');
          } else if (jobStatus === "completed") {
            setSummarizationProgress('100%');
            clearInterval(pollInterval);
            // Close progress bar after 2 seconds
            setTimeout(() => {
              setIsSummarizing(false);
              setIsProcessingDisabled(false);
              setSummarizationJobId(null);
              setSummarizationProgress('0%');
            }, 2000);
            toast.success("All summaries completed");
          } else if (jobStatus === "failed") {
            clearInterval(pollInterval);
            setIsSummarizing(false);
            setIsProcessingDisabled(false);
            setSummarizationJobId(null);
            setSummarizationProgress('0%');
            toast.error("Summarization failed");
          }
        } catch (error) {
          console.error("Polling error:", error);
          clearInterval(pollInterval);
          setIsSummarizing(false);
          setIsProcessingDisabled(false);
          setSummarizationJobId(null);
          setSummarizationProgress('0%');
          toast.error("Failed to check summarization status");
        }
      }, 3000);

    } catch (error) {
      console.error("Summary error:", error);
      toast.error("Failed to start summarization");
      setIsSummarizing(false);
      setIsProcessingDisabled(false);
    }
  };

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
              {/* Actions can be added here */}
            </div>
          </div>
        </div>

        {/* Content Layout: Modified Grid */}
        <div className="w-full">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6">
            {/* Basic Information - 8 columns */}
            <div className="lg:col-span-8">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Basic Information</CardTitle>
                    {!isEditingBasicInfo ? (
                      <Button onClick={handleEditBasicInfo} size="sm" variant="outline">
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                    ) : (
                      <div className="flex gap-2">
                        <Button onClick={handleSaveBasicInfo} size="sm">
                          OK
                        </Button>
                        <Button onClick={handleCancelEditBasicInfo} size="sm" variant="outline">
                          Cancel
                        </Button>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {!isEditingBasicInfo ? (
                    <div className="grid gap-4 grid-cols-2">
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
                        <p className="text-sm font-medium font-mono truncate" title={demandNote.id}>{demandNote.id}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Title</p>
                        <p className="text-sm font-medium truncate" title={demandNote.title}>{demandNote.title}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="clientName">Client Name</Label>
                        <Input
                          id="clientName"
                          value={editedBasicInfo.clientName}
                          onChange={(e) => setEditedBasicInfo({ ...editedBasicInfo, clientName: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="demandDate">Demand Date</Label>
                        <Input
                          id="demandDate"
                          type="date"
                          value={editedBasicInfo.demandDate}
                          onChange={(e) => setEditedBasicInfo({ ...editedBasicInfo, demandDate: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="title">Title</Label>
                        <Input
                          id="title"
                          value={editedBasicInfo.title}
                          onChange={(e) => setEditedBasicInfo({ ...editedBasicInfo, title: e.target.value })}
                        />
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Activity Timeline - 4 columns, sticky on right */}
            <div className="lg:col-span-4">
              <div className="sticky top-6">
                <Card>
                  <CardHeader className="cursor-pointer" onClick={() => setIsActivityTimelineOpen(!isActivityTimelineOpen)}>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">Activity Timeline</CardTitle>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                      >
                        {isActivityTimelineOpen ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </CardHeader>
                  {isActivityTimelineOpen && (
                    <CardContent className="max-h-[400px] overflow-y-auto">
                      {activityEvents.length > 0 ? (
                        <div className="space-y-4">
                          {activityEvents.map((event) => (
                            <div key={event.id} className="flex gap-3">
                              <div className="flex-shrink-0 w-2 h-2 mt-1.5 rounded-full bg-blue-500" />
                              <div className="flex-1 space-y-1">
                                <p className="text-sm text-foreground">{event.description}</p>
                                <p className="text-xs text-muted-foreground">{event.timestamp}</p>
                              </div>
                            </div>
                          ))}
                          {allActivityEvents.length > 3 && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                setShowAllActivities(!showAllActivities);
                              }}
                              className="text-xs w-full"
                            >
                              {showAllActivities ? "Show Less" : `Show All (${allActivityEvents.length})`}
                            </Button>
                          )}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">No activity yet</p>
                      )}
                    </CardContent>
                  )}
                </Card>
              </div>
            </div>
          </div>

          {/* Full Width Document Section */}
          <div className="w-full">
            {/* Tab Navigation using DefaultCardComponent and Tabs */}
            <DefaultCardComponent title="Demand Note Documents">
              <Tabs defaultValue="upload" className="gap-0">
                {/* TAB HEADER */}
                <div className="flex items-center justify-between border-b border-neutral-200 dark:border-slate-600">
                  <TabsList className="bg-transparent rounded-none h-[50px] p-0">
                    <TabsTrigger
                      value="upload"
                      className="py-2.5 px-4 font-medium text-base text-neutral-600
                        hover:text-primary border-0 border-b-2 border-transparent
                        data-[state=active]:text-primary
                        data-[state=active]:border-primary
                        rounded-none shadow-none"
                    >
                      Document Upload
                    </TabsTrigger>

                    <TabsTrigger
                      value="indexing"
                      className="py-2.5 px-4 font-medium text-base text-neutral-600
                        hover:text-primary border-0 border-b-2 border-transparent
                        data-[state=active]:text-primary
                        data-[state=active]:border-primary
                        rounded-none shadow-none"
                    >
                      Indexing & Summary
                    </TabsTrigger>

                    <TabsTrigger
                      value="draft"
                      className="py-2.5 px-4 font-medium text-base text-neutral-600
                        hover:text-primary border-0 border-b-2 border-transparent
                        data-[state=active]:text-primary
                        data-[state=active]:border-primary
                        rounded-none shadow-none"
                    >
                      Draft
                    </TabsTrigger>
                  </TabsList>
                </div>

                {/* TAB CONTENT */}
                <div className="pt-6">
                  {/* ---------------- UPLOAD TAB ---------------- */}
                  <TabsContent value="upload" className="p-0 space-y-6">
                    {/* Upload Section */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Upload Documents</CardTitle>
                        <p className="text-sm text-muted-foreground">
                          Drag and drop files or click to select
                        </p>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-6">
                          {/* Category Selection */}
                          <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
                            <Label className="text-sm font-medium">Document Type:</Label>
                            <Select
                              value={selectedCategory}
                              onValueChange={setSelectedCategory}
                            >
                              <SelectTrigger className="w-full lg:w-48">
                                <SelectValue placeholder="Select category" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="traffic">🚗 Traffic Reports</SelectItem>
                                <SelectItem value="medical">🏥 Medical Reports</SelectItem>
                                <SelectItem value="bills">💊 Medical Bills</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          {/* Drag and Drop Zone */}
                          <div
                            onDragEnter={handleDrag}
                            onDragLeave={handleDrag}
                            onDragOver={handleDrag}
                            onDrop={handleDrop}
                            className={`
                                relative border-2 border-dashed rounded-lg p-8 lg:p-12 text-center transition-colors
                                ${dragActive
                                ? "border-blue-500 bg-blue-50"
                                : "border-gray-300 bg-gray-50 hover:border-gray-400"
                              }
                              `}
                          >
                            <input
                              id="file-upload"
                              type="file"
                              multiple
                              onChange={(e) =>
                                setUploadFiles(e.target.files ? Array.from(e.target.files) : [])
                              }
                              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            />
                            <div className="flex flex-col items-center gap-3">
                              <Upload className="h-10 w-10 lg:h-12 lg:w-12 text-gray-400" />
                              <div>
                                <p className="text-sm font-medium text-gray-700">
                                  Drop files here or click to browse
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                  Supports PDF, DOC, DOCX, JPG, PNG
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Selected Files */}
                          {uploadFiles.length > 0 && (
                            <div className="space-y-2">
                              <Label className="text-sm font-medium">Selected Files ({uploadFiles.length})</Label>
                              <div className="space-y-2 max-h-64 overflow-y-auto">
                                {uploadFiles.map((file, idx) => (
                                  <div
                                    key={`${file.name}-${idx}`}
                                    className="flex items-center justify-between p-3 rounded-lg border bg-white hover:bg-gray-50"
                                  >
                                    <div className="flex items-center gap-3 overflow-hidden">
                                      <FileText className="h-5 w-5 text-blue-500 flex-shrink-0" />
                                      <div className="min-w-0">
                                        <p className="text-sm font-medium truncate">{file.name}</p>
                                        <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                                      </div>
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() => handleRemoveFile(idx)}
                                      className="p-1.5 rounded-full text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors flex-shrink-0"
                                      aria-label={`Remove ${file.name}`}
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </button>
                                  </div>
                                ))}
                              </div>
                              <Button
                                onClick={handleFileUpload}
                                disabled={uploadFiles.length === 0 || isUploading}
                                className="w-full"
                                size="lg"
                              >
                                {isUploading ? (
                                  <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Uploading...
                                  </>
                                ) : (
                                  <>
                                    <Upload className="h-4 w-4 mr-2" />
                                    Upload {uploadFiles.length} file(s)
                                  </>
                                )}
                              </Button>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Uploaded Documents Table */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Uploaded Documents</CardTitle>
                        <p className="text-sm text-muted-foreground">
                          All documents uploaded to this demand note
                        </p>
                      </CardHeader>
                      <CardContent>
                        {demandNote?.files && demandNote.files.length > 0 ? (
                          <HorizontalScrollContainer>
                            <table className="w-full">
                              <thead className="sticky top-0 bg-gray-50 border-b">
                                <tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  <th className="px-4 py-3">Document Name</th>
                                  <th className="px-4 py-3">Document Type</th>
                                  <th className="px-4 py-3">Upload Date</th>
                                  <th className="px-4 py-3">Status</th>
                                  <th className="px-4 py-3 text-right">Actions</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-200">
                                {Array.from(
                                  new Map(demandNote.files.map(f => [f.id, f])).values()
                                ).map(file => (
                                  <tr key={file.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-4 py-3">
                                      <div className="flex items-center gap-3">
                                        <FileText className="h-5 w-5 text-blue-500 flex-shrink-0" />
                                        <span className="text-sm font-medium text-gray-900">
                                          {file.fileName}
                                        </span>
                                      </div>
                                    </td>
                                    <td className="px-4 py-3">
                                      <Badge variant="outline" className="capitalize">
                                        {file.fileCategory === "traffic" && "🚗 Traffic"}
                                        {file.fileCategory === "medical" && "🏥 Medical"}
                                        {file.fileCategory === "bills" && "💊 Bills"}
                                      </Badge>
                                    </td>
                                    <td className="px-4 py-3">
                                      <div className="flex items-center gap-1 text-sm text-gray-500">
                                        <Calendar className="h-3.5 w-3.5" />
                                        {formatDate(file.uploadedAt, 'MM/dd/yyyy')}
                                      </div>
                                    </td>
                                    <td className="px-4 py-3">
                                      <Badge variant="secondary" className="text-xs">
                                        {file.status}
                                      </Badge>
                                    </td>
                                    <td className="px-4 py-3">
                                      <div className="flex gap-1 justify-end">
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          onClick={() => handlePreviewFile(file.fileUrl, file.fileName)}
                                          className="h-8 w-8"
                                          title="Preview"
                                        >
                                          <Eye className="h-4 w-4" />
                                        </Button>
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          onClick={() => handleDownloadFile(file.fileUrl, file.fileName)}
                                          className="h-8 w-8"
                                          title="Download"
                                        >
                                          <Download className="h-4 w-4" />
                                        </Button>
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          onClick={() => handleDeleteFile(file.id)}
                                          className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                                          title="Delete"
                                        >
                                          <Trash2 className="h-4 w-4" />
                                        </Button>
                                      </div>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </HorizontalScrollContainer>
                        ) : (
                          <div className="text-center py-12 text-gray-500">
                            <FileText className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                            <p className="text-sm">No documents uploaded yet</p>
                            <p className="text-xs text-gray-400 mt-1">
                              Use the upload section above to add documents
                            </p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* ---------------- INDEXING TAB ---------------- */}
                  <TabsContent value="indexing" className="p-0">
                    <Card>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle>Document Indexing & Summary</CardTitle>
                            <p className="text-sm text-muted-foreground">
                              Documents ordered by upload date with editable summaries
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              onClick={handleCommonIndexing}
                              disabled={isIndexing || isProcessingDisabled}
                              variant="outline"
                              className="bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
                            >
                              {isIndexing ? (
                                <>
                                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                  {indexingProgress === 'indexing' && 'Indexing...'}
                                  {indexingProgress === 'in-progress' && 'Processing...'}
                                  {indexingProgress === 'complete' && 'Complete!'}
                                </>
                              ) : (
                                <>
                                  <FileText className="h-4 w-4 mr-2" />
                                  Indexing
                                </>
                              )}
                            </Button>
                            <Button
                              onClick={handleCommonSummary}
                              disabled={isSummarizing || isProcessingDisabled || !demandNote?.files || demandNote.files.length === 0}
                              variant="outline"
                              className="bg-indigo-50 border-indigo-200 text-indigo-700 hover:bg-indigo-100"
                            >
                              {isSummarizing ? (
                                <>
                                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                  Summarizing...
                                </>
                              ) : (
                                <>
                                  <Sparkles className="h-4 w-4 mr-2" />
                                  Summary
                                </>
                              )}
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        {/* NEW: Progress Bar */}
                        {(isIndexing || isSummarizing) && (
                          <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                                <span className="text-sm font-medium text-blue-900">
                                  {isIndexing && 'Indexing in progress...'}
                                  {isSummarizing && 'Summarizing documents...'}
                                </span>
                              </div>
                              <span className="text-xs text-blue-700">
                                {isSummarizing && summarizationProgress}
                                {isIndexing && (
                                  <>
                                    {indexingProgress === 'indexing' && '33%'}
                                    {indexingProgress === 'in-progress' && '66%'}
                                    {indexingProgress === 'complete' && '100%'}
                                  </>
                                )}
                              </span>
                            </div>
                            <div className="w-full bg-blue-200 rounded-full h-2 overflow-hidden">
                              <div
                                className="bg-gradient-to-r from-blue-600 to-indigo-600 h-2 rounded-full transition-all duration-500 ease-out"
                                style={{
                                  width: isIndexing
                                    ? (indexingProgress === 'indexing' ? '33%' : indexingProgress === 'in-progress' ? '66%' : '100%')
                                    : isSummarizing
                                      ? summarizationProgress  // Use the direct progress value
                                      : '0%'
                                }}
                              />
                            </div>
                          </div>
                        )}

                        {demandNote?.files && demandNote.files.length > 0 ? (
                          <HorizontalScrollContainer>
                            <table className="w-full">
                              <thead className="sticky top-0 bg-gray-50 border-b">
                                <tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  <th className="px-4 py-3">Document Name</th>
                                  <th className="px-4 py-3">Document Type</th>
                                  <th className="px-4 py-3">Chronology</th>
                                  {/* <th className="px-4 py-3">Status</th> */}
                                  <th className="px-4 py-3 w-2/5">Summary</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-200">
                                {[...demandNote.files]
                                  .sort((a, b) => new Date(a.uploadedAt || a.createdAt || "").getTime() - new Date(b.uploadedAt || b.createdAt || "").getTime())
                                  .map((file, index) => (
                                    <tr key={file.id} className="hover:bg-gray-50 transition-colors">
                                      <td className="px-4 py-3">
                                        <div className="flex items-center gap-3">
                                          <FileText className="h-5 w-5 text-blue-500 flex-shrink-0" />
                                          <span className="text-sm font-medium text-gray-900">
                                            {file.fileName}
                                          </span>
                                        </div>
                                      </td>
                                      <td className="px-4 py-3">
                                        <Badge variant="outline" className="capitalize">
                                          {file.fileCategory === "traffic" && "🚗 Traffic"}
                                          {file.fileCategory === "medical" && "🏥 Medical"}
                                          {file.fileCategory === "bills" && "💊 Bills"}
                                        </Badge>
                                      </td>
                                      <td className="px-4 py-3">
                                        <div className="flex items-center gap-2">
                                          <div className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold">
                                            {index + 1}
                                          </div>
                                          <div className="text-sm text-gray-600">
                                            {formatDate(file.uploadedAt, 'MM/dd/yyyy')}
                                          </div>
                                        </div>
                                      </td>
                                      {/* <td className="px-4 py-3">
                                        <Badge
                                          variant={
                                            summaryStatuses[file.id] === 'complete' ? 'default' :
                                              summaryStatuses[file.id] === 'in-progress' ? 'secondary' :
                                                'outline'
                                          }
                                          className="text-xs capitalize"
                                        >
                                          {summaryStatuses[file.id] || 'pending'}
                                        </Badge>
                                      </td> */}
                                      <td className="px-4 py-3">
                                        <div className="flex items-center gap-2">
                                          <div className="flex-1 min-w-0">
                                            {summaryStatuses[file.id] === 'in-progress' ? (
                                              <div className="flex items-center gap-2">
                                                <Loader2 className="h-4 w-4 animate-spin text-indigo-600" />
                                                <span className="text-sm text-indigo-600">Generating summary...</span>
                                              </div>
                                            ) : (
                                              <>
                                                <p
                                                  className="text-sm text-gray-600 truncate max-w-[200px]"
                                                  title={(file as any).tasks?.[0]?.outputSummary || "No summary available"}
                                                >
                                                  {(() => {
                                                    const summary = (file as any).tasks?.[0]?.outputSummary || (file as any).tasks?.[0]?.editedSummary || "No summary available";
                                                    return summary.length > 25 ? summary.substring(0, 25) + "..." : summary;
                                                  })()}
                                                </p>
                                                <div className="flex items-center gap-1 text-[10px] text-gray-400 mt-0.5">
                                                  <Clock className="h-2.5 w-2.5" />
                                                  {(() => {
                                                    const task = (file as any).tasks?.[0];
                                                    if (!task) return "No data";
                                                    const ts = task.endTs;
                                                    return ts ? formatDistanceToNow(new Date(ts), { addSuffix: true }) : "No timestamp";
                                                  })()}
                                                </div>
                                              </>
                                            )}
                                          </div>
                                          <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleOpenSummaryModal(file.id, file.fileName)}
                                            disabled={summaryLoadingFileId === file.id || summaryStatuses[file.id] === 'in-progress'}
                                            className="h-8 w-8 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 flex-shrink-0"
                                            title="View/Edit Summary"
                                          >
                                            {summaryLoadingFileId === file.id ? (
                                              <Loader2 className="h-4 w-4 animate-spin" />
                                            ) : (
                                              <Pencil className="h-4 w-4" />
                                            )}
                                          </Button>
                                        </div>
                                      </td>
                                    </tr>
                                  ))}
                              </tbody>
                            </table>
                          </HorizontalScrollContainer>
                        ) : (
                          <div className="text-center py-12 text-gray-500">
                            <FileText className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                            <p className="text-sm">No documents available</p>
                            <p className="text-xs text-gray-400 mt-1">
                              Upload documents to view indexing and add summaries
                            </p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* ---------------- DRAFT TAB ---------------- */}
                  <TabsContent value="draft" className="p-0 space-y-6">
                    <Card>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle>Draft Summary</CardTitle>
                            <p className="text-sm text-muted-foreground mt-1">
                              Aggregate summaries from all files and refine the final draft
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              onClick={() => handleFetchDraftSummary(true)}
                              disabled={isDraftLoading || job?.publishStatus === "published"}
                              variant="outline"
                            >
                              {isDraftLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Sparkles className="h-4 w-4 mr-2" />}
                              Summary
                            </Button>
                            <Button
                              onClick={handleSaveDraft}
                              disabled={isDraftLoading || !isDraftEdited}
                              variant="outline"
                              className="bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
                            >
                              {isDraftLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Edit className="h-4 w-4 mr-2" />}
                              Draft
                            </Button>
                            <Button
                              onClick={handleExportDraft}
                              disabled={!draftContent}
                              variant="outline"
                            >
                              <Download className="h-4 w-4 mr-2" />
                              Export
                            </Button>
                            <Button
                              onClick={handlePublish}
                              disabled={isPublishing || !draftContent || draftContent.trim() === "<p><br></p>" || draftContent.trim() === "" || job?.publishStatus === "published"}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              {isPublishing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Upload className="h-4 w-4 mr-2" />}
                              Publish
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="min-h-[500px] border rounded-md p-4 bg-white prose max-w-none">
                          {ReactQuill ? (
                            <ReactQuill
                              theme="snow"
                              value={draftContent}
                              onChange={(content: string) => {
                                setDraftContent(content);
                                setIsDraftEdited(true);
                              }}
                              className="h-[400px] mb-12"
                            />
                          ) : (
                            <textarea
                              value={draftContent}
                              onChange={(e) => {
                                setDraftContent(e.target.value);
                                setIsDraftEdited(true);
                              }}
                              className="w-full h-[400px] p-2 border-none focus:ring-0 resize-none font-sans"
                              placeholder="Start drafting your summary here..."
                            />
                          )}
                        </div>

                        {!isPublishable && publishDetails && (
                          <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-sm">
                            <p className="font-semibold mb-1">Publish Requirements:</p>
                            <ul className="list-disc list-inside space-y-1">
                              {!publishDetails.allFilesSummarized && (
                                <li>All files must be summarized (Found {publishDetails.unsummarizedCount} unsummarized)</li>
                              )}
                              {!publishDetails.tasksSynced && (
                                <li>All summarization tasks must be completed</li>
                              )}
                            </ul>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>
                </div>
              </Tabs>
            </DefaultCardComponent>
          </div>
        </div>
      </div>

      {/* Modals */}
      {previewFile && (
        <DocumentPreviewModal
          isOpen={!!previewFile}
          onClose={() => setPreviewFile(null)}
          fileName={previewFile.name}
          fileUrl={previewFile.url}
        />
      )}

      {demandNote && (
        <SummarizeJobModal
          isOpen={!!summarizeFileId}
          onClose={() => setSummarizeFileId(null)}
          demandNoteId={demandNote.id}
          demandFileId={summarizeFileId}
        />
      )}

      {/* NEW: Summary Modal */}
      <Dialog open={isSummaryModalOpen} onOpenChange={handleCloseSummaryModal}>
        <DialogContent
          className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white text-gray-900 border border-gray-200 shadow-xl"
        >
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <Sparkles className="h-5 w-5 text-indigo-600" />
              Document Summary
            </DialogTitle>
            {summaryModalFile && (
              <p className="text-sm text-muted-foreground mt-1">
                {summaryModalFile.name}
              </p>
            )}
          </DialogHeader>

          {isModalLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
              <span className="ml-3 text-muted-foreground">Loading summary...</span>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Tab Selection */}
              <Tabs value={modalSummaryMode} onValueChange={(v) => setModalSummaryMode(v as "ai" | "edited")}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="ai" className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4" />
                    AI Summary
                  </TabsTrigger>
                  <TabsTrigger value="edited" className="flex items-center gap-2">
                    <Edit className="h-4 w-4" />
                    Edited Summary
                  </TabsTrigger>
                </TabsList>

                {/* AI Summary Tab */}
                <TabsContent value="ai" className="space-y-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start gap-2">
                      <Sparkles className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="text-sm text-blue-900 mb-2">AI-Generated Summary</p>
                        <p className="text-sm text-blue-800 whitespace-pre-wrap">
                          {modalAiSummary || "No AI summary available. Please generate a summary first."}
                        </p>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                {/* Edited Summary Tab */}
                <TabsContent value="edited" className="space-y-4">
                  <div>
                    <Label htmlFor="edited-summary" className="text-base font-medium mb-2 block">
                      Edit Summary
                    </Label>
                    <Textarea
                      id="edited-summary"
                      value={modalEditedSummary}
                      onChange={(e) => setModalEditedSummary(e.target.value)}
                      placeholder="Edit the summary here..."
                      className="min-h-[300px] font-sans text-sm"
                    />
                  </div>
                </TabsContent>
              </Tabs>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-4 border-t">
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopySummaryModal}
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copy
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleExportSummaryModal}
                  >
                    <FileDown className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </div>

                <div className="flex gap-2">
                  {modalSummaryMode === "edited" && (
                    <Button
                      onClick={handleSaveEditedSummary}
                      disabled={isSavingSummary}
                      className="bg-indigo-600 hover:bg-indigo-700"
                    >
                      {isSavingSummary ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          Save Changes
                        </>
                      )}
                    </Button>
                  )}
                  <Button variant="outline" onClick={handleCloseSummaryModal}>
                    Close
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Floating Download Button */}
      {job?.publishStatus === "published" && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-bottom-8 duration-500">
          <Button
            onClick={handleDownloadDoc}
            size="sm"
            className="bg-primary text-white hover:text-blue-900 shadow-2xl rounded-full px-4 py-2 h-auto flex items-center gap-3 group"
          >
            <div className="bg-white/20 p-2 rounded-full group-hover:scale-110 transition-transform">
              <Download className="h-5 w-5" />
            </div>
            <div className="flex flex-col items-start">
              <span className="text-xs opacity-80 font-normal">Ready to download</span>
              <span className="text-sm font-semibold">Download Formatted Doc</span>
            </div>
          </Button>
        </div>
      )}
    </div>
  );
}