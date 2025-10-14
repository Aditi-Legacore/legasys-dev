'use client';

import React, { useState } from 'react';
import { Eye, Edit, Trash2, Plus } from 'lucide-react';
import { CaseIntake } from '@/types/intake';
import IntakeFormWizard from '@/components/forms/IntakeForm';

export default function CaseIntakeManagement() {
  const [intakes, setIntakes] = useState<CaseIntake[]>([
  {
    id: 1,
    clientName: 'John Anderson',
    dateOfLoss: '2024-08-15',
    caseType: 'Personal Injury'
  },
    {
      id: 2,
      clientName: 'Sarah Mitchell',
      dateOfLoss: '2024-09-22',
      caseType: 'Property Damage'
    },
    {
      id: 3,
      clientName: 'Michael Chen',
      dateOfLoss: '2024-07-10',
      caseType: 'Contract Dispute'
    },
    {
      id: 4,
      clientName: 'Emily Rodriguez',
      dateOfLoss: '2024-10-05',
      caseType: 'Employment Law'
    }
  ]);

  const [selectedIntake, setSelectedIntake] = useState<CaseIntake | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showFormModal, setShowFormModal] = useState(false);

  const handleView = (intake: CaseIntake) => {
  setSelectedIntake(intake);
  setShowModal(true);
};

  const handleDelete = (id: number) => {
  if (window.confirm('Are you sure you want to delete this intake?')) {
    setIntakes(intakes.filter((intake) => intake.id !== id));
  }
};

  const handleUpdate = () => {
    alert('Update functionality will be implemented');
  };

  const handleCreateNew = () => {
    setShowFormModal(true);
  };

  const handleFormSubmit = (data: any) => {
    const newIntake: CaseIntake = {
      id: intakes.length + 1,
      clientName: data.clientName,
      dateOfLoss: data.accidentDate,
      caseType: data.caseType,
    };
    setIntakes([...intakes, newIntake]);
    setShowFormModal(false);
  };

  const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            {/* <h1 className="text-4xl font-bold text-slate-900 dark:text-white">Case Intake List</h1> */}
            <p className="text-2xl font-bold text-slate-900 dark:text-white">Manage and track case intakes</p>
          </div>
          <button
            onClick={handleCreateNew}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors duration-200 shadow-md hover:shadow-lg"
          >
            <Plus size={20} />
            Create New Intake
          </button>
        </div>

        {/* Table Container */}
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
                {intakes.map((intake, index) => (
                  <tr
                    key={intake.id}
                    className={`border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150 ${
                      index === intakes.length - 1 ? 'border-b-0' : ''
                    }`}
                  >
                    <td className="px-6 py-4 text-sm font-semibold text-gray-700 dark:text-gray-300">{index + 1}</td>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-white font-medium">{intake.clientName}</td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{formatDate(intake.dateOfLoss)}</td>
                    <td className="px-6 py-4 text-sm">
                      <span className="inline-block bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-3 py-1 rounded-full text-xs font-medium">
                        {intake.caseType}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => handleView(intake)}
                          className="p-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-gray-700 rounded-lg transition-colors duration-150"
                          title="View"
                        >
                          <Eye size={18} />
                        </button>
                        <button
                          onClick={handleUpdate}
                          className="p-2 text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-gray-700 rounded-lg transition-colors duration-150"
                          title="Edit"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(intake.id)}
                          className="p-2 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-gray-700 rounded-lg transition-colors duration-150"
                          title="Delete"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Empty State */}
          {intakes.length === 0 && (
            <div className="text-center py-12">
              <p className="text-slate-500 text-lg">No case intakes found. Create one to get started.</p>
            </div>
          )}
        </div>

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
                  <p className="text-lg font-semibold text-slate-900">{formatDate(selectedIntake.dateOfLoss)}</p>
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

        {/* Form Modal */}
        {showFormModal && (
          <div className="fixed inset-0 bg-transparent bg-opacity-20 flex items-center justify-center p-4 z-50">
            <div className="bg-white bg-opacity-90 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-slate-900">Create New Intake</h2>
                <button
                  onClick={() => setShowFormModal(false)}
                  className="text-slate-600 hover:text-slate-900 text-2xl"
                >
                  ×
                </button>
              </div>
              <IntakeFormWizard onFormSubmit={handleFormSubmit} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
