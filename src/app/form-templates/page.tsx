'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { FormTemplate } from '@/types/form';
import { useRouter } from 'next/navigation';
import Pagination from '@/components/ui/pagination';
import FilterBar from '@/components/ui/FilterBar';
import FilterSidebar from '@/components/ui/FilterSidebar';
import ActiveFilters from '@/components/ui/ActiveFilters';
import CommonTable, { Column, Action } from '@/components/ui/CommonTable';

// FormTemplatesTable component using CommonTable
function FormTemplatesTable({ templates, onDelete, router, deletingId }: { templates: FormTemplate[], onDelete: (id: string) => void, router: any, deletingId: string | null }) {
  // Define columns for CommonTable
  const columns: Column[] = [
    {
      key: 'title',
      label: 'Form Title',
      className: 'px-4 py-4 text-xs sm:text-sm text-gray-600 dark:text-gray-400 font-medium'
    },
    {
      key: 'language',
      label: 'Language',
      className: 'px-4 py-4',
      render: (value) => <Badge variant="outline">{value}</Badge>
    },
    {
      key: 'createdBy',
      label: 'Created By',
      className: 'px-4 py-4 text-xs sm:text-sm text-gray-600 dark:text-gray-400',
      render: (value) => value || 'N/A'
    },
    {
      key: 'createdAt',
      label: 'Created At',
      className: 'px-4 py-4 text-xs sm:text-sm text-gray-600 dark:text-gray-400',
      render: (value) => new Date(value).toLocaleDateString()
    }
  ];

  // Define actions for CommonTable
  const actions: Action[] = [
    {
      label: 'Edit',
      icon: Edit,
      onClick: (row) => router.push(`/form-templates/${row.id}/edit`),
      className: 'text-blue-600 dark:text-blue-400'
    },
    {
      label: 'Delete',
      icon: Trash2,
      onClick: (row) => onDelete(row.id),
      disabled: (row) => deletingId === row.id,
      className: 'text-red-600 dark:text-red-400'
    }
  ];

  return (
    <CommonTable
      columns={columns}
      data={templates}
      actions={actions}
      emptyMessage="No form templates found."
    />
  );
}

export default function FormTemplatesPage() {
  const [templates, setTemplates] = useState<FormTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [languageFilter, setLanguageFilter] = useState('all');
  const [dateFromFilter, setDateFromFilter] = useState('');
  const [dateToFilter, setDateToFilter] = useState('');
  const [showFiltersSidebar, setShowFiltersSidebar] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const router = useRouter();

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const response = await fetch('/api/form-templates');
      if (response.ok) {
        const data = await response.json();
        setTemplates(data);
      }
    } catch (error) {
      console.error('Error fetching templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this template?')) return;

    setDeletingId(id);
    try {
      const response = await fetch(`/api/form-templates/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setTemplates(templates.filter(t => t.id !== id));
      } else {
        alert('Failed to delete template');
      }
    } catch (error) {
      console.error('Error deleting template:', error);
      alert('Failed to delete template');
    } finally {
      setDeletingId(null);
    }
  };

  // Get unique languages
  const uniqueLanguages = useMemo(() => {
    const languages = [...new Set(templates.map(t => t.language))].filter(Boolean);
    return languages.sort();
  }, [templates]);

  // Filtered templates
  const filteredTemplates = useMemo(() => {
    return templates.filter((template) => {
      const matchesSearch =
        template.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.language.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesLanguage = languageFilter === 'all' || template.language === languageFilter;

      // Date range filtering
      let matchesDateRange = true;
      if (dateFromFilter || dateToFilter) {
        const templateDate = new Date(template.createdAt);
        if (dateFromFilter) {
          const fromDate = new Date(dateFromFilter);
          matchesDateRange = matchesDateRange && templateDate >= fromDate;
        }
        if (dateToFilter) {
          const toDate = new Date(dateToFilter);
          matchesDateRange = matchesDateRange && templateDate <= toDate;
        }
      }

      return matchesSearch && matchesLanguage && matchesDateRange;
    });
  }, [templates, searchQuery, languageFilter, dateFromFilter, dateToFilter]);

  // Paginated templates
  const paginatedTemplates = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredTemplates.slice(startIndex, endIndex);
  }, [filteredTemplates, currentPage, itemsPerPage]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, languageFilter, dateFromFilter, dateToFilter]);

  // Reset filters function
  const resetFilters = () => {
    setLanguageFilter('all');
    setDateFromFilter('');
    setDateToFilter('');
  };

  // Total templates count
  const totalTemplates = templates.length;

  // Active filters
  const activeFilters = useMemo(() => {
    const filters = [];
    if (searchQuery) {
      filters.push({
        label: `Search: "${searchQuery}"`,
        onRemove: () => setSearchQuery('')
      });
    }
    if (languageFilter !== 'all') {
      filters.push({
        label: `Language: ${languageFilter}`,
        onRemove: () => setLanguageFilter('all')
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
  }, [searchQuery, languageFilter, dateFromFilter, dateToFilter]);

  // Loading state removed - now handled inline with table

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Form Templates</h1>
          <p className="text-muted-foreground mt-1">Manage and create form templates</p>
        </div>

        {/* Summary Card */}
        <div className="grid grid-cols-1 md:grid-cols-1 gap-4 max-w-md">
          <Card className="bg-white dark:bg-gray-800">
            <CardHeader>
              <CardTitle>Total Templates</CardTitle>
              <CardDescription>{totalTemplates} templates</CardDescription>
            </CardHeader>
            <CardContent>
              <Badge className="bg-blue-400 text-primary">Templates</Badge>
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
                  searchPlaceholder="Search by template title or language..."
                  filterValue={languageFilter}
                  setFilterValue={setLanguageFilter}
                  filterOptions={[
                    { value: 'all', label: 'All Languages' },
                    ...uniqueLanguages.map((lang) => ({ value: lang || '', label: lang || '' })),
                  ]}
                  filterPlaceholder="Filter by language"
                  onMoreFilters={() => setShowFiltersSidebar(true)}
                />
              </div>
              <Button onClick={() => router.push('/form-templates/new')}>
                <Plus className="w-4 h-4 mr-2" />
                New Template
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Active Filters */}
        <ActiveFilters filters={activeFilters} />

        {/* Templates Table */}
        {loading ? (
          <Card>
            <CardContent className="p-6">
              <div className="text-center text-gray-500 py-10">Loading form templates...</div>
            </CardContent>
          </Card>
        ) : (
          <FormTemplatesTable
            templates={paginatedTemplates}
            onDelete={handleDelete}
            router={router}
            deletingId={deletingId}
          />
        )}

        {/* Pagination */}
        <Pagination
          totalItems={filteredTemplates.length}
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
    </main>
  );
}
