'use client';

// import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Search, FileText } from "lucide-react";
import { useEffect, useState, useMemo } from "react";
// import { FileText } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import DocumentsTable from "@/components/table/DocumentsTable";
import FilterBar from "@/components/ui/FilterBar";
import FilterSidebar from "@/components/ui/FilterSidebar";
import ActiveFilters from "@/components/ui/ActiveFilters";

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
  const [caseTypeFilter, setCaseTypeFilter] = useState("all");
  const [dateFromFilter, setDateFromFilter] = useState("");
  const [dateToFilter, setDateToFilter] = useState("");
  const [showFiltersSidebar, setShowFiltersSidebar] = useState(false);

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

  // Get unique case types for filter options
  const uniqueCaseTypes = useMemo(() => {
    const caseTypes = [...new Set(documents.map(doc => doc.caseType))].filter(Boolean);
    return caseTypes.sort();
  }, [documents]);

  // Filtered documents based on search and filters
  const filteredDocuments = useMemo(() => {
    return documents.filter((doc) => {
      const matchesSearch =
        doc.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.caseType.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = filterValue === "all" || doc.documentStatus === filterValue;
      const matchesCaseType = caseTypeFilter === "all" || doc.caseType === caseTypeFilter;

      // Date range filtering
      let matchesDateRange = true;
      if (dateFromFilter || dateToFilter) {
        const docDate = new Date(doc.createdDate);
        if (dateFromFilter) {
          const fromDate = new Date(dateFromFilter);
          matchesDateRange = matchesDateRange && docDate >= fromDate;
        }
        if (dateToFilter) {
          const toDate = new Date(dateToFilter);
          matchesDateRange = matchesDateRange && docDate <= toDate;
        }
      }

      return matchesSearch && matchesStatus && matchesCaseType && matchesDateRange;
    });
  }, [documents, searchQuery, filterValue, caseTypeFilter, dateFromFilter, dateToFilter]);

  // Reset filters function
  const resetFilters = () => {
    setCaseTypeFilter("all");
    setDateFromFilter("");
    setDateToFilter("");
  };

  const submittedCount = documents.filter(d => d.documentStatus === "submitted").length;
  const pendingCount = documents.filter(d => d.documentStatus === "pending").length;

  // Active filters for display
  const activeFilters = useMemo(() => {
    const filters = [];
    if (searchQuery) {
      filters.push({
        label: `Search: "${searchQuery}"`,
        onRemove: () => setSearchQuery("")
      });
    }
    if (filterValue !== "all") {
      const statusLabel = filterValue === "submitted" ? "Submitted" : "Pending";
      filters.push({
        label: `Status: ${statusLabel}`,
        onRemove: () => setFilterValue("all")
      });
    }
    if (caseTypeFilter !== "all") {
      filters.push({
        label: `Case Type: ${caseTypeFilter}`,
        onRemove: () => setCaseTypeFilter("all")
      });
    }
    if (dateFromFilter) {
      filters.push({
        label: `From: ${dateFromFilter}`,
        onRemove: () => setDateFromFilter("")
      });
    }
    if (dateToFilter) {
      filters.push({
        label: `To: ${dateToFilter}`,
        onRemove: () => setDateToFilter("")
      });
    }
    return filters;
  }, [searchQuery, filterValue, caseTypeFilter, dateFromFilter, dateToFilter]);

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
              onMoreFilters={() => setShowFiltersSidebar(true)}
            />
          </CardContent>
        </Card>

        {/* Active Filters */}
        <ActiveFilters filters={activeFilters} />

        {loading ? (
          <div className="text-center text-gray-500 py-10">Loading...</div>
        ) : (
          <DocumentsTable documents={filteredDocuments} />
        )}

        <FilterSidebar
          isOpen={showFiltersSidebar}
          onClose={() => setShowFiltersSidebar(false)}
          caseTypeFilter={caseTypeFilter}
          setCaseTypeFilter={setCaseTypeFilter}
          caseTypeOptions={[
            { value: "all", label: "All Case Types" },
            ...uniqueCaseTypes.map((caseType) => ({ value: caseType || "", label: caseType || "" })),
          ]}
          dateFromFilter={dateFromFilter}
          setDateFromFilter={setDateFromFilter}
          dateToFilter={dateToFilter}
          setDateToFilter={setDateToFilter}
          referralSourceFilter=""
          setReferralSourceFilter={() => {}}
          referralSourceOptions={[]}
          onResetFilters={resetFilters}
          showReferralSource={false}
        />
      </div>
    </main>
  );
}
