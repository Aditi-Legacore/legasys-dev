'use client';

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Search, FileText } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import DocumentsTable from "@/components/table/DocumentsTable";



export default function DocumentsPage() {
  // Static document data for now
  const [documents, setDocuments] = useState([
    {
      id: "DOC-001",
      clientName: "John Smith",
      caseType: "Personal Injury",
      status: "New Intake",
      documentStatus: "submitted",
      createdDate: "2024-01-15 10:30 AM",
      files: ["intake-form.pdf", "medical-records.pdf"]
    },
    {
      id: "DOC-002",
      clientName: "Sarah Johnson",
      caseType: "Auto Accident",
      status: "Hired",
      documentStatus: "submitted",
      createdDate: "2024-01-14 02:15 PM",
      files: ["accident-report.pdf", "insurance-claim.pdf"]
    },
    {
      id: "DOC-003",
      clientName: "Michael Chen",
      caseType: "Workers Comp",
      status: "New Intake",
      documentStatus: "pending",
      createdDate: "2024-01-13 09:45 AM",
      files: []
    },
  ]);

  // Calculate stats for cards
  const submittedCount = documents.filter(d => d.documentStatus === "submitted").length;
  const pendingCount = documents.filter(d => d.documentStatus === "pending").length;

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Documents</h1>
          <p className="text-muted-foreground mt-1">Manage client documents and files</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Documents Submitted</CardTitle>
              <CardDescription>{submittedCount} submitted</CardDescription>
            </CardHeader>
            <CardContent>
              <FileText className="h-8 w-8 text-primary" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Documents Pending</CardTitle>
              <CardDescription>{pendingCount} pending</CardDescription>
            </CardHeader>
            <CardContent>
              <FileText className="h-8 w-8 text-warning" />
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <Card>
          <CardContent className="flex gap-4 flex-col md:flex-row">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search by name or document ID..."
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Table */}
        <DocumentsTable documents={documents} />
      </div>
    </main>
  );
}
