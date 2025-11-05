"use client";

import React, { useState } from "react";
import { Eye, Edit, Trash2,FileText  } from "lucide-react";
import Pagination from "@/components/ui/pagination";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

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
}

export default function DocumentsTable({ documents, onView, onEdit }: DocumentsTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [tableDocs, setTableDocs] = useState<Document[]>(documents);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const router = useRouter();

  const itemsPerPage = 5;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedDocuments = tableDocs.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (page: number) => setCurrentPage(page);

  // ✅ Delete handler
  const handleDelete = async (doc: Document) => {
    const confirmed = confirm(`Are you sure you want to delete "${doc.clientName}"?`);
    if (!confirmed) return;

    setDeletingId(doc.id);

    try {
      const res = await fetch(`/api/documents?id=${doc.id}`, { method: "DELETE" });

      if (res.ok) {
        setTableDocs((prev) => prev.filter((d) => d.id !== doc.id));
        toast.success(`Deleted "${doc.clientName}" successfully.`);
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to delete document.");
      }
    } catch (error) {
      console.error("Error deleting:", error);
      toast.error("Something went wrong while deleting.");
    } finally {
      setDeletingId(null);
    }
  };

  if (!tableDocs || tableDocs.length === 0) {
    return (
      <div className="text-center py-10 text-gray-500 dark:text-gray-400">
        No documents found.
      </div>
    );
  }

  return (
    <div>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-100 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
              <tr>
                <th className="px-4 py-3 text-left text-xs sm:text-sm font-semibold text-gray-900 dark:text-white">
                  S.No
                </th>
                <th className="px-4 py-3 text-left text-xs sm:text-sm font-semibold text-gray-900 dark:text-white">
                  Client Name
                </th>
                <th className="px-4 py-3 text-left text-xs sm:text-sm font-semibold text-gray-900 dark:text-white">
                  Case Type
                </th>
                <th className="px-4 py-3 text-left text-xs sm:text-sm font-semibold text-gray-900 dark:text-white hidden sm:table-cell">
                  Created Date
                </th>
                <th className="px-4 py-3 text-left text-xs sm:text-sm font-semibold text-gray-900 dark:text-white">
                  Document Status
                </th>
                <th className="px-4 py-3 text-left text-xs sm:text-sm font-semibold text-gray-900 dark:text-white">
                  Files
                </th>
                <th className="px-4 py-3 text-center text-xs sm:text-sm font-semibold text-gray-900 dark:text-white">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {paginatedDocuments.map((doc, index) => (
                <tr
                  key={doc.id}
                  className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <td className="px-4 py-4 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                    {startIndex + index + 1}
                  </td>
                  <td className="px-4 py-4 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                    {doc.clientName}
                  </td>
                  <td className="px-4 py-4 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                    {doc.caseType}
                  </td>
                  <td className="px-4 py-4 text-xs sm:text-sm text-gray-600 dark:text-gray-400 hidden sm:table-cell">
                    {new Date(doc.createdDate).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        doc.documentStatus === "submitted"
                          ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                          : doc.documentStatus === "pending"
                          ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                          : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                      }`}
                    >
                      {doc.documentStatus}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-center">
                    {doc.documentStatus === "submitted" ? (
                      <button
                        onClick={() => router.push(`/documents/${doc.id}`)}
                        className="p-2 hover:bg-blue-50 dark:hover:bg-gray-700 rounded-lg text-blue-600 dark:text-blue-400 transition"
                        title="View Uploaded Files"
                      >
                        <FileText size={16} />
                      </button>
                    ) : (
                      <span className="text-gray-400 text-xs italic">—</span>
                    )}
                  </td>

                  {/* ✅ Action Buttons */}
                  <td className="px-4 py-4 text-center flex justify-center gap-1 sm:gap-2">
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
                      onClick={() => handleDelete(doc)}
                      disabled={deletingId === doc.id}
                      className={`p-2 rounded-lg transition ${
                        deletingId === doc.id
                          ? "opacity-50 cursor-not-allowed"
                          : "hover:bg-red-50 dark:hover:bg-gray-700 text-red-600 dark:text-red-400"
                      }`}
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

      {/* ✅ Pagination */}
      {tableDocs.length > itemsPerPage && (
        <div className="mt-6">
          <Pagination
            totalItems={tableDocs.length}
            itemsPerPage={itemsPerPage}
            currentPage={currentPage}
            onPageChange={handlePageChange}
          />
        </div>
      )}
    </div>
  );
}
