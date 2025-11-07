"use client";

import React, { useState } from "react";
import { Eye, Edit, Trash2, FileText, Upload } from "lucide-react";
import Pagination from "@/components/ui/pagination";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import CommonTable, { Column, Action } from "@/components/ui/CommonTable";
import UploadDocumentsModal from "@/components/modal/UploadDocumentsModal";

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
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);

  // Update tableDocs when documents prop changes
  React.useEffect(() => {
    setTableDocs(documents);
    setCurrentPage(1); // Reset to first page when documents change
  }, [documents]);

  const router = useRouter();

  const itemsPerPage = 5;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedDocuments = tableDocs.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (page: number) => setCurrentPage(page);

  // Delete handler
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

  // Define columns
  const columns: Column[] = [
    {
      key: 'clientName',
      label: 'Client Name',
      className: 'px-4 py-4 text-xs sm:text-sm text-gray-600 dark:text-gray-400',
      sortable: true,
      link: (row) => `/intake-preview/${row.id}`
    },
    {
      key: 'caseType',
      label: 'Case Type',
      className: 'px-4 py-4 text-xs sm:text-sm text-gray-600 dark:text-gray-400',
      sortable: true
    },
    {
      key: 'createdDate',
      label: 'Created Date',
      className: 'px-4 py-4 text-xs sm:text-sm text-gray-600 dark:text-gray-400 hidden sm:table-cell',
      sortable: true,
      render: (value) => new Date(value).toLocaleDateString()
    },
    {
      key: 'documentStatus',
      label: 'Document Status',
      className: 'px-4 py-4',
      sortable: true,
      render: (value) => (
        <Badge
          className={`px-3 py-1 rounded-full text-xs font-medium ${
            value === "submitted"
              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
              : value === "pending"
              ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
              : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
          }`}
        >
          {value}
        </Badge>
      )
    },
    {
      key: 'files',
      label: 'Files',
      className: 'px-4 py-4 text-center',
      render: (value, row) => (
        row.documentStatus === "submitted" ? (
          <button
            onClick={() => router.push(`/documents/${row.id}`)}
            className="p-2 hover:bg-blue-50 dark:hover:bg-gray-700 rounded-lg text-blue-600 dark:text-blue-400 transition"
            title="View Uploaded Files"
          >
            <FileText size={16} />
          </button>
        ) : (
          <span className="text-gray-400 text-xs italic">—</span>
        )
      )
    }
  ];

  // Define actions
  const actions: Action[] = [
    {
      label: 'View',
      icon: Eye,
      onClick: (row) => onView?.(row),
      className: 'text-blue-600 dark:text-blue-400'
    },
    {
      label: 'Upload',
      icon: Upload,
      onClick: (row) => {
        setSelectedDocId(row.id);
        setUploadModalOpen(true);
      },
      className: 'text-green-600 dark:text-green-400'
    },
    {
      label: 'Delete',
      icon: Trash2,
      onClick: (row) => handleDelete(row),
      disabled: (row) => deletingId === row.id,
      className: 'text-red-600 dark:text-red-400'
    }
  ];

  return (
    <>
      <CommonTable
        columns={columns}
        data={paginatedDocuments}
        actions={actions}
        showSerialNumber={true}
        emptyMessage="No documents found."
      />

      {/* Pagination */}
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

      {/* Upload Documents Modal */}
      {selectedDocId && (
        <UploadDocumentsModal
          isOpen={uploadModalOpen}
          onClose={() => {
            setUploadModalOpen(false);
            setSelectedDocId(null);
          }}
          intakeId={selectedDocId}
          onUploadSuccess={() => {
            // Refresh documents or handle success
            setUploadModalOpen(false);
            setSelectedDocId(null);
          }}
        />
      )}
    </>
  );
}