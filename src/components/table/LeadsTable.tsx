'use client';

import Link from 'next/link';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MoreVertical, Eye, Mail, FileCheck, Archive } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Lead } from "@/types/leads";
import { toast } from "sonner";
import CommonTable, { Column, Action } from "@/components/ui/CommonTable";
import SortableHeader from "@/components/ui/SortableHeader"; // ✅ reuse same sortable header
import { useEffect, useMemo, useState } from "react";

interface LeadsTableProps {
  leads: Lead[];
  onLeadUpdate?: () => void;
}

const statusConfig = {
  new: { label: "New", color: "bg-muted text-muted-foreground" },
  form_sent: { label: "Form Sent", color: "bg-primary-light text-primary" },
  in_progress: { label: "In Progress", color: "bg-warning-light text-warning" },
  completed: { label: "Completed", color: "bg-success-light text-success" },
  default: { label: "Unknown", color: "bg-muted text-muted-foreground" },
};

export default function LeadsTable({ leads, onLeadUpdate }: LeadsTableProps) {
  const router = useRouter();
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc" | null>(null);
  const [sortedLeads, setSortedLeads] = useState<Lead[]>(leads);

  useEffect(() => {
    setSortedLeads(leads);
  }, [leads]);

  // 🔹 Sorting handler
  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDirection(sortDirection === "asc" ? "desc" : sortDirection === "desc" ? null : "asc");
    } else {
      setSortKey(key);
      setSortDirection("asc");
    }
  };

  // 🔹 Apply sorting logic
  const displayedLeads = useMemo(() => {
    if (!sortKey || !sortDirection) return sortedLeads;

    return [...sortedLeads].sort((a, b) => {
      let valA = a[sortKey as keyof Lead];
      let valB = b[sortKey as keyof Lead];

      if (typeof valA === "string" && typeof valB === "string") {
        // Check if sortable as date (like dueDate)
        const dateA = new Date(valA);
        const dateB = new Date(valB);
        if (dateA.toString() !== 'Invalid Date' && dateB.toString() !== 'Invalid Date') {
          return sortDirection === "asc" ? dateA.getTime() - dateB.getTime() : dateB.getTime() - dateA.getTime();
        }

        return sortDirection === "asc"
          ? valA.localeCompare(valB, undefined, { sensitivity: "base" })
          : valB.localeCompare(valA, undefined, { sensitivity: "base" });
      }

      if (typeof valA === "number" && typeof valB === "number") {
        return sortDirection === "asc" ? valA - valB : valB - valA;
      }

      return 0;
    });
  }, [sortedLeads, sortKey, sortDirection]);

  const handleView = (lead: Lead) => {
  if (lead.intakeInfo?.id) {
    router.push(`/intake-preview/${lead.intakeInfo.id}`);
  } else {
    toast.error("No intake information found for this lead");
  }
};


  // send email
  
  const handleResendEmail = async (lead: Lead) => {
    try {
      const response = await fetch('/api/resend-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: lead.email,
          name: lead.name,
          caseType: lead.caseType,
          referenceId: lead.referenceId,
        }),
      });

      if (response.ok) {
        toast.success("Email resent successfully!");
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to resend email");
      }
    } catch (error) {
      console.error("Failed to resend email:", error);
      toast.error("Failed to resend email");
    }
  };

  const handleConvertToMatter = async (lead: Lead) => {
    try {
      await fetch(`/api/leads/${lead.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ matter: lead.name, status: "in_progress" }),
      });
      toast.success("Lead converted to matter!");
      onLeadUpdate?.();
    } catch (error) {
      console.error("Failed to convert to matter:", error);
      toast.error("Failed to convert to matter");
    }
  };

  const handleArchive = async (lead: Lead) => {
    try {
      await fetch(`/api/leads/${lead.id}`, {
        method: "DELETE",
      });
      toast.success("Lead archived!");
      onLeadUpdate?.();
    } catch (error) {
      console.error("Failed to archive lead:", error);
      toast.error("Failed to archive lead");
    }
  };
  // Define columns for CommonTable
  const columns: Column[] = [
    {
      key: 'dueDate',
      label: 'Due Date',
      className: 'px-4 py-4 text-xs sm:text-sm text-gray-600 dark:text-gray-400',
      render: (value) => new Date(value).toLocaleDateString('en-US')
    },
    {
      key: 'name',
      label: 'Client Name',
      className: 'px-4 py-4 text-xs sm:text-sm text-gray-600 dark:text-gray-400 font-medium'
    },
    {
      key: 'caseType',
      label: 'Case Type',
      className: 'px-4 py-4 text-xs sm:text-sm text-gray-600 dark:text-gray-400',
      render: (value) => value ? value.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()) : '-'
    },
    {
      key: 'status',
      label: 'Status',
      className: 'px-4 py-4',
      render: (value: string) => (
        <Badge className={statusConfig[value as keyof typeof statusConfig]?.color || statusConfig.default.color}>
          {statusConfig[value as keyof typeof statusConfig]?.label || statusConfig.default.label}
        </Badge>
      )
    },
    {
      key: 'contact',
      label: 'Contact',
      className: 'px-4 py-4 text-xs sm:text-sm text-gray-600 dark:text-gray-400',
      render: (value, row) => (
        <div>
          <div>{value}</div>
          <div className="text-xs text-muted-foreground dark:text-gray-400">
            {row.phone}
          </div>
        </div>
      )
    },
    {
      key: 'matter',
      label: 'Matter',
      className: 'px-4 py-4 text-xs sm:text-sm',
      render: (value) => (
        value !== "-" ? (
          <span className="text-primary dark:text-blue-400 font-medium">{value}</span>
        ) : (
          <span className="text-muted-foreground dark:text-gray-400">-</span>
        )
      )
    }
  ];

  // Define actions for CommonTable
  const actions: Action[] = [
    {
      label: 'View Details',
      icon: Eye,
      onClick: (row) => {
        // Handle view details - placeholder for now
        console.log('View details for lead:', row);
      },
      className: 'text-blue-600 dark:text-blue-400'
    },
    {
      label: 'Resend Email',
      icon: Mail,
      onClick: (row) => handleResendEmail(row),
      className: 'text-green-600 dark:text-green-400'
    },
    {
      label: 'Convert to Matter',
      icon: FileCheck,
      onClick: (row) => handleConvertToMatter(row),
      className: 'text-purple-600 dark:text-purple-400'
    },
    {
      label: 'Archive',
      icon: Archive,
      onClick: (row) => handleArchive(row),
      className: 'text-red-600 dark:text-red-400'
    }
  ];

  return (
    <CommonTable
      columns={columns}
      data={leads}
      actions={actions}
      emptyMessage="No leads found."
    />
    <Card className="card-shadow overflow-hidden hidden md:block bg-white dark:bg-gray-800">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted/50 dark:bg-gray-700 border-b border-border dark:border-gray-600">
            <tr>
              {/* <SortableHeader
                label="Due Date"
                sortKey="dueDate"
                currentSortKey={sortKey}
                currentDirection={sortDirection}
                onSort={handleSort}
              /> */}
              <th className="px-4 py-3 text-left text-xs sm:text-sm font-semibold text-gray-900 dark:text-white">
                  S.No
                </th>
              <SortableHeader
                label="Client Name"
                sortKey="name"
                currentSortKey={sortKey}
                currentDirection={sortDirection}
                onSort={handleSort}
              />
              <SortableHeader
                label="Case Type"
                sortKey="caseType"
                currentSortKey={sortKey}
                currentDirection={sortDirection}
                onSort={handleSort}
              />
              <SortableHeader
                label="Status"
                sortKey="status"
                currentSortKey={sortKey}
                currentDirection={sortDirection}
                onSort={handleSort}
              />
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground dark:text-white uppercase tracking-wider">
                Contact
              </th>
              <SortableHeader
                label="Matter"
                sortKey="matter"
                currentSortKey={sortKey}
                currentDirection={sortDirection}
                onSort={handleSort}
              />
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground dark:text-white uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>

          <tbody className="bg-card dark:bg-gray-800 divide-y divide-border dark:divide-gray-600">
            {displayedLeads.map((lead, index) => (
              <tr
                key={lead.id}
                className="hover:bg-primary-light/50 dark:hover:bg-gray-700 transition-fast cursor-pointer group"
              >
                <td className="px-4 py-4 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                    {index + 1}
                  </td>
                {/* <td className="px-6 py-4 text-sm text-foreground dark:text-gray-300">
                  {new Date(lead.dueDate).toLocaleDateString("en-US")}
                </td> */}
                <td className="px-4 lg:px-6 py-3 lg:py-4 text-xs lg:text-sm text-gray-900 dark:text-white font-medium">
                      <button
                        onClick={() => handleView(lead)}
                        className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 underline cursor-pointer bg-transparent border-none p-0"
                      >
                        {lead.name}
                      </button>

                    </td>
                <td className="px-6 py-4 text-sm text-foreground dark:text-gray-300">
                  {lead.caseType
                    ? lead.caseType.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())
                    : "-"}
                </td>
                <td className="px-6 py-4">
                  <Badge className={statusConfig[lead.status]?.color || statusConfig.default.color}>
                    {statusConfig[lead.status]?.label || statusConfig.default.label}
                  </Badge>
                </td>
                <td className="px-6 py-4 text-sm text-foreground dark:text-gray-300">
                  <div>{lead.contact}</div>
                  <div className="text-xs text-muted-foreground dark:text-gray-400">{lead.phone}</div>
                </td>
                <td className="px-6 py-4 text-sm">
                  {lead.matter !== "-" ? (
                    <span className="text-primary dark:text-blue-400 font-medium">{lead.matter}</span>
                  ) : (
                    <span className="text-muted-foreground dark:text-gray-400">-</span>
                  )}
                </td>
                <td className="px-6 py-4 text-sm">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Eye className="w-4 h-4 mr-2" /> View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleResendEmail(lead)}>
                        <Mail className="w-4 h-4 mr-2" /> Resend Email
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleConvertToMatter(lead)}>
                        <FileCheck className="w-4 h-4 mr-2" /> Convert to Matter
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleArchive(lead)}>
                        <Archive className="w-4 h-4 mr-2" /> Archive
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
