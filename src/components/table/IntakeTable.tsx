'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Edit, Trash2, Eye, Plus, Loader2, X } from 'lucide-react';
import { toast } from 'sonner';
import Pagination from '@/components/ui/pagination';
import NewIntakeModal from '../NewIntakeModal';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import CommonTable, { Column, Action } from '@/components/ui/CommonTable';
import { Badge } from '@/components/ui/badge';

interface CaseIntake {
  id: number | string;
  clientName: string | null | undefined;
  accidentDate: string;
  accidentDescription: string | null | undefined;
  isDraft: boolean;
}

export default function IntakeTable() {
  const router = useRouter();
  const [intakes, setIntakes] = useState<CaseIntake[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingView, setLoadingView] = useState<number | string | null>(null);
  const [loadingEdit, setLoadingEdit] = useState<number | string | null>(null);
  const [loadingDelete, setLoadingDelete] = useState<number | string | null>(null);
  const [loadingNew, setLoadingNew] = useState(false); // ✅ Added loader for "New Intake"
  const [selectedIntake, setSelectedIntake] = useState<CaseIntake | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [showIntakeModal, setShowIntakeModal] = useState(false);
  const itemsPerPage = 5;

  useEffect(() => {
    const fetchIntakes = async () => {
      try {
        const res = await fetch('/api/intake');
        if (!res.ok) throw new Error('Failed to fetch intakes');
        const data = await res.json();
        setIntakes(data);
      } catch (error) {
        console.error(error);
        toast.error('Failed to load intakes.');
      } finally {
        setLoading(false);
      }
    };
    fetchIntakes();
  }, []);

  const handleView = async (intake: CaseIntake) => {
    setLoadingView(intake.id);
    try {
      router.push(`/intake-preview/${intake.id}`);
    } finally {
      setLoadingView(null);
    }
  };

  const handleUpdate = async (id: number | string) => {
    setLoadingEdit(id);
    try {
      router.push(`/intake-form?id=${id}`);
    } finally {
      setLoadingEdit(null);
    }
  };

  const handleDelete = async (id: number | string) => {
    if (!confirm('Are you sure you want to delete this intake?')) return;
    setLoadingDelete(id);
    try {
      const res = await fetch(`/api/intake/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete intake');
      setIntakes(intakes.filter(i => i.id !== id));
      alert("Data deleted successfully");
      toast.success('Intake deleted successfully.');
    } catch (error) {
      console.error(error);
      toast.error('Failed to delete intake.');
    } finally {
      setLoadingDelete(null);
    }
  };

  // const handleNewIntake = async () => {
  //   setLoadingNew(true);
  //   try {
  //     router.push('/intake-form');
  //   } finally {
  //     setLoadingNew(false);
  //   }
  // };
const handleNewIntake = () => {
  setShowIntakeModal(true);
};
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const formatDate = (dateString: string): string => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const truncateText = (text: string | null | undefined, maxLength: number): string => {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedIntakes = intakes.slice(startIndex, startIndex + itemsPerPage);

  // Define columns for CommonTable
  const columns: Column[] = [
    {
      key: 'clientName',
      label: 'Client Name',
      className: 'px-4 py-4 text-xs sm:text-sm text-gray-600 dark:text-gray-400 font-medium'
    },
    {
      key: 'accidentDate',
      label: 'Date of Loss',
      className: 'px-4 py-4 text-xs sm:text-sm text-gray-600 dark:text-gray-400',
      render: (value) => formatDate(value)
    },
    {
      key: 'accidentDescription',
      label: 'Accident Description',
      className: 'px-4 py-4',
      render: (value) => (
        <span className="inline-block bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded-full text-xs font-medium">
          {value}
        </span>
      )
    },
    {
      key: 'isDraft',
      label: 'Status',
      className: 'px-4 py-4',
      render: (value) => (
        <Badge
          className={`px-3 py-1 rounded-full text-xs font-medium ${
            value
              ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
              : "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
          }`}
        >
          {value ? 'Draft' : 'Complete'}
        </Badge>
      )
    }
  ];

  // Define actions for CommonTable
  const actions: Action[] = [
    {
      label: 'View',
      icon: Eye,
      onClick: (row) => handleView(row),
      disabled: (row) => loadingView === row.id,
      className: 'text-blue-600 dark:text-blue-400'
    },
    {
      label: 'Edit',
      icon: Edit,
      onClick: (row) => handleUpdate(row.id),
      disabled: (row) => loadingEdit === row.id,
      className: 'text-green-600 dark:text-green-400'
    },
    {
      label: 'Delete',
      icon: Trash2,
      onClick: (row) => handleDelete(row.id),
      disabled: (row) => loadingDelete === row.id,
      className: 'text-red-600 dark:text-red-400'
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
             
          

        {/* Desktop Table View */}
        <CommonTable
          columns={columns}
          data={paginatedIntakes}
          actions={actions}
          showSerialNumber={true}
          emptyMessage="No case intakes found."
        />

        {/* Mobile Card View */}
        <div className="md:hidden space-y-4">
          {paginatedIntakes.map((intake, index) => (
            <div
              key={intake.id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 border border-gray-200 dark:border-gray-700"
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1 min-w-0 overflow-hidden">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gray-100 dark:bg-gray-700 text-xs font-bold text-gray-700 dark:text-gray-300">
                      {startIndex + index + 1}
                    </span>
                    <h3 className="text-base font-semibold text-gray-900 dark:text-white truncate">
                      {truncateText(intake.clientName, 20)}
                    </h3>
                  </div>
                  <div className="flex gap-2 mt-1">
                    <span className="inline-block bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-0.5 rounded-full text-xs font-medium max-w-full overflow-hidden text-ellipsis whitespace-nowrap">
                      {truncateText(intake.accidentDescription, 20)}
                    </span>
                    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${intake.isDraft ? 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200' : 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'}`}>
                      {intake.isDraft ? 'Draft' : 'Complete'}
                    </span>
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleView(intake)}
                    disabled={loadingView === intake.id}
                    title="View"
                  >
                    {loadingView === intake.id ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <Eye size={16} />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleUpdate(intake.id)}
                    disabled={loadingEdit === intake.id}
                    title="Edit"
                  >
                    {loadingEdit === intake.id ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <Edit size={16} />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(intake.id)}
                    disabled={loadingDelete === intake.id}
                    title="Delete"
                  >
                    {loadingDelete === intake.id ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <Trash2 size={16} />
                    )}
                  </Button>
                </div>
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Date of Loss: {formatDate(intake.accidentDate)}
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
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowModal(false)}
                className="absolute top-4 right-4"
                aria-label="Close modal"
              >
                <X size={20} />
              </Button>

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
                  <p className="text-sm text-slate-600 dark:text-gray-400 mb-1">Accident Description</p>
                  <p className="text-base sm:text-lg font-semibold text-slate-900 dark:text-white">
                    {selectedIntake.accidentDescription}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* New Intake Modal */}
        {showIntakeModal && <NewIntakeModal onClose={() => setShowIntakeModal(false)} />}
      </div>
    </div>
  );
}
