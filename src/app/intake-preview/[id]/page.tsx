'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Edit, Trash2, Download, Share2, Eye, ArrowLeft, Car, Shield, Heart, Stethoscope, AlertTriangle, User } from 'lucide-react';
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
        const res = await fetch(`/api/intake/${id}`);
        if (!res.ok) throw new Error('Failed to fetch intake');
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
    if (id && activeTab === 'notes') {
      fetchNotes();
    }
    if (id && activeTab === 'activity') {
      fetchActivityLogs();
    }
    if (id && activeTab === 'documents') {
      fetchDocuments();
    }
  }, [id, activeTab]);

  const fetchNotes = async () => {
    setLoadingNotes(true);
    try {
      const res = await fetch(`/api/intake/${id}/notes`);
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
    setLoadingActivity(true);
    try {
      const res = await fetch(`/api/intake/${id}/activity-logs`);
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
    setLoadingDocuments(true);
    try {
      const res = await fetch(`/api/documents?intakeId=${id}`);
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
    if (!newNote.trim()) return;
    console.log("session", session);

    try {
      const res = await fetch(`/api/intake/${id}/notes`, {
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
          intakeId: id,
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
    if (!newActivityAction.trim()) return;
    try {
      const res = await fetch(`/api/intake/${id}/activity-logs`, {
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
    try {
      const res = await fetch(`/api/intake/${id}/notes`, {
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
          // intakeId: id,
          refId: id,
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
    if (!confirm('Are you sure you want to delete this intake?')) return;

    setLoadingDelete(true);
    try {
      const res = await fetch(`/api/intake/${id}`, { method: 'DELETE' });
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
    setLoadingPdf(true);
    try {
      const res = await fetch(`/api/intake/${id}/pdf`, {
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
      link.download = `intake-${id}.pdf`;
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
      <div ref={contentRef} className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6 sm:p-8 lg:p-12">
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
          {/* Header */}
          <div className="flex items-center justify-between gap-4 mb-8 lg:mb-12">
            <button
              onClick={() => router.back()}
              className="flex items-center justify-center bg-gray-600 hover:bg-gray-700 text-white p-2 rounded-lg transition-colors duration-200"
              title="Back"
            >
              <ArrowLeft size={20} />
            </button>
            <div className="flex-1 text-center">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 dark:text-white mb-2">
                Case Intake Preview
              </h1>
              <p className="text-slate-600 dark:text-gray-400 text-base sm:text-lg">
                Review and manage case intake details
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleUpdate}
                className="flex items-center justify-center bg-green-600 hover:bg-green-700 text-white p-2 rounded-lg transition-colors duration-200"
                title="Update"
              >
                <Edit size={16} />
              </button>
              <button
                onClick={handlePreview}
                disabled={loadingPdf}
                className="flex items-center justify-center bg-purple-600 hover:bg-purple-700 text-white p-2 rounded-lg transition-colors duration-200 disabled:opacity-50"
                title="Preview PDF"
              >
                {loadingPdf ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <Download size={16} />
                )}
              </button>
              <button
                onClick={handleDelete}
                disabled={loadingDelete}
                className="flex items-center justify-center bg-red-600 hover:bg-red-700 text-white p-2 rounded-lg transition-colors duration-200 disabled:opacity-50"
                title="Delete"
              >
                {loadingDelete ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <Trash2 size={16} />
                )}
              </button>
            </div>
          </div>

          {/* Intake Details */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              {/* Accident Information */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-8">
                <h5 className="text-lg font-semibold text-green-600 mb-6 flex items-center gap-2">
                  <Car size={24} />
                  Accident Information
                </h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <p className="text-gray-700 dark:text-gray-300 text-lg"><strong className="text-gray-900 dark:text-white">Date:</strong> {formatDate(intake.accidentDate)}</p>
                  <p className="text-gray-700 dark:text-gray-300 text-lg"><strong className="text-gray-900 dark:text-white">Time:</strong> {intake.accidentTime || 'N/A'}</p>
                  <p className="text-gray-700 dark:text-gray-300 text-lg"><strong className="text-gray-900 dark:text-white">Location:</strong> {intake.accidentLocation || 'N/A'}</p>
                  <p className="text-gray-700 dark:text-gray-300 text-lg"><strong className="text-gray-900 dark:text-white">Description:</strong> {intake.accidentDescription || 'N/A'}</p>
                </div>
              </div>

              {/* Defendant 1 Information */}
              {intake.defendant1Name && (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-8">
                  <h5 className="text-lg font-semibold text-green-600 mb-6 flex items-center gap-2">
                    <Shield size={24} />
                    Defendant 1 Information
                  </h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <p className="text-gray-700 dark:text-gray-300 text-lg"><strong className="text-gray-900 dark:text-white">Name:</strong> {intake.defendant1Name}</p>
                    {/* <p className="text-gray-700 dark:text-gray-300 text-lg"><strong className="text-gray-900 dark:text-white">Phone:</strong> {intake.defendant1Phone || 'N/A'}</p> */}
                    <p className="text-gray-700 dark:text-gray-300 text-lg"><strong className="text-gray-900 dark:text-white">Address:</strong> {intake.defendant1Address || 'N/A'}</p>
                    <p className="text-gray-700 dark:text-gray-300 text-lg"><strong className="text-gray-900 dark:text-white">Carrier:</strong> {intake.defendant1Carrier || 'N/A'}</p>
                    <p className="text-gray-700 dark:text-gray-300 text-lg"><strong className="text-gray-900 dark:text-white">Carrier Phone:</strong> {intake.defendant1CarrierPhone || 'N/A'}</p>
                    {/* <p className="text-gray-700 dark:text-gray-300 text-lg"><strong className="text-gray-900 dark:text-white">Policy:</strong> {intake.defendant1Policy || 'N/A'}</p> */}
                    <p className="text-gray-700 dark:text-gray-300 text-lg"><strong className="text-gray-900 dark:text-white">Year:</strong> {intake.defendant1Year || 'N/A'}</p>
                    <p className="text-gray-700 dark:text-gray-300 text-lg"><strong className="text-gray-900 dark:text-white">Make:</strong> {intake.defendant1Make || 'N/A'}</p>
                    <p className="text-gray-700 dark:text-gray-300 text-lg"><strong className="text-gray-900 dark:text-white">Model:</strong> {intake.defendant1Model || 'N/A'}</p>
                    <p className="text-gray-700 dark:text-gray-300 text-lg"><strong className="text-gray-900 dark:text-white">Damage:</strong> {intake.defendant1Damage || 'N/A'}</p>
                  </div>
                </div>
              )}

              {/* Defendant 2 Information */}
              {intake.defendant2Name && (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-8">
                  <h5 className="text-lg font-semibold text-green-600 mb-6 flex items-center gap-2">
                    <Shield size={24} />
                    Defendant 2 Information
                  </h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <p className="text-gray-700 dark:text-gray-300 text-lg"><strong className="text-gray-900 dark:text-white">Name:</strong> {intake.defendant2Name}</p>
                    {/* <p className="text-gray-700 dark:text-gray-300 text-lg"><strong className="text-gray-900 dark:text-white">Phone:</strong> {intake.defendant2Phone || 'N/A'}</p> */}
                    <p className="text-gray-700 dark:text-gray-300 text-lg"><strong className="text-gray-900 dark:text-white">Address:</strong> {intake.defendant2Address || 'N/A'}</p>
                    <p className="text-gray-700 dark:text-gray-300 text-lg"><strong className="text-gray-900 dark:text-white">Carrier:</strong> {intake.defendant2Carrier || 'N/A'}</p>
                    <p className="text-gray-700 dark:text-gray-300 text-lg"><strong className="text-gray-900 dark:text-white">Carrier Phone:</strong> {intake.defendant2CarrierPhone || 'N/A'}</p>
                    <p className="text-gray-700 dark:text-gray-300 text-lg"><strong className="text-gray-900 dark:text-white">Policy:</strong> {intake.defendant2Policy || 'N/A'}</p>
                    <p className="text-gray-700 dark:text-gray-300 text-lg"><strong className="text-gray-900 dark:text-white">Year:</strong> {intake.defendant2Year || 'N/A'}</p>
                    <p className="text-gray-700 dark:text-gray-300 text-lg"><strong className="text-gray-900 dark:text-white">Make:</strong> {intake.defendant2Make || 'N/A'}</p>
                    <p className="text-gray-700 dark:text-gray-300 text-lg"><strong className="text-gray-900 dark:text-white">Model:</strong> {intake.defendant2Model || 'N/A'}</p>
                    <p className="text-gray-700 dark:text-gray-300 text-lg"><strong className="text-gray-900 dark:text-white">Damage:</strong> {intake.defendant2Damage || 'N/A'}</p>
                  </div>
                </div>
              )}

              {/* Auto Insurance */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-8">
                <h5 className="text-lg font-semibold text-green-600 mb-6 flex items-center gap-2">
                  <Shield size={24} />
                  Auto Insurance
                </h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <p className="text-gray-700 dark:text-gray-300 text-lg"><strong className="text-gray-900 dark:text-white">Name:</strong> {intake.autoName || 'N/A'}</p>
                  <p className="text-gray-700 dark:text-gray-300 text-lg"><strong className="text-gray-900 dark:text-white">Phone:</strong> {intake.autoPhone || 'N/A'}</p>
                  <p className="text-gray-700 dark:text-gray-300 text-lg"><strong className="text-gray-900 dark:text-white">Address:</strong> {intake.autoAddress || 'N/A'}</p>
                  {/* <p className="text-gray-700 dark:text-gray-300 text-lg"><strong className="text-gray-900 dark:text-white">Carrier:</strong> {intake.autoCarrier || 'N/A'}</p> */}
                  <p className="text-gray-700 dark:text-gray-300 text-lg"><strong className="text-gray-900 dark:text-white">Agent:</strong> {intake.autoAgent || 'N/A'}</p>
                  <p className="text-gray-700 dark:text-gray-300 text-lg"><strong className="text-gray-900 dark:text-white">Policy:</strong> {intake.autoPolicy || 'N/A'}</p>
                </div>
              </div>

              {/* Health Insurance */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-8">
                <h5 className="text-lg font-semibold text-green-600 mb-6 flex items-center gap-2">
                  <Heart size={24} />
                  Health Insurance
                </h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <p className="text-gray-700 dark:text-gray-300 text-lg"><strong className="text-gray-900 dark:text-white">Carrier Name:</strong> {intake.healthCarrier || 'N/A'}</p>
                  <p className="text-gray-700 dark:text-gray-300 text-lg"><strong className="text-gray-900 dark:text-white">Phone:</strong> {intake.healthPhone || 'N/A'}</p>
                  {/* <p className="text-gray-700 dark:text-gray-300 text-lg"><strong className="text-gray-900 dark:text-white">Type:</strong> {intake.healthType || 'N/A'}</p> */}
                  <p className="text-gray-700 dark:text-gray-300 text-lg"><strong className="text-gray-900 dark:text-white">Address:</strong> {intake.healthAddress || 'N/A'}</p>
                  {/* <p className="text-gray-700 dark:text-gray-300 text-lg"><strong className="text-gray-900 dark:text-white">Group:</strong> {intake.healthGroup || 'N/A'}</p> */}
                  <p className="text-gray-700 dark:text-gray-300 text-lg"><strong className="text-gray-900 dark:text-white">Policy:</strong> {intake.healthPolicy || 'N/A'}</p>
                </div>
              </div>

              {/* Medical Treatment */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-8">
                <h5 className="text-lg font-semibold text-green-600 mb-6 flex items-center gap-2">
                  <Stethoscope size={24} />
                  Medical Treatment
                </h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <p className="text-gray-700 dark:text-gray-300 text-lg"><strong className="text-gray-900 dark:text-white">Ambulance:</strong> {intake.ambulance ? 'Yes' : 'No'}</p>
                  <p className="text-gray-700 dark:text-gray-300 text-lg"><strong className="text-gray-900 dark:text-white">Ambulance Company:</strong> {intake.ambulanceCompany || 'N/A'}</p>
                  <p className="text-gray-700 dark:text-gray-300 text-lg"><strong className="text-gray-900 dark:text-white">Admitted:</strong> {intake.admitted ? 'Yes' : 'No'}</p>
                  <p className="text-gray-700 dark:text-gray-300 text-lg"><strong className="text-gray-900 dark:text-white">Length of Stay:</strong> {intake.lengthOfStay || 'N/A'}</p>
                </div>
                {intake.doctorHospital1 && (
                  <div className="mt-6">
                    <h4 className="font-semibold text-green-600 mb-2">Treatment 1</h4>
                    <p className="text-gray-700 dark:text-gray-300 text-lg"><strong className="text-gray-900 dark:text-white">Doctor/Hospital:</strong> {intake.doctorHospital1}</p>
                    <p className="text-gray-700 dark:text-gray-300 text-lg"><strong className="text-gray-900 dark:text-white">Address:</strong> {intake.address1 || 'N/A'}</p>
                    <p className="text-gray-700 dark:text-gray-300 text-lg"><strong className="text-gray-900 dark:text-white">Phone:</strong> {intake.phone1 || 'N/A'}</p>
                    <p className="text-gray-700 dark:text-gray-300 text-lg"><strong className="text-gray-900 dark:text-white">Treatment Date:</strong> {formatDate(intake.treatmentDate1)}</p>
                  </div>
                )}
                {intake.doctorHospital2 && (
                  <div className="mt-6">
                    <h4 className="font-semibold text-green-600 mb-2">Treatment 2</h4>
                    <p className="text-gray-700 dark:text-gray-300 text-lg"><strong className="text-gray-900 dark:text-white">Doctor/Hospital:</strong> {intake.doctorHospital2}</p>
                    <p className="text-gray-700 dark:text-gray-300 text-lg"><strong className="text-gray-900 dark:text-white">Address:</strong> {intake.address2 || 'N/A'}</p>
                    <p className="text-gray-700 dark:text-gray-300 text-lg"><strong className="text-gray-900 dark:text-white">Phone:</strong> {intake.phone2 || 'N/A'}</p>
                    <p className="text-gray-700 dark:text-gray-300 text-lg"><strong className="text-gray-900 dark:text-white">Treatment Date:</strong> {formatDate(intake.treatmentDate2)}</p>
                  </div>
                )}
                {intake.doctorHospital3 && (
                  <div className="mt-6">
                    <h4 className="font-semibold text-green-600 mb-2">Treatment 3</h4>
                    <p className="text-gray-700 dark:text-gray-300 text-lg"><strong className="text-gray-900 dark:text-white">Doctor/Hospital:</strong> {intake.doctorHospital3}</p>
                    <p className="text-gray-700 dark:text-gray-300 text-lg"><strong className="text-gray-900 dark:text-white">Address:</strong> {intake.address3 || 'N/A'}</p>
                    <p className="text-gray-700 dark:text-gray-300 text-lg"><strong className="text-gray-900 dark:text-white">Phone:</strong> {intake.phone3 || 'N/A'}</p>
                    <p className="text-gray-700 dark:text-gray-300 text-lg"><strong className="text-gray-900 dark:text-white">Treatment Date:</strong> {formatDate(intake.treatmentDate3)}</p>
                  </div>
                )}
              </div>

              {/* Injuries */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-8">
                <h5 className="text-lg font-semibold text-green-600 mb-6 flex items-center gap-2">
                  <AlertTriangle size={24} />
                  Injuries
                </h5>
                <div className="space-y-4">
                  <p className="text-gray-700 dark:text-gray-300 text-lg"><strong className="text-gray-900 dark:text-white">Body Parts Affected:</strong> {intake.bodyPartsAffected || 'N/A'}</p>
                  <p className="text-gray-700 dark:text-gray-300 text-lg"><strong className="text-gray-900 dark:text-white">Prior Injuries:</strong> {intake.priorInjuries || 'N/A'}</p>
                  <p className="text-gray-700 dark:text-gray-300 text-lg"><strong className="text-gray-900 dark:text-white">Prior Insurance Claims:</strong> {intake.priorInsuranceClaims || 'N/A'}</p>
                  <p className="text-gray-700 dark:text-gray-300 text-lg"><strong className="text-gray-900 dark:text-white">Prior Attorneys:</strong> {intake.priorAttorneys || 'N/A'}</p>
                </div>
              </div>
            </div>

            {/* Right Side: Plaintiff Information */}
            <div className="lg:col-span-1">
              <PlaintiffInformationCard intake={intake} formatDate={formatDate} />
              {/* Plaintiff Information */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-8">
                <h5 className="text-lg font-semibold text-green-600 mb-6 flex items-center gap-2">
                  <User size={24} />
                  Plaintiff Information
                </h5>
                <div className="space-y-4">
                  <p className="text-gray-700 dark:text-gray-300 text-lg"><strong className="text-gray-900 dark:text-white">Name:</strong> {intake.clientName}</p>
                  <p className="text-gray-700 dark:text-gray-300 text-lg"><strong className="text-gray-900 dark:text-white">Gender:</strong> {intake.gender || 'N/A'}</p>
                  <p className="text-gray-700 dark:text-gray-300 text-lg"><strong className="text-gray-900 dark:text-white">Phone:</strong> {intake.phoneNumber || 'N/A'}</p>
                  <p className="text-gray-700 dark:text-gray-300 text-lg"><strong className="text-gray-900 dark:text-white">Email:</strong> {intake.email}</p>
                  <p className="text-gray-700 dark:text-gray-300 text-lg"><strong className="text-gray-900 dark:text-white">Address:</strong> {intake.address || 'N/A'}</p>
                  <p className="text-gray-700 dark:text-gray-300 text-lg"><strong className="text-gray-900 dark:text-white">City:</strong> {intake.city || 'N/A'}</p>
                  <p className="text-gray-700 dark:text-gray-300 text-lg"><strong className="text-gray-900 dark:text-white">Zip:</strong> {intake.zip || 'N/A'}</p>
                  <p className="text-gray-700 dark:text-gray-300 text-lg"><strong className="text-gray-900 dark:text-white">Date of Birth:</strong> {formatDate(intake.dateOfBirth)}</p>
                </div>
              </div>
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
