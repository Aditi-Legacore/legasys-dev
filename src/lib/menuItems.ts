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
    label: "Intake",
    path: "/intake-list",
    icon: ListChecks,
  },
  {
    label: "Reports",
    path: "/reports",
    icon: BarChart2,
  },
  {
    label: "Stages",
    path: "/stages",
    icon: FolderTree,
  },
  {
    label: "Leads",
    path: "/leads",
    icon: ClipboardList,
  },
  {
    label: "Forms",
    path: "/forms",
    icon: FileText,
  },
  {
    label: "Documents",
    path: "/documents",
    icon: FolderOpen,
  },
];
