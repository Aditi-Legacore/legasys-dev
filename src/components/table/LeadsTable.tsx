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
``
interface LeadsTableProps {
  leads: Lead[];
}

const statusConfig = {
  new: { label: "New", color: "bg-muted text-muted-foreground" },
  form_sent: { label: "Form Sent", color: "bg-primary-light text-primary" },
  in_progress: { label: "In Progress", color: "bg-warning-light text-warning" },
  completed: { label: "Completed", color: "bg-success-light text-success" },
};

export default function LeadsTable({ leads }: LeadsTableProps) {
  return (
    <Card className="card-shadow overflow-hidden hidden md:block bg-white dark:bg-gray-800">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted/50 dark:bg-gray-700 border-b border-border dark:border-gray-600">
            <tr>
              {[
                "Due Date",
                "Lead ID",
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
                  {new Date(lead.dueDate).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 text-sm font-medium text-primary dark:text-blue-400">
                  {lead.id}
                </td>
                <td className="px-6 py-4 text-sm font-medium text-foreground dark:text-white">
                  {lead.name}
                </td>
                <td className="px-6 py-4 text-sm text-foreground dark:text-gray-300">
                  {lead.caseType}
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
                      <DropdownMenuItem>
                        <Mail className="w-4 h-4 mr-2" /> Resend Email
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <FileCheck className="w-4 h-4 mr-2" /> Convert to Matter
                      </DropdownMenuItem>
                      <DropdownMenuItem>
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
