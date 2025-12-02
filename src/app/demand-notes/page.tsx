'use client';

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Search, Filter, FileText, Eye, Loader2 } from "lucide-react";
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
  const filteredNotes = demandNotes.filter((note) => {
    const clientName = note.client?.name ?? "";
    const matchesSearch = clientName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || note.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // TABLE DATA → convert DemandNote → Record<string, unknown>
  const tableData: Record<string, unknown>[] = filteredNotes.map((n) => ({
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
      </div>
    </main>
  );
}
