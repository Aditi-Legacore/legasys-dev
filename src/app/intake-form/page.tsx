"use client";

import IntakeFormWizard from "@/components/forms/IntakeForm";

export default function IntakeFormPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto min-h-screen flex flex-col items-center justify-center">
        <IntakeFormWizard />
      </div>
    </div>
  );
}
