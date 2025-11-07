'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export interface Column {
  key: string;
  label: string;
  render?: (value: any, row: any, index: number) => React.ReactNode;
  className?: string;
  hidden?: boolean;
}

export interface Action {
  label: string;
  icon?: React.ComponentType<{ size?: number; className?: string }>;
  onClick: (row: any, index: number) => void;
  variant?: 'default' | 'outline' | 'ghost' | 'destructive';
  size?: 'sm' | 'default' | 'lg' | 'icon';
  disabled?: (row: any) => boolean;
  className?: string;
}

export interface CommonTableProps {
  columns: Column[];
  data: any[];
  actions?: Action[];
  onRowClick?: (row: any, index: number) => void;
  emptyMessage?: string;
  className?: string;
  showSerialNumber?: boolean;
  serialNumberLabel?: string;
}

export default function CommonTable({
  columns,
  data,
  actions = [],
  onRowClick,
  emptyMessage = 'No records found',
  className = '',
  showSerialNumber = false,
  serialNumberLabel = 'S.No'
}: CommonTableProps) {
  const visibleColumns = columns.filter(col => !col.hidden);

  if (!data || data.length === 0) {
    return (
      <Card className={`card-shadow overflow-hidden hidden md:block bg-white dark:bg-gray-800 ${className}`}>
        <div className="text-center py-10 text-gray-500 dark:text-gray-400">
          {emptyMessage}
        </div>
      </Card>
    );
  }

  return (
    <Card className={`card-shadow overflow-hidden hidden md:block bg-white dark:bg-gray-800 ${className}`}>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted/50 dark:bg-gray-700 border-b border-border dark:border-gray-600">
            <tr>
              {showSerialNumber && (
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground dark:text-white uppercase tracking-wider">
                  {serialNumberLabel}
                </th>
              )}
              {visibleColumns.map((column) => (
                <th
                  key={column.key}
                  className={`px-6 py-3 text-left text-xs font-medium text-muted-foreground dark:text-white uppercase tracking-wider ${column.className || ''}`}
                >
                  {column.label}
                </th>
              ))}
              {actions.length > 0 && (
                <th className="px-6 py-3 text-center text-xs font-medium text-muted-foreground dark:text-white uppercase tracking-wider">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-card dark:bg-gray-800 divide-y divide-border dark:divide-gray-600">
            {data.map((row, rowIndex) => (
              <tr
                key={row.id || rowIndex}
                className={`hover:bg-primary-light/50 dark:hover:bg-gray-700 transition-fast ${
                  onRowClick ? 'cursor-pointer' : ''
                } group`}
                onClick={() => onRowClick?.(row, rowIndex)}
              >
                {showSerialNumber && (
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                    {rowIndex + 1}
                  </td>
                )}
                {visibleColumns.map((column) => (
                  <td
                    key={column.key}
                    className={`px-6 py-4 text-sm text-foreground dark:text-gray-300 ${column.className || ''}`}
                  >
                    {column.render
                      ? column.render(row[column.key], row, rowIndex)
                      : row[column.key] || '-'
                    }
                  </td>
                ))}
                {actions.length > 0 && (
                  <td className="px-6 py-4 text-center">
                    <div className="flex justify-center gap-2">
                      {actions.map((action, actionIndex) => {
                        const Icon = action.icon;
                        const isDisabled = action.disabled?.(row) || false;

                        return (
                          <Button
                            key={actionIndex}
                            variant={action.variant || 'ghost'}
                            size={action.size || 'icon'}
                            onClick={(e) => {
                              e.stopPropagation();
                              action.onClick(row, rowIndex);
                            }}
                            disabled={isDisabled}
                            className={action.className || ''}
                          >
                            {Icon && <Icon size={16} />}
                            {action.label && !Icon && action.label}
                          </Button>
                        );
                      })}
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
