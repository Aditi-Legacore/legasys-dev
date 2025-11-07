'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';
import { IntakeData } from '@/types/intake';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import IntakePreviewHeader from '@/components/intake-preview/IntakePreviewHeader';
import IntakeInformationTab from '@/components/intake-preview/IntakeInformationTab';
import NotesTab from '@/components/intake-preview/NotesTab';
import ActivityLogTab from '@/components/intake-preview/ActivityLogTab';
import DocumentsTab from '@/components/intake-preview/DocumentsTab';
import PlaintiffInformationCard from '@/components/intake-preview/PlaintiffInformationCard';
import PDFPreviewModal from '@/components/intake-preview/PDFPreviewModal';

export default function IntakePreviewPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const [intake, setIntake] = useState<IntakeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingDelete, setLoadingDelete] = useState(false);
  const [loadingPdf, setLoadingPdf] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [showPdfPreview, setShowPdfPreview] = useState(false);
  const [notes, setNotes] = useState<{ id: string; content: string; createdAt: string; createdBy: string }[]>([]);
  const [activityLogs, setActivityLogs] = useState<{ id: string; shortDescription: string; longDescription?: string; createdAt: string; createdBy: string; createdByName?: string }[]>([]);
  const [documents, setDocuments] = useState<{ id: string; name: string; type: string; uploadedAt: string }[]>([]);
  const [loadingNotes, setLoadingNotes] = useState(false);
  const [loadingActivity, setLoadingActivity] = useState(false);
  const [loadingDocuments, setLoadingDocuments] = useState(false);
  const [newNote, setNewNote] = useState('');
  const [newActivityAction, setNewActivityAction] = useState('');
  const [newActivityDetails, setNewActivityDetails] = useState('');
  const [activeTab, setActiveTab] = useState('information');
  const contentRef = useRef<HTMLDivElement>(null);

  const id = params.id as string;

  useEffect(() => {
    const fetchIntake = async () => {
      try {
        // First try to fetch by ID (for intake table links)
        let res = await fetch(`/api/intake/${id}`);
        if (res.status === 404) {
          // If not found by ID, try to fetch by referenceId (for leads table links)
          res = await fetch(`/api/intake/reference/${id}`);
        }
        if (res.status === 404) {
          setIntake(null);
          return;
        }
        if (!res.ok) {
          console.log(`Fetch failed with status: ${res.status} ${res.statusText}`);
          throw new Error('Failed to fetch intake');
        }
        const data = await res.json();
        setIntake(data);
      } catch (error) {
        console.error(error);
        toast.error('Failed to load intake details.');
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchIntake();
  }, [id]);

  useEffect(() => {
    if (intake?.id && activeTab === 'notes') {
      fetchNotes();
    }
    if (intake?.id && activeTab === 'activity') {
      fetchActivityLogs();
    }
    if (intake?.id && activeTab === 'documents') {
      fetchDocuments();
    }
  }, [intake?.id, activeTab]);

  const fetchNotes = async () => {
    if (!intake?.id) return;
    setLoadingNotes(true);
    try {
      const res = await fetch(`/api/intake/${intake.id}/notes`);
      if (!res.ok) throw new Error('Failed to fetch notes');
      const data = await res.json();
      setNotes(data);
    } catch (error) {
      console.error(error);
      toast.error('Failed to load notes.');
    } finally {
      setLoadingNotes(false);
    }
  };

  const fetchActivityLogs = async () => {
    if (!intake?.id) return;
    setLoadingActivity(true);
    try {
      const res = await fetch(`/api/intake/${intake.id}/activity-logs`);
      if (!res.ok) throw new Error('Failed to fetch activity logs');
      const data = await res.json();
      setActivityLogs(data);
    } catch (error) {
      console.error(error);
      toast.error('Failed to load activity logs.');
    } finally {
      setLoadingActivity(false);
    }
  };

  const fetchDocuments = async () => {
    if (!intake?.id) return;
    setLoadingDocuments(true);
    try {
      const res = await fetch(`/api/documents?intakeId=${intake.id}`);
      if (!res.ok) throw new Error('Failed to fetch documents');
      const data = await res.json();
      setDocuments(data);
    } catch (error) {
      console.error(error);
      toast.error('Failed to load documents.');
    } finally {
      setLoadingDocuments(false);
    }
  };

  const addNote = async () => {
    if (!newNote.trim() || !intake?.id) return;
    console.log("session", session);

    try {
      const res = await fetch(`/api/intake/${intake.id}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newNote, createdBy: session?.user?.name || 'User' }),
      });
      if (!res.ok) throw new Error('Failed to add note');
      setNewNote('');
      fetchNotes();
      toast.success('Note added successfully.');

      // Log activity for adding note
      await fetch('/api/activity-log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          intakeId: intake.id,
          activityType: 'add_note',
          shortDescription: 'Note Added',
          longDescription: 'added a note',
        }),
      });
    } catch (error) {
      console.error(error);
      toast.error('Failed to add note.');
    }
  };

  const addActivityLog = async () => {
    if (!newActivityAction.trim() || !intake?.id) return;
    try {
      const res = await fetch(`/api/intake/${intake.id}/activity-logs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: newActivityAction, details: newActivityDetails, createdBy: session?.user?.name || 'User' }),
      });
      if (!res.ok) throw new Error('Failed to add activity log');
      setNewActivityAction('');
      setNewActivityDetails('');
      fetchActivityLogs();
      toast.success('Activity log added successfully.');
    } catch (error) {
      console.error(error);
      toast.error('Failed to add activity log.');
    }
  };

  const deleteNote = async (noteId: string) => {
    if (!intake?.id) return;
    try {
      const res = await fetch(`/api/intake/${intake.id}/notes`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ noteId }),
      });
      if (!res.ok) throw new Error('Failed to delete note');
      fetchNotes();
      toast.success('Note deleted successfully.');

      // Log activity for deleting note
      await fetch('/api/activity-log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          intakeId: intake.id,
          activityType: 'delete_note',
          shortDescription: 'Note Deleted',
          longDescription: 'deleted a note',
        }),
      });
    } catch (error) {
      console.error(error);
      toast.error('Failed to delete note.');
    }
  };

  useEffect(() => {
    return () => {
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
      }
    };
  }, [pdfUrl]);

  const handleUpdate = () => {
    toast.info('Update functionality will be implemented.');
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this intake?') || !intake?.id) return;

    setLoadingDelete(true);
    try {
      const res = await fetch(`/api/intake/${intake.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete intake');
      toast.success('Intake deleted successfully.');
      router.push('/forms');
    } catch (error) {
      console.error(error);
      toast.error('Failed to delete intake.');
    } finally {
      setLoadingDelete(false);
    }
  };

  const generatePdf = async () => {
    if (!intake?.id) return null;
    setLoadingPdf(true);
    try {
      const res = await fetch(`/api/intake/${intake.id}/pdf`, {
        method: 'POST',
      });

      if (!res.ok) throw new Error('Failed to generate PDF');

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);

      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
      }

      setPdfUrl(url);
      toast.success('PDF generated successfully.');
      return url;
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Failed to generate PDF.');
      return null;
    } finally {
      setLoadingPdf(false);
    }
  };

  const handlePreview = async () => {
    let url = pdfUrl;
    if (!url) {
      url = await generatePdf();
    }
    if (url) {
      setShowPdfPreview(true);
    }
  };

  const handleDownload = async () => {
    let url = pdfUrl;
    if (!url) {
      url = await generatePdf();
    }

    if (url) {
      const link = document.createElement('a');
      link.href = url;
      link.download = `intake-${intake?.id || id}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('PDF downloaded successfully.');
    }
  };

  const handleShare = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    toast.success('Link copied to clipboard.');
  };

  const formatDate = (dateString: string | null): string => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white dark:bg-gray-900">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!intake) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white dark:bg-gray-900">
        <p className="text-slate-500">Intake not found.</p>
      </div>
    );
  }

  return (
    <>
      <div ref={contentRef} className="min-h-screen bg-white dark:bg-gray-900 p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <IntakePreviewHeader
            onBack={() => router.back()}
            onUpdate={handleUpdate}
            onPreview={handlePreview}
            onDelete={handleDelete}
            loadingPdf={loadingPdf}
            loadingDelete={loadingDelete}
          />

          {/* Main Content Grid: Left Side (Tabs) + Right Side (Plaintiff Info) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Side: Tabs with Information, Notes, Activity Log, Documents */}
            <div className="lg:col-span-2">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="information">Information</TabsTrigger>
                  <TabsTrigger value="notes">Notes</TabsTrigger>
                  <TabsTrigger value="activity">Activity Log</TabsTrigger>
                  <TabsTrigger value="documents">Documents</TabsTrigger>
                </TabsList>

                <TabsContent value="information" className="mt-4">
                  <IntakeInformationTab intake={intake} formatDate={formatDate} />
                </TabsContent>

                <TabsContent value="notes" className="mt-4">
                  <NotesTab
                    notes={notes}
                    loadingNotes={loadingNotes}
                    newNote={newNote}
                    setNewNote={setNewNote}
                    addNote={addNote}
                    deleteNote={deleteNote}
                    formatDate={formatDate}
                  />
                </TabsContent>

                <TabsContent value="activity" className="mt-4">
                  <ActivityLogTab
                    activityLogs={activityLogs}
                    loadingActivity={loadingActivity}
                    newActivityAction={newActivityAction}
                    setNewActivityAction={setNewActivityAction}
                    newActivityDetails={newActivityDetails}
                    setNewActivityDetails={setNewActivityDetails}
                    addActivityLog={addActivityLog}
                    formatDate={formatDate}
                  />
                </TabsContent>

                <TabsContent value="documents" className="mt-4">
                  <DocumentsTab
                    documents={documents}
                    loadingDocuments={loadingDocuments}
                    formatDate={formatDate}
                  />
                </TabsContent>
              </Tabs>
            </div>

            {/* Right Side: Plaintiff Information */}
            <div className="lg:col-span-1">
              <PlaintiffInformationCard intake={intake} formatDate={formatDate} />
            </div>
          </div>
        </div>
      </div>

      <PDFPreviewModal
        showPdfPreview={showPdfPreview}
        pdfUrl={pdfUrl}
        onClose={() => setShowPdfPreview(false)}
      />
    </>
  );
}
