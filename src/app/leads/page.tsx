'use client';

import { useState, useEffect, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Search, Filter, Plus } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import LeadsTable from "@/components/table/LeadsTable";
import { Badge } from "@/components/ui/badge";
import { Lead } from "@/types/leads";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import QuickIntakeForm from "@/components/forms/QuickIntakeForm";

export default function LeadsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showQuickIntake, setShowQuickIntake] = useState(false);
  const [leadsData, setLeadsData] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLeads = async () => {
    try {
      const response = await fetch('/api/leads');
      if (response.ok) {
        const data = await response.json();
        setLeadsData(data);
      } else {
        console.error('Failed to fetch leads');
      }
    } catch (error) {
      console.error('Error fetching leads:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  // Filtered leads based on search and status
  const filteredLeads = useMemo(() => {
    return leadsData.filter((lead) => {
      const matchesSearch =
        lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lead.contact.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lead.phone.includes(searchQuery) ||
        lead.caseType.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = statusFilter === "all" || lead.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [leadsData, searchQuery, statusFilter]);

  // Status counts for cards
  const completedCount = leadsData.filter((l: Lead) => l.status === "completed").length;
  const inProgressCount = leadsData.filter((l: Lead) => l.status === "in_progress").length;
  const newCount = leadsData.filter((l: Lead) => l.status === "new").length;

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Leads</h1>
          <p className="text-muted-foreground mt-1">Manage and track all client intake leads</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-blue-300 dark:bg-gray-800">
            <CardHeader>
              <CardTitle className="text-white">Completed Leads</CardTitle>
              <CardDescription>{completedCount} completed</CardDescription>
            </CardHeader>
            <CardContent>
              <Badge className="bg-green-400 text-success">Completed</Badge>
            </CardContent>
          </Card>
          <Card className="bg-emerald-300 dark:bg-gray-800">
            <CardHeader>
              <CardTitle>In Progress Leads</CardTitle>
              <CardDescription>{inProgressCount} in progress</CardDescription>
            </CardHeader>
            <CardContent>
              <Badge className="bg-yellow-300 text-warning">In Progress</Badge>
            </CardContent>
          </Card>
          <Card className="bg-yellow-300 dark:bg-gray-800">
            <CardHeader>
              <CardTitle>New Leads</CardTitle>
              <CardDescription>{newCount} new</CardDescription>
            </CardHeader>
            <CardContent>
              <Badge className="bg-red-400 text-success">New</Badge>
            </CardContent>
          </Card>
        </div>

        {/* Filters/Search */}
        <Card>
          <CardContent className="flex gap-4 flex-col md:flex-row">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search by name, contact, or case type..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <CardContent className="flex gap-2 md:gap-4 flex-wrap">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="form_sent">Form Sent</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" className="w-full md:w-auto bg-blue-400">
                <Filter className="w-4 h-4 mr-2" />
                More Filters
              </Button>
              <Button
                className="bg-green-400 hover:bg-success/90 text-success-foreground w-full md:w-auto"
                onClick={() => setShowQuickIntake(true)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Quick Intake
              </Button>
            </CardContent>
          </CardContent>
        </Card>

        {/* Leads Table */}
        <LeadsTable leads={filteredLeads} onLeadUpdate={fetchLeads} />

        {/* Quick Intake Modal */}
        {showQuickIntake && (
          <div className="fixed inset-0 bg-white dark:bg-gray-800 bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl w-full max-w-2xl shadow-lg h-[90vh] overflow-y-auto">
              <div className="flex justify-end mb-4">
                <button
                  onClick={() => setShowQuickIntake(false)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-2xl"
                >
                  ×
                </button>
              </div>
              <QuickIntakeForm onClose={() => setShowQuickIntake(false)} />
            </div>
          </div>
        )}

      </div>
    </main>
  );
}
