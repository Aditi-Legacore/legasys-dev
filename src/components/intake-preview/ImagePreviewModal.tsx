'use client';

import React from 'react';
import Image from "next/image";

interface ImagePreviewModalProps {
  showImagePreview: boolean;
  imageUrl: string | null;
  onClose: () => void;
}

export default function ImagePreviewModal({ showImagePreview, imageUrl, onClose }: ImagePreviewModalProps) {
  if (!showImagePreview || !imageUrl) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-4xl h-5/6 flex flex-col">
        <div className="flex justify-between items-center p-4 border-b dark:border-gray-700">
          <h5 className="text-lg font-semibold text-slate-500 dark:text-white">Image Preview</h5>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="flex-1 overflow-hidden flex items-center justify-center">
          <Image
            src={imageUrl}
            alt="Document Preview"
            className="max-w-full max-h-full object-contain"
          />
        </div>
      </div>
    </div>
  );
}
