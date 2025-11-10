'use client';

import React, { useRef } from 'react';
import { Eye, Trash2, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Document {
  id: string;
  name: string;
  type: string;
  uploadedAt: string;
  filePath: string;
}

interface DocumentsTabProps {
  documents: Document[];
  loadingDocuments: boolean;
  formatDate: (dateString: string | null) => string;
  onPreview: (filePath: string, type: string) => void;
  onDelete: (documentId: string) => void;
  onUpload?: (files: FileList) => void;
}

export default function DocumentsTab({
  documents,
  loadingDocuments,
  formatDate,
  onPreview,
  onDelete,
  onUpload,
}: DocumentsTabProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files.length > 0 && onUpload) {
      onUpload(files);
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0 && onUpload) {
      onUpload(files);
    }
  };

  return (
    <>
      <div
        className="border-2 border-dashed border-gray-300 rounded-lg p-6 mb-4 text-center"
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <p className="text-gray-600 mb-4">Drag and drop files here or click to upload</p>
        <Button onClick={handleButtonClick} className="mx-auto">
          <Upload className="w-4 h-4 mr-2" />
          Upload Documents
        </Button>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          multiple
          className="hidden"
        />
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
          ) : documents.length > 0 ? (
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
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onPreview(doc.filePath, doc.type)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onDelete(doc.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-center text-gray-500">No documents uploaded</p>
          )}
        </CardContent>
      </Card>
    </>
  );
}
