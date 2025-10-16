'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Edit, Trash2, Download, Share2, Eye } from 'lucide-react';
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
    return () => {
      if (pdfUrl) URL.revokeObjectURL(pdfUrl);
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
      router.push('/');
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
      const res = await fetch(`/api/intake/${id}/pdf`, { method: 'POST' });
      if (!res.ok) throw new Error('Failed to generate PDF');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      if (pdfUrl) URL.revokeObjectURL(pdfUrl);
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
    if (!url) url = await generatePdf();
    if (url) setShowPdfPreview(true);
  };

  const handleDownload = async () => {
    let url = pdfUrl;
    if (!url) url = await generatePdf();
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
    navigator.clipboard.writeText(window.location.href);
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
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!intake) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <p className="text-slate-500">Intake not found.</p>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-6">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
                Case Intake Preview
              </h1>
              <p className="text-slate-600 dark:text-gray-400 text-sm">
                Review and manage case intake details
              </p>
            </div>

            {/* Client Info Card - Top Right */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 border border-gray-200 dark:border-gray-700 min-w-[280px]">
              <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase mb-3">Client Information</h3>
              <div className="space-y-2">
                <div>
                  <p className="text-lg font-semibold text-slate-900 dark:text-white">{intake.clientName}</p>
                </div>
                <div className="text-sm space-y-1">
                  <p className="text-slate-600 dark:text-gray-400">
                    <span className="inline-block w-16">Email:</span>
                    <span className="text-slate-900 dark:text-white">{intake.email}</span>
                  </p>
                  <p className="text-slate-600 dark:text-gray-400">
                    <span className="inline-block w-16">Phone:</span>
                    <span className="text-slate-900 dark:text-white">{intake.phoneNumber || 'N/A'}</span>
                  </p>
                  <p className="text-slate-600 dark:text-gray-400">
                    <span className="inline-block w-16">DOB:</span>
                    <span className="text-slate-900 dark:text-white">{formatDate(intake.dateOfBirth)}</span>
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 flex-wrap mb-6">
            <button
              onClick={handleUpdate}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              <Edit size={16} />
              Update
            </button>
            <button
              onClick={handlePreview}
              disabled={loadingPdf}
              className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
            >
              {loadingPdf ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <Eye size={16} />
              )}
              Preview PDF
            </button>
            <button
              onClick={handleDownload}
              disabled={loadingPdf}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
            >
              {loadingPdf ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <Download size={16} />
              )}
              Download
            </button>
            <button
              onClick={handleShare}
              className="flex items-center gap-2 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              <Share2 size={16} />
              Share
            </button>
            <button
              onClick={handleDelete}
              disabled={loadingDelete}
              className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
            >
              {loadingDelete ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <Trash2 size={16} />
              )}
              Delete
            </button>
          </div>

          {/* Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Plaintiff Information */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold mb-4 text-slate-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
                Plaintiff Information
              </h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-gray-400">Name:</span>
                  <span className="font-medium text-slate-900 dark:text-white">{intake.clientName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-gray-400">Gender:</span>
                  <span className="font-medium text-slate-900 dark:text-white">{intake.gender || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-gray-400">Address:</span>
                  <span className="font-medium text-slate-900 dark:text-white text-right">{intake.address || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-gray-400">City:</span>
                  <span className="font-medium text-slate-900 dark:text-white">{intake.city || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-gray-400">Zip:</span>
                  <span className="font-medium text-slate-900 dark:text-white">{intake.zip || 'N/A'}</span>
                </div>
              </div>
            </div>

            {/* Accident Information */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold mb-4 text-slate-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
                Accident Information
              </h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-gray-400">Date:</span>
                  <span className="font-medium text-slate-900 dark:text-white">{formatDate(intake.accidentDate)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-gray-400">Time:</span>
                  <span className="font-medium text-slate-900 dark:text-white">{intake.accidentTime || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-gray-400">Location:</span>
                  <span className="font-medium text-slate-900 dark:text-white text-right max-w-[60%]">{intake.accidentLocation || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-slate-600 dark:text-gray-400 block mb-1">Description:</span>
                  <p className="font-medium text-slate-900 dark:text-white">{intake.accidentDescription || 'N/A'}</p>
                </div>
              </div>
            </div>

            {/* Defendant 1 Information */}
            {intake.defendant1Name && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-semibold mb-4 text-slate-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
                  Defendant 1 Information
                </h2>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-600 dark:text-gray-400">Name:</span>
                    <span className="font-medium text-slate-900 dark:text-white">{intake.defendant1Name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600 dark:text-gray-400">Phone:</span>
                    <span className="font-medium text-slate-900 dark:text-white">{intake.defendant1Phone || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600 dark:text-gray-400">Carrier:</span>
                    <span className="font-medium text-slate-900 dark:text-white">{intake.defendant1Carrier || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600 dark:text-gray-400">Policy:</span>
                    <span className="font-medium text-slate-900 dark:text-white">{intake.defendant1Policy || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600 dark:text-gray-400">Vehicle:</span>
                    <span className="font-medium text-slate-900 dark:text-white">{intake.defendant1Year} {intake.defendant1Make} {intake.defendant1Model || 'N/A'}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Defendant 2 Information */}
            {intake.defendant2Name && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-semibold mb-4 text-slate-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
                  Defendant 2 Information
                </h2>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-600 dark:text-gray-400">Name:</span>
                    <span className="font-medium text-slate-900 dark:text-white">{intake.defendant2Name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600 dark:text-gray-400">Phone:</span>
                    <span className="font-medium text-slate-900 dark:text-white">{intake.defendant2Phone || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600 dark:text-gray-400">Carrier:</span>
                    <span className="font-medium text-slate-900 dark:text-white">{intake.defendant2Carrier || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600 dark:text-gray-400">Policy:</span>
                    <span className="font-medium text-slate-900 dark:text-white">{intake.defendant2Policy || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600 dark:text-gray-400">Vehicle:</span>
                    <span className="font-medium text-slate-900 dark:text-white">{intake.defendant2Year} {intake.defendant2Make} {intake.defendant2Model || 'N/A'}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Auto Insurance */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold mb-4 text-slate-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
                Auto Insurance
              </h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-gray-400">Carrier:</span>
                  <span className="font-medium text-slate-900 dark:text-white">{intake.autoCarrier || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-gray-400">Agent:</span>
                  <span className="font-medium text-slate-900 dark:text-white">{intake.autoAgent || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-gray-400">Policy:</span>
                  <span className="font-medium text-slate-900 dark:text-white">{intake.autoPolicy || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-gray-400">Phone:</span>
                  <span className="font-medium text-slate-900 dark:text-white">{intake.autoPhone || 'N/A'}</span>
                </div>
              </div>
            </div>

            {/* Health Insurance */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold mb-4 text-slate-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
                Health Insurance
              </h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-gray-400">Carrier:</span>
                  <span className="font-medium text-slate-900 dark:text-white">{intake.healthCarrier || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-gray-400">Type:</span>
                  <span className="font-medium text-slate-900 dark:text-white">{intake.healthType || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-gray-400">Group:</span>
                  <span className="font-medium text-slate-900 dark:text-white">{intake.healthGroup || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-gray-400">Policy:</span>
                  <span className="font-medium text-slate-900 dark:text-white">{intake.healthPolicy || 'N/A'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Medical Treatment - Full Width */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700 mt-6">
            <h2 className="text-xl font-semibold mb-4 text-slate-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
              Medical Treatment
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
              <div>
                <span className="text-slate-600 dark:text-gray-400 block mb-1">Ambulance:</span>
                <span className="font-medium text-slate-900 dark:text-white">{intake.ambulance ? 'Yes' : 'No'}</span>
              </div>
              <div>
                <span className="text-slate-600 dark:text-gray-400 block mb-1">Company:</span>
                <span className="font-medium text-slate-900 dark:text-white">{intake.ambulanceCompany || 'N/A'}</span>
              </div>
              <div>
                <span className="text-slate-600 dark:text-gray-400 block mb-1">Admitted:</span>
                <span className="font-medium text-slate-900 dark:text-white">{intake.admitted ? 'Yes' : 'No'}</span>
              </div>
              <div>
                <span className="text-slate-600 dark:text-gray-400 block mb-1">Length of Stay:</span>
                <span className="font-medium text-slate-900 dark:text-white">{intake.lengthOfStay || 'N/A'}</span>
              </div>
            </div>

            {(intake.doctorHospital1 || intake.doctorHospital2 || intake.doctorHospital3) && (
              <div className="space-y-4 mt-4">
                {intake.doctorHospital1 && (
                  <div className="border-l-4 border-blue-500 pl-4 py-2 bg-gray-50 dark:bg-gray-700/50">
                    <h4 className="font-semibold text-slate-900 dark:text-white mb-2">Treatment 1</h4>
                    <div className="space-y-1 text-sm">
                      <p><span className="text-slate-600 dark:text-gray-400">Doctor/Hospital:</span> <span className="font-medium text-slate-900 dark:text-white">{intake.doctorHospital1}</span></p>
                      <p><span className="text-slate-600 dark:text-gray-400">Address:</span> <span className="font-medium text-slate-900 dark:text-white">{intake.address1 || 'N/A'}</span></p>
                      <p><span className="text-slate-600 dark:text-gray-400">Phone:</span> <span className="font-medium text-slate-900 dark:text-white">{intake.phone1 || 'N/A'}</span></p>
                      <p><span className="text-slate-600 dark:text-gray-400">Date:</span> <span className="font-medium text-slate-900 dark:text-white">{formatDate(intake.treatmentDate1)}</span></p>
                    </div>
                  </div>
                )}
                {intake.doctorHospital2 && (
                  <div className="border-l-4 border-blue-500 pl-4 py-2 bg-gray-50 dark:bg-gray-700/50">
                    <h4 className="font-semibold text-slate-900 dark:text-white mb-2">Treatment 2</h4>
                    <div className="space-y-1 text-sm">
                      <p><span className="text-slate-600 dark:text-gray-400">Doctor/Hospital:</span> <span className="font-medium text-slate-900 dark:text-white">{intake.doctorHospital2}</span></p>
                      <p><span className="text-slate-600 dark:text-gray-400">Address:</span> <span className="font-medium text-slate-900 dark:text-white">{intake.address2 || 'N/A'}</span></p>
                      <p><span className="text-slate-600 dark:text-gray-400">Phone:</span> <span className="font-medium text-slate-900 dark:text-white">{intake.phone2 || 'N/A'}</span></p>
                      <p><span className="text-slate-600 dark:text-gray-400">Date:</span> <span className="font-medium text-slate-900 dark:text-white">{formatDate(intake.treatmentDate2)}</span></p>
                    </div>
                  </div>
                )}
                {intake.doctorHospital3 && (
                  <div className="border-l-4 border-blue-500 pl-4 py-2 bg-gray-50 dark:bg-gray-700/50">
                    <h4 className="font-semibold text-slate-900 dark:text-white mb-2">Treatment 3</h4>
                    <div className="space-y-1 text-sm">
                      <p><span className="text-slate-600 dark:text-gray-400">Doctor/Hospital:</span> <span className="font-medium text-slate-900 dark:text-white">{intake.doctorHospital3}</span></p>
                      <p><span className="text-slate-600 dark:text-gray-400">Address:</span> <span className="font-medium text-slate-900 dark:text-white">{intake.address3 || 'N/A'}</span></p>
                      <p><span className="text-slate-600 dark:text-gray-400">Phone:</span> <span className="font-medium text-slate-900 dark:text-white">{intake.phone3 || 'N/A'}</span></p>
                      <p><span className="text-slate-600 dark:text-gray-400">Date:</span> <span className="font-medium text-slate-900 dark:text-white">{formatDate(intake.treatmentDate3)}</span></p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Injuries - Full Width */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700 mt-6">
            <h2 className="text-xl font-semibold mb-4 text-slate-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
              Injuries & Prior History
            </h2>
            <div className="space-y-3 text-sm">
              <div>
                <span className="text-slate-600 dark:text-gray-400 block mb-1">Body Parts Affected:</span>
                <p className="font-medium text-slate-900 dark:text-white">{intake.bodyPartsAffected || 'N/A'}</p>
              </div>
              <div>
                <span className="text-slate-600 dark:text-gray-400 block mb-1">Prior Injuries:</span>
                <p className="font-medium text-slate-900 dark:text-white">{intake.priorInjuries || 'N/A'}</p>
              </div>
              <div>
                <span className="text-slate-600 dark:text-gray-400 block mb-1">Prior Insurance Claims:</span>
                <p className="font-medium text-slate-900 dark:text-white">{intake.priorInsuranceClaims || 'N/A'}</p>
              </div>
              <div>
                <span className="text-slate-600 dark:text-gray-400 block mb-1">Prior Attorneys:</span>
                <p className="font-medium text-slate-900 dark:text-white">{intake.priorAttorneys || 'N/A'}</p>
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
              <iframe src={pdfUrl} className="w-full h-full" title="PDF Preview" />
            </div>
          </div>
        </div>
      )}
    </>
  );
}