'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ActivityLog {
  id: string;
  shortDescription: string;
  longDescription?: string;
  createdAt: string;
  createdBy: string;
  createdByName?: string;
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
          <div className="space-y-6">
            {activityLogs.map((log, index) => (
              <div key={log.id} className="flex gap-4">
                {/* Left side - Timeline with icon */}
                <div className="flex flex-col items-center">
                  {/* Icon circle */}
                  <div className="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center flex-shrink-0">
                    <svg
                      className="w-5 h-5 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  
                  {/* Connecting line - don't show for last item */}
                  {index < activityLogs.length - 1 && (
                    <div className="w-0.5 h-full min-h-[40px] bg-gray-300 dark:bg-gray-600 mt-2"></div>
                  )}
                </div>

                {/* Right side - Description */}
                <div className="flex-1">
                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                    <p className="font-medium text-gray-900 dark:text-gray-100">
                      {log.shortDescription}
                    </p>
                    {log.longDescription && (
                      <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
                        {log.longDescription}
                      </p>
                    )}
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">
                      {formatDate(log.createdAt)} by {log.createdByName || log.createdBy}
                    </p>
                  </div>
                </div>
              </div>
            ))}

            {activityLogs.length === 0 && (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                No activity logs yet
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}