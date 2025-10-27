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
// import InjuriesStep from "./formSteps/InjuriesStep";
import SubmitStep from "./formSteps/SubmitStep";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";

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
  "Submit",
];

// 👇 Define the fields to validate at each step
const stepFields: (keyof IntakeFormData)[][] = [
  ["clientName", "email", "gender", "phone"], // Step 1
  ["accidentDate", "accidentLocation", "accidentDescription"], // Step 2
  ["defendant1Name"], // Step 3
  [], // Step 4 (Client Insurance - no required fields)
  [], // Step 5 (Medical Treatment - no required fields)
  [], // Step 6 (Submit)
];

interface IntakeFormWizardProps {
  onFormSubmit?: (data: IntakeFormData) => void;
}

export default function IntakeFormWizard({ onFormSubmit }: IntakeFormWizardProps) {
  const searchParams = useSearchParams();
  //code for fetch draft
  //  const referenceId = searchParams.get("ref");
  const [draft, setDraft] = useState(null);

  const intakeId = searchParams.get("id");  // 👈 get ID from URL
  const [isLoadingExistingData, setIsLoadingExistingData] = useState(false);
  const [step, setStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({});
const referenceId = localStorage.getItem("referenceId");

// Prefill draft if exists
  useEffect(() => {
    const draftData = localStorage.getItem("draftData");
    if (draftData) {
      setFormData(JSON.parse(draftData));
    }
  }, []);

const handleSaveDraft = async () => {
    try {
      if (!referenceId) {
        toast.error("No reference ID found. Please start a new session.");
        return;
      }

      const currentFormData = methods.getValues();

      const res = await fetch("/api/intake/draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ referenceId, ...currentFormData }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.error(`Failed to save draft: ${res.status} ${res.statusText}`, errorText);
        throw new Error(`Failed to save draft: ${res.statusText}`);
      }
      toast.success("Draft saved successfully!");
    } catch (err) {
      console.error(err);
      toast.error("Error saving draft.");
    }
  };


  const methods = useForm<IntakeFormData>({
    resolver: zodResolver(intakeFormSchema),
    mode: "onBlur",
  });
  const { data: session } = useSession();

  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (referenceId) {
      fetch("/api/session/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ referenceId }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (!data.error) {
            setDraft(data.intakeInfo); // or adjust based on your structure
          }
        });
    }
  }, [referenceId]);

  // Populate form with draft data when draft is loaded
  useEffect(() => {
    if (draft) {
      const mappedData = {
        ...draft,
        phone: draft.phoneNumber || '',
        dob: draft.dateOfBirth ? new Date(draft.dateOfBirth).toISOString().split('T')[0] : '',
        phoneNumber: draft.phoneNumber || '',
        dateOfBirth: draft.dateOfBirth ? new Date(draft.dateOfBirth).toISOString().split('T')[0] : '',
      };

      Object.keys(mappedData).forEach((key) => {
        if (mappedData[key] !== null && mappedData[key] !== undefined) {
          methods.setValue(key as keyof IntakeFormData, mappedData[key]);
        }
      });
    }
  }, [draft, methods]);

  
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
  if (intakeId) {
    const fetchIntake = async () => {
      try {
        setIsLoadingExistingData(true);
        const res = await fetch(`/api/intake/${intakeId}`);
        if (!res.ok) throw new Error("Failed to fetch intake data");
        const data = await res.json();

        // Map database fields back to form fields
        const mappedData = {
          ...data,
          phone: data.phoneNumber || '',
          dob: data.dateOfBirth ? new Date(data.dateOfBirth).toISOString().split('T')[0] : '',
          phoneNumber: data.phoneNumber || '',
          dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth).toISOString().split('T')[0] : '',
        };

        Object.keys(mappedData).forEach((key) => {
          if (mappedData[key] !== null && mappedData[key] !== undefined) {
            methods.setValue(key as keyof IntakeFormData, mappedData[key]);
          }
        });
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoadingExistingData(false);
      }
    };
    fetchIntake();
  }
}, [session, intakeId, methods]);  // ✅ Removed "step" here

  

  const router = useRouter();

  // ✅ Scroll to top whenever step changes
  // 👇 Add this effect for scrolling on step change
