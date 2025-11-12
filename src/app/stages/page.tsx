'use client';

import { useState, useMemo, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import FilterBar from "@/components/ui/FilterBar";
import ActiveFilters from "@/components/ui/ActiveFilters";
import Pagination from "@/components/ui/pagination";
import CommonTable, { Column } from "@/components/ui/CommonTable";

export default function StagesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [loading] = useState(false);

  const stages = [
    { id: 1, name: 'Initial Review', description: 'Collecting initial documents', created: '2025-11-01', status: 'Active' },
    { id: 2, name: 'Verification', description: 'Checking client details', created: '2025-11-02', status: 'Active' },
    { id: 3, name: 'In Progress', description: 'Case assigned to legal team', created: '2025-11-03', status: 'Ongoing' },
    { id: 4, name: 'Completed', description: 'Case successfully closed', created: '2025-11-04', status: 'Completed' },
  ];

  // Filtered stages based on search and status
  const filteredStages = useMemo(() => {
    return stages.filter((stage) => {
      const matchesSearch = stage.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           stage.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === "all" || stage.status.toLowerCase() === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [stages, searchQuery, statusFilter]);

  // Paginated stages
  const paginatedStages = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredStages.slice(startIndex, endIndex);
  }, [filteredStages, currentPage, itemsPerPage]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter]);

  // Status counts for cards
  const totalCount = stages.length;
  const activeCount = stages.filter((s) => s.status === 'Active').length;
  const ongoingCount = stages.filter((s) => s.status === 'Ongoing').length;
  const completedCount = stages.filter((s) => s.status === 'Completed').length;

  // Active filters for display
  const activeFilters = useMemo(() => {
    const filters = [];
    if (searchQuery) {
      filters.push({
        label: `Search: "${searchQuery}"`,
        onRemove: () => setSearchQuery("")
      });
    }
    if (statusFilter !== "all") {
      const statusLabel = statusFilter === "active" ? "Active" : statusFilter === "ongoing" ? "Ongoing" : "Completed";
      filters.push({
        label: `Status: ${statusLabel}`,
        onRemove: () => setStatusFilter("all")
      });
    }
    return filters;
  }, [searchQuery, statusFilter]);

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Stages</h1>
          <p className="text-muted-foreground mt-1">Manage and track case stages</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-white dark:bg-gray-800">
            <CardHeader>
              <CardTitle>Total Stages</CardTitle>
              <CardDescription>{totalCount} total</CardDescription>
            </CardHeader>
            <CardContent>
              <Badge className="bg-blue-400 text-blue-900">Total</Badge>
            </CardContent>
          </Card>
          <Card className="bg-white dark:bg-gray-800">
            <CardHeader>
              <CardTitle>Active Stages</CardTitle>
              <CardDescription>{activeCount} active</CardDescription>
            </CardHeader>
            <CardContent>
              <Badge className="bg-blue-400 text-blue-900">Active</Badge>
            </CardContent>
          </Card>
          <Card className="bg-white dark:bg-gray-800">
            <CardHeader>
              <CardTitle>Ongoing Stages</CardTitle>
              <CardDescription>{ongoingCount} ongoing</CardDescription>
            </CardHeader>
            <CardContent>
              <Badge className="bg-yellow-300 text-yellow-900">Ongoing</Badge>
            </CardContent>
          </Card>
          <Card className="bg-white dark:bg-gray-800">
            <CardHeader>
              <CardTitle>Completed Stages</CardTitle>
              <CardDescription>{completedCount} completed</CardDescription>
            </CardHeader>
            <CardContent>
              <Badge className="bg-green-400 text-green-900">Completed</Badge>
            </CardContent>
          </Card>
        </div>

        {/* Filters/Search */}
        <Card>
          <CardContent>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <div className="flex-1">
                <FilterBar
                  searchQuery={searchQuery}
                  setSearchQuery={setSearchQuery}
                  searchPlaceholder="Search by stage name or description..."
                  filterValue={statusFilter}
                  setFilterValue={setStatusFilter}
                  filterOptions={[
                    { value: "all", label: "All Status" },
                    { value: "active", label: "Active" },
                    { value: "ongoing", label: "Ongoing" },
                    { value: "completed", label: "Completed" },
                  ]}
                  filterPlaceholder="Filter by status"
                />
              </div>
            </div>
            <div className="mt-3">
              {/* Active Filters */}
              <ActiveFilters filters={activeFilters} />
            </div>

          </CardContent>
        </Card>

        {/* Stages Table */}
        {loading ? (
          <Card>
            <CardContent className="p-6">
              <div className="text-center text-gray-500 py-10">Loading stages...</div>
            </CardContent>
          </Card>
        ) : (
          <StagesTable stages={paginatedStages} />
        )}

        {/* Pagination */}
        <Pagination
          totalItems={filteredStages.length}
          itemsPerPage={itemsPerPage}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
        />

      </div>
    </main>
  );
}

function StagesTable({ stages }: { stages: any[] }) {
  // Define columns for CommonTable
  const columns: Column[] = [
    {
      key: 'name',
      label: 'Stage Name',
      className: 'px-4 py-4 text-xs sm:text-sm text-gray-600 dark:text-gray-400 font-medium'
    },
    {
      key: 'description',
      label: 'Description',
      className: 'px-4 py-4 text-xs sm:text-sm text-gray-600 dark:text-gray-400'
    },
    {
      key: 'created',
      label: 'Created Date',
      className: 'px-4 py-4 text-xs sm:text-sm text-gray-600 dark:text-gray-400'
    },
    {
      key: 'status',
      label: 'Status',
      className: 'px-4 py-4',
     render: (value): React.ReactNode => (
        <Badge
          className={`${
            value === 'Completed'
              ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
              : value === 'Ongoing'
              ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'
              : 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
          }`}
        >
          {value as string}
        </Badge>
      )
    }
  ];

  return (
    <CommonTable
      columns={columns}
      data={stages}
      emptyMessage="No stages found."
    />
  );
}
