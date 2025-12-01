'use client';

import { useState, useEffect } from "react";
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
import { useSession } from "next-auth/react";

interface DemandNote {
  id: string;
  client: { name: string };
  dueDate: string;
  status: DemandNoteStatus;
  updatedAt: string;
}

export default function DemandNotes() {
  const router = useRouter();
  const { data: session, status: sessionStatus } = useSession();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [demandNotes, setDemandNotes] = useState<DemandNote[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (sessionStatus === 'loading') return;

    if (!session) {
      setError('Please log in to view demand notes');
      setIsLoading(false);
      return;
    }

    const fetchDemandNotes = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await fetch('/api/demand-notes');
        if (!response.ok) {
          if (response.status === 401) {
            throw new Error('Authentication required. Please log in again.');
          }
          throw new Error('Failed to fetch demand notes');
        }
        const data = await response.json();
        setDemandNotes(data);
      } catch (err) {
        console.error('Error fetching demand notes:', err);
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDemandNotes();
  }, [session, sessionStatus]);

  const filteredNotes = demandNotes.filter((note) => {
    const matchesSearch = note.client.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || note.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Define columns for CommonTable
  const columns: Column<Record<string, unknown>>[] = [
    {
      key: 'client.name',
      label: 'Client Name',
      className: 'px-4 py-4 text-xs sm:text-sm text-gray-600 dark:text-gray-400 font-medium',
      sortable: true,
      render: (value, row): React.ReactNode => (row as unknown as DemandNote).client.name
    },
    {
      key: 'dueDate',
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
      key: 'updatedAt',
      label: 'Last Updated',
      className: 'px-4 py-4 text-xs sm:text-sm text-gray-600 dark:text-gray-400',
      sortable: true,
      render: (value): React.ReactNode => new Date(value as string).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
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

        {/* Loading State */}
        {isLoading && (
          <Card>
            <CardContent className="p-12 text-center">
              <Loader2 className="h-12 w-12 animate-spin text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Loading demand notes...
              </h3>
            </CardContent>
          </Card>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <Card>
            <CardContent className="p-12 text-center">
              <FileText className="h-12 w-12 text-destructive mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Error loading demand notes
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                {error}
              </p>
              <Button onClick={() => window.location.reload()}>
                Try Again
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Table */}
        {!isLoading && !error && filteredNotes.length === 0 ? (
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
