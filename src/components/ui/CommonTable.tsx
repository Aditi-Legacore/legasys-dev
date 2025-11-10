'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronUp, ChevronDown, MoreVertical } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export interface Column {
  key: string;
  label: string;
  render?: (value: any, row: any, index: number) => React.ReactNode;
  className?: string;
  hidden?: boolean;
  sortable?: boolean;
  link?: (row: any) => string; // href for link
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
  onSort?: (column: string, direction: 'asc' | 'desc') => void;
}

export default function CommonTable({
  columns,
  data,
  actions = [],
  onRowClick,
  emptyMessage = 'No records found',
  className = '',
  showSerialNumber = false,
  serialNumberLabel = 'S.No',
  onSort
}: CommonTableProps) {
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const visibleColumns = columns.filter(col => !col.hidden);

  const handleSort = (columnKey: string) => {
    if (!onSort) return;
    const newDirection = sortColumn === columnKey && sortDirection === 'asc' ? 'desc' : 'asc';
    setSortColumn(columnKey);
    setSortDirection(newDirection);
    onSort(columnKey, newDirection);
  };

  // Mobile Card Layout Component
  const MobileCardLayout = () => (
    <div className="space-y-4 md:hidden">
      {data.map((row, rowIndex) => (
        <Card key={row.id || rowIndex} className="p-4 bg-white dark:bg-gray-800">
          <div className="space-y-3">
            {showSerialNumber && (
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-muted-foreground">{serialNumberLabel}</span>
                <span className="text-sm text-gray-600 dark:text-gray-400">{rowIndex + 1}</span>
              </div>
            )}
            {visibleColumns.map((column) => {
              const cellContent = column.render
                ? column.render(row[column.key], row, rowIndex)
                : row[column.key] || '-';

              return (
                <div key={column.key} className="flex justify-between items-center">
                  <span className="text-sm font-medium text-muted-foreground">{column.label}:</span>
                  <div className="text-sm text-foreground dark:text-gray-300 max-w-[60%] truncate">
                    {column.link ? (
                      <a
                        href={column.link(row)}
                        className="underline text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                      >
                        {cellContent}
                      </a>
                    ) : (
                      cellContent
                    )}
                  </div>
                </div>
              );
            })}
            {actions.length > 0 && (
              <div className="flex justify-end pt-2 border-t border-border dark:border-gray-600">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8">
                      <MoreVertical size={16} />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {actions.map((action, actionIndex) => {
                      const Icon = action.icon;
                      const isDisabled = action.disabled?.(row) || false;

                      return (
                        <DropdownMenuItem
                          key={actionIndex}
                          onClick={(e) => {
                            if (!isDisabled) action.onClick(row, rowIndex);
                          }}
                          disabled={isDisabled}
                          className={action.className || ''}
                        >
                          {Icon && <Icon size={16} className="mr-2" />}
                          {action.label}
                        </DropdownMenuItem>
                      );
                    })}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}
          </div>
        </Card>
      ))}
    </div>
  );

  if (!data || data.length === 0) {
    return (
      <Card className={`card-shadow overflow-hidden bg-white dark:bg-gray-800 ${className}`}>
        <div className="text-center py-10 text-gray-500 dark:text-gray-400">
          {emptyMessage}
        </div>
      </Card>
    );
  }

  return (
    <>
      {/* Mobile Card Layout */}
      <MobileCardLayout />

      {/* Desktop Table Layout */}
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
                    className={`px-6 py-3 text-left text-xs font-medium text-muted-foreground dark:text-white uppercase tracking-wider ${column.className || ''} ${column.sortable ? 'cursor-pointer hover:bg-muted/70 dark:hover:bg-gray-600' : ''}`}
                    onClick={() => column.sortable && handleSort(column.key)}
                  >
                    <div className="flex items-center gap-1">
                      {column.label}
                      {column.sortable && (
                        <div className="flex flex-col">
                          <ChevronUp
                            size={12}
                            className={`transition-colors ${sortColumn === column.key && sortDirection === 'asc' ? 'text-primary' : 'text-muted-foreground'}`}
                          />
                          <ChevronDown
                            size={12}
                            className={`transition-colors -mt-1 ${sortColumn === column.key && sortDirection === 'desc' ? 'text-primary' : 'text-muted-foreground'}`}
                          />
                        </div>
                      )}
                    </div>
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
                  {visibleColumns.map((column) => {
                    const cellContent = column.render
                      ? column.render(row[column.key], row, rowIndex)
                      : row[column.key] || '-';

                    return (
                      <td
                        key={column.key}
                        className={`px-6 py-4 text-sm text-foreground dark:text-gray-300 ${column.className || ''}`}
                      >
                        {column.link ? (
                          <a
                            href={column.link(row)}
                            className="underline text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {cellContent}
                          </a>
                        ) : (
                          cellContent
                        )}
                      </td>
                    );
                  })}
                  {actions.length > 0 && (
                    <td className="px-6 py-4 text-center">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical size={16} />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {actions.map((action, actionIndex) => {
                            const Icon = action.icon;
                            const isDisabled = action.disabled?.(row) || false;

                            return (
                              <DropdownMenuItem
                                key={actionIndex}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (!isDisabled) action.onClick(row, rowIndex);
                                }}
                                disabled={isDisabled}
                                className={action.className || ''}
                              >
                                {Icon && <Icon size={16} className="mr-2" />}
                                {action.label}
                              </DropdownMenuItem>
                            );
                          })}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  );
}
