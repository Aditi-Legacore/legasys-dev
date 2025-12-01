'use client';

import { useState } from "react";
import Link from "next/link";
import { Plus, Search, Filter, FileText, Eye } from "lucide-react";
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
  clientName: string;
  demandDate: string;
  status: DemandNoteStatus;
  lastUpdated: string;
}

const mockDemandNotes: DemandNote[] = [
  {
    id: "DN-001",
    clientName: "John Doe",
    demandDate: "2025-11-20",
    status: "generated",
    lastUpdated: "2025-11-25 14:30",
  },
  {
    id: "DN-002",
    clientName: "Jane Smith",
    demandDate: "2025-11-22",
    status: "verified",
    lastUpdated: "2025-11-26 09:15",
  },
  {
    id: "DN-003",
    clientName: "Robert Johnson",
    demandDate: "2025-11-24",
    status: "doc-uploaded",
    lastUpdated: "2025-11-26 16:45",
  },
];

export default function DemandNotes() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filteredNotes = mockDemandNotes.filter((note) => {
    const matchesSearch = note.clientName
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || note.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Define columns for CommonTable
  const columns: Column<Record<string, unknown>>[] = [
    {
      key: 'clientName',
      label: 'Client Name',
      className: 'px-4 py-4 text-xs sm:text-sm text-gray-600 dark:text-gray-400 font-medium',
      sortable: true,
    },
    {
      key: 'demandDate',
      label: 'Demand Date',
      className: 'px-4 py-4 text-xs sm:text-sm text-gray-600 dark:text-gray-400',
      sortable: true,
      render: (value): React.ReactNode => new Date(value as string).toLocaleDateString('en-US')
    },
    {
      key: 'status',
      label: 'Status',
      className: 'px-4 py-4',
      sortable: true,
      render: (value): React.ReactNode => (
        <StatusBadge status={value as DemandNoteStatus} />
      )
    },
    {
      key: 'lastUpdated',
      label: 'Last Updated',
      className: 'px-4 py-4 text-xs sm:text-sm text-gray-600 dark:text-gray-400',
      sortable: true,
    }
  ];

  // Define actions for CommonTable
  const actions: Action<Record<string, unknown>>[] = [
    {
      label: 'View Details',
      icon: Eye,
      onClick: (row) => router.push(`/demand-notes/${(row as unknown as DemandNote).id}`),
      className: 'text-blue-600 dark:text-blue-400'
    }
  ];

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Demand Notes</h1>
            <p className="text-muted-foreground mt-1">
              Manage and track demand notes for your cases
            </p>
          </div>
          <Button asChild className="bg-primary hover:bg-primary/90">
            <Link href="/demand-notes/new">
              <Plus className="h-4 w-4 mr-2" />
              New Demand Note
            </Link>
          </Button>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by client name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[200px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="initiated">Initiated</SelectItem>
                  <SelectItem value="doc-uploading">Uploading</SelectItem>
                  <SelectItem value="doc-uploaded">Uploaded</SelectItem>
                  <SelectItem value="verified">Verified</SelectItem>
                  <SelectItem value="generated">Generated</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Table */}
        {filteredNotes.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                No demand notes yet
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Get started by creating your first demand note
              </p>
              <Button asChild>
                <Link href="/demand-notes/new">
                  <Plus className="h-4 w-4 mr-2" />
                  Create your first demand note
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <CommonTable
            columns={columns}
            data={filteredNotes as unknown as Record<string, unknown>[]}
            actions={actions}
            emptyMessage="No demand notes found."
          />
        )}
      </div>
    </main>
  );
}
