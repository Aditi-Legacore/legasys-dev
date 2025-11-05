'use client';

import { useState, useMemo } from "react";
import TabsNav from "@/components/TabsNav";
import ReportTable from "@/components/table/ReportTable";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import FilterBar from "@/components/ui/FilterBar";
import FilterSidebar from "@/components/ui/FilterSidebar";

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState<"intakes" | "leads" | "documents">("intakes");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterValue, setFilterValue] = useState("all");
  const [showFiltersSidebar, setShowFiltersSidebar] = useState(false);
  const [dateFromFilter, setDateFromFilter] = useState("");
  const [dateToFilter, setDateToFilter] = useState("");

  const handleExport = () => {
    alert(`Exporting ${activeTab} data...`);
  };

  // Example summarized data for reports
  const summarizedReports = {
    intakes: [
      { name: "Total Intakes", value: 156, status: "Completed" },
      { name: "Pending Intakes", value: 23, status: "Pending" },
    ],
    leads: [
      { name: "New Leads", value: 58, status: "New" },
      { name: "In Progress Leads", value: 33, status: "In Progress" },
    ],
    documents: [
      { name: "Uploaded Docs", value: 342, status: "Reviewed" },
      { name: "Pending Approval", value: 27, status: "Pending" },
    ],
  };

  const reportColumns = {
    intakes: ["Name", "Count", "Status"],
    leads: ["Name", "Count", "Status"],
    documents: ["Name", "Count", "Status"],
  };

  // Reset filters function
  const resetFilters = () => {
    setDateFromFilter("");
    setDateToFilter("");
  };

  const columns = reportColumns[activeTab];
  const data = summarizedReports[activeTab];

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
                  filterOptions={[
                    { value: "all", label: "All" },
                    { value: "today", label: "Today" },
                    { value: "week", label: "This Week" },
                    { value: "month", label: "This Month" },
                  ]}
                  filterPlaceholder="Filter by type"
                  onMoreFilters={() => setShowFiltersSidebar(true)}
                  onExport={handleExport}
                  showExport={true}
                />
              </div>
            </div>

            {/* Dynamic Report Table */}
            <ReportTable columns={columns} data={data} />
          </CardContent>
        </Card>

        <FilterSidebar
          isOpen={showFiltersSidebar}
          onClose={() => setShowFiltersSidebar(false)}
          caseTypeFilter=""
          setCaseTypeFilter={() => {}}
          caseTypeOptions={[]}
          dateFromFilter={dateFromFilter}
          setDateFromFilter={setDateFromFilter}
          dateToFilter={dateToFilter}
          setDateToFilter={setDateToFilter}
          referralSourceFilter=""
          setReferralSourceFilter={() => {}}
          referralSourceOptions={[]}
          onResetFilters={resetFilters}
          showCaseType={false}
          showReferralSource={false}
        />

      </div>
    </main>
  );
}
