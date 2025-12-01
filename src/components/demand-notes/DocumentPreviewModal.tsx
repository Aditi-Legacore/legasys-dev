import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Download, X } from 'lucide-react';

interface DocumentPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  fileName: string;
  fileUrl: string;
}

export function DocumentPreviewModal({
  isOpen,
  onClose,
  fileName,
  fileUrl,
}: DocumentPreviewModalProps) {
  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-lg font-semibold">
              {fileName}
            </DialogTitle>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownload}
                className="flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Download
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="h-8 w-8 p-0"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>
        <div className="flex-1 min-h-0">
          {fileUrl ? (
            <iframe
              src={fileUrl}
              className="w-full h-[70vh] border rounded-md"
              title={`Preview of ${fileName}`}
            />
          ) : (
            <div className="w-full h-[70vh] border rounded-md flex items-center justify-center bg-muted">
              <p className="text-muted-foreground">No preview available</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
