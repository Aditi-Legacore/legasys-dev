'use client';

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { Plus, Search, Filter, FileText, Eye, Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge, DemandNoteStatus } from "@/components/demand-notes/StatusBadge";
import CommonTable, { Column, Action } from "@/components/ui/CommonTable";
import Pagination from "@/components/ui/pagination";
import { useRouter } from "next/navigation";

interface DemandNote {
  id: string;
  client: { name: string } | null;
  dueDate: string | null;
  status: DemandNoteStatus;
  updatedAt: string;
}

export default function DemandNotes() {
  const router = useRouter();
  const [demandNotes, setDemandNotes] = useState<DemandNote[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/demand-notes");
        const data = await res.json();
        if (Array.isArray(data)) setDemandNotes(data);
      } catch (error) {
        console.error("Error loading demand notes:", error);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  // FILTERING
  const filteredNotes = useMemo(() => {
    return demandNotes.filter((note) => {
      const clientName = note.client?.name ?? "";
      const matchesSearch = clientName.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === "all" || note.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [demandNotes, searchQuery, statusFilter]);

  // Paginated notes
  const paginatedNotes = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredNotes.slice(startIndex, endIndex);
  }, [filteredNotes, currentPage, itemsPerPage]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter]);

  // TABLE DATA → convert DemandNote → Record<string, unknown>
  const tableData: Record<string, unknown>[] = paginatedNotes.map((n) => ({
    id: n.id,
    clientName: n.client?.name ?? "Unknown",
    dueDate: n.dueDate,
    status: n.status,
    updatedAt: n.updatedAt,
    _original: n, // keep reference for actions
  }));

  // COLUMNS
  const columns: Column<Record<string, unknown>>[] = [
    {
      key: "clientName",
      label: "Client Name",
      sortable: true,
    },
    {
      key: "dueDate",
      label: "Demand Date",
      sortable: true,
      render: (value) =>
        value ? new Date(value as string).toLocaleDateString() : "—",
    },
    {
      key: "status",
      label: "Status",
      sortable: true,
      render: (value) => <StatusBadge status={value as DemandNoteStatus} />,
    },
    {
      key: "updatedAt",
      label: "Last Updated",
      sortable: true,
      render: (value) =>
        new Date(value as string).toLocaleString(),
    },
  ];

  // ACTIONS
  const actions: Action<Record<string, unknown>>[] = [
    {
      label: "View",
      icon: Eye,
      onClick: (row) => {
        const original = row._original as DemandNote;
        router.push(`/demand-notes/${original.id}`);
      },
    },
    {
      label: "Delete",
      icon: Trash2,
      onClick: async (row) => {
        const original = row._original as DemandNote;
        const confirmDelete = window.confirm(`Are you sure you want to delete the demand note for ${original.client?.name ?? "Unknown"}?`);
        if (!confirmDelete) return;

        try {
          const response = await fetch(`/api/demand-notes/${original.id}`, {
            method: "DELETE",
          });

          if (response.ok) {
            // Remove from state
            setDemandNotes((prev) => prev.filter((note) => note.id !== original.id));
            alert("Demand note deleted successfully!");
          } else {
            alert("Failed to delete demand note.");
          }
        } catch (error) {
          console.error("Error deleting demand note:", error);
          alert("An error occurred while deleting the demand note.");
        }
      },
    },
    {
      label: "Request Documents",
      icon: FileText,
      onClick: async (row) => {
        const original = row._original as DemandNote;
  
        try {
          const response = await fetch(
            `/api/demand-notes/${original.id}/request-documents`,
            {
              method: "POST",
            }
          );
  
          if (response.ok) {
            alert("Document request sent successfully!");
          } else {
            alert("Failed to send document request.");
          }
        } catch (error) {
          console.error("Error requesting documents:", error);
          alert("An error occurred while requesting documents.");
        }
      },
    },
  ];
  

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Demand Notes</h1>
          <Button asChild>
            <Link href="/demand-notes/new">
              <Plus className="h-4 w-4 mr-2" /> New Demand Note
            </Link>
          </Button>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4 flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" />
              <Input
                placeholder="Search by client name..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[200px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="initiated">Initiated</SelectItem>
                <SelectItem value="doc-uploading">Uploading</SelectItem>
                <SelectItem value="doc-uploaded">Uploaded</SelectItem>
                <SelectItem value="verified">Verified</SelectItem>
                <SelectItem value="generated">Generated</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Table */}
        {isLoading ? (
          <Card>
            <CardContent className="p-8">
              <div className="flex items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin mr-2" />
                <span>Loading demand notes...</span>
              </div>
            </CardContent>
          </Card>
        ) : (
          <CommonTable
            columns={columns}
            data={tableData}
            actions={actions}
            emptyMessage="No demand notes found"
          />
        )}

        {/* Pagination */}
        <Pagination
          totalItems={filteredNotes.length}
          itemsPerPage={itemsPerPage}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
        />
      </div>
    </main>
  );
}
