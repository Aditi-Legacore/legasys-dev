"use client";

import { useRef, useEffect, useState } from "react";
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
import { useSession } from "next-auth/react";

// Extend the session user type to include 'id'
import type { DefaultUser } from "next-auth";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

declare module "next-auth" {
  interface Session {
    user: DefaultUser & { id?: string | null };
  }
  interface User extends DefaultUser {
    id?: string | null;
  }
}



const steps = [
  "PLAINTIFF INFORMATION",
  "ACCIDENT INFORMATION",
  "DEFENDANT INFORMATION",
  "CLIENT INSURANCE INFORMATION",
  "MEDICAL TREATMENT",
  "INJURIES",
  "Submit",
];

// 👇 Define the fields to validate at each step
const stepFields: (keyof IntakeFormData)[][] = [
  ["clientName", "email","gender","phone"], // Step 1
  ["accidentDate", "accidentLocation","accidentDescription"], // Step 2
  ["defendant1Name"], // Step 3
  ["healthAddress"], // Step 4
  ["doctorHospital1","ambulance","admitted"], // Step 5
  ["bodyPartsAffected"], // Step 6
  [], // Step 7 (Submit)
];

interface IntakeFormWizardProps {
  onFormSubmit?: (data: IntakeFormData) => void;
}

export default function IntakeFormWizard({ onFormSubmit }: IntakeFormWizardProps) {
  const [step, setStep] = useState(0);
  //  const [isSubmitting, setIsSubmitting] = useState(false);

  const methods = useForm<IntakeFormData>({
    resolver: zodResolver(intakeFormSchema),
    mode: "onBlur",
  });
  const { data: session } = useSession();

  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    
    if (session?.user) {
      methods.setValue("clientName", session.user.name || "");
      methods.setValue("email", session.user.email || "");
    }
    if (containerRef.current) {
      containerRef.current.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [session, methods,step]);
  

  const router = useRouter();

  // ✅ Scroll to top whenever step changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [step]);

  const onSubmit = async (data: IntakeFormData) => {
    try {
      const response = await fetch("/api/intake", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          userId: session?.user?.id || null,
        }),
      });

      if (!response.ok) {
        const errorDetails = await response.text();
        console.error("❌ Server Error:", errorDetails);
        throw new Error("Failed to submit form");
      }

      const savedData = await response.json();
      console.log("✅ Intake form saved:", savedData);

      toast.success("✅ Intake form saved successfully!");

      setTimeout(() => {
        router.push("/");
      }, 1000);
    } catch (error) {
      console.error(
        "❌ Form submission failed:",
        error instanceof Error ? error.message : error
      );
      toast.error("⚠️ There was an error submitting the form. Please try again.");
    }
  };

  
  // ✅ Validate current step before moving to the next
  const nextStep = async () => {
    const fieldsToValidate = stepFields[step];

    if (fieldsToValidate.length > 0) {
      const isValid = await methods.trigger(fieldsToValidate);
      if (!isValid) {
        toast.error("Please fill in all required fields before proceeding.");
        return; // ❌ Stop if validation fails
      }
    }

    setStep((s) => s + 1);
  };


  // const nextStep = () => setStep((s) => s + 1);
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
      <div
  ref={containerRef}
  className="max-h-[80vh] overflow-auto"   // 👈 make this container scrollable
>
      <form
        onSubmit={methods.handleSubmit(onSubmit)}
        className="max-w-4xl bg-white dark:bg-gray-900 p-8 rounded-xl shadow-xl transition-all duration-300"
      >
        {/* Header */}
        <h2 className="text-2xl font-bold text-center dark:text-white text-gray-800 mb-8">
          Step {step + 1}: {steps[step]}
        </h2>

        {/* Step indicators */}
        <div className="flex justify-between mb-6 mx-auto w-full max-w-3xl">
          {steps.map((label, index) => (
            <div
              key={label}
              onClick={() => setStep(index)}
              className={`flex-1 text-center text-xs sm:text-sm font-semibold cursor-pointer transition 
                ${index <= step ? "text-indigo-500 dark:text-indigo-400" : "text-gray-400"}`}
            >
              <div
                className={`w-8 h-8 mx-auto mb-1 rounded-full flex items-center justify-center ${
                  index <= step ? "bg-indigo-500 text-white" : "bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-300"
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
        <div className="flex justify-between pt-4 border-t mt-4 dark:border-gray-700">
          {step > 0 && (
            <button
              type="button"
              onClick={prevStep}
              className="px-5 py-2 bg-gray-300 dark:border-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-400 transition"
            >
              Back
            </button>
          )}
          {step < steps.length - 1 && (
            <button
              type="button"
              onClick={nextStep}
              className="ml-auto  px-5 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
            >
              Next
            </button>
          )}
        </div>
      </form>
      </div>
    </FormProvider>
  );
}
