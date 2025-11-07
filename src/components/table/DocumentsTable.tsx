"use client";

import React, { useState } from "react";
import { Eye, Edit, Trash2,FileText,Upload, MoreVertical   } from "lucide-react";
import Pagination from "@/components/ui/pagination";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import UploadDocumentsModal from "@/components/modal/UploadDocumentsModal";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import SortableHeader from "../ui/SortableHeader";

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
  const [selectedIntakeId, setSelectedIntakeId] = useState<string>("");
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc" | null>(null);

// for sorting
const handleSort = (key: string) => {
  if (sortKey === key) {
    setSortDirection(sortDirection === "asc" ? "desc" : sortDirection === "desc" ? null : "asc");
  } else {
    setSortKey(key);
    setSortDirection("asc");
  }
};


  // Update tableDocs when documents prop changes
  React.useEffect(() => {
    setTableDocs(documents);
    setCurrentPage(1); // Reset to first page when documents change
  }, [documents]);

  const router = useRouter();

  const itemsPerPage = 5;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const sortedDocuments = React.useMemo(() => {
  if (!sortKey || !sortDirection) return tableDocs;

  return [...tableDocs].sort((a, b) => {
    let valA = a[sortKey as keyof Document];
    let valB = b[sortKey as keyof Document];

    // Convert to string for comparison safety
    if (typeof valA === "string" && typeof valB === "string") {
      // Handle date strings automatically (like createdDate)
      const dateA = Date.parse(valA);
      const dateB = Date.parse(valB);

      if (!isNaN(dateA) && !isNaN(dateB)) {
        return sortDirection === "asc" ? dateA - dateB : dateB - dateA;
      }

      // Regular case-insensitive string sorting
      return sortDirection === "asc"
        ? valA.localeCompare(valB, undefined, { sensitivity: "base" })
        : valB.localeCompare(valA, undefined, { sensitivity: "base" });
    }

    // Handle Date objects directly
    if (valA instanceof Date && valB instanceof Date) {
      return sortDirection === "asc"
        ? valA.getTime() - valB.getTime()
        : valB.getTime() - valA.getTime();
    }

    // Handle numbers if any
    if (typeof valA === "number" && typeof valB === "number") {
      return sortDirection === "asc" ? valA - valB : valB - valA;
    }

    return 0;
  });
}, [tableDocs, sortKey, sortDirection]);

const paginatedDocuments = React.useMemo(() => {
  return sortedDocuments.slice(startIndex, startIndex + itemsPerPage);
}, [sortedDocuments, startIndex, itemsPerPage]);


const handleView = (id: string) => {
    router.push(`/intake-preview/${id}`);
  };


  const handlePageChange = (page: number) => setCurrentPage(page);

  const handleUploadClick = (doc: Document) => {
    setSelectedIntakeId(doc.id);
    setUploadModalOpen(true);
  };

  const handleUploadSuccess = () => {
    setUploadModalOpen(false);
    // Refresh the table data by calling the parent component's refresh function if available
    if (onView) {
      // Assuming onView can be used to refresh, or we need to add a refresh prop
      // For now, we'll trigger a re-fetch by updating the state
      setTableDocs((prev) => [...prev]); // This will trigger a re-render and potentially refresh
    }
  };

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

                <SortableHeader
                  label="Client Name"
                  sortKey="clientName"
                  currentSortKey={sortKey}
                  currentDirection={sortDirection}
                  onSort={handleSort}
                />

                <SortableHeader
                  label="Case Type"
                  sortKey="caseType"
                  currentSortKey={sortKey}
                  currentDirection={sortDirection}
                  onSort={handleSort}
                />

                <SortableHeader
                  label="Created Date"
                  sortKey="createdDate"
                  currentSortKey={sortKey}
                  currentDirection={sortDirection}
                  onSort={handleSort}
                  className="hidden sm:table-cell"
                />

                <SortableHeader
                  label="Document Status"
                  sortKey="documentStatus"
                  currentSortKey={sortKey}
                  currentDirection={sortDirection}
                  onSort={handleSort}
                />

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
                  <td className="px-4 lg:px-6 py-3 lg:py-4 text-xs lg:text-sm text-gray-900 dark:text-white font-medium">
                      <button
                        onClick={() => handleView(doc.id)}
                        className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 underline cursor-pointer bg-transparent border-none p-0"
                      >
                        {doc.clientName} 
                      </button>
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

                  <td className="px-4 py-4 text-center">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleUploadClick(doc)}>
                          <Upload className="w-4 h-4 mr-2" /> Upload Documents
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDelete(doc)}>
                          <Trash2 className="w-4 h-4 mr-2" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
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

      {/* Upload Documents Modal */}
      <UploadDocumentsModal
        isOpen={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        intakeId={selectedIntakeId}
        onUploadSuccess={handleUploadSuccess}
      />
    </div>
  );
}
