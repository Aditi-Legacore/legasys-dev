'use client';

import { Card } from "@/components/ui/card";

interface ReportTableProps {
  columns: string[];
  data: any[];
}

export default function ReportTable({ columns, data }: ReportTableProps) {
  return (
    <Card className="card-shadow overflow-hidden hidden md:block bg-white dark:bg-gray-800">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted/50 dark:bg-gray-700 border-b border-border dark:border-gray-600">
            <tr>
              {columns.map((col) => (
                <th
                  key={col}
                  className="px-6 py-3 text-left text-xs font-medium text-muted-foreground dark:text-white uppercase tracking-wider"
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-card dark:bg-gray-800 divide-y divide-border dark:divide-gray-600">
            {data.length > 0 ? (
              data.map((row, idx) => (
                <tr
                  key={idx}
                  className="hover:bg-primary-light/50 dark:hover:bg-gray-700 transition-fast cursor-pointer group"
                >
                  {columns.map((col) => (
                    <td
                      key={col}
                      className="px-6 py-4 text-sm text-foreground dark:text-gray-300"
                    >
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
    </Card>
  );
}
