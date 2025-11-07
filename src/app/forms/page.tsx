'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus } from 'lucide-react';
import PrepareFormModal from '@/components/forms/PrepareFormModal';
import NewIntakeModal from '@/components/NewIntakeModal';
import { FormSubmission } from '@/types/form';
import Pagination from '@/components/ui/pagination';
import FilterBar from '@/components/ui/FilterBar';
import FilterSidebar from '@/components/ui/FilterSidebar';
import ActiveFilters from '@/components/ui/ActiveFilters';

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

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

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
        <FormsTable submissions={paginatedSubmissions} />

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
  return (
    <Card className="card-shadow overflow-hidden hidden md:block bg-white dark:bg-gray-800">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted/50 dark:bg-gray-700 border-b border-border dark:border-gray-600">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground dark:text-white uppercase tracking-wider">Due</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground dark:text-white uppercase tracking-wider">Form</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground dark:text-white uppercase tracking-wider">Contact</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground dark:text-white uppercase tracking-wider">Matter</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground dark:text-white uppercase tracking-wider">Status</th>
              {showEditButton && <th className="px-6 py-3 text-center text-xs font-medium text-muted-foreground dark:text-white uppercase tracking-wider">Actions</th>}
            </tr>
          </thead>
          <tbody className="bg-card dark:bg-gray-800 divide-y divide-border dark:divide-gray-600">
            {submissions.map((submission) => (
              <tr key={submission.id} className="hover:bg-primary-light/50 dark:hover:bg-gray-700 transition-fast cursor-pointer group">
                <td className="px-6 py-4 text-sm text-foreground dark:text-gray-300">{new Date(submission.createdAt).toLocaleDateString()}</td>
                <td className="px-6 py-4 text-sm text-foreground dark:text-gray-300">{submission.template.title}</td>
                <td className="px-6 py-4 text-sm text-foreground dark:text-gray-300">
                  {submission.user ? `${submission.user.firstName} ${submission.user.lastName}` : 'N/A'}
                </td>
                <td className="px-6 py-4 text-sm text-foreground dark:text-gray-300">{submission.matter?.title || 'N/A'}</td>
                <td className="px-6 py-4">
                  <Badge variant={submission.status === 'Pending' || submission.status === 'Draft' ? 'secondary' : 'default'}>
                    {submission.status}
                  </Badge>
                </td>
                {showEditButton && (
                  <td className="px-6 py-4 text-center">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.location.href = `/forms/${submission.id}/fill`}
                    >
                      Edit
                    </Button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

function TemplatesTable({ templates }: { templates: any[] }) {
  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Form Title</TableHead>
            <TableHead>Language</TableHead>
            <TableHead>Created By</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {templates.map((template) => (
            <TableRow key={template.id}>
              <TableCell>{template.title}</TableCell>
              <TableCell>{template.language}</TableCell>
              <TableCell>{template.createdBy || 'N/A'}</TableCell>
              <TableCell>
                <Button variant="outline" size="sm">Edit</Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
