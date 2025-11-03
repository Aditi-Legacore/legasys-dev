'use client';

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Search, Filter, Plus } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import LeadsTable from "@/components/table/LeadsTable";
import { Badge } from "@/components/ui/badge";
import { Lead } from "@/types/leads";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

const leadsData: Lead[] = [
  {
    id: "L-2025-001",
    dueDate: "2025-11-02",
    name: "Sarah Johnson",
    caseType: "Personal Injury",
    status: "completed",
    contact: "sarah.j@email.com",
    phone: "(555) 123-4567",
    matter: "MAT-2025-045",
  },
  {
    id: "L-2025-002",
    dueDate: "2025-11-01",
    name: "Michael Brown",
    caseType: "Workers Comp",
    status: "form_sent",
    contact: "mbrown@email.com",
    phone: "(555) 234-5678",
    matter: "-",
  },
  {
    id: "L-2025-003",
    dueDate: "2025-10-31",
    name: "Emily Davis",
    caseType: "Auto Accident",
    status: "in_progress",
    contact: "emily.d@email.com",
    phone: "(555) 345-6789",
    matter: "-",
  },
  {
    id: "L-2025-004",
    dueDate: "2025-10-30",
    name: "Robert Wilson",
    caseType: "Medical Malpractice",
    status: "new",
    contact: "rwilson@email.com",
    phone: "(555) 456-7890",
    matter: "-",
  },
  {
    id: "L-2025-005",
    dueDate: "2025-11-03",
    name: "Jessica Lee",
    caseType: "Personal Injury",
    status: "in_progress",
    contact: "jlee@email.com",
    phone: "(555) 567-8901",
    matter: "MAT-2025-046",
  }
];

export default function LeadsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Status counts for cards
  const completedCount = leadsData.filter(l => l.status === "completed").length;
  const inProgressCount = leadsData.filter(l => l.status === "in_progress").length;
  const newCount = leadsData.filter(l => l.status === "new").length;

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
          <Card className="bg-white dark:bg-gray-800">
            <CardHeader>
              <CardTitle>Completed Leads</CardTitle>
              <CardDescription>{completedCount} completed</CardDescription>
            </CardHeader>
            <CardContent>
              <Badge className="bg-success-light text-success">Completed</Badge>
            </CardContent>
          </Card>
          <Card className="bg-white dark:bg-gray-800">
            <CardHeader>
              <CardTitle>In Progress Leads</CardTitle>
              <CardDescription>{inProgressCount} in progress</CardDescription>
            </CardHeader>
            <CardContent>
              <Badge className="bg-warning-light text-warning">In Progress</Badge>
            </CardContent>
          </Card>
          <Card className="bg-white dark:bg-gray-800">
            <CardHeader>
              <CardTitle>New Leads</CardTitle>
              <CardDescription>{newCount} new</CardDescription>
            </CardHeader>
            <CardContent>
              <Badge className="bg-muted text-muted-foreground">New</Badge>
            </CardContent>
          </Card>
        </div>

        {/* Filters/Search */}
        <Card>
          <CardContent className="flex gap-4 flex-col md:flex-row">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search by name or lead ID..."
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
              <Button variant="outline" className="w-full md:w-auto">
                <Filter className="w-4 h-4 mr-2" />
                More Filters
              </Button>
              <Button className="bg-success hover:bg-success/90 text-success-foreground w-full md:w-auto">
                <Plus className="w-4 h-4 mr-2" />
                Quick Intake
              </Button>
            </CardContent>
          </CardContent>
        </Card>

        {/* Leads Table */}
        <LeadsTable leads={leadsData} />

      </div>
    </main>
  );
}
