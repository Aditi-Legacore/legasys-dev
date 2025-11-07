'use client';

import { useState, useEffect, useMemo } from "react";
import { Plus, Loader2, Badge } from 'lucide-react';
import CaseIntakeManagement from "@/components/table/IntakeTable";
import FilterBar from "@/components/ui/FilterBar";
import FilterSidebar from "@/components/ui/FilterSidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import NewIntakeModal from '@/components/NewIntakeModal';

interface IntakeData {
  id: string;
  clientName: string;
  isDraft: boolean;
  createdAt: string;
  accidentDate: string;
  accidentDescription: string | null | undefined;
  Lead?: { caseType: string };
}

export default function IntakeList() {
  const [intakesData, setIntakesData] = useState<IntakeData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterValue, setFilterValue] = useState("all");
  const [caseTypeFilter, setCaseTypeFilter] = useState("all");
  const [dateFromFilter, setDateFromFilter] = useState("");
  const [dateToFilter, setDateToFilter] = useState("");
  const [showFiltersSidebar, setShowFiltersSidebar] = useState(false);
  const [loadingNew, setLoadingNew] = useState(false);
  const [showIntakeModal, setShowIntakeModal] = useState(false);

  // Fetch intake data
  useEffect(() => {
    async function fetchIntakes() {
      try {
        const res = await fetch("/api/intake");
        const data = await res.json();
        if (Array.isArray(data)) {
          setIntakesData(data);
        }
      } catch (err) {
        console.error("Error fetching intakes:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchIntakes();
  }, []);

  // Get unique case types for filter options
  const uniqueCaseTypes = useMemo(() => {
    const caseTypes = [...new Set(intakesData.map(intake => intake.Lead?.caseType || "N/A"))].filter(Boolean);
    return caseTypes.sort();
  }, [intakesData]);

  // Filtered intakes based on search and filters
  const filteredIntakes = useMemo(() => {
    return intakesData.filter((intake) => {
      const matchesSearch =
        intake.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        intake.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        intake.Lead?.caseType.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = filterValue === "all" || 
        (filterValue === "completed" && !intake.isDraft) ||
        (filterValue === "draft" && intake.isDraft);

      const matchesCaseType = caseTypeFilter === "all" || 
        intake.Lead?.caseType === caseTypeFilter;

      // Date range filtering
      let matchesDateRange = true;
      if (dateFromFilter || dateToFilter) {
        const intakeDate = new Date(intake.createdAt);
        if (dateFromFilter) {
          const fromDate = new Date(dateFromFilter);
          matchesDateRange = matchesDateRange && intakeDate >= fromDate;
        }
        if (dateToFilter) {
          const toDate = new Date(dateToFilter);
          matchesDateRange = matchesDateRange && intakeDate <= toDate;
        }
      }

      return matchesSearch && matchesStatus && matchesCaseType && matchesDateRange;
    });
  }, [intakesData, searchQuery, filterValue, caseTypeFilter, dateFromFilter, dateToFilter]);

  // Reset filters function
  const resetFilters = () => {
    setCaseTypeFilter("all");
    setDateFromFilter("");
    setDateToFilter("");
  };

  const handleNewIntake = () => {
    setShowIntakeModal(true);
  };

  // Calculate counts for display
  const totalCount = intakesData.length;
  const completedCount = intakesData.filter(i => !i.isDraft).length;
  const draftCount = intakesData.filter(i => i.isDraft).length;

  return (
    <div className="min-h-screen bg-gradient-to-br  dark:border-gray-600 from-slate-50 to-slate-100 p-4 md:p-6">
      <div className="max-w-7xl  dark:border-gray-600 mx-auto space-y-6">
        {/* Page Header */}
        <div className="flex justify-between items-start  dark:border-gray-600">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Case Intake Management</h1>
            <p className="text-muted-foreground mt-1">Manage and track all case intakes</p>
          </div>
          <button
            onClick={handleNewIntake}
            disabled={loadingNew}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
          >
            {loadingNew ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Plus size={16} />
            )}
            {loadingNew ? 'Loading...' : 'Intake'}
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
         
          <Card className="bg-white dark:bg-gray-800">
            <CardHeader>
              <CardTitle>Total Intakes</CardTitle>
              <CardDescription>{totalCount} intakes</CardDescription>
            </CardHeader>
            <CardContent >
              <span className="text-blue-600 font-bold">Total</span>
            </CardContent>
          </Card>
          <Card className="bg-white dark:bg-gray-800">
            <CardHeader>
              <CardTitle>Completed</CardTitle>
              <CardDescription>{completedCount} intakes</CardDescription>
            </CardHeader>
            <CardContent >
              <span className="text-green-600 font-bold">Completed</span>
            </CardContent>
          </Card>
          <Card className="bg-white dark:bg-gray-800">
            <CardHeader>
              <CardTitle>Drafts</CardTitle>
              <CardDescription>{draftCount} intakes</CardDescription>
              
            </CardHeader>
            <CardContent >
              <span className="text-amber-600 font-bold">Drafts</span>
              
            </CardContent>
          </Card>
          
          {/* <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Drafts</p>
                  <p className="text-2xl font-bold text-amber-600">{draftCount}</p>
                </div>
                <div className="h-10 w-10 bg-amber-100 rounded-full flex items-center justify-center">
                  <span className="text-amber-600 font-bold">D</span>
                </div>
              </div>
            </CardContent>
          </Card> */}
        </div>

        {/* Filter Bar Card */}
        <Card>
          <CardContent>
            <FilterBar
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              searchPlaceholder="Search by client name or case type..."
              filterValue={filterValue}
              setFilterValue={setFilterValue}
              filterOptions={[
                { value: "all", label: "All Intakes" },
                { value: "completed", label: "Completed" },
                { value: "draft", label: "Drafts" },
              ]}
              filterPlaceholder="Filter by status"
              onMoreFilters={() => setShowFiltersSidebar(true)}
            />
          </CardContent>
        </Card>

        {/* Main Table */}
        {loading ? (
          <Card>
            <CardContent className="p-6">
              <div className="text-center text-gray-500 py-10">Loading intakes...</div>
            </CardContent>
          </Card>
        ) : (
          <CaseIntakeManagement
            intakes={filteredIntakes}
            onDelete={(id) => setIntakesData(prev => prev.filter(intake => intake.id !== id))}
          />
        )}

        {/* Filter Sidebar */}
        <FilterSidebar
          isOpen={showFiltersSidebar}
          onClose={() => setShowFiltersSidebar(false)}
          caseTypeFilter={caseTypeFilter}
          setCaseTypeFilter={setCaseTypeFilter}
          caseTypeOptions={[
            { value: "all", label: "All Case Types" },
            ...uniqueCaseTypes.map((caseType) => ({ value: caseType, label: caseType })),
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

        {/* New Intake Modal */}
        {showIntakeModal && <NewIntakeModal onClose={() => setShowIntakeModal(false)} />}
      </div>
    </div>
  );
}