useEffect(() => {
  if (containerRef.current) {
    containerRef.current.scrollTo({ top: 0, behavior: "smooth" });
  } else {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
}, [step]);

useEffect(() => {
  const draft = localStorage.getItem("draftData");
  if (draft) {
    setFormData(JSON.parse(draft));
  }
}, []);

  // new code for update field added to fetch data from database

  const onSubmit = async (data: IntakeFormData) => {
  console.log("🚀 Form submission attempted with data:", data);
  console.log("Session user ID:", session?.user?.id);
  setIsSubmitting(true);

  try {
    const method = intakeId ? "PUT" : "POST";
    const url = intakeId ? `/api/intake/${intakeId}` : `/api/intake`;

    console.log(`📡 Sending ${method} request to ${url}`);

  const payload = {
  ...data,
  phoneNumber: data.phone,
  dateOfBirth: data.dob ? new Date(data.dob).toISOString() : null, // ✅ only convert if dob exists
  userId: session?.user?.id || null,
};

delete (payload as any).phone;
delete payload.dob;

const response = await fetch(intakeId ? `/api/intake/${intakeId}` : `/api/intake`, {
  method: intakeId ? "PUT" : "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(payload),
});


    console.log("Response status:", response.status);
    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ Server error:", errorText);
      throw new Error("Failed to save intake");
    }

    const savedData = await response.json();
    console.log("✅ Intake form saved:", savedData);

    // Email notification is handled in the API route

    toast.success(intakeId ? "✅ Intake updated successfully!" : "✅ Intake created successfully!");
    router.push("/intake-list");
  } catch (error) {
    console.error("❌ Error saving intake:", error);
    toast.error("⚠️ There was an error saving the form.");
  } finally {
    setIsSubmitting(false);
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

    try {
      if (!referenceId) {
        toast.error("No reference ID found. Please start a new session.");
        return;
      }

      const currentFormData = methods.getValues();

      const res = await fetch("/api/intake/draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ referenceId, ...currentFormData }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.error(`Failed to save draft: ${res.status} ${res.statusText}`, errorText);
        throw new Error(`Failed to save draft: ${res.statusText}`);
      }
      console.log("Draft saved successfully!");
      toast.success("Draft saved successfully!");
    } catch (err) {
      console.error(err);
      toast.error("Error saving draft.");
    }
    // try {
    //   if (!referenceId) {
    //     toast.error("No reference ID found. Please start a new session.");
    //     return;
    //   }

    //   const currentFormData = methods.getValues();

    //   const res = await fetch("/api/intake/draft", {
    //     method: "POST",
    //     headers: { "Content-Type": "application/json" },
    //     body: JSON.stringify({ referenceId, ...currentFormData }),
    //   });

    //   if (!res.ok) {
    //     const errorText = await res.text();
    //     console.error(`Failed to save draft: ${res.status} ${res.statusText}`, errorText);
    //     throw new Error(`Failed to save draft: ${res.statusText}`);
    //   }
    //   console.log("Draft saved successfully!");
    //   // alert("Draft saved successfully!");
      
    //   toast.success("Draft saved successfully!");
    // } catch (err) {
    //   console.error(err);
    //   toast.error("Error saving draft.");
    // }
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
      // case 5: return <InjuriesStep />;
      case 5: return <SubmitStep isSubmitting={isSubmitting} />;
      default: return null;
    }
  };

  const handleFinalSubmit = async () => {
    const isValid = await methods.trigger(); // validate all known fields
    if (!isValid) {
      toast.error("Please fill in all required fields before submitting.");
      return;
    }

    methods.handleSubmit(onSubmit)();
  };

  // 🌀 Show loader while data is loading
  if (isLoadingExistingData) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <FormProvider {...methods}>
      <div
        ref={containerRef}
        className="w-full mx-auto max-h-[80vh] overflow-auto"
      >
        <form
          onSubmit={(e) => {
            console.log("Form onSubmit triggered");
            e.preventDefault();
            console.log("Calling methods.handleSubmit(onSubmit)");
            methods.handleSubmit(onSubmit, (errors) => {
              console.log("❌ Validation failed:", errors);
            })();
          }}
          className="bg-white dark:bg-gray-900 p-4 sm:p-6 lg:p-8 rounded-xl shadow-xl transition-all duration-300"
        >
        <input type="hidden" {...methods.register("hearAboutUs")} />
        <input type="hidden" {...methods.register("hearAboutUsDetail")} />

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
                ${index === step ? "block" : "hidden sm:block"}
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
              className="px-5 py-2 bg-gray-300 dark:border-gray-300 text-gray-800 dark:text-gray-900 rounded-lg hover:bg-gray-400 transition"
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
          {/* 💾 Save Draft Button */}
      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleSaveDraft}
          className="ml-auto  px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          Save Draft
        </button>
      </div>
        </div>
      </form>
      </div>
    </FormProvider>
  );
}
