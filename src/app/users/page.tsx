'use client';

import type { Metadata } from "next";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Plus } from "lucide-react";
import DashboardBreadcrumb from "@/components/layout/dashboard-breadcrumb";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import CustomSelect from "@/components/shared/custom-select";
// import SearchBox from "@/components/shared/search-box";
import UsersListTable from "@/components/table/UsersListTable";
import AddUserModal from "@/components/users/AddUserModal";

const UsersList = () => {
  const [openAddUser, setOpenAddUser] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [users, setUsers] = useState<any[]>([]);

  const handleUserAdded = () => {
    setRefreshKey(prev => prev + 1);
  };

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch('/api/admin/users');
        const data = await res.json();
        setUsers(data.users || []);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };

    fetchUsers();
  }, [refreshKey]);

  const adminActiveCount = users.filter((user: any) => user.role === 'admin' && user.status).length;
  const adminInactiveCount = users.filter((user: any) => user.role === 'admin' && !user.status).length;
  const customerActiveCount = users.filter((user: any) => user.role === 'Customer' && user.status).length;
  const customerInactiveCount = users.filter((user: any) => user.role === 'Customer' && !user.status).length;
  const legacoreActiveCount = users.filter((user: any) => user.role === 'Legacore User' && user.status).length;
  const legacoreInactiveCount = users.filter((user: any) => user.role === 'Legacore User' && !user.status).length;

    return (
        <>
            <DashboardBreadcrumb title="Users List" text="Users List" />

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <Card className="bg-white dark:bg-gray-800">
                <CardHeader>
                  <CardTitle>Total Admins</CardTitle>
                  <CardDescription>{adminActiveCount + adminInactiveCount} total</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between">
                    <div>
                      <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">Active: {adminActiveCount}</Badge>
                    </div>
                    <div>
                      <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300">Inactive: {adminInactiveCount}</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-white dark:bg-gray-800">
                <CardHeader>
                  <CardTitle>Total Customers</CardTitle>
                  <CardDescription>{customerActiveCount + customerInactiveCount} total</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between">
                    <div>
                      <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">Active: {customerActiveCount}</Badge>
                    </div>
                    <div>
                      <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300">Inactive: {customerInactiveCount}</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-white dark:bg-gray-800">
                <CardHeader>
                  <CardTitle>Total Legacore Users</CardTitle>
                  <CardDescription>{legacoreActiveCount + legacoreInactiveCount} total</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between">
                    <div>
                      <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">Active: {legacoreActiveCount}</Badge>
                    </div>
                    <div>
                      <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300">Inactive: {legacoreInactiveCount}</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="card h-full !p-0 !block border-0 overflow-hidden mb-6">
                <CardHeader className="border-b border-neutral-200 dark:border-slate-600 !py-4 px-6 flex items-center flex-wrap gap-3 justify-between">
                    <div className="flex items-center flex-wrap gap-3">
                        <span className="text-base font-medium text-secondary-light mb-0">Show</span>
                        <CustomSelect
                            placeholder="1"
                            options={["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"]}
                        />
                        {/* <SearchBox /> */}
                        <CustomSelect
                            placeholder="Status"
                            options={["Status", "Active", "Inactive"]}
                        />
                    </div>
                    <Button className={cn(`w-auto h-11`)} onClick={() => setOpenAddUser(true)}>
                        <Plus className="w-5 h-5" />
                        Add New User
                    </Button>
                </CardHeader>

                <CardContent className="card-body p-6">
                    <UsersListTable key={refreshKey} />
                </CardContent>
            </Card>

            <AddUserModal
                open={openAddUser}
                onClose={() => setOpenAddUser(false)}
                onSuccess={handleUserAdded}
            />
        </>
    );
};
export default UsersList;
