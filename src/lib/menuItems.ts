import {
  LayoutDashboard,
  ListChecks,
  BarChart2,
  FolderTree,
  ClipboardList,
  FileText,
  FolderOpen,
} from "lucide-react";

export interface MenuItem {
  label: string;
  path: string;
  icon: React.ElementType;
  styles?: {
    active?: string;
    inactive?: string;
  };
}

export const menuItems: MenuItem[] = [
  {
    label: "Dashboard",
    path: "/",
    icon: LayoutDashboard,
  },
  {
    label: "Leads",
    path: "/leads",
    icon: ClipboardList,
  },
  {
    label: "Intake",
    path: "/intake-list",
    icon: ListChecks,
  },
  
  {
    label: "Stages",
    path: "/stages",
    icon: FolderTree,
  },
  {
    label: "Reports",
    path: "/reports",
    icon: BarChart2,
  },
  {
    label: "Forms",
    path: "/forms",
    icon: FileText,
  },
  {
    label: "Form Templates",
    path: "/form-templates",
    icon: FileText,
  },
  {
    label: "Documents",
    path: "/documents",
    icon: FolderOpen,
  },
  {
    label: "Demand Notes",
    path: "/demand-notes",
    icon: FolderOpen,
  },
];
