'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Edit, Trash2, Download, Share2, Eye, ArrowLeft, Car, Shield, Heart, Stethoscope, AlertTriangle, User } from 'lucide-react';
import { toast } from 'sonner';
import { IntakeData } from '@/types/intake';

export default function IntakePreviewPage() {
  const params = useParams();
  const router = useRouter();
  const [intake, setIntake] = useState<IntakeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingDelete, setLoadingDelete] = useState(false);
  const [loadingPdf, setLoadingPdf] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [showPdfPreview, setShowPdfPreview] = useState(false);
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

  // Cleanup PDF URL when component unmounts
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
      // router.push('/intake-list');
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
      
      // Revoke old URL if exists
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
            <div className="lg:col-span-1">
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

      {/* PDF Preview Modal */}
      {showPdfPreview && pdfUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-6xl h-5/6 flex flex-col">
            <div className="flex justify-between items-center p-4 border-b dark:border-gray-700">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">PDF Preview</h3>
              <button
                onClick={() => setShowPdfPreview(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex-1 overflow-hidden">
              <iframe
                src={pdfUrl}
                className="w-full h-full"
                title="PDF Preview"
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}