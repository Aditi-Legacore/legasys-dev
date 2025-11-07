"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import QuickIntakeForm from "./forms/QuickIntakeForm";
import { Button } from "@/components/ui/button";

export default function NewIntakeModal({ onClose }: { onClose: () => void }) {
  const [mode, setMode] = useState<"existing" | "new">("existing");
  const [referenceId, setReferenceId] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleValidate = async () => {
    try {
      const res = await fetch("/api/session/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ referenceId }),
      });
      const data = await res.json();

      if (res.ok) {
        localStorage.setItem("draftData", JSON.stringify(data.intakeInfo || {}));
        router.push(`/intake-form?ref=${referenceId}`);
      } else {
        setError(data.error || "Invalid reference ID");
      }
    } catch (err) {
      setError("Something went wrong");
    }
  };



  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
  <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-2xl p-6 shadow-2xl border border-gray-200 dark:border-gray-700">
    {/* Header */}
    <div className="flex justify-between items-center mb-4">
      <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">Intake</h2>
      <Button variant="ghost" size="icon" onClick={onClose} className="text-gray-400 hover:text-red-600 text-lg">✕</Button>
    </div>

    {/* Tabs */}
    <div className="flex mb-6 border-b border-gray-200 dark:border-gray-700">
      <Button
        variant="ghost"
        onClick={() => setMode("existing")}
        className={`w-1/2 py-2 text-center font-medium transition-all ${
          mode === "existing"
            ? "border-b-2 border-blue-600 text-blue-600"
            : "text-gray-500 hover:text-blue-500"
        }`}
      >
        Existing Intake
      </Button>
      <Button
        variant="ghost"
        onClick={() => setMode("new")}
        className={`w-1/2 py-2 text-center font-medium transition-all ${
          mode === "new"
            ? "border-b-2 border-blue-600 text-blue-600"
            : "text-gray-500 hover:text-blue-500"
        }`}
      >
        New Intake
      </Button>
    </div>

    {/* Form */}
    {mode === "existing" ? (
      <div className="space-y-4">
        <input
          type="text"
          placeholder="Enter Reference ID"
          value={referenceId}
          onChange={(e) => setReferenceId(e.target.value)}
          className="border rounded-lg p-2 w-full focus:ring-2 focus:ring-blue-500"
        />
        <Button
          onClick={handleValidate}
          className="w-full"
        >
          Continue
        </Button>

        <p className="text-center text-sm text-gray-500 mt-2">
          Need a new one?{" "}
          <span
            onClick={() => setMode("new")}
            className="text-blue-600 hover:underline cursor-pointer"
          >
            Create New Intake
          </span>
        </p>

        {error && <p className="text-red-600 text-sm text-center">{error}</p>}
      </div>
    ) : (
      <QuickIntakeForm onClose={onClose} />
    )}
  </div>
</div>

  );
}
