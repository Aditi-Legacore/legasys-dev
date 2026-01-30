"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Calendar, Loader2 } from "lucide-react";
import { ChevronDown, ChevronUp } from 'lucide-react'; // Import icons

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { StatusBadge, DemandNoteStatus } from "@/components/demand-notes/StatusBadge";
import { FileUploadGroup } from "@/components/demand-notes/FileUploadGroup";
import { toast } from "sonner";

interface UploadedFile {
  id: string;
  fileName: string;
  size: number;
  fileCategory: string;
  fileUrl: string;
  uploadedAt: string | null;
  file: File | null;
}

export default function DemandNoteForm({ id }: { id?: string }) {
  const router = useRouter();
  const isEditMode = !!id;

  const [clientName, setClientName] = useState(isEditMode ? "John Doe" : "");
  const [defendantPhoneEmail, setDefendantPhoneEmail] = useState("");
  const [demandDate, setDemandDate] = useState(
    isEditMode ? "2025-11-20" : new Date().toISOString().split("T")[0]
  );
  const [status, setStatus] = useState<DemandNoteStatus>(
    isEditMode ? "doc-uploaded" : "initiated"
  );
  const [internalNotes, setInternalNotes] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const [trafficFiles, setTrafficFiles] = useState<UploadedFile[]>([]);
  const [medicalFiles, setMedicalFiles] = useState<UploadedFile[]>([]);
  const [billFiles, setBillFiles] = useState<UploadedFile[]>([]);

  const [showAdditionalInfo, setShowAdditionalInfo] = useState(false);

  const directoryName = `dn_${demandDate.replace(/-/g, "_")}_${Math.random()
    .toString(36)
    .substring(2, 8)}`;

    const handleGenerate = async () => {
      try {
        setIsGenerating(true);

        const response = await fetch("/api/demand-notes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            clientName,
            defendantPhoneEmail,
            demandDate,
            internalNotes,
            status: "generated",
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          toast.error("Failed to create demand note.");
          return;
        }

        const demandNoteId = data.id;

        if (!demandNoteId) {
          console.error("Demand note ID is missing from response:", data);
          toast.error("Failed to get demand note ID. Cannot upload files.");
          return;
        }

        // Upload files individually
        const allFiles = [...trafficFiles, ...medicalFiles, ...billFiles];
        for (const fileInfo of allFiles) {
          if (fileInfo.file) {
            console.log("Uploading file:", fileInfo.fileName, "to demandNoteId:", demandNoteId, "category:", fileInfo.fileCategory);
            try {
              const formData = new FormData();
              formData.append("file", fileInfo.file);
              formData.append("demandNoteId", demandNoteId);
              formData.append("fileCategory", fileInfo.fileCategory);

              const uploadResponse = await fetch("/api/upload", {
                method: "POST",
                body: formData,
              });

              if (!uploadResponse.ok) {
                console.log("Upload response status:", uploadResponse.status, uploadResponse.statusText);
                let errorData;
                try {
                  errorData = await uploadResponse.json();
                  console.log("Parsed error data:", errorData);
                } catch {
                  errorData = { error: `HTTP ${uploadResponse.status}: ${uploadResponse.statusText}` };
                }
                console.error("Upload failed for file:", fileInfo.fileName, errorData);
                toast.error(`Failed to upload ${fileInfo.fileName}: ${errorData.error || "Unknown error"}`);
              } else {
                console.log("Uploaded file:", fileInfo.fileName);
              }
            } catch (uploadError) {
              console.error("Upload error for file:", fileInfo.fileName, uploadError);
              toast.error(`Failed to upload ${fileInfo.fileName}: ${uploadError instanceof Error ? uploadError.message : "Unknown error"}`);
            }
          }
        }

        toast.success("Demand note generated & saved!!!!");
        setStatus("generated");
        // if (demandNoteId) {
        //   router.push(`/demand-notes/${demandNoteId}`);
        // }
        router.push("/demand-notes");
      } catch (err) {
        console.error(err);
        toast.error("An error occurred while generating the demand note.");
      } finally {
        setIsGenerating(false);
      }
    };

  const handleSaveDraft = () => {
    toast.success("Draft saved successfully!");
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => router.push("/demand-notes")}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Demand Notes
          </Button>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                {isEditMode ? `Edit Demand Note – ${clientName}` : "New Demand Note"}
              </h1>
              {isEditMode && (
                <p className="text-sm text-muted-foreground mt-1">
                  ID: {id} • Last updated: 2025-11-26 16:45
                </p>
              )}
            </div>
            <StatusBadge status={status} />
          </div>
        </div>

        {/* Main Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Info */}
            <div className="bg-card border border-border rounded-lg p-6 space-y-4">
              <h2 className="text-lg font-semibold text-foreground">
                Basic Information
              </h2>
              

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="clientName">Client Name *</Label>
                  <Input
                    id="clientName"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    placeholder="Enter client name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="defendantPhoneEmail">Client Phone/Email *</Label>
                  <Input
                    id="defendantPhoneEmail"
                    value={defendantPhoneEmail}
                    onChange={(e) => setDefendantPhoneEmail(e.target.value)}
                    placeholder="Enter phone or email"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="demandDate">Demand Date</Label>
                  <div className="relative">
                    <Input
                      id="demandDate"
                      type="date"
                      value={demandDate}
                      onChange={(e) => setDemandDate(e.target.value)}
                    />
                    {/* <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" /> */}
                  </div>
                </div>
              
              
                <div className="space-y-2">
                  <Label htmlFor="demandDate">Date of Loss *</Label>
                  <div className="relative">
                    <Input
                      id="dateofloss"
                      type="date"
                      // value={dateofloss}
                      onChange={(e) => setDemandDate(e.target.value)}
                    />
                    {/* <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" /> */}
                  </div>
                </div>
              </div>
              
           

              {isEditMode && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Demand Note ID</Label>
                    <Input value={id} disabled />
                  </div>

                  <div className="space-y-2">
                    <Label>Directory Name</Label>
                    <Input value={directoryName} disabled className="font-mono text-xs" />
                  </div>
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={() => setShowAdditionalInfo(!showAdditionalInfo)}
              className="flex items-center bg-blue-400 rounded-b-md gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {showAdditionalInfo ? (
                <>
                  Hide Additional Info
                  <ChevronUp className="h-4 w-4" />
                </>
              ) : (
                <>
                  Show Additional Info
                  <ChevronDown className="h-4 w-4" />
                </>
              )}
            </button>

            {/* Additional Info - Collapsible */}
            {showAdditionalInfo && (
              <div className="bg-card border border-border rounded-lg p-6 space-y-6 animate-in fade-in duration-300 mt-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-foreground">
                    Additional Info
                  </h2>
                  
                  <button
                    type="button"
                    onClick={() => setShowAdditionalInfo(false)}
                    className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Hide
                    <ChevronUp className="h-4 w-4" />
                  </button>
                </div>
                
                <div className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="defendantName">Defendant Name</Label>
                      <Input
                        id="defendantName"
                        // value={defendantName}
                        // onChange={(e) => setDefendantName(e.target.value)}
                        placeholder="Enter defendant name"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="claimNumber">Claim Number</Label>
                      <Input
                        id="claimNumber"
                        // value={claimNumber}
                        // onChange={(e) => setClaimNumber(e.target.value)}
                        placeholder="Enter claim number"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="insuranceName">Insurance Company Name</Label>
                      <Input
                        id="insuranceName"
                        // value={insuranceName}
                        // onChange={(e) => setInsuranceName(e.target.value)}
                        placeholder="Enter insurance company name"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="adjuster">Adjuster</Label>
                      <Input
                        id="adjuster"
                        // value={adjuster}
                        // onChange={(e) => setAdjuster(e.target.value)}
                        placeholder="Enter adjuster name"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="insuranceAddress">Insurance Company Address</Label>
                    <Input
                      id="insuranceAddress"
                      // value={insuranceAddress}
                      // onChange={(e) => setInsuranceAddress(e.target.value)}
                      placeholder="Enter insurance company address"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        // value={phone}
                        // onChange={(e) => setPhone(e.target.value)}
                        placeholder="Enter phone number"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="fax">Fax</Label>
                      <Input
                        id="fax"
                        // value={fax}
                        // onChange={(e) => setFax(e.target.value)}
                        placeholder="Enter fax number"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="claimType">Claim Type</Label>
                      <select
                        id="claimType"
                        // value={claimType}
                        // onChange={(e) => setClaimType(e.target.value)}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <option value="">Select claim type</option>
                        <option value="auto">Auto Accident</option>
                        <option value="property">Property Damage</option>
                        <option value="liability">General Liability</option>
                        <option value="workers-comp">Workers Compensation</option>
                        <option value="medical">Medical Malpractice</option>
                        <option value="product">Product Liability</option>
                        <option value="premises">Premises Liability</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="additionalNotes">Additional Notes</Label>
                    <textarea
                      id="additionalNotes"
                      // value={additionalNotes}
                      // onChange={(e) => setAdditionalNotes(e.target.value)}
                      placeholder="Enter any additional notes"
                      rows={4}
                      className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 min-h-[80px]"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Document Uploads */}
            <div className="bg-card border border-border rounded-lg p-6 space-y-6">
              <h2 className="text-lg font-semibold text-foreground">
                Document Uploads
              </h2>

              <FileUploadGroup
                title="Traffic Reports"
                description="Upload all traffic / police / accident reports."
                folderPath="/traffic"
                files={trafficFiles}
                onFilesChange={setTrafficFiles}
                accept=".pdf,.doc,.docx"
              />

              <div className="border-t border-border pt-6">
                <FileUploadGroup
                  title="Medical Reports"
                  description="Upload doctor notes, diagnoses, imaging reports."
                  folderPath="/medical"
                  files={medicalFiles}
                  onFilesChange={setMedicalFiles}
                  accept=".pdf,.doc,.docx"
                />
              </div>

              <div className="border-t border-border pt-6">
                <FileUploadGroup
                  title="Medical Bills"
                  description="Upload invoices and bills related to treatment."
                  folderPath="/bills"
                  files={billFiles}
                  onFilesChange={setBillFiles}
                  accept=".pdf,.doc,.docx"
                />
              </div>
            </div>

            {/* Generated Summary */}
            {status === "generated" && (
              <div className="bg-success/5 border border-success/20 rounded-lg p-6">
                <h2 className="text-lg font-semibold text-foreground mb-4">
                  Generated Document Summary
                </h2>

                <div className="space-y-3 font-mono text-xs">
                  <div>
                    <p className="text-muted-foreground mb-1">Traffic Reports:</p>
                    <ul className="list-disc list-inside text-foreground space-y-1">
                      {trafficFiles.map((file) => (
                        <li key={file.id}>{file.fileName}</li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <p className="text-muted-foreground mb-1">Medical Reports:</p>
                    <ul className="list-disc list-inside text-foreground space-y-1">
                      {medicalFiles.map((file) => (
                        <li key={file.id}>{file.fileName}</li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <p className="text-muted-foreground mb-1">Medical Bills:</p>
                    <ul className="list-disc list-inside text-foreground space-y-1">
                      {billFiles.map((file) => (
                        <li key={file.id}>{file.fileName}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="bg-card border border-border rounded-lg p-6 space-y-4">
              <h2 className="text-lg font-semibold text-foreground">
                Status & Info
              </h2>

              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-muted-foreground">Status</p>
                  <StatusBadge status={status} />
                </div>

                {isEditMode && (
                  <>
                    <div>
                      <p className="text-muted-foreground">Created by</p>
                      <p className="text-foreground">Admin User</p>
                    </div>

                    <div>
                      <p className="text-muted-foreground">Created at</p>
                      <p className="text-foreground">2025-11-20 10:30</p>
                    </div>

                    <div>
                      <p className="text-muted-foreground">Last updated</p>
                      <p className="text-foreground">2025-11-26 16:45</p>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Internal Notes */}
            <div className="bg-card border border-border rounded-lg p-6 space-y-4">
              <h2 className="text-lg font-semibold text-foreground">
                Internal Notes
              </h2>
              <Textarea
                placeholder="Add internal notes..."
                value={internalNotes}
                onChange={(e) => setInternalNotes(e.target.value)}
                rows={6}
              />
            </div>
          </div>
        </div>

        {/* Action Bar */}
        <div className="sticky bottom-0 mt-6 bg-card border border-border rounded-lg p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <Button variant="outline" onClick={() => router.push("/demand-notes")}>
            Cancel
          </Button>

          <div className="flex gap-2">
            <Button variant="outline" onClick={handleSaveDraft}>
              Save Draft
            </Button>

            <Button
              onClick={handleGenerate}
              disabled={isGenerating || !clientName || trafficFiles.length === 0}
              className="bg-primary hover:bg-primary/90"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                "Generate"
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
