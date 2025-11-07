'use client';

import { useState, useMemo, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import FilterBar from "@/components/ui/FilterBar";
import ActiveFilters from "@/components/ui/ActiveFilters";
import Pagination from "@/components/ui/pagination";

export default function StagesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);

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
        <Card className="card-shadow overflow-hidden hidden md:block bg-white dark:bg-gray-800">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50 dark:bg-gray-700 border-b border-border dark:border-gray-600">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground dark:text-white uppercase tracking-wider">Stage Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground dark:text-white uppercase tracking-wider">Description</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground dark:text-white uppercase tracking-wider">Created Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground dark:text-white uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="bg-card dark:bg-gray-800 divide-y divide-border dark:divide-gray-600">
                {paginatedStages.map((stage) => (
                  <tr key={stage.id} className="hover:bg-primary-light/50 dark:hover:bg-gray-700 transition-fast cursor-pointer group">
                    <td className="px-6 py-4 text-sm text-foreground dark:text-gray-300">{stage.name}</td>
                    <td className="px-6 py-4 text-sm text-foreground dark:text-gray-300">{stage.description}</td>
                    <td className="px-6 py-4 text-sm text-foreground dark:text-gray-300">{stage.created}</td>
                    <td className="px-6 py-4">
                      <Badge
                        className={`${
                          stage.status === 'Completed'
                            ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                            : stage.status === 'Ongoing'
                            ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'
                            : 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                        }`}
                      >
                        {stage.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
                {paginatedStages.length === 0 && (
                  <tr>
                    <td colSpan={4} className="text-center py-6 text-gray-500 dark:text-gray-400">
                      No stages found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>

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
