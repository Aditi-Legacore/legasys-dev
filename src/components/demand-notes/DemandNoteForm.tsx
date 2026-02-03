"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";
import { ChevronDown, ChevronUp } from 'lucide-react';

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

  // Basic Info States
  const [salutation, setSalutation] = useState("Mr.");
  const [firstName, setFirstName] = useState(isEditMode ? "John" : "");
  const [middleName, setMiddleName] = useState("");
  const [lastName, setLastName] = useState(isEditMode ? "Doe" : "");
  const [clientPhoneEmail, setClientPhoneEmail] = useState("");
  const [demandCreatedDate, setDemandCreatedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [dateOfLoss, setDateOfLoss] = useState("");
  const [status, setStatus] = useState<DemandNoteStatus>(
    isEditMode ? "doc-uploaded" : "initiated"
  );
  const [internalNotes, setInternalNotes] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  // Additional Info States
  const [showAdditionalInfo, setShowAdditionalInfo] = useState(false);
  const [defendantName, setDefendantName] = useState("");
  const [claimNumber, setClaimNumber] = useState("");
  const [insuranceName, setInsuranceName] = useState("");
  const [adjuster, setAdjuster] = useState("");
  const [insuranceAddress, setInsuranceAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [fax, setFax] = useState("");
  const [claimType, setClaimType] = useState("");
  const [additionalNotes, setAdditionalNotes] = useState("");

  // File States
  const [trafficFiles, setTrafficFiles] = useState<UploadedFile[]>([]);
  const [medicalFiles, setMedicalFiles] = useState<UploadedFile[]>([]);
  const [billFiles, setBillFiles] = useState<UploadedFile[]>([]);

  const directoryName = `dn_${demandCreatedDate.replace(/-/g, "_")}_${Math.random()
    .toString(36)
    .substring(2, 8)}`;

  const handleGenerate = async () => {
    try {
      setIsGenerating(true);

      // Combine first, middle, and last names
      const clientName = `${salutation} ${firstName} ${middleName ? middleName + ' ' : ''}${lastName}`.trim();

      const response = await fetch("/api/demand-notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientName,
          salutation,
          firstName,
          middleName,
          lastName,
          clientPhoneEmail,
          demandCreatedDate,
          dateOfLoss,
          internalNotes,
          status: "generated",
          // Additional info
          defendantName,
          claimNumber,
          insuranceName,
          adjuster,
          insuranceAddress,
          phone,
          fax,
          claimType,
          additionalNotes
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
              let errorData;
              try {
                errorData = await uploadResponse.json();
              } catch {
                errorData = { error: `HTTP ${uploadResponse.status}: ${uploadResponse.statusText}` };
              }
              toast.error(`Failed to upload ${fileInfo.fileName}: ${errorData.error || "Unknown error"}`);
            }
          } catch (uploadError) {
            toast.error(`Failed to upload ${fileInfo.fileName}: ${uploadError instanceof Error ? uploadError.message : "Unknown error"}`);
          }
        }
      }

      toast.success("Demand note generated & saved!");
      setStatus("generated");
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
                {isEditMode ? `Edit Demand Note – ${firstName} ${lastName}` : "New Demand Note"}
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

              {/* Date Fields - Top Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="demandCreatedDate">Demand Created Date *</Label>
                  <Input
                    id="demandCreatedDate"
                    type="date"
                    value={demandCreatedDate}
                    readOnly
                    className="bg-muted/50"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dateOfLoss">Date of Loss (DOL) *</Label>
                  <Input
                    id="dateOfLoss"
                    type="date"
                    value={dateOfLoss}
                    onChange={(e) => setDateOfLoss(e.target.value)}
                  />
                </div>
              </div>

              {/* Client Name Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="salutation">Salutation</Label>
                  <select
                    id="salutation"
                    value={salutation}
                    onChange={(e) => setSalutation(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    <option value="Mr.">Mr.</option>
                    <option value="Mrs.">Mrs.</option>
                    <option value="Ms.">Ms.</option>
                    <option value="Miss">Miss</option>
                    <option value="Dr.">Dr.</option>
                    <option value="Prof.">Prof.</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="firstName">Client First Name *</Label>
                  <Input
                    id="firstName"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Enter first name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="middleName">Middle Name</Label>
                  <Input
                    id="middleName"
                    value={middleName}
                    onChange={(e) => setMiddleName(e.target.value)}
                    placeholder="Enter middle name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input
                    id="lastName"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Enter last name"
                  />
                </div>
              </div>

              {/* Contact Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="clientPhoneEmail">Client Phone/Email *</Label>
                  <Input
                    id="clientPhoneEmail"
                    value={clientPhoneEmail}
                    onChange={(e) => setClientPhoneEmail(e.target.value)}
                    placeholder="Enter phone or email"
                  />
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

            {/* Additional Info Toggle Button */}
            <button
              type="button"
              onClick={() => setShowAdditionalInfo(!showAdditionalInfo)}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-400 rounded-md text-sm hover:bg-blue-500 transition-colors"
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
              <div className="bg-card border border-border rounded-lg p-6 space-y-6 animate-in fade-in duration-300">
                <h2 className="text-lg font-semibold text-foreground">
                  Additional Information
                </h2>
                
                <div className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="defendantName">Defendant Name</Label>
                      <Input
                        id="defendantName"
                        value={defendantName}
                        onChange={(e) => setDefendantName(e.target.value)}
                        placeholder="Enter defendant name"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="claimNumber">Claim Number</Label>
                      <Input
                        id="claimNumber"
                        value={claimNumber}
                        onChange={(e) => setClaimNumber(e.target.value)}
                        placeholder="Enter claim number"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="insuranceName">Insurance Company Name</Label>
                      <Input
                        id="insuranceName"
                        value={insuranceName}
                        onChange={(e) => setInsuranceName(e.target.value)}
                        placeholder="Enter insurance company name"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="adjuster">Adjuster</Label>
                      <Input
                        id="adjuster"
                        value={adjuster}
                        onChange={(e) => setAdjuster(e.target.value)}
                        placeholder="Enter adjuster name"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="insuranceAddress">Insurance Company Address</Label>
                    <Input
                      id="insuranceAddress"
                      value={insuranceAddress}
                      onChange={(e) => setInsuranceAddress(e.target.value)}
                      placeholder="Enter insurance company address"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="Enter phone number"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="fax">Fax</Label>
                      <Input
                        id="fax"
                        value={fax}
                        onChange={(e) => setFax(e.target.value)}
                        placeholder="Enter fax number"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="claimType">Claim Type</Label>
                      <select
                        id="claimType"
                        value={claimType}
                        onChange={(e) => setClaimType(e.target.value)}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
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
                      value={additionalNotes}
                      onChange={(e) => setAdditionalNotes(e.target.value)}
                      placeholder="Enter any additional notes"
                      rows={4}
                      className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 min-h-[80px]"
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
              disabled={isGenerating || !firstName || trafficFiles.length === 0}
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
