"use client";

import { useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { IntakeFormData, intakeFormSchema } from "../../lib/formValidationSchemas";
import PlaintiffInfoStep from "./formSteps/PlaintiffInfoStep";
import AccidentInfoStep from "./formSteps/AccidentInfoStep";
import DefendantInfoStep from "./formSteps/DefendantInfoStep";
import ClientInsuranceStep from "./formSteps/ClientInsuranceStep";
import MedicalTreatmentStep from "./formSteps/MedicalTreatmentStep";
import InjuriesStep from "./formSteps/InjuriesStep";
import SubmitStep from "./formSteps/SubmitStep";


// Import Step Components
// Ensure the file exists at ./formSteps/PlaintiffInfoStep.tsx or adjust the import path/casing accordingly


const steps = [
  "PLAINTIFF INFORMATION",
  "ACCIDENT INFORMATION",
  "DEFENDANT INFORMATION",
  "CLIENT INSURANCE INFORMATION",
  "MEDICAL TREATMENT",
  "INJURIES",
  "Submit",
];

interface IntakeFormWizardProps {
  onFormSubmit?: (data: IntakeFormData) => void;
}

export default function IntakeFormWizard({ onFormSubmit }: IntakeFormWizardProps) {
  const [step, setStep] = useState(0);

  const methods = useForm<IntakeFormData>({
    resolver: zodResolver(intakeFormSchema),
    mode: "onBlur",
  });

  const onSubmit = (data: IntakeFormData) => {
    if (onFormSubmit) onFormSubmit(data);
    else {
      console.log("Form submitted:", data);
      alert("✅ Intake form submitted successfully!");
    }
  };

  const nextStep = () => setStep((s) => s + 1);
  const prevStep = () => setStep((s) => s - 1);

  const renderStep = () => {
    switch (step) {
      case 0: return <PlaintiffInfoStep />;
      case 1: return <AccidentInfoStep />;
      case 2: return <DefendantInfoStep />;
      case 3: return <ClientInsuranceStep />;
      case 4: return <MedicalTreatmentStep />;
      case 5: return <InjuriesStep />;
      case 6: return <SubmitStep />;
      default: return null;
    }
  };

  return (
    <FormProvider {...methods}>
      <form
        onSubmit={methods.handleSubmit(onSubmit)}
        className="max-w-4xl bg-white p-8 rounded-xl shadow-xl transition-all duration-300"
      >
        {/* Header */}
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-8">
          Step {step + 1}: {steps[step]}
        </h2>

        {/* Step indicators */}
        <div className="flex justify-between mb-6 mx-auto w-full max-w-3xl">
          {steps.map((label, index) => (
            <div
              key={label}
              onClick={() => setStep(index)}
              className={`flex-1 text-center text-xs sm:text-sm font-semibold cursor-pointer transition 
                ${index <= step ? "text-indigo-500" : "text-gray-400"}`}
            >
              <div
                className={`w-8 h-8 mx-auto mb-1 rounded-full flex items-center justify-center ${
                  index <= step ? "bg-indigo-500 text-white" : "bg-gray-200 text-gray-500"
                }`}
              >
                {index + 1}
              </div>
              {label}
            </div>
          ))}
        </div>

        {/* Step Content */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          {renderStep()}
        </motion.div>

        {/* Buttons */}
        <div className="flex justify-between pt-4 border-t mt-4">
          {step > 0 && (
            <button
              type="button"
              onClick={prevStep}
              className="px-5 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition"
            >
              Back
            </button>
          )}
          {step < steps.length - 1 && (
            <button
              type="button"
              onClick={nextStep}
              className="ml-auto px-5 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
            >
              Next
            </button>
          )}
        </div>
      </form>
    </FormProvider>
  );
}
