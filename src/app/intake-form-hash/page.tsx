"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import IntakeFormWizard from "@/components/forms/IntakeForm";
import NewIntakeModal from "@/components/NewIntakeModal";

export default function IntakeFormHashPage() {
  const searchParams = useSearchParams();
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const ref = searchParams.get("ref");
    if (ref) {
      setShowModal(true);
    }
  }, [searchParams]);

  const decodedRef = searchParams.get("ref") || undefined;

  return (
    <>
      <IntakeFormWizard />
      {showModal && (
        <NewIntakeModal
          onClose={() => setShowModal(false)}
          expectedRef={decodedRef}
          onValidateSuccess={() => setShowModal(false)}
        />
      )}
    </>
  );
}
