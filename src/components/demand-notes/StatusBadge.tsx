import { Badge } from "@/components/ui/badge";

export type DemandNoteStatus =
  | "initiated"
  | "doc-uploading"
  | "doc-uploaded"
  | "verified"
  | "generated";

interface StatusBadgeProps {
  status: DemandNoteStatus;
}

const statusConfig = {
  initiated: { label: "Initiated", color: "bg-gray-400 text-white" },
  "doc-uploading": { label: "Uploading", color: "bg-yellow-400 text-black" },
  "doc-uploaded": { label: "Uploaded", color: "bg-blue-400 text-white" },
  verified: { label: "Verified", color: "bg-green-400 text-white" },
  generated: { label: "Generated", color: "bg-purple-400 text-white" },
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status] || { label: "Unknown", color: "bg-gray-400 text-white" };

  return (
    <Badge className={config.color}>
      {config.label}
    </Badge>
  );
}
