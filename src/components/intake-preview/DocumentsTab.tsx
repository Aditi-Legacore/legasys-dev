'use client';

import React from 'react';
import { Eye, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import PlaintiffInformationCard from './PlaintiffInformationCard';
import { IntakeData } from '@/types/intake';

interface Document {
  id: string;
  name: string;
  type: string;
  uploadedAt: string;
}

interface DocumentsTabProps {
  documents: Document[];
  loadingDocuments: boolean;
  formatDate: (dateString: string | null) => string;
  intake: IntakeData;
  showPlaintiffCard: boolean;
  setShowPlaintiffCard: (show: boolean) => void;
}

export default function DocumentsTab({
  documents,
  loadingDocuments,
  formatDate,
  intake,
  showPlaintiffCard,
  setShowPlaintiffCard,
}: DocumentsTabProps) {
  return (
    <div className="relative">
      {/* Plaintiff Info Button at top right */}
      <div className="flex justify-end mb-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowPlaintiffCard(!showPlaintiffCard)}
          className="bg-green-600 text-white hover:bg-green-700 rounded-full p-3 shadow-lg lg:hidden"
          title="Plaintiff Info Button"
        >
          <User className="w-5 h-5" />
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Documents</CardTitle>
        </CardHeader>
        <CardContent>
        {loadingDocuments ? (
          <div className="flex justify-center">
            <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Uploaded At</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {documents.map((doc) => (
                <TableRow key={doc.id}>
                  <TableCell>{doc.name}</TableCell>
                  <TableCell>{doc.type}</TableCell>
                  <TableCell>{formatDate(doc.uploadedAt)}</TableCell>
                  <TableCell>
                    <Button variant="outline" size="sm">
                      <Eye className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>

    {/* Sliding Plaintiff Info Card */}
    {showPlaintiffCard && (
      <div className="fixed inset-0 z-50 lg:hidden">
        {/* Centered Responsive Card */}
        <div className="absolute top-1/2 left-1/2 w-[90vw] h-[80vh] bg-white dark:bg-gray-800 shadow-lg transform -translate-x-1/2 -translate-y-1/2 transition-transform duration-300 ease-in-out rounded-lg overflow-hidden">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowPlaintiffCard(false)}
            className="absolute top-2 right-2 z-10 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            ✕
          </Button>
          <div className="p-4 overflow-y-auto h-full pt-10">
            <PlaintiffInformationCard intake={intake} formatDate={formatDate} />
          </div>
        </div>
      </div>
    )}

    {/* Desktop small card */}
    {showPlaintiffCard && (
      <div className="hidden lg:block absolute top-0 right-0 w-80 bg-white dark:bg-gray-800 shadow-lg rounded-lg transform transition-transform duration-300 ease-in-out z-10">
        <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-green-600">Plaintiff Information</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowPlaintiffCard(false)}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            ✕
          </Button>
        </div>
        <div className="p-4 overflow-y-auto max-h-96">
          <PlaintiffInformationCard intake={intake} formatDate={formatDate} />
        </div>
      </div>
    )}
  </div>
  );
}
