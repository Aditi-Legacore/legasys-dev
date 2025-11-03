"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Button } from "./ui/button";

export default function NewIntakeModal({ onClose }: { onClose: () => void }) {
  const [mode, setMode] = useState<"existing" | "new">("existing");
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
        body: JSON.stringify({ name, dateOfBirth: dob, caseType, email }),
      });
      const data = await res.json();

      if (res.ok) {
        setReferenceId(data.referenceId);
        localStorage.setItem("referenceId", data.referenceId);
        localStorage.setItem("caseType", caseType);
        localStorage.setItem("email", email);
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
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
  <div className="bg-white dark:bg-gray-900 rounded-2xl w-[420px] p-6 shadow-2xl border border-gray-200 dark:border-gray-700">
    {/* Header */}
    <div className="flex justify-between items-center mb-4">
      <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">Intake Portal</h2>
      <button onClick={onClose} className="text-gray-400 hover:text-red-600 text-lg">✕</button>
    </div>

    {/* Tabs */}
    <div className="flex mb-6 border-b border-gray-200 dark:border-gray-700">
      <button
        onClick={() => setMode("existing")}
        className={`w-1/2 py-2 text-center font-medium transition-all ${
          mode === "existing"
            ? "border-b-2 border-blue-600 text-blue-600"
            : "text-gray-500 hover:text-blue-500"
        }`}
      >
        Existing Intake
      </button>
      <button
        onClick={() => setMode("new")}
        className={`w-1/2 py-2 text-center font-medium transition-all ${
          mode === "new"
            ? "border-b-2 border-blue-600 text-blue-600"
            : "text-gray-500 hover:text-blue-500"
        }`}
      >
        New Intake
      </button>
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
        <button
          onClick={handleValidate}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition"
        >
          Continue
        </button>

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
      <div className="space-y-4 animate-fadeIn">
        <input
          type="text"
          placeholder="Full Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="border rounded-lg p-2 w-full"
        />

        <DatePicker
          selected={dob ? new Date(dob) : null}
          onChange={(date) => {
            if (date) {
              const month = (date.getMonth() + 1).toString().padStart(2, "0");
              const day = date.getDate().toString().padStart(2, "0");
              const year = date.getFullYear();
              setDob(`${month}/${day}/${year}`);
            } else setDob("");
          }}
          dateFormat="MM/dd/yyyy"
          placeholderText="mm/dd/yyyy"
          className="border rounded-lg p-2 w-full"
        />

        <input
          type="email"
          placeholder="Email Address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border rounded-lg p-2 w-full"
        />

        <div className="border rounded-lg p-3">
          <p className="text-sm font-semibold mb-2">Case Type</p>
          {["Automobile", "Premises Liabilities", "Dog Bite / Slip and Fall"].map((type) => (
            <label key={type} className="flex items-center gap-2 mb-1">
              <input
                type="radio"
                name="caseType"
                value={type}
                checked={caseType === type}
                onChange={(e) => setCaseType(e.target.value)}
              />
              <span>{type}</span>
            </label>
          ))}
        </div>

        {!referenceId ? (
          <Button
            onClick={handleCreateSession}
            className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg font-semibold"
          >
            Generate Reference ID
          </Button>
        ) : (
          <div className="text-center">
            <p className="text-blue-700 font-semibold">Your Reference ID:</p>
            <p className="text-2xl font-bold">{referenceId}</p>
            <p className="text-xs text-gray-500 mt-1">Save this for later access.</p>
            <Button
              onClick={handleNext}
              className="mt-3 w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg"
            >
              Continue
            </Button>
          </div>
        )}
      </div>
    )}
  </div>
</div>

  );
}
