"use client";

// Update the import path below to the correct relative path based on your project structure.
// For example, if IntakeForm.tsx is at src/components/forms/IntakeForm.tsx, use the following:
import IntakeFormWizard from "../../components/forms/IntakeForm";
import { useState } from "react";
import UserAuth from "@/components/UserAuth";


export default function IntakePage() {
  const [userAuthenticated, setUserAuthenticated] = useState(false);
  const [userUniqueId, setUserUniqueId] = useState("");
  const [draftData, setDraftData] = useState<any>(null);

  const handleUserAuthenticated = (uniqueId: string, hasDraft?: boolean, draftData?: any) => {
    setUserUniqueId(uniqueId);
    setDraftData(draftData);
    setUserAuthenticated(true);
  };

  if (!userAuthenticated) {
    return <UserAuth onUserAuthenticated={handleUserAuthenticated} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <IntakeFormWizard 
        userUniqueId={userUniqueId}
        draftData={draftData}
      />
    </div>
  );
}