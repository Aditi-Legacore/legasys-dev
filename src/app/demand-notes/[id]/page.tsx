"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Loader2,
  ArrowLeft,
  Calendar,
  User2,
  FileText,
  Download,
  Eye,
} from "lucide-react";
import Link from "next/link";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

export default function DemandNoteView() {
  const params = useParams();
  const id = params.id as string;

  const [loading, setLoading] = useState(true);
  const [demand, setDemand] = useState<any>(null);
  const [selectedFile, setSelectedFile] = useState<any>(null);

  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      try {
        const res = await fetch(`/api/demand-notes/${id}`);
        const data = await res.json();
        setDemand(data);
      } catch (err) {
        console.error("Error fetching demand note:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  if (loading)
    return (
      <div className="flex justify-center py-10">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );

  if (!demand)
    return <p className="text-center text-red-500">Demand Note not found.</p>;

  const groupedFiles = {
    traffic: demand.files?.filter((f: any) => f.fileCategory === "traffic") || [],
    medical: demand.files?.filter((f: any) => f.fileCategory === "medical") || [],
    bills: demand.files?.filter((f: any) => f.fileCategory === "bills") || [],
  };
  

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Back */}
      <Link href="/demand-notes" className="flex items-center gap-2 text-sm mb-6 font-medium">
        <ArrowLeft className="h-4 w-4" /> Back to Demand Notes
      </Link>

      {/* HEADER */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          {/* Avatar Circle */}
          <div className="h-16 w-16 rounded-full bg-gray-200 flex items-center justify-center text-xl font-semibold">
            {demand.client?.name?.charAt(0) || "?"}
          </div>

          <div>
            <h1 className="text-3xl font-semibold">{demand.client?.name}</h1>

            <div className="flex gap-3 mt-1 text-sm text-gray-600">
              <span>{new Date(demand.createdAt).toLocaleDateString()}</span>
              <span>• Updated {new Date(demand.updatedAt).toLocaleString()}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline">Export PDF</Button>
          <Button>Edit</Button>
        </div>
      </div>

      {/* Status Badge */}
      <Badge className="mt-3 bg-purple-100 text-purple-700">
        {demand.status}
      </Badge>

      {/* TWO COLUMN LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        {/* BASIC INFORMATION */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-y-4 text-sm">
            <div>
              <p className="text-gray-500">Client Name</p>
              <p className="font-medium">{demand.client?.name}</p>
            </div>

            <div>
              <p className="text-gray-500">Demand Date</p>
              <p className="font-medium">
                {new Date(demand.demandDate).toLocaleDateString()}
              </p>
            </div>

            <div>
              <p className="text-gray-500">Demand Note ID</p>
              <p className="font-medium">{demand.id}</p>
            </div>

            <div>
              <p className="text-gray-500">Directory Name</p>
              <p className="font-medium">{demand.directoryName}</p>
            </div>
          </CardContent>
        </Card>

        {/* TIMELINE */}
        <Card>
          <CardHeader>
            <CardTitle>Activity Timeline</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {demand.timeline?.map((t: any) => (
                <div key={t.id} className="flex gap-3">
                  <div className="mt-1">
                    <span
                      className={`h-3 w-3 rounded-full block ${
                        t.type === "created"
                          ? "bg-blue-500"
                          : t.type === "uploaded"
                          ? "bg-green-500"
                          : "bg-gray-400"
                      }`}
                    ></span>
                  </div>

                  <div>
                    <p className="text-sm font-medium capitalize">{t.type}</p>
                    <p className="text-sm text-gray-700">{t.message}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(t.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* UPLOADED DOCUMENTS */}
      <h2 className="text-xl font-semibold mt-10 mb-4">Uploaded Documents</h2>

      <div className="space-y-6">
        {Object.entries(groupedFiles).map(([group, files]) => (
          <Card key={group}>
            <CardHeader> 
              <CardTitle className="capitalize">{group} Reports</CardTitle>
            </CardHeader>
            <CardContent>
              {files.length === 0 ? (
                <p className="text-sm text-gray-500">No files uploaded.</p>
              ) : (
                <div className="space-y-3">
                  {files.map((file: any) => (
                    <div
                      key={file.id}
                      className="p-3 border rounded-lg flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-blue-600" />
                        <div>
                          <p>{file.fileName}</p>
                          <p className="text-xs text-gray-500">
                            {(file.size / 1024).toFixed(1)} KB
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setSelectedFile(file)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>

                        <a
                          href={file.fileUrl}
                          download
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Button variant="ghost" size="icon">
                            <Download className="h-4 w-4" />
                          </Button>
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* FILE PREVIEW MODAL */}
      <Dialog open={!!selectedFile} onOpenChange={() => setSelectedFile(null)}>
        <DialogContent className="max-w-3xl">
          <DialogTitle>{selectedFile?.fileName}</DialogTitle>

          {selectedFile && (
            <iframe
              src={selectedFile.fileUrl}
              className="w-full h-[500px] border rounded"
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
