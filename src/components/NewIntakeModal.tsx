"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Button } from "./ui/button";

export default function NewIntakeModal({ onClose }: { onClose: () => void }) {
  const [mode, setMode] = useState<"existing" | "new" | "select">("select");
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

        {mode === "new" ? (
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

        <input
          type="email"
          placeholder="Email Address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border rounded-lg p-2 w-full"
        />

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
