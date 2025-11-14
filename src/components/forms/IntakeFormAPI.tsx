"use client";

import { useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { IntakeFormData, intakeFormSchema } from "../../lib/formValidationSchemas";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";

// Extend the session user type to include 'id'
import type { DefaultUser } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: DefaultUser & { id?: string | null };
  }
  interface User extends DefaultUser {
    id?: string | null;
  }
}

interface Payload {
  phoneNumber?: string;
  dateOfBirth?: string | null;
  userId?: string | null;
  referenceId?: string | null;
  [key: string]: unknown;
}

export default function IntakeFormAPI() {
  const searchParams = useSearchParams();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [referenceId, setReferenceId] = useState<string | null>(null);

  const methods = useForm<IntakeFormData>({
    resolver: zodResolver(intakeFormSchema),
    mode: "onBlur",
  });
  const { data: session } = useSession();

  // Set referenceId on mount
  useState(() => {
    const refFromUrl = searchParams.get("ref");
    setReferenceId(refFromUrl || null);
  });

  const onSubmit = async (data: IntakeFormData) => {
    console.log("🚀 API Form submission attempted with data:", data);
    setIsSubmitting(true);

    try {
      const payload: Payload = {
        ...data,
        phoneNumber: data.phone,
        dateOfBirth: data.dob ? new Date(data.dob).toISOString() : null,
        userId: session?.user?.id || null,
        referenceId: referenceId || null,
      };

      delete payload.phone;
      delete payload.dob;

      const response = await fetch("/api/intake", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("❌ Server error:", errorText);
        throw new Error("Failed to save intake");
      }

      const savedData = await response.json();
      console.log("✅ Intake form saved:", savedData);

      toast.success("✅ Intake submitted successfully!");
    } catch (error) {
      console.error("❌ Error saving intake:", error);
      toast.error("⚠️ There was an error saving the form.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <FormProvider {...methods}>
      <div className="w-full mx-auto max-w-4xl">
        <div className="border border-gray-300 dark:border-gray-600 rounded-xl">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              methods.handleSubmit(onSubmit, (errors) => {
                console.log("❌ Validation failed:", errors);
              })();
            }}
            className="bg-white dark:bg-gray-900 p-4 sm:p-6 lg:p-8 rounded-xl shadow-xl"
          >
            <h2 className="text-center mb-8">API Intake Form</h2>

            {/* Simplified form fields for API submission */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Client Name</label>
                <input
                  {...methods.register("clientName")}
                  className="w-full p-2 border rounded"
                  placeholder="Enter client name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input
                  {...methods.register("email")}
                  type="email"
                  className="w-full p-2 border rounded"
                  placeholder="Enter email"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Phone</label>
                <input
                  {...methods.register("phone")}
                  className="w-full p-2 border rounded"
                  placeholder="Enter phone number"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Accident Description</label>
                <textarea
                  {...methods.register("accidentDescription")}
                  className="w-full p-2 border rounded"
                  placeholder="Describe the accident"
                />
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t mt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition disabled:opacity-50"
              >
                {isSubmitting ? "Submitting..." : "Submit"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </FormProvider>
  );
}
