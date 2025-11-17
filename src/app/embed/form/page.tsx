'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import IntakeFormWizard from '@/components/forms/IntakeForm';
import NewIntakeModal from '@/components/NewIntakeModal';

export default function EmbedFormPage() {
  const searchParams = useSearchParams();
  const ref = searchParams.get('ref');
  const [showModal, setShowModal] = useState(!ref);

  const handleClose = () => {
    setShowModal(false);
    // If embedded in iframe, notify parent window
    if (window.self !== window.top) {
      window.parent.postMessage('closeModal', '*');
    }
  };

  const handleModalSuccess = () => {
    setShowModal(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-6 sm:py-8 lg:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {showModal ? (
          <NewIntakeModal onClose={handleClose} />
        ) : (
          <IntakeFormWizard />
        )}
      </div>
    </div>
  );
}
