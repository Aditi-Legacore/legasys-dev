"use client";

import IntakeFormWizard from "@/src/components/forms/IntakeForm";

export default function Home() {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6">
        
        <IntakeFormWizard />
      </div>
    );
  }