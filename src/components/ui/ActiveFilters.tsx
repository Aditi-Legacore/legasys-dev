'use client';

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
          <Button
            variant="ghost"
            size="icon"
            className="ml-1 w-4 h-4 p-0 rounded-full hover:bg-gray-300 dark:hover:bg-gray-600"
            onClick={filter.onRemove}
            aria-label={`Remove ${filter.label} filter`}
          >
            <X size={12} />
          </Button>
        </Badge>
      ))}
    </div>
  );
}
