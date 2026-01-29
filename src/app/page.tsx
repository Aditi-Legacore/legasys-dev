'use client';

import { useState } from 'react';
import LineChart from '@/components/charts/LineChart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, UserPlus } from 'lucide-react';
import AddUserModal from '@/components/users/AddUserModal';
import UserListModal from '@/components/users/UserListModal';

export default function Home() {
  const [openAddUser, setOpenAddUser] = useState(false);
  const [openUserList, setOpenUserList] = useState(false);

  return (
    <div className="min-h-screen p-8 bg-muted/30">
      {/* Header actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <div className="flex gap-3">
          <Button onClick={() => setOpenAddUser(true)}>
            <UserPlus className="mr-2 h-4 w-4" />
            Add New User
          </Button>
          <Button variant="outline" onClick={() => setOpenUserList(true)}>
            <Users className="mr-2 h-4 w-4" />
            User List
          </Button>

        </div>
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>User Overview</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            <p>Total Users: <span className="font-medium text-foreground">1,248</span></p>
            <p className="mt-2">Active This Month: <span className="font-medium text-foreground">312</span></p>
            <p className="mt-2">New This Week: <span className="font-medium text-foreground">27</span></p>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>User Growth</CardTitle>
          </CardHeader>
          <CardContent>
            <LineChart />
          </CardContent>
        </Card>
      </div>

      {/* Add User Modal */}
      <AddUserModal
        open={openAddUser}
        onClose={() => setOpenAddUser(false)}
      />
      <UserListModal
        open={openUserList}
        onClose={() => setOpenUserList(false)}
      />

    </div>
  );
}
