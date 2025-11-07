'use client';

import { useState, useMemo, useEffect } from "react";
import TabsNav from "@/components/TabsNav";
import ReportTable from "@/components/table/ReportTable";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import FilterBar from "@/components/ui/FilterBar";
import FilterSidebar from "@/components/ui/FilterSidebar";
import { Loader2 } from "lucide-react";
import { utils, writeFile } from 'xlsx';

interface IntakeData {
  id: string;
  clientName: string;
  isDraft: boolean;
  createdAt: string;
  Lead?: { caseType: string };
}

interface LeadData {
  id: string;
  name: string;
  status: string;
  caseType: string;
  createdAt: string;
  referralSource: string;
}

interface DocumentData {
  id: string;
  clientName: string;
  caseType: string;
  status: string;
  documentStatus: string;
  createdDate: string;
}

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState<"intakes" | "leads" | "documents">("intakes");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterValue, setFilterValue] = useState("all");
  const [showFiltersSidebar, setShowFiltersSidebar] = useState(false);
  const [dateFromFilter, setDateFromFilter] = useState("");
  const [dateToFilter, setDateToFilter] = useState("");
  const [caseTypeFilter, setCaseTypeFilter] = useState("");
  const [referralSourceFilter, setReferralSourceFilter] = useState("");

  // Data states
  const [intakesData, setIntakesData] = useState<IntakeData[]>([]);
  const [leadsData, setLeadsData] = useState<LeadData[]>([]);
  const [documentsData, setDocumentsData] = useState<DocumentData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch data based on active tab
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        let endpoint = "";
        if (activeTab === "intakes") endpoint = "/api/intake";
        else if (activeTab === "leads") endpoint = "/api/leads";
        else if (activeTab === "documents") endpoint = "/api/documents";

        const response = await fetch(endpoint);
        if (!response.ok) throw new Error(`Failed to fetch ${activeTab} data`);
        const data = await response.json();

        if (activeTab === "intakes") setIntakesData(data);
        else if (activeTab === "leads") setLeadsData(data);
        else if (activeTab === "documents") setDocumentsData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [activeTab]);

  // Aggregate data for reports
  const aggregatedData = useMemo(() => {
    if (activeTab === "intakes") {
      const total = intakesData.length;
      const completed = intakesData.filter(i => !i.isDraft).length;
      const drafts = intakesData.filter(i => i.isDraft).length;
      const caseTypes = intakesData.reduce((acc, i) => {
        const type = i.Lead?.caseType || "N/A";
        acc[type] = (acc[type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      return [
        { name: "Total Intakes", count: total, status: "All" },
        { name: "Completed Intakes", count: completed, status: "Completed" },
        { name: "Draft Intakes", count: drafts, status: "Draft" },
        ...Object.entries(caseTypes).map(([type, count]) => ({
          name: `${type} Cases`,
          count: count,
          status: "By Case Type"
        }))
      ];
    } else if (activeTab === "leads") {
      const total = leadsData.length;
      const newLeads = leadsData.filter(l => l.status === "new").length;
      const completed = leadsData.filter(l => l.status === "completed").length;
      const inProgress = leadsData.filter(l => l.status === "in_progress").length;
      const caseTypes = leadsData.reduce((acc, l) => {
        acc[l.caseType] = (acc[l.caseType] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      return [
        { name: "Total Leads", count: total, status: "All" },
        { name: "New Leads", count: newLeads, status: "New" },
        { name: "Completed Leads", count: completed, status: "Completed" },
        { name: "In Progress Leads", count: inProgress, status: "In Progress" },
        ...Object.entries(caseTypes).map(([type, count]) => ({
          name: `${type} Cases`,
          count: count,
          status: "By Case Type"
        }))
      ];
    } else if (activeTab === "documents") {
      const total = documentsData.length;
      const submitted = documentsData.filter(d => d.documentStatus === "submitted").length;
      const pending = documentsData.filter(d => d.documentStatus === "pending").length;
      const caseTypes = documentsData.reduce((acc, d) => {
        acc[d.caseType] = (acc[d.caseType] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      return [
        { name: "Total Documents", count: total, status: "All" },
        { name: "Submitted Documents", count: submitted, status: "Submitted" },
        { name: "Pending Documents", count: pending, status: "Pending" },
        ...Object.entries(caseTypes).map(([type, count]) => ({
          name: `${type} Cases`,
          count: count,
          status: "By Case Type"
        }))
      ];
    }
    return [];
  }, [activeTab, intakesData, leadsData, documentsData]);

  // Filtered data
  const filteredData = useMemo(() => {
    let data = aggregatedData;

    // Search filter
    if (searchQuery) {
      data = data.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Status filter
    if (filterValue !== "all") {
      if (filterValue === "today") {
        // For now, just show all - could implement date filtering later
      } else if (filterValue === "week") {
        // Implement week filter
      } else if (filterValue === "month") {
        // Implement month filter
      } else {
        data = data.filter(item => item.status.toLowerCase() === filterValue.toLowerCase());
      }
    }

    // Date range filter
    if (dateFromFilter || dateToFilter) {
      // Since aggregated data doesn't have dates, this might not apply directly
      // Could be used for raw data filtering if we switch to detailed view
    }

    // Case type filter (for aggregated data, filter by name containing case type)
    if (caseTypeFilter && caseTypeFilter !== "all") {
      data = data.filter(item =>
        item.name.toLowerCase().includes(caseTypeFilter.toLowerCase())
      );
    }

    return data;
  }, [aggregatedData, searchQuery, filterValue, dateFromFilter, dateToFilter, caseTypeFilter]);

  // Dynamic columns based on tab
  const reportColumns = {
    intakes: ["Name", "Count", "Status"],
    leads: ["Name", "Count", "Status"],
    documents: ["Name", "Count", "Status"],
  };

  // Filter options for FilterBar
  const filterOptions = [
    { value: "all", label: "All" },
    { value: "completed", label: "Completed" },
    { value: "new", label: "New" },
    { value: "pending", label: "Pending" },
    { value: "draft", label: "Draft" },
  ];

  // Case type options for sidebar
  const caseTypeOptions = useMemo(() => {
    const types = new Set<string>();
    if (activeTab === "intakes") {
      intakesData.forEach(i => types.add(i.Lead?.caseType || "N/A"));
    } else if (activeTab === "leads") {
      leadsData.forEach(l => types.add(l.caseType));
    } else if (activeTab === "documents") {
      documentsData.forEach(d => types.add(d.caseType));
    }
    return [{ value: "all", label: "All Case Types" }, ...Array.from(types).map(type => ({ value: type, label: type }))];
  }, [activeTab, intakesData, leadsData, documentsData]);

  // Referral source options (only for leads)
  const referralSourceOptions = useMemo(() => {
    if (activeTab !== "leads") return [];
    const sources = new Set<string>();
    leadsData.forEach(l => sources.add(l.referralSource));
    return [{ value: "all", label: "All Sources" }, ...Array.from(sources).map(source => ({ value: source, label: source }))];
  }, [activeTab, leadsData]);

  // const handleExport = () => {
  //   alert(`Exporting ${activeTab} data...`);
  // };

   // ... your existing code above ...
  
  // added in 06-11-2025
const handleExport = (format: 'csv' | 'excel' | 'json' = 'csv') => {
  try {
    // Use the filtered aggregated data that's displayed in the table
    const dataToExport = filteredData;
    let filename = `${activeTab}_report`;

    if (dataToExport.length === 0) {
      alert('No data to export with current filters.');
      return;
    }

    // Export in chosen format
    switch (format) {
      case 'csv':
        exportToCSV(dataToExport, filename);
        break;
      case 'excel':
        exportToExcel(dataToExport, filename);
        break;
      case 'json':
        exportToJSON(dataToExport, filename);
        break;
    }

  } catch (error) {
    console.error('Export failed:', error);
    alert('Export failed. Please try again.');
  }
};

// Enhanced CSV Export function
const exportToCSV = (data: any[], filename: string) => {
  const headers = ['Report Item', 'Count', 'Status'];
  
  const csvHeaders = headers.join(',');
  const csvRows = data.map(item => {
    const row = [
      `"${String(item.name).replace(/"/g, '""')}"`,
      item.count.toString(),
      `"${String(item.status).replace(/"/g, '""')}"`
    ];
    return row.join(',');
  });

  const csvContent = [csvHeaders, ...csvRows].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  downloadBlob(blob, `${filename}_${getFormattedDate()}.csv`);
};

// Enhanced Excel Export with Better Formatting
const exportToExcel = (data: any[], filename: string) => {
  // Prepare the data for Excel
  const excelData = data.map(item => ({
    'Report Item': item.name,
    'Count': item.count,
    'Status': item.status
  }));

  // Create worksheet from data
  const worksheet = utils.json_to_sheet(excelData);
  
  // Create workbook
  const workbook = utils.book_new();
  
  // Add title row
  const title = `${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Report - ${new Date().toLocaleDateString()}`;
  utils.sheet_add_aoa(worksheet, [[title]], { origin: 'A1' });
  utils.sheet_add_aoa(worksheet, [[]], { origin: 'A2' }); // Empty row
  utils.sheet_add_json(worksheet, excelData, { origin: 'A3', skipHeader: false });

  // Merge title cells
  if (!worksheet['!merges']) worksheet['!merges'] = [];
  worksheet['!merges'].push({ s: { r: 0, c: 0 }, e: { r: 0, c: 2 } });

  // Set column widths
  worksheet['!cols'] = [
    { wch: 40 }, // Report Item
    { wch: 15 }, // Count
    { wch: 25 }  // Status
  ];

  // Apply styles
  const titleCell = worksheet['A1'];
  if (titleCell) {
    titleCell.s = {
      font: { bold: true, sz: 14 },
      alignment: { horizontal: 'center' }
    };
  }

  // Style header row (row 3)
  ['A3', 'B3', 'C3'].forEach(cell => {
    if (worksheet[cell]) {
      worksheet[cell].s = {
        font: { bold: true, color: { rgb: "FFFFFF" } },
        fill: { fgColor: { rgb: "4472C4" } }, // Blue background
        alignment: { horizontal: 'center' }
      };
    }
  });

  // Add the worksheet to the workbook
  utils.book_append_sheet(workbook, worksheet, 'Report');

  // Write the file
  writeFile(workbook, `${filename}_${getFormattedDate()}.xlsx`);
};

// JSON Export function (unchanged)
const exportToJSON = (data: any[], filename: string) => {
  const jsonContent = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonContent], { type: 'application/json' });
  downloadBlob(blob, `${filename}_${getFormattedDate()}.json`);
};

// Generic download function for non-Excel formats
const downloadBlob = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

// Helper function to format date for filenames
const getFormattedDate = () => {
  return new Date().toISOString().split('T')[0];
};


// previous code below

  // Reset filters function
  const resetFilters = () => {
    setDateFromFilter("");
    setDateToFilter("");
    setCaseTypeFilter("");
    setReferralSourceFilter("");
  };

  const columns = reportColumns[activeTab];
  const data = filteredData;

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Reports</h1>
          <p className="text-muted-foreground mt-1">Manage and track all reports</p>
        </div>

        {/* Tabs Navigation */}
        <TabsNav activeTab={activeTab} onChange={setActiveTab} />

        {/* Report Card */}
        <Card className="bg-white dark:bg-gray-800">
          <CardHeader className="pb-0">
            <CardTitle className="text-lg capitalize">{activeTab} Report</CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Table Header: search + filter + export */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
             
            <div className="flex-1">
              <FilterBar
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                searchPlaceholder="Search by name or record..."
                filterValue={filterValue}
                setFilterValue={setFilterValue}
                filterOptions={filterOptions}
                filterPlaceholder="Filter by type"
                onMoreFilters={() => setShowFiltersSidebar(true)}
                onExportCSV={() => handleExport('csv')}
                onExportExcel={() => handleExport('excel')}
                onExportJSON={() => handleExport('json')}
                showExportDropdown={true}
              />
            </div>
            </div>

            {/* Loading State */}
            {loading && (
              <div className="flex justify-center items-center py-8">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                <span className="ml-2 text-muted-foreground">Loading {activeTab} data...</span>
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="text-center py-8">
                <p className="text-red-500">Error: {error}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Retry
                </button>
              </div>
            )}

            {/* Dynamic Report Table */}
            {!loading && !error && <ReportTable columns={columns} data={data} />}
          </CardContent>
        </Card>

        <FilterSidebar
          isOpen={showFiltersSidebar}
          onClose={() => setShowFiltersSidebar(false)}
          caseTypeFilter={caseTypeFilter}
          setCaseTypeFilter={setCaseTypeFilter}
          caseTypeOptions={caseTypeOptions}
          dateFromFilter={dateFromFilter}
          setDateFromFilter={setDateFromFilter}
          dateToFilter={dateToFilter}
          setDateToFilter={setDateToFilter}
          referralSourceFilter={referralSourceFilter}
          setReferralSourceFilter={setReferralSourceFilter}
          referralSourceOptions={referralSourceOptions}
          onResetFilters={resetFilters}
          showCaseType={true}
          showReferralSource={activeTab === "leads"}
        />

      </div>
    </main>
  );
}
