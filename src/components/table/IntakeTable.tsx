'use client';

import React, { useEffect, useState } from 'react';
import { Eye, Edit, Trash2, Plus, Loader2, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Pagination from '@/components/ui/pagination';

interface CaseIntake {
  id: number | string;
  clientName: string;
  accidentDate: string;
  caseType: string;
}

export default function CaseIntakeManagement() {
  const [intakes, setIntakes] = useState<CaseIntake[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingView, setLoadingView] = useState<number | string | null>(null);
  const [loadingEdit, setLoadingEdit] = useState<number | string | null>(null);
  const [loadingDelete, setLoadingDelete] = useState<number | string | null>(null);
  const [selectedIntake, setSelectedIntake] = useState<CaseIntake | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const router = useRouter();

  // Fetch intakes from API
  useEffect(() => {
    const fetchIntakes = async () => {
      try {
        const res = await fetch('/api/intake');
        if (!res.ok) throw new Error('Failed to fetch intakes');
        const data = await res.json();
        setIntakes(data);
      } catch (error) {
        console.error(error);
        alert('Failed to load case intakes.');
      } finally {
        setLoading(false);
      }
    };
    fetchIntakes();
  }, []);

  const handleView = (intake: CaseIntake) => {
    setLoadingView(intake.id);
    setSelectedIntake(intake);
    setShowModal(true);
    setLoadingView(null);
  };

  const handleUpdate = (id: number | string) => {
    setLoadingEdit(id);
    alert('Update functionality will be implemented.');
    setLoadingEdit(null);
  };

  const handleDelete = async (id: number | string) => {
    if (!confirm('Are you sure you want to delete this intake?')) return;

    setLoadingDelete(id);
    try {
      const res = await fetch(`/api/intake/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete intake');
      setIntakes(intakes.filter((intake) => intake.id !== id));
    } catch (error) {
      console.error(error);
      alert('Failed to delete intake.');
    } finally {
      setLoadingDelete(null);
    }
  };

  const handleCreateNew = () => {
    router.push('/intake-form');
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedIntakes = intakes.slice(startIndex, startIndex + itemsPerPage);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white dark:bg-gray-900">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6 lg:mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white">
              Case Intake List
            </h1>
            <p className="text-slate-600 dark:text-gray-400 mt-1 sm:mt-2 text-sm sm:text-base">
              Manage and track case intakes
            </p>
          </div>
          <button
            onClick={handleCreateNew}
            className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-semibold transition-colors duration-200 shadow-md hover:shadow-lg text-sm sm:text-base whitespace-nowrap"
          >
            <Plus size={18} className="sm:w-5 sm:h-5" />
            <span className="hidden xs:inline">Create New Intake</span>
            <span className="xs:hidden">New Intake</span>
          </button>
        </div>

        {/* Desktop Table View - Hidden on mobile */}
        <div className="hidden md:block bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                  <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-xs lg:text-sm font-semibold text-slate-900 dark:text-white">
                    S.No
                  </th>
                  <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-xs lg:text-sm font-semibold text-slate-900 dark:text-white">
                    Client Name
                  </th>
                  <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-xs lg:text-sm font-semibold text-slate-900 dark:text-white">
                    Date of Loss
                  </th>
                  <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-xs lg:text-sm font-semibold text-slate-900 dark:text-white">
                    Case Type
                  </th>
                  <th className="px-4 lg:px-6 py-3 lg:py-4 text-center text-xs lg:text-sm font-semibold text-slate-900 dark:text-white">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {paginatedIntakes.map((intake, index) => (
                  <tr
                    key={intake.id}
                    className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150"
                  >
                    <td className="px-4 lg:px-6 py-3 lg:py-4 text-xs lg:text-sm font-semibold text-gray-700 dark:text-gray-300">
                      {startIndex + index + 1}
                    </td>
                    <td className="px-4 lg:px-6 py-3 lg:py-4 text-xs lg:text-sm text-gray-900 dark:text-white font-medium">
                      {intake.clientName}
                    </td>
                    <td className="px-4 lg:px-6 py-3 lg:py-4 text-xs lg:text-sm text-gray-600 dark:text-gray-400">
                      {formatDate(intake.accidentDate)}
                    </td>
                    <td className="px-4 lg:px-6 py-3 lg:py-4 text-xs lg:text-sm">
                      <span className="inline-block bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 lg:px-3 py-1 rounded-full text-xs font-medium">
                        {intake.caseType}
                      </span>
                    </td>
                    <td className="px-4 lg:px-6 py-3 lg:py-4">
                      <div className="flex justify-center gap-1 lg:gap-2">
                        <button
                          onClick={() => handleView(intake)}
                          disabled={loadingView === intake.id}
                          className="p-1.5 lg:p-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-gray-700 rounded-lg transition-colors duration-150"
                          title="View"
                        >
                          {loadingView === intake.id ? (
                            <Loader2 size={16} className="lg:w-[18px] lg:h-[18px] animate-spin" />
                          ) : (
                            <Eye size={16} className="lg:w-[18px] lg:h-[18px]" />
                          )}
                        </button>
                        <button
                          onClick={() => handleUpdate(intake.id)}
                          className="p-1.5 lg:p-2 text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-gray-700 rounded-lg transition-colors duration-150"
                          title="Edit"
                        >
                          {loadingEdit === intake.id ? (
                            <Loader2 size={16} className="lg:w-[18px] lg:h-[18px] animate-spin" />
                          ) : (
                            <Edit size={16} className="lg:w-[18px] lg:h-[18px]" />
                          )}
                        </button>
                        <button
                          onClick={() => handleDelete(intake.id)}
                          disabled={loadingDelete === intake.id}
                          className="p-1.5 lg:p-2 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-gray-700 rounded-lg transition-colors duration-150"
                          title="Delete"
                        >
                          {loadingDelete === intake.id ? (
                            <Loader2 size={16} className="lg:w-[18px] lg:h-[18px] animate-spin" />
                          ) : (
                            <Trash2 size={16} className="lg:w-[18px] lg:h-[18px]" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {intakes.length === 0 && (
              <div className="text-center py-12">
                <p className="text-slate-500 text-base lg:text-lg">
                  No case intakes found. Create one to get started.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Card View - Visible only on mobile */}
        <div className="md:hidden space-y-4">
          {paginatedIntakes.map((intake, index) => (
            <div
              key={intake.id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 border border-gray-200 dark:border-gray-700"
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gray-100 dark:bg-gray-700 text-xs font-bold text-gray-700 dark:text-gray-300">
                      {startIndex + index + 1}
                    </span>
                    <h3 className="text-base font-semibold text-gray-900 dark:text-white truncate">
                      {intake.clientName}
                    </h3>
                  </div>
                  <span className="inline-block bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-0.5 rounded-full text-xs font-medium">
                    {intake.caseType}
                  </span>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <div>
                  <p className="text-xs text-slate-600 dark:text-gray-400">Date of Loss</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {formatDate(intake.accidentDate)}
                  </p>
                </div>
              </div>

              <div className="flex gap-2 pt-3 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => handleView(intake)}
                  disabled={loadingView === intake.id}
                  className="flex-1 flex items-center justify-center gap-2 p-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-gray-700 rounded-lg transition-colors duration-150 text-sm font-medium"
                >
                  {loadingView === intake.id ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Eye size={16} />
                  )}
                  View
                </button>
                <button
                  onClick={() => handleUpdate(intake.id)}
                  className="flex-1 flex items-center justify-center gap-2 p-2 text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-gray-700 rounded-lg transition-colors duration-150 text-sm font-medium"
                >
                  {loadingEdit === intake.id ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Edit size={16} />
                  )}
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(intake.id)}
                  disabled={loadingDelete === intake.id}
                  className="flex-1 flex items-center justify-center gap-2 p-2 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-gray-700 rounded-lg transition-colors duration-150 text-sm font-medium"
                >
                  {loadingDelete === intake.id ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Trash2 size={16} />
                  )}
                  Delete
                </button>
              </div>
            </div>
          ))}

          {intakes.length === 0 && (
            <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow-md">
              <p className="text-slate-500 text-base">
                No case intakes found. Create one to get started.
              </p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {intakes.length > itemsPerPage && (
          <div className="mt-6">
            <Pagination
              totalItems={intakes.length}
              itemsPerPage={itemsPerPage}
              currentPage={currentPage}
              onPageChange={handlePageChange}
            />
          </div>
        )}

        {/* View Modal */}
        {showModal && selectedIntake && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6 relative">
              <button
                onClick={() => setShowModal(false)}
                className="absolute top-4 right-4 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                aria-label="Close modal"
              >
                <X size={20} />
              </button>

              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-6 pr-8">
                Case Details
              </h2>
              
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-slate-600 dark:text-gray-400 mb-1">Client Name</p>
                  <p className="text-base sm:text-lg font-semibold text-slate-900 dark:text-white">
                    {selectedIntake.clientName}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-600 dark:text-gray-400 mb-1">Date of Loss</p>
                  <p className="text-base sm:text-lg font-semibold text-slate-900 dark:text-white">
                    {formatDate(selectedIntake.accidentDate)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-600 dark:text-gray-400 mb-1">Case Type</p>
                  <p className="text-base sm:text-lg font-semibold text-slate-900 dark:text-white">
                    {selectedIntake.caseType}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowModal(false)}
                className="mt-6 w-full bg-slate-200 hover:bg-slate-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-slate-900 dark:text-white px-4 py-2.5 rounded-lg font-semibold transition-colors duration-150"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}