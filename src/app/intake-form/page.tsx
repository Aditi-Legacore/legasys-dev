"use client";

// Update the import path below to the correct relative path based on your project structure.
// For example, if IntakeForm.tsx is at src/components/forms/IntakeForm.tsx, use the following:
import IntakeFormWizard from "../../components/forms/IntakeForm";

export default function Home() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 flex flex-col items-center justify-center p-6">
      <IntakeFormWizard />
    </div>
  );
}