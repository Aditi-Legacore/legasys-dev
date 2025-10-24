"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function NewIntakeModal({ onClose }: { onClose: () => void }) {
  const [mode, setMode] = useState<"select" | "new" | "existing">("select");
  const [name, setName] = useState("");
  const [dob, setDob] = useState("");
  const [caseType, setCaseType] = useState("");
  const [referenceId, setReferenceId] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleCreateSession = async () => {
    if (!name || !dob || !caseType) {
      setError("Please fill all required fields.");
      return;
    }
    try {
      const res = await fetch("/api/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, dateOfBirth: dob ,caseType }),
      });
      const data = await res.json();
      if (res.ok) {
        setReferenceId(data.referenceId);
        localStorage.setItem("referenceId", data.referenceId);
        localStorage.setItem("caseType", caseType);
        setError("");
      } else {
        setError(data.error || "Failed to create session");
      }
    } catch (err) {
      setError("Something went wrong");
    }
  };

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

  const handleNext = () => {
    router.push(`/intake-form?ref=${referenceId}`);
  };

  return (
    <div className="fixed inset-0 flex justify-center items-center bg-black/50 z-50">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl w-96 shadow-lg">
        {mode === "select" && (
          <div className="space-y-4">
            <button onClick={onClose} className="mt-4 text-sm text-gray-500">
          ❌
        </button>
            <h2 className="text-lg font-bold">Choose an option</h2>
            <button
              onClick={() => setMode("new")}
              className="w-full bg-blue-600 text-white py-2 rounded-lg"
            >
              New User
            </button>
            <button
              onClick={() => setMode("existing")}
              className="w-full bg-gray-600 text-white py-2 rounded-lg"
            >
              Existing User
            </button>
          </div>
        )}

        {mode === "new" && (
          <div className="space-y-3">
              <button onClick={onClose} className="mt-4 text-sm text-gray-500">
          ❌</button>
            <input
              type="text"
              placeholder="Enter Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="border w-full p-2 rounded"
            />
            <input
              type="date"
              value={dob}
              onChange={(e) => setDob(e.target.value)}
              className="border w-full p-2 rounded"
            />

            {/* Case Type Radio Buttons */}
            <div className="border rounded p-3">
              <p className="font-medium mb-2">Case Type:</p>
              <div className="space-y-1">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="caseType"
                    value="Automobile"
                    checked={caseType === "Automobile"}
                    onChange={(e) => setCaseType(e.target.value)}
                  />
                  <span>Automobile</span>
                </label>

                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="caseType"
                    value="Premises Liabilities"
                    checked={caseType === "Premises Liabilities"}
                    onChange={(e) => setCaseType(e.target.value)}
                  />
                  <span>Premises Liabilities</span>
                </label>

                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="caseType"
                    value="Dog Bite / Slip and Fall"
                    checked={caseType === "Dog Bite / Slip and Fall"}
                    onChange={(e) => setCaseType(e.target.value)}
                  />
                  <span>Dog Bite / Slip and Fall</span>
                </label>
              </div>
            </div>

            {!referenceId && (
              <button
                onClick={handleCreateSession}
                className="bg-blue-600 text-white w-full py-2 rounded-lg"
              >
                Generate Reference ID
              </button>
            )}
            {referenceId && (
              <div className="text-center">
                <p className="font-bold text-lg text-blue-700">Your Reference ID:</p>
                <p className="text-2xl font-extrabold mt-2">{referenceId}</p>
                <p className="text-sm text-gray-500">
                  ⚠️ Please save this ID for later access.
                </p>
                <button
                  onClick={handleNext}
                  className="mt-3 bg-blue-600 text-white py-2 px-4 rounded-lg"
                >
                  Next
                </button>
              </div>
            )}
            {error && <p className="text-red-600 text-sm">{error}</p>}
          </div>
        )}

        {mode === "existing" && (
          <div className="space-y-3">
            <input
              type="text"
              placeholder="Enter Reference ID"
              value={referenceId}
              onChange={(e) => setReferenceId(e.target.value)}
              className="border w-full p-2 rounded"
            />
            <button
              onClick={handleValidate}
              className="bg-blue-600 text-white w-full py-2 rounded-lg"
            >
              Continue
            </button>
            {error && <p className="text-red-600 text-sm">{error}</p>}
          </div>
        )}

        <button onClick={onClose} className="mt-4 text-sm text-gray-500">
          Cancel
        </button>
      </div>
    </div>
  );
}
