'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus } from 'lucide-react';
import PrepareFormModal from '@/components/forms/PrepareFormModal';
import NewIntakeModal from '@/components/NewIntakeModal';
import { FormSubmission } from '@/types/form';
import Pagination from '@/components/ui/pagination';
import FilterBar from '@/components/ui/FilterBar';
import FilterSidebar from '@/components/ui/FilterSidebar';
import ActiveFilters from '@/components/ui/ActiveFilters';
import CommonTable, { Column, Action } from '@/components/ui/CommonTable';

export default function FormsPage() {
  const [submissions, setSubmissions] = useState<FormSubmission[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFromFilter, setDateFromFilter] = useState('');
  const [dateToFilter, setDateToFilter] = useState('');
  const [showFiltersSidebar, setShowFiltersSidebar] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showIntakeModal, setShowIntakeModal] = useState(false);

  useEffect(() => {
    fetchSubmissions();
    fetchTemplates();
  }, []);

  const fetchSubmissions = async () => {
    try {
      const response = await fetch('/api/forms');
      if (response.ok) {
        const data = await response.json();
        setSubmissions(data);
      }
    } catch (error) {
      console.error('Error fetching submissions:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTemplates = async () => {
    try {
      const response = await fetch('/api/form-templates');
      if (response.ok) {
        const data = await response.json();
        setTemplates(data);
      }
    } catch (error) {
      console.error('Error fetching templates:', error);
    }
  };



  // Filtered submissions
  const filteredSubmissions = useMemo(() => {
    return submissions.filter((submission) => {
      const matchesSearch =
        submission.template.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (submission.user?.firstName + ' ' + submission.user?.lastName).toLowerCase().includes(searchQuery.toLowerCase()) ||
        submission.matter?.title.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = statusFilter === 'all' || submission.status === statusFilter;
      const matchesCaseType = true; // Temporarily disable case type filter

      // Date range filtering
      let matchesDateRange = true;
      if (dateFromFilter || dateToFilter) {
        const submissionDate = new Date(submission.createdAt);
        if (dateFromFilter) {
          const fromDate = new Date(dateFromFilter);
          matchesDateRange = matchesDateRange && submissionDate >= fromDate;
        }
        if (dateToFilter) {
          const toDate = new Date(dateToFilter);
          matchesDateRange = matchesDateRange && submissionDate <= toDate;
        }
      }

      return matchesSearch && matchesStatus && matchesCaseType && matchesDateRange;
    });
  }, [submissions, searchQuery, statusFilter, dateFromFilter, dateToFilter]);

  // Paginated submissions
  const paginatedSubmissions = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredSubmissions.slice(startIndex, endIndex);
  }, [filteredSubmissions, currentPage, itemsPerPage]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, dateFromFilter, dateToFilter]);

  // Reset filters function
  const resetFilters = () => {
    setDateFromFilter('');
    setDateToFilter('');
  };

  // Status counts
  const pendingCount = submissions.filter(s => s.status === 'Pending').length;
  const submittedCount = submissions.filter(s => s.status === 'Submitted').length;
  const draftCount = submissions.filter(s => s.status === 'Draft').length;

  // Active filters
  const activeFilters = useMemo(() => {
    const filters = [];
    if (searchQuery) {
      filters.push({
        label: `Search: "${searchQuery}"`,
        onRemove: () => setSearchQuery('')
      });
    }
    if (statusFilter !== 'all') {
      filters.push({
        label: `Status: ${statusFilter}`,
        onRemove: () => setStatusFilter('all')
      });
    }

    if (dateFromFilter) {
      filters.push({
        label: `From: ${dateFromFilter}`,
        onRemove: () => setDateFromFilter('')
      });
    }
    if (dateToFilter) {
      filters.push({
        label: `To: ${dateToFilter}`,
        onRemove: () => setDateToFilter('')
      });
    }
    return filters;
  }, [searchQuery, statusFilter, dateFromFilter, dateToFilter]);

  // Loading state removed - now handled inline with table

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Forms</h1>
          <p className="text-muted-foreground mt-1">Manage and review all form submissions</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-white dark:bg-gray-800">
            <CardHeader>
              <CardTitle>Pending Forms</CardTitle>
              <CardDescription>{pendingCount} pending</CardDescription>
            </CardHeader>
            <CardContent>
              <Badge className="bg-yellow-300 text-warning">Pending</Badge>
            </CardContent>
          </Card>
          <Card className="bg-white dark:bg-gray-800">
            <CardHeader>
              <CardTitle>Submitted Forms</CardTitle>
              <CardDescription>{submittedCount} submitted</CardDescription>
            </CardHeader>
            <CardContent>
              <Badge className="bg-green-400 text-success">Submitted</Badge>
            </CardContent>
          </Card>
          <Card className="bg-white dark:bg-gray-800">
            <CardHeader>
              <CardTitle>Draft Forms</CardTitle>
              <CardDescription>{draftCount} drafts</CardDescription>
            </CardHeader>
            <CardContent>
              <Badge className="bg-gray-400 text-muted-foreground">Draft</Badge>
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
                  searchPlaceholder="Search by form title, contact, or matter..."
                  filterValue={statusFilter}
                  setFilterValue={setStatusFilter}
                  filterOptions={[
                    { value: 'all', label: 'All Status' },
                    { value: 'Pending', label: 'Pending' },
                    { value: 'Submitted', label: 'Submitted' },
                    { value: 'Draft', label: 'Draft' },
                  ]}
                  filterPlaceholder="Filter by status"
                  onMoreFilters={() => setShowFiltersSidebar(true)}
                />
              </div>
              <button
                onClick={() => setShowIntakeModal(true)}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                <Plus size={16} />
                New Intake
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Active Filters */}
        <ActiveFilters filters={activeFilters} />

        {/* Forms Table */}
        {loading ? (
          <Card>
            <CardContent className="p-6">
              <div className="text-center text-gray-500 py-10">Loading forms...</div>
            </CardContent>
          </Card>
        ) : (
          <FormsTable submissions={paginatedSubmissions} />
        )}

        {/* Pagination */}
        <Pagination
          totalItems={filteredSubmissions.length}
          itemsPerPage={itemsPerPage}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
        />

        <FilterSidebar
          isOpen={showFiltersSidebar}
          onClose={() => setShowFiltersSidebar(false)}
          dateFromFilter={dateFromFilter}
          setDateFromFilter={setDateFromFilter}
          dateToFilter={dateToFilter}
          setDateToFilter={setDateToFilter}
          onResetFilters={resetFilters}
        />

      </div>

      <PrepareFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={fetchSubmissions}
        templates={templates}
      />

      {showIntakeModal && <NewIntakeModal onClose={() => setShowIntakeModal(false)} />}
    </main>
  );
}

function FormsTable({ submissions, showEditButton = false }: { submissions: FormSubmission[]; showEditButton?: boolean }) {
  // Define columns for CommonTable
  const columns: Column[] = [
    {
      key: 'createdAt',
      label: 'Due',
      className: 'px-4 py-4 text-xs sm:text-sm text-gray-600 dark:text-gray-400',
      render: (value) => new Date(value).toLocaleDateString()
    },
    {
      key: 'template',
      label: 'Form',
      className: 'px-4 py-4 text-xs sm:text-sm text-gray-600 dark:text-gray-400 font-medium',
      render: (value) => value.title
    },
    {
      key: 'user',
      label: 'Contact',
      className: 'px-4 py-4 text-xs sm:text-sm text-gray-600 dark:text-gray-400',
      render: (value) => value ? `${value.firstName} ${value.lastName}` : 'N/A'
    },
    {
      key: 'matter',
      label: 'Matter',
      className: 'px-4 py-4 text-xs sm:text-sm text-gray-600 dark:text-gray-400',
      render: (value) => value?.title || 'N/A'
    },
    {
      key: 'status',
      label: 'Status',
      className: 'px-4 py-4',
      render: (value: string) => (
        <Badge variant={value === 'Pending' || value === 'Draft' ? 'secondary' : 'default'}>
          {value}
        </Badge>
      )
    }
  ];

  // Define actions for CommonTable
  const actions: Action[] = [];
  if (showEditButton) {
    actions.push({
      label: 'Edit',
      onClick: (row) => window.location.href = `/forms/${row.id}/fill`,
      className: 'text-blue-600 dark:text-blue-400'
    });
  }

  return (
    <CommonTable
      columns={columns}
      data={submissions}
      actions={actions}
      emptyMessage="No form submissions found."
    />
  );
}


