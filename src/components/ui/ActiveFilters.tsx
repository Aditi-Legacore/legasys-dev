'use client';

import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";

interface ActiveFilter {
  label: string;
  onRemove: () => void;
}

interface ActiveFiltersProps {
  filters: ActiveFilter[];
}

export default function ActiveFilters({ filters }: ActiveFiltersProps) {
  if (filters.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 mb-4">
      {filters.map((filter, index) => (
        <Badge key={index} variant="secondary" className="flex items-center gap-1">
          {filter.label}
          <button
            onClick={filter.onRemove}
            className="ml-1 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-full p-0.5"
            aria-label={`Remove ${filter.label} filter`}
          >
            <X size={12} />
          </button>
        </Badge>
      ))}
    </div>
  );
}
