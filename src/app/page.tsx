'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation'; // Add this import

import LineChart from '@/components/charts/LineChart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, UserPlus } from 'lucide-react';

import AddUserModal from '@/components/users/AddUserModal';
import ResetPasswordModal from '@/components/auth/ResetPasswordModal';

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter(); // Initialize router

  const [openAddUser, setOpenAddUser] = useState(false);
  const [showReset, setShowReset] = useState(false);
  
  useEffect(() => {
    if (
      session?.user?.status === true &&
      session?.user?.forcePasswordReset === false
    ) {
      setShowReset(true);
    }
  }, [session]);

  // Handle User List button click
  const handleUserListClick = () => {
    router.push('/users'); // Navigate to users page
  };

  // wait for session
  if (status === 'loading') return null;

  // role check
  const isNormalUser = session?.user?.role === 'user';

  return (
    <>
      {/* 🔒 Mandatory Password Reset */}
      {showReset && <ResetPasswordModal />}

      {/* Dashboard (locked while reset required) */}
      <div
        className={`min-h-screen p-8 bg-muted/30 transition ${
          showReset ? 'pointer-events-none blur-sm' : ''
        }`}
      >
        {/* Header actions */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <h1 className="text-2xl font-semibold">Dashboard</h1>

          {/* ADMIN / STAFF ONLY */}
          {!isNormalUser && (
            <div className="flex gap-3">
              <Button onClick={() => setOpenAddUser(true)}>
                <UserPlus className="mr-2 h-4 w-4" />
                Add New User
              </Button>

              <Button variant="outline" onClick={handleUserListClick}>
                <Users className="mr-2 h-4 w-4" />
                User List
              </Button>
            </div>
          )}
        </div>

        {/* Main grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>User Overview</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              <p>
                Total Users:{' '}
                <span className="font-medium text-foreground">1,248</span>
              </p>
              <p className="mt-2">
                Active This Month:{' '}
                <span className="font-medium text-foreground">312</span>
              </p>
              <p className="mt-2">
                New This Week:{' '}
                <span className="font-medium text-foreground">27</span>
              </p>
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

        {/* Modals - Only AddUserModal remains */}
        {!isNormalUser && (
          <AddUserModal
            open={openAddUser}
            onClose={() => setOpenAddUser(false)}
          />
        )}
      </div>
    </>
  );
}