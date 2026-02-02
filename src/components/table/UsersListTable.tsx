'use client';

import React, { useEffect, useState } from 'react';
import { Send, Trash } from 'lucide-react';
import { toast } from 'sonner';
import CommonTable, { Column, Action } from '@/components/ui/CommonTable';
import Pagination from '@/components/ui/pagination';

interface User {
  id: string;
  email: string;
  role: string;
  createdAt: string;
  password: string | null;
  status: boolean;
}

export default function UsersListTable() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/admin/users');
        const data = await res.json();
        setUsers(data.users || []);
      } catch (error) {
        console.error('Error fetching users:', error);
        toast.error('Failed to load users');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Sort users based on current sort state
  const sortedUsers = React.useMemo(() => {
    if (!sortColumn) return users;

    return [...users].sort((a, b) => {
      const aValue = a[sortColumn as keyof User];
      const bValue = b[sortColumn as keyof User];

      // Handle null/undefined values
      if (aValue == null && bValue == null) return 0;
      if (aValue == null) return sortDirection === 'asc' ? 1 : -1;
      if (bValue == null) return sortDirection === 'asc' ? -1 : 1;

      // Handle string sorting
      const aStr = String(aValue).toLowerCase();
      const bStr = String(bValue).toLowerCase();

      if (aStr < bStr) return sortDirection === 'asc' ? -1 : 1;
      if (aStr > bStr) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [users, sortColumn, sortDirection]);

  const itemsPerPage = 10;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedUsers = sortedUsers.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (page: number) => setCurrentPage(page);

  // Define columns
  const columns: Column<User>[] = [
    {
      key: 'email',
      label: 'Email',
      className: 'px-4 py-4 text-xs sm:text-sm text-gray-600 dark:text-gray-400',
      sortable: true
    },
    {
      key: 'role',
      label: 'Role',
      className: 'px-4 py-4 text-xs sm:text-sm text-gray-600 dark:text-gray-400',
      sortable: true
    },
    {
      key: 'status',
      label: 'Status',
      className: 'px-4 py-4 text-xs sm:text-sm text-gray-600 dark:text-gray-400',
      render: (value) => (
        <button
          className={`px-3 py-1 rounded-full text-xs font-medium ${
            value ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
          }`}
          disabled
        >
          {value ? 'Active' : 'Inactive'}
        </button>
      )
    },
    {
      key: 'createdAt',
      label: 'Created Date',
      className: 'px-4 py-4 text-xs sm:text-sm text-gray-600 dark:text-gray-400',
      sortable: true
    }
  ];

  // Define actions
  const actions: Action<User>[] = [
    {
      label: 'Send Login Email',
      icon: Send,
      onClick: async (row) => {
        try {
          const res = await fetch('/api/admin/send-user-login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: row.id }),
          });

          if (!res.ok) throw new Error();

          toast.success('Login email sent successfully');
        } catch {
          toast.error('Failed to send email');
        }
      },
      className: 'text-blue-600 dark:text-blue-400'
    },
    {
      label: 'Delete',
      icon: Trash,
      onClick: async (row) => {
        const confirmed = window.confirm(`Are you sure you want to delete user ${row.email}?`);
        if (!confirmed) return;

        try {
          const res = await fetch('/api/admin/users', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: row.id }),
          });

          if (!res.ok) {
            const error = await res.json();
            throw new Error(error.error || 'Failed to delete user');
          }

          toast.success('User deleted successfully');
          // Refresh the users list
          const fetchUsers = async () => {
            setLoading(true);
            try {
              const res = await fetch('/api/admin/users');
              const data = await res.json();
              setUsers(data.users || []);
            } catch (error) {
              console.error('Error fetching users:', error);
              toast.error('Failed to refresh users list');
            } finally {
              setLoading(false);
            }
          };
          fetchUsers();
        } catch (error) {
          toast.error(error instanceof Error ? error.message : 'Failed to delete user');
        }
      },
      className: 'text-red-600 dark:text-red-400'
    }
  ];

  if (loading) {
    return (
      <div className="text-center py-10 text-gray-500 dark:text-gray-400">
        Loading users...
      </div>
    );
  }

  const UsersTable = CommonTable as unknown as React.ComponentType<{
    columns: Column<User>[];
    data: User[];
    actions?: Action<User>[];
    showSerialNumber?: boolean;
    emptyMessage?: string;
    onSort?: (column: string, direction: 'asc' | 'desc') => void;
  }>;

  return (
    <>
      <UsersTable
        columns={columns}
        data={paginatedUsers}
        actions={actions}
        showSerialNumber={true}
        emptyMessage="No users found."
        onSort={(column, direction) => {
          setSortColumn(column);
          setSortDirection(direction);
        }}
      />

      {/* Pagination */}
      {users.length > itemsPerPage && (
        <div className="mt-6">
          <Pagination
            totalItems={users.length}
            itemsPerPage={itemsPerPage}
            currentPage={currentPage}
            onPageChange={handlePageChange}
          />
        </div>
      )}
    </>
  );
}
