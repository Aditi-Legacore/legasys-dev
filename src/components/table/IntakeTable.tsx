'use client';

import React, { useEffect, useState } from 'react';
import { Eye, Edit, Trash2, Plus, Loader2 } from 'lucide-react';
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
    router.push('/intake-form'); // redirect to intake form page
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

  if (loading) return <div className="text-center py-10">Loading...</div>;

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-slate-900 dark:text-white">Case Intake List</h1>
            <p className="text-slate-600 dark:text-gray-400 mt-2">Manage and track case intakes</p>
          </div>
          <button
            onClick={handleCreateNew}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors duration-200 shadow-md hover:shadow-lg"
          >
            <Plus size={20} />
            Create New Intake
          </button>
        </div>

        {/* Table */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">S.No</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Client Name</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Date of Loss</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Case Type</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-slate-900">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedIntakes.map((intake, index) => (
                  <tr
                    key={intake.id}
                    className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150"
                  >
                    <td className="px-6 py-4 text-sm font-semibold text-gray-700 dark:text-gray-300">{startIndex + index + 1}</td>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-white font-medium">{intake.clientName}</td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{formatDate(intake.accidentDate)}</td>
                    <td className="px-6 py-4 text-sm">
                      <span className="inline-block bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-3 py-1 rounded-full text-xs font-medium">
                        {intake.caseType}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => handleView(intake)}
                          disabled={loadingView === intake.id}
                          className="p-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-gray-700 rounded-lg transition-colors duration-150"
                        >
                          {loadingView === intake.id ? <Loader2 size={18} className="animate-spin" /> : <Eye size={18} />}
                        </button>
                        <button
                          onClick={() => handleUpdate(intake.id)}
                          className="p-2 text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-gray-700 rounded-lg transition-colors duration-150"
                        >
                          {loadingEdit === intake.id ? <Loader2 size={18} className="animate-spin" /> : <Edit size={18} />}
                        </button>
                        <button
                          onClick={() => handleDelete(intake.id)}
                          disabled={loadingDelete === intake.id}
                          className="p-2 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-gray-700 rounded-lg transition-colors duration-150"
                        >
                          {loadingDelete === intake.id ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18} />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {intakes.length === 0 && (
              <div className="text-center py-12">
                <p className="text-slate-500 text-lg">No case intakes found. Create one to get started.</p>
              </div>
            )}
          </div>
        </div>

        {/* Pagination */}
        {intakes.length > itemsPerPage && (
          <Pagination
            totalItems={intakes.length}
            itemsPerPage={itemsPerPage}
            currentPage={currentPage}
            onPageChange={handlePageChange}
          />
        )}

        {/* View Modal */}
        {showModal && selectedIntake && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">Case Details</h2>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-slate-600">Client Name</p>
                  <p className="text-lg font-semibold text-slate-900">{selectedIntake.clientName}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Date of Loss</p>
                  <p className="text-lg font-semibold text-slate-900">{formatDate(selectedIntake.accidentDate)}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Case Type</p>
                  <p className="text-lg font-semibold text-slate-900">{selectedIntake.caseType}</p>
                </div>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="mt-6 w-full bg-slate-200 hover:bg-slate-300 text-slate-900 px-4 py-2 rounded-lg font-semibold transition-colors duration-150"
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
