'use client';

import React, { useState } from 'react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MoreVertical, Eye, Mail, FileCheck, Archive } from "lucide-react";
import { Lead } from "@/types/leads";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import CommonTable, { Column, Action } from "@/components/ui/CommonTable";

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
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

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

  // Sort data based on current sort state
  const sortedLeads = React.useMemo(() => {
    if (!sortColumn) return leads;

    return [...leads].sort((a, b) => {
      let aValue = a[sortColumn as keyof Lead];
      let bValue = b[sortColumn as keyof Lead];

      // Handle null/undefined values
      if (aValue == null && bValue == null) return 0;
      if (aValue == null) return sortDirection === 'asc' ? 1 : -1;
      if (bValue == null) return sortDirection === 'asc' ? -1 : 1;

      // Handle date sorting
      if (sortColumn === 'dueDate') {
        const aDate = new Date(aValue as string);
        const bDate = new Date(bValue as string);
        return sortDirection === 'asc' ? aDate.getTime() - bDate.getTime() : bDate.getTime() - aDate.getTime();
      }

      // Handle status sorting (custom order: new, form_sent, in_progress, completed)
      if (sortColumn === 'status') {
        const statusOrder = { 'new': 1, 'form_sent': 2, 'in_progress': 3, 'completed': 4 };
        const aOrder = statusOrder[aValue as keyof typeof statusOrder] || 5;
        const bOrder = statusOrder[bValue as keyof typeof statusOrder] || 5;
        return sortDirection === 'asc' ? aOrder - bOrder : bOrder - aOrder;
      }

      // Handle string sorting
      const aStr = String(aValue).toLowerCase();
      const bStr = String(bValue).toLowerCase();

      if (aStr < bStr) return sortDirection === 'asc' ? -1 : 1;
      if (aStr > bStr) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [leads, sortColumn, sortDirection]);

  // Define columns for CommonTable
  const columns: Column[] = [
    {
      key: 'dueDate',
      label: 'Date Of Loss',
      className: 'px-4 py-4 text-xs sm:text-sm text-gray-600 dark:text-gray-400',
      sortable: true,
      render: (value) => new Date(value).toLocaleDateString('en-US')
    },
    {
      key: 'name',
      label: 'Client Name',
      className: 'px-4 py-4 text-xs sm:text-sm text-gray-600 dark:text-gray-400 font-medium',
      sortable: true,
      render: (value, row) => row.intakeInfo ? (
        <a
          href={`/intake-preview/${row.intakeInfo.id}`}
          className="underline text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
        >
          {value}
        </a>
      ) : value
    },
    {
      key: 'caseType',
      label: 'Case Type',
      className: 'px-4 py-4 text-xs sm:text-sm text-gray-600 dark:text-gray-400',
      sortable: true,
      render: (value) => value ? value.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()) : '-'
    },
    {
      key: 'status',
      label: 'Status',
      className: 'px-4 py-4',
      sortable: true,
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
      onClick: (row) => row.intakeInfo && router.push(`/intake-preview/${row.intakeInfo.id}`),
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
      data={sortedLeads}
      actions={actions}
      emptyMessage="No leads found."
      onSort={(column, direction) => {
        setSortColumn(column);
        setSortDirection(direction);
      }}
    />
  );
}
