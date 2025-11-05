'use client';

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Search, FileText } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import DocumentsTable from "@/components/table/DocumentsTable";
import FilterBar from "@/components/ui/FilterBar";

interface DocumentType {
  id: string;
  clientName: string;
  caseType: string;
  status: string;
  documentStatus: string;
  createdDate: string;
  files: string[];
}

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<DocumentType[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterValue, setFilterValue] = useState("all");

  useEffect(() => {
    async function fetchDocuments() {
      try {
        const res = await fetch("/api/documents");
        const data = await res.json();
        if (Array.isArray(data)) {
          setDocuments(data);
        }
      } catch (err) {
        console.error("Error fetching documents:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchDocuments();
  }, []);

  const submittedCount = documents.filter(d => d.documentStatus === "submitted").length;
  const pendingCount = documents.filter(d => d.documentStatus === "pending").length;

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
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

        <Card>
          <CardContent>
            <FilterBar
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              searchPlaceholder="Search by name or document ID..."
              filterValue={filterValue}
              setFilterValue={setFilterValue}
              filterOptions={[
                { value: "all", label: "All Documents" },
                { value: "submitted", label: "Submitted" },
                { value: "pending", label: "Pending" },
              ]}
              filterPlaceholder="Filter by status"
            />
          </CardContent>
        </Card>

        {loading ? (
          <div className="text-center text-gray-500 py-10">Loading...</div>
        ) : (
          <DocumentsTable documents={documents} />
        )}
      </div>
    </main>
  );
}
