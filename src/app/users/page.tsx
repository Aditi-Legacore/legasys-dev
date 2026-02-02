'use client';

import type { Metadata } from "next";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Plus } from "lucide-react";
import DashboardBreadcrumb from "@/components/layout/dashboard-breadcrumb";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import CustomSelect from "@/components/shared/custom-select";
// import SearchBox from "@/components/shared/search-box";
import UsersListTable from "@/components/table/UsersListTable";
import AddUserModal from "@/components/users/AddUserModal";

const UsersList = () => {
  const [openAddUser, setOpenAddUser] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleUserAdded = () => {
    setRefreshKey(prev => prev + 1);
  };

    return (
        <>
            <DashboardBreadcrumb title="Users List" text="Users List" />

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
