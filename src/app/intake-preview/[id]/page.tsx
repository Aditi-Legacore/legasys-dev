'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Edit, Trash2, Download, Share2, Eye, ArrowLeft } from 'lucide-react';
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
      router.push('/intake-list');
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
      <div ref={contentRef} className="min-h-screen bg-white dark:bg-gray-900 p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between gap-4 mb-6 lg:mb-8">
            <button
              onClick={() => router.back()}
              className="flex items-center justify-center bg-gray-600 hover:bg-gray-700 text-white p-2 rounded-lg transition-colors duration-200"
              title="Back"
            >
              <ArrowLeft size={20} />
            </button>
            <div className="flex-1 text-center">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white">
                Case Intake Preview
              </h1>
              <p className="text-slate-600 dark:text-gray-400 mt-1 sm:mt-2 text-sm sm:text-base">
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
                  <Eye size={16} />
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
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {/* Accident Information */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h3 className="text-lg font-bold mb-2 text-green-600">Accident Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <p className="text-black dark:text-gray-200"><strong>Date:</strong> {formatDate(intake.accidentDate)}</p>
                  <p className="text-black dark:text-gray-200"><strong>Time:</strong> {intake.accidentTime || 'N/A'}</p>
                  <p className="text-black dark:text-gray-200"><strong>Location:</strong> {intake.accidentLocation || 'N/A'}</p>
                  <p className="text-black dark:text-gray-200"><strong>Description:</strong> {intake.accidentDescription || 'N/A'}</p>
                </div>
              </div>

              {/* Defendant 1 Information */}
              {intake.defendant1Name && (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                  <h3 className="text-lg font-bold mb-2 text-green-600">Defendant 1 Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <p className="text-black dark:text-gray-200"><strong>Name:</strong> {intake.defendant1Name}</p>
                    {/* <p className="text-black dark:text-gray-200"><strong>Phone:</strong> {intake.defendant1Phone || 'N/A'}</p> */}
                    <p className="text-black dark:text-gray-200"><strong>Address:</strong> {intake.defendant1Address || 'N/A'}</p>
                    <p className="text-black dark:text-gray-200"><strong>Carrier:</strong> {intake.defendant1Carrier || 'N/A'}</p>
                    <p className="text-black dark:text-gray-200"><strong>Carrier Phone:</strong> {intake.defendant1CarrierPhone || 'N/A'}</p>
                    {/* <p className="text-black dark:text-gray-200"><strong>Policy:</strong> {intake.defendant1Policy || 'N/A'}</p> */}
                    <p className="text-black dark:text-gray-200"><strong>Year:</strong> {intake.defendant1Year || 'N/A'}</p>
                    <p className="text-black dark:text-gray-200"><strong>Make:</strong> {intake.defendant1Make || 'N/A'}</p>
                    <p className="text-black dark:text-gray-200"><strong>Model:</strong> {intake.defendant1Model || 'N/A'}</p>
                    <p className="text-black dark:text-gray-200"><strong>Damage:</strong> {intake.defendant1Damage || 'N/A'}</p>
                  </div>
                </div>
              )}

              {/* Defendant 2 Information */}
              {intake.defendant2Name && (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                  <h3 className="text-lg font-bold mb-2 text-green-600">Defendant 2 Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <p className="text-black dark:text-gray-200"><strong>Name:</strong> {intake.defendant2Name}</p>
                    {/* <p className="text-black dark:text-gray-200"><strong>Phone:</strong> {intake.defendant2Phone || 'N/A'}</p> */}
                    <p className="text-black dark:text-gray-200"><strong>Address:</strong> {intake.defendant2Address || 'N/A'}</p>
                    <p className="text-black dark:text-gray-200"><strong>Carrier:</strong> {intake.defendant2Carrier || 'N/A'}</p>
                    <p className="text-black dark:text-gray-200"><strong>Carrier Phone:</strong> {intake.defendant2CarrierPhone || 'N/A'}</p>
                    <p className="text-black dark:text-gray-200"><strong>Policy:</strong> {intake.defendant2Policy || 'N/A'}</p>
                    <p className="text-black dark:text-gray-200"><strong>Year:</strong> {intake.defendant2Year || 'N/A'}</p>
                    <p className="text-black dark:text-gray-200"><strong>Make:</strong> {intake.defendant2Make || 'N/A'}</p>
                    <p className="text-black dark:text-gray-200"><strong>Model:</strong> {intake.defendant2Model || 'N/A'}</p>
                    <p className="text-black dark:text-gray-200"><strong>Damage:</strong> {intake.defendant2Damage || 'N/A'}</p>
                  </div>
                </div>
              )}

              {/* Auto Insurance */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h3 className="text-lg font-bold mb-2 text-green-600">Auto Insurance</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <p className="text-black dark:text-gray-200"><strong>Name:</strong> {intake.autoName || 'N/A'}</p>
                  <p className="text-black dark:text-gray-200"><strong>Phone:</strong> {intake.autoPhone || 'N/A'}</p>
                  <p className="text-black dark:text-gray-200"><strong>Address:</strong> {intake.autoAddress || 'N/A'}</p>
                  {/* <p className="text-black dark:text-gray-200"><strong>Carrier:</strong> {intake.autoCarrier || 'N/A'}</p> */}
                  <p className="text-black dark:text-gray-200"><strong>Agent:</strong> {intake.autoAgent || 'N/A'}</p>
                  <p className="text-black dark:text-gray-200"><strong>Policy:</strong> {intake.autoPolicy || 'N/A'}</p>
                </div>
              </div>

              {/* Health Insurance */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h3 className="text-lg font-bold mb-2 text-green-600">Health Insurance</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <p className="text-black dark:text-gray-200"><strong>Carrier Name:</strong> {intake.healthCarrier || 'N/A'}</p>
                  <p className="text-black dark:text-gray-200"><strong>Phone:</strong> {intake.healthPhone || 'N/A'}</p>
                  {/* <p className="text-black dark:text-gray-200"><strong>Type:</strong> {intake.healthType || 'N/A'}</p> */}
                  <p className="text-black dark:text-gray-200"><strong>Address:</strong> {intake.healthAddress || 'N/A'}</p>
                  {/* <p className="text-black dark:text-gray-200"><strong>Group:</strong> {intake.healthGroup || 'N/A'}</p> */}
                  <p className="text-black dark:text-gray-200"><strong>Policy:</strong> {intake.healthPolicy || 'N/A'}</p>
                </div>
              </div>

              {/* Medical Treatment */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h3 className="text-lg font-bold mb-2 text-green-600">Medical Treatment</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <p className="text-black dark:text-gray-200"><strong>Ambulance:</strong> {intake.ambulance ? 'Yes' : 'No'}</p>
                  <p className="text-black dark:text-gray-200"><strong>Ambulance Company:</strong> {intake.ambulanceCompany || 'N/A'}</p>
                  <p className="text-black dark:text-gray-200"><strong>Admitted:</strong> {intake.admitted ? 'Yes' : 'No'}</p>
                  <p className="text-black dark:text-gray-200"><strong>Length of Stay:</strong> {intake.lengthOfStay || 'N/A'}</p>
                </div>
                {intake.doctorHospital1 && (
                  <div className="mt-4">
                    <h4 className="font-medium text-green-600">Treatment 1</h4>
                    <p className="text-black dark:text-gray-200"><strong>Doctor/Hospital:</strong> {intake.doctorHospital1}</p>
                    <p className="text-black dark:text-gray-200"><strong>Address:</strong> {intake.address1 || 'N/A'}</p>
                    <p className="text-black dark:text-gray-200"><strong>Phone:</strong> {intake.phone1 || 'N/A'}</p>
                    <p className="text-black dark:text-gray-200"><strong>Treatment Date:</strong> {formatDate(intake.treatmentDate1)}</p>
                  </div>
                )}
                {intake.doctorHospital2 && (
                  <div className="mt-4">
                    <h4 className="font-medium text-green-600">Treatment 2</h4>
                    <p className="text-black dark:text-gray-200"><strong>Doctor/Hospital:</strong> {intake.doctorHospital2}</p>
                    <p className="text-black dark:text-gray-200"><strong>Address:</strong> {intake.address2 || 'N/A'}</p>
                    <p className="text-black dark:text-gray-200"><strong>Phone:</strong> {intake.phone2 || 'N/A'}</p>
                    <p className="text-black dark:text-gray-200"><strong>Treatment Date:</strong> {formatDate(intake.treatmentDate2)}</p>
                  </div>
                )}
                {intake.doctorHospital3 && (
                  <div className="mt-4">
                    <h4 className="font-medium text-green-600">Treatment 3</h4>
                    <p className="text-black dark:text-gray-200"><strong>Doctor/Hospital:</strong> {intake.doctorHospital3}</p>
                    <p className="text-black dark:text-gray-200"><strong>Address:</strong> {intake.address3 || 'N/A'}</p>
                    <p className="text-black dark:text-gray-200"><strong>Phone:</strong> {intake.phone3 || 'N/A'}</p>
                    <p className="text-black dark:text-gray-200"><strong>Treatment Date:</strong> {formatDate(intake.treatmentDate3)}</p>
                  </div>
                )}
              </div>

              {/* Injuries */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h3 className="text-lg font-bold mb-2 text-green-600">Injuries</h3>
                <p className="text-black dark:text-gray-200"><strong>Body Parts Affected:</strong> {intake.bodyPartsAffected || 'N/A'}</p>
                <p className="text-black dark:text-gray-200"><strong>Prior Injuries:</strong> {intake.priorInjuries || 'N/A'}</p>
                <p className="text-black dark:text-gray-200"><strong>Prior Insurance Claims:</strong> {intake.priorInsuranceClaims || 'N/A'}</p>
                <p className="text-black dark:text-gray-200"><strong>Prior Attorneys:</strong> {intake.priorAttorneys || 'N/A'}</p>
              </div>
            </div>
            <div className="lg:col-span-1">
              {/* Plaintiff Information */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h3 className="text-lg font-bold mb-2 text-green-600">Plaintiff Information</h3>
                <div className="grid grid-cols-1 gap-4">
                  <p className="text-black dark:text-gray-200"><strong>Name:</strong> {intake.clientName}</p>
                  <p className="text-black dark:text-gray-200"><strong>Gender:</strong> {intake.gender || 'N/A'}</p>
                  <p className="text-black dark:text-gray-200"><strong>Phone:</strong> {intake.phoneNumber || 'N/A'}</p>
                  <p className="text-black dark:text-gray-200"><strong>Email:</strong> {intake.email}</p>
                  <p className="text-black dark:text-gray-200"><strong>Address:</strong> {intake.address || 'N/A'}</p>
                  <p className="text-black dark:text-gray-200"><strong>City:</strong> {intake.city || 'N/A'}</p>
                  <p className="text-black dark:text-gray-200"><strong>Zip:</strong> {intake.zip || 'N/A'}</p>
                  <p className="text-black dark:text-gray-200"><strong>Date of Birth:</strong> {formatDate(intake.dateOfBirth)}</p>
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