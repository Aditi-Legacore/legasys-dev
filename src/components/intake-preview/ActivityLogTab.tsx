'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ActivityLog {
  id: string;
  action: string;
  details?: string;
  createdAt: string;
  createdBy: string;
}

interface ActivityLogTabProps {
  activityLogs: ActivityLog[];
  loadingActivity: boolean;
  newActivityAction: string;
  setNewActivityAction: (value: string) => void;
  newActivityDetails: string;
  setNewActivityDetails: (value: string) => void;
  addActivityLog: () => void;
  formatDate: (dateString: string | null) => string;
}

export default function ActivityLogTab({
  activityLogs,
  loadingActivity,
  newActivityAction,
  setNewActivityAction,
  newActivityDetails,
  setNewActivityDetails,
  addActivityLog,
  formatDate,
}: ActivityLogTabProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Activity Logs</CardTitle>
      </CardHeader>
      <CardContent>
        {loadingActivity ? (
          <div className="flex justify-center">
            <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <>
            <div className="space-y-4 mb-4">
              {activityLogs.map((log) => (
                <div key={log.id} className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <p className="font-medium">{log.action}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">{log.details}</p>
                  <p className="text-xs text-gray-500 mt-2">
                    {formatDate(log.createdAt)} by {log.createdBy}
                  </p>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <Input
                placeholder="Action"
                value={newActivityAction}
                onChange={(e) => setNewActivityAction(e.target.value)}
              />
              <Input
                placeholder="Details"
                value={newActivityDetails}
                onChange={(e) => setNewActivityDetails(e.target.value)}
              />
              <Button onClick={addActivityLog} className="md:col-span-2">Add Activity Log</Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
