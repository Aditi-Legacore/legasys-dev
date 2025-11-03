'use client';

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MoreVertical, Eye, Mail, FileCheck, Archive } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Lead } from "@/types/leads";
import { toast } from "sonner";

interface LeadsTableProps {
  leads: Lead[];
  onLeadUpdate?: () => void;
}

const statusConfig = {
  new: { label: "New", color: "bg-muted text-muted-foreground" },
  form_sent: { label: "Form Sent", color: "bg-primary-light text-primary" },
  in_progress: { label: "In Progress", color: "bg-warning-light text-warning" },
  completed: { label: "Completed", color: "bg-success-light text-success" },
};

export default function LeadsTable({ leads, onLeadUpdate }: LeadsTableProps) {
  const handleResendEmail = async (lead: Lead) => {
    try {
      // Generate the same reference ID that was used for the original email
      let prefix = "LEG";
      if (lead.caseType.toLowerCase().includes("auto")) prefix = "MVA";
      else if (lead.caseType.toLowerCase().includes("premises")) prefix = "PRE";
      else if (lead.caseType.toLowerCase().includes("dog")) prefix = "SLP";

      // Use the lead's ID to generate a consistent reference ID
      const referenceId = `${prefix}-${lead.id.slice(-8).toUpperCase()}`;

      const response = await fetch('/api/resend-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: lead.email,
          name: lead.name,
          caseType: lead.caseType,
          referenceId,
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
  return (
    <Card className="card-shadow overflow-hidden hidden md:block bg-white dark:bg-gray-800">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted/50 dark:bg-gray-700 border-b border-border dark:border-gray-600">
            <tr>
              {[
                "Due Date",
                "Client Name",
                "Case Type",
                "Status",
                "Contact",
                "Matter",
                "Actions",
              ].map((header) => (
                <th
                  key={header}
                  className="px-6 py-3 text-left text-xs font-medium text-muted-foreground dark:text-white uppercase tracking-wider"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-card dark:bg-gray-800 divide-y divide-border dark:divide-gray-600">
            {leads.map((lead) => (
              <tr
                key={lead.id}
                className="hover:bg-primary-light/50 dark:hover:bg-gray-700 transition-fast cursor-pointer group"
              >
                <td className="px-6 py-4 text-sm text-foreground dark:text-gray-300">
                  {new Date(lead.dueDate).toLocaleDateString('en-US')}
                </td>
                <td className="px-6 py-4 text-sm font-medium text-foreground dark:text-white">
                  {lead.name}
                </td>
                <td className="px-6 py-4 text-sm text-foreground dark:text-gray-300">
                  {lead.caseType ? lead.caseType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : '-'}
                </td>
                <td className="px-6 py-4">
                  <Badge className={statusConfig[lead.status].color}>
                    {statusConfig[lead.status].label}
                  </Badge>
                </td>
                <td className="px-6 py-4 text-sm text-foreground dark:text-gray-300">
                  <div>{lead.contact}</div>
                  <div className="text-xs text-muted-foreground dark:text-gray-400">
                    {lead.phone}
                  </div>
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
