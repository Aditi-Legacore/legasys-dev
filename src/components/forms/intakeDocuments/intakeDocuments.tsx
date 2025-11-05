"use client";

import Link from "next/link";
import React, { useState } from "react";
import { toast } from "sonner"; // or any toast lib you use

interface IntakeDocumentsProps {
  submittedIntakeId: string;
  onUploadSuccess?: () => void;
}

const IntakeDocuments: React.FC<IntakeDocumentsProps> = ({ submittedIntakeId, onUploadSuccess }) => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  // ✅ Combine previous and new files
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const newFiles = files.filter((f) => f.size <= 600 * 1024);

    if (newFiles.length < files.length) {
      toast.warning("Some files exceeded 600KB and were skipped.");
    }

    setSelectedFiles((prev) => [...prev, ...newFiles]); // ✅ append instead of replace
  };

  const handleMultiFileUpload = async () => {
    if (!submittedIntakeId) {
      toast.error("Missing intake ID.");
      return;
    }
    if (selectedFiles.length === 0) {
      toast.error("Please select files to upload.");
      return;
    }

    const formData = new FormData();
    selectedFiles.forEach((file) => formData.append("files", file));

    try {
      setIsUploading(true);
      const response = await fetch(`/api/intake/${submittedIntakeId}/documents`, {
        method: "POST",
        body: formData,
      });
      if (!response.ok) throw new Error("Upload failed");

      toast.success("Documents uploaded successfully!");
      setSelectedFiles([]); // Clear after upload
      if (onUploadSuccess) {
        onUploadSuccess();
      }
    } catch (err) {
      console.error("Upload error:", err);
      toast.error("Failed to upload files.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="w-full  bg-white dark:bg-gray-900 p-8 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">
        Upload Supporting Documents
      </h1>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
        You can upload multiple files (PDF, JPG, PNG). Each file must be under <b>600 KB</b>.
      </p>

      {/* File selector */}
      <div className="flex items-center gap-4 mb-6">
        <label
          htmlFor="file-upload"
          className="cursor-pointer bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg shadow transition-all"
        >
          Choose Files
        </label>
        <input
          id="file-upload"
          type="file"
          multiple
          onChange={handleFileChange}
          className="hidden"
        />
        {selectedFiles.length > 0 && (
          <button
            onClick={() => setSelectedFiles([])}
            className="text-sm text-red-500 hover:underline"
          >
            Clear All
          </button>
        )}
      </div>

      {/* File preview list */}
      {selectedFiles.length > 0 && (
        <div className="border-t border-gray-300 dark:border-gray-700 pt-4">
          <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-3">
            Selected Files
          </h2>
          <ul className="space-y-3">
            {selectedFiles.map((file, index) => (
              <li
                key={index}
                className="flex justify-between items-center bg-gray-50 dark:bg-gray-800 px-4 py-3 rounded-lg"
              >
                <div className="flex flex-col text-sm">
                  <span className="font-medium text-gray-800 dark:text-gray-100">{file.name}</span>
                  <span className="text-xs text-gray-500">
                    {(file.size / 1024).toFixed(1)} KB
                  </span>
                </div>
                <button
                  onClick={() => handleRemoveFile(index)}
                  className="text-red-500 hover:text-red-700 text-sm"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>

          <button
            onClick={handleMultiFileUpload}
            disabled={isUploading}
            className="mt-6 bg-green-600 hover:bg-green-700 text-white font-medium py-2.5 px-6 rounded-lg transition disabled:opacity-50"
          >
            {isUploading ? "Uploading..." : "Upload Documents"}
          </button>
        </div>
      )}

      {/* Back link */}
      <div className="mt-6 text-center">
        <Link
          href="/intake-list"
          className="text-indigo-600 hover:text-indigo-800 font-medium transition"
        >
          ← Back to Intake List
        </Link>
      </div>
      
    </div>
    
  );
};

export default IntakeDocuments;
