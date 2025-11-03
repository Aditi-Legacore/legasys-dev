'use client';

import React from 'react';
import { Eye, Edit, Trash2 } from 'lucide-react';

interface Document {
  id: string;
  clientName: string;
  caseType: string;
  status: string;
  documentStatus: string;
  createdDate: string;
  files: string[];
}

interface DocumentsTableProps {
  documents: Document[];
  onView?: (doc: Document) => void;
  onEdit?: (doc: Document) => void;
  onDelete?: (doc: Document) => void;
}

export default function DocumentsTable({
  documents,
  onView,
  onEdit,
  onDelete,
}: DocumentsTableProps) {
  if (!documents || documents.length === 0) {
    return (
      <div className="text-center py-10 text-gray-500 dark:text-gray-400">
        No documents found.
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-100 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
            <tr>
              <th className="px-4 py-3 sm:px-6 sm:py-3 text-left text-xs sm:text-sm font-semibold text-gray-900 dark:text-white">
                ID
              </th>
              <th className="px-4 py-3 sm:px-6 sm:py-3 text-left text-xs sm:text-sm font-semibold text-gray-900 dark:text-white">
                Client Name
              </th>
              <th className="px-4 py-3 sm:px-6 sm:py-3 text-left text-xs sm:text-sm font-semibold text-gray-900 dark:text-white">
                Case Type
              </th>
              <th className="px-4 py-3 sm:px-6 sm:py-3 text-left text-xs sm:text-sm font-semibold text-gray-900 dark:text-white hidden sm:table-cell">
                Created Date
              </th>
              <th className="px-4 py-3 sm:px-6 sm:py-3 text-left text-xs sm:text-sm font-semibold text-gray-900 dark:text-white">
                Document Status
              </th>
              <th className="px-4 py-3 sm:px-6 sm:py-3 text-center text-xs sm:text-sm font-semibold text-gray-900 dark:text-white">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {documents.map((doc) => (
              <tr
                key={doc.id}
                className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <td className="px-4 py-4 sm:px-6 sm:py-4 text-xs sm:text-sm text-gray-800 dark:text-gray-200">{doc.id}</td>
                <td className="px-4 py-4 sm:px-6 sm:py-4 text-xs sm:text-sm text-gray-600 dark:text-gray-400">{doc.clientName}</td>
                <td className="px-4 py-4 sm:px-6 sm:py-4 text-xs sm:text-sm text-gray-600 dark:text-gray-400">{doc.caseType}</td>
                <td className="px-4 py-4 sm:px-6 sm:py-4 text-xs sm:text-sm text-gray-600 dark:text-gray-400 hidden sm:table-cell">{doc.createdDate}</td>
                <td className="px-4 py-4 sm:px-6 sm:py-4">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      doc.documentStatus === 'submitted'
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : doc.documentStatus === 'pending'
                        ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                        : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                    }`}
                  >
                    {doc.documentStatus}
                  </span>
                </td>
                <td className="px-4 py-4 sm:px-6 sm:py-4 text-center flex justify-center gap-1 sm:gap-2">
                  <button
                    onClick={() => onView?.(doc)}
                    className="p-2 hover:bg-blue-50 dark:hover:bg-gray-700 rounded-lg text-blue-600 dark:text-blue-400 transition"
                    title="View"
                  >
                    <Eye size={16} />
                  </button>
                  <button
                    onClick={() => onEdit?.(doc)}
                    className="p-2 hover:bg-green-50 dark:hover:bg-gray-700 rounded-lg text-green-600 dark:text-green-400 transition"
                    title="Edit"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => onDelete?.(doc)}
                    className="p-2 hover:bg-red-50 dark:hover:bg-gray-700 rounded-lg text-red-600 dark:text-red-400 transition"
                    title="Delete"
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
