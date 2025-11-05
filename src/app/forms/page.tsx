'use client';

import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Filter, Loader2 } from 'lucide-react';
import PrepareFormModal from '@/components/forms/PrepareFormModal';
import NewIntakeModal from '@/components/NewIntakeModal';
import { FormSubmission } from '@/types/form';

export default function FormsPage() {
  const [submissions, setSubmissions] = useState<FormSubmission[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showIntakeModal, setShowIntakeModal] = useState(false);

  useEffect(() => {
    fetchSubmissions();
    fetchTemplates();
  }, []);

  useEffect(() => {
    fetchSubmissions(statusFilter);
  }, [statusFilter]);

  const fetchSubmissions = async (status?: string) => {
    try {
      const url = status && status !== 'all' ? `/api/forms?status=${encodeURIComponent(status)}` : '/api/forms';
      const response = await fetch(url);
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

  const filteredSubmissions = submissions.filter(submission => {
    const matchesSearch = submission.template.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (submission.user?.firstName + ' ' + submission.user?.lastName).toLowerCase().includes(searchTerm.toLowerCase()) ||
                         submission.matter?.title.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const pendingSubmissions = filteredSubmissions.filter(s => s.status === 'Pending');
  const submittedSubmissions = filteredSubmissions.filter(s => s.status === 'Submitted');
  const draftSubmissions = filteredSubmissions.filter(s => s.status === 'Draft');

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Case Intake Management</h1>
          <p>Manage and review all case intakes</p>
        </div>
        {/* <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Prepare Form
        </Button> */}
        <button
          onClick={() => setShowIntakeModal(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          <Plus size={16} />
          New Intake
        </button>
      </div>

      <div className="flex gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search forms, contacts, matters..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="Pending">Pending</SelectItem>
            <SelectItem value="Submitted">Submitted</SelectItem>
            <SelectItem value="Draft">Draft</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Tabs defaultValue="pending" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="pending">Pending ({pendingSubmissions.length})</TabsTrigger>
          <TabsTrigger value="submitted">Submitted ({submittedSubmissions.length})</TabsTrigger>
          <TabsTrigger value="draft">Draft ({draftSubmissions.length})</TabsTrigger>
          <TabsTrigger value="templates">Templates ({templates.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="pending">
          <FormsTable submissions={pendingSubmissions} />
        </TabsContent>

        <TabsContent value="submitted">
          <FormsTable submissions={submittedSubmissions} />
        </TabsContent>

        <TabsContent value="draft">
          <FormsTable submissions={draftSubmissions} showEditButton={true} />
        </TabsContent>

        <TabsContent value="templates">
          <TemplatesTable templates={templates} />
        </TabsContent>
      </Tabs>

      <PrepareFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={fetchSubmissions}
        templates={templates}
      />

      {showIntakeModal && <NewIntakeModal onClose={() => setShowIntakeModal(false)} />}
    </div>
  );
}

function FormsTable({ submissions, showEditButton = false }: { submissions: FormSubmission[]; showEditButton?: boolean }) {
  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Due</TableHead>
            <TableHead>Form</TableHead>
            <TableHead>Contact</TableHead>
            <TableHead>Matter</TableHead>
            <TableHead>Status</TableHead>
            {showEditButton && <TableHead>Actions</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {submissions.map((submission) => (
            <TableRow key={submission.id}>
              <TableCell>{new Date(submission.createdAt).toLocaleDateString()}</TableCell>
              <TableCell>{submission.template.title}</TableCell>
              <TableCell>
                {submission.user ? `${submission.user.firstName} ${submission.user.lastName}` : 'N/A'}
              </TableCell>
              <TableCell>{submission.matter?.title || 'N/A'}</TableCell>
              <TableCell>
                <Badge variant={submission.status === 'Pending' || submission.status === 'Draft' ? 'secondary' : 'default'}>
                  {submission.status}
                </Badge>
              </TableCell>
              {showEditButton && (
                <TableCell>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.location.href = `/forms/${submission.id}/fill`}
                  >
                    Edit
                  </Button>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
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
