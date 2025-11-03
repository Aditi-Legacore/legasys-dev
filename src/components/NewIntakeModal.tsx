"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";


export default function NewIntakeModal({ onClose }: { onClose: () => void }) {
  const [mode, setMode] = useState<"select" | "new" | "existing">("select");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
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
        body: JSON.stringify({ name, dateOfBirth: dob ,caseType,email }),
      });
      const data = await res.json();
      if (res.ok) {
        setReferenceId(data.referenceId);
        localStorage.setItem("referenceId", data.referenceId);
        localStorage.setItem("caseType", caseType);
        localStorage.setItem("caseType", email);
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

  const handleNext = async () => {
    try {
      const templatesResponse = await fetch('/api/form-templates');
      if (!templatesResponse.ok) {
        throw new Error('Failed to fetch templates');
      }
      const templates = await templatesResponse.json();
      const matchingTemplate = templates.find((template: any) => template.title === caseType);
      if (matchingTemplate) {
        const submissionResponse = await fetch('/api/forms', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            templateId: matchingTemplate.id,
            data: {},
          }),
        });
        if (submissionResponse.ok) {
          const submission = await submissionResponse.json();
          router.push(`/forms/${submission.id}/fill`);
        } else {
          setError('Failed to create form submission');
        }
      } else {
        setError('No form template found for this case type');
      }
    } catch (err) {
      setError('Something went wrong while creating the form');
    }
  };

  return (
    <div className="fixed inset-0 flex justify-center items-center bg-black/50 z-50">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl w-96 shadow-lg">
        {mode === "select" && (
          <div className="space-y-4">
            <button onClick={onClose} className="mt-4 text-sm text-gray-500">
              ❌
            </button>
            <h2 className="font-bold text-center text-xl">Choose an option</h2>
            <button
              onClick={() => setMode("new")}
              className="w-full bg-blue-600 text-white py-2 rounded-lg"
            >
              New Intake
            </button>
            <button
              onClick={() => setMode("existing")}
              className="w-full bg-gray-600 text-white py-2 rounded-lg"
            >
              Existing Intake
            </button>
          </div>
        )}

        {mode === "new" && (
          <div className="space-y-3">
            <button onClick={onClose} className="mt-4 text-sm text-gray-500">
              ❌
            </button>
            <input
              type="text"
              placeholder="Enter Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="border w-full p-2 rounded"
            />
            <div className="w-full p-2 rounded">

              <DatePicker
                selected={dob ? new Date(dob) : null}
                onChange={(date) => {
                  if (date) {
                    const month = (date.getMonth() + 1).toString().padStart(2, "0");
                    const day = date.getDate().toString().padStart(2, "0");
                    const year = date.getFullYear();
                    const formattedDate = `${month}/${day}/${year}`;
                    setDob(formattedDate);
                  } else {
                    setDob("");
                  }
                }}
                dateFormat="MM/dd/yyyy"
                placeholderText="mm/dd/yyyy"
                className="border w-full p-2 rounded bg-white text-gray-900 dark:bg-gray-800 dark:text-gray-100"
            />
            </div>

            <input
              type="text"
              placeholder="Enter Mail Id"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="border w-full p-2 rounded"
            />

            {/* Case Type Radio Buttons */}
            <div className="border rounded p-3">
              <p className="font-medium mb-2">Case Type:</p>
              <div className="space-y-1 pl-4">
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
