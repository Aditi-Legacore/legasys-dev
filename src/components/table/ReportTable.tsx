'use client';

interface ReportTableProps {
  columns: string[];
  data: any[];
}

export default function ReportTable({ columns, data }: ReportTableProps) {
  return (
    <div className="overflow-x-auto rounded-lg border border-border mt-4">
      <table className="min-w-full divide-y divide-border">
        <thead className="bg-muted/50">
          <tr>
            {columns.map((col) => (
              <th key={col} className="px-4 py-2 text-left text-sm font-semibold text-foreground">
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border bg-background">
          {data.length > 0 ? (
            data.map((row, idx) => (
              <tr key={idx} className="hover:bg-muted/20 transition-colors">
                {columns.map((col) => (
                  <td key={col} className="px-4 py-2 text-sm text-muted-foreground">
                    {row[col.toLowerCase()] || "-"}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={columns.length} className="text-center py-6 text-muted-foreground">
                No records found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
