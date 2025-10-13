import { useState } from "react";
import { useForm, FormProvider, FieldError } from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { useFormContext } from "react-hook-form";
import { IntakeFormData, intakeFormSchema } from "../../lib/formValidationSchemas";

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
    if (onFormSubmit) {
      onFormSubmit(data);
    } else {
      console.log("Form submitted:", data);
      alert("✅ Intake form submitted successfully!");
    }
  };

  const nextStep = () => setStep((s) => s + 1);
  const prevStep = () => setStep((s) => s - 1);

  return (
    <FormProvider {...methods}>
      <form
    onSubmit={methods.handleSubmit(onSubmit)}
    className=" max-w-4xl bg-white p-8 rounded-xl shadow-xl transition-all duration-300"
  >
        {/* Header */}
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-8">
          Step {step + 1}: {steps[step]}
        </h2>

        {/* Step indicators with clickable function */}
        <div className="flex justify-between mb-6 mx-auto w-full max-w-3xl">
        {steps.map((label, index) => (
            <div
            key={label}
            onClick={() => setStep(index)}  // 👈 Go to that step on click
            className={`flex-1 text-center text-xs sm:text-sm font-semibold cursor-pointer transition ${
                index <= step ? "text-indigo-500" : "text-gray-400"
            }`}
            >
            <div
                className={`w-8 h-8 mx-auto mb-1 rounded-full flex items-center justify-center ${
                index <= step
                    ? "bg-indigo-500 text-white"
                    : "bg-gray-200 text-gray-500"
                }`}
            >
                {index + 1}
            </div>
            {label}
            </div>
        ))}
        </div>


        {/* Step 1 */}
        {step === 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4 w-full">
            <InputField name="clientName" label="Client Name" />
            <RadioGroup name="gender" label="Gender" options={["Male", "Female"]} />
            <InputField name="dob" label="Date of Birth" type="date" />
            <InputField name="phone" label="Phone" />
            <InputField name="email" label="Email" type="email" />
            <InputField name="address" label="Address" />
            <div className="grid grid-cols-2 gap-4">
              <InputField name="city" label="City" />
              <InputField name="zip" label="Zip" />
            </div>
          </motion.div>
        )}

        {/* Step 2 */}
        {step === 1 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4 w-full">
            <InputField name="accidentDate" label="Date of Accident" type="date" />
            <InputField name="accidentTime" label="Time" type="time" />
            <RadioGroup name="caseType" label="Type of Case" options={["Auto Accident", "Slip & Fall", "Other"]} />
            <InputField name="policeCase" label="Police Dept. & Case No." />
            <InputField name="accidentLocation" label="Location" />
            <RadioGroup name="seatBelt" label="Wearing Seat Belt?" options={["Yes", "No"]} />
            <InputField name="seatBeltReason" label="If No, Why?" />
            <TextareaField name="accidentDescription" label="Accident Description" />
          </motion.div>
        )}

        {/* Step 3 */}
        {step === 2 && (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-8 w-full"
        >
            {/* Defendant #1 / Driver */}
            <h2 className="text-xl font-semibold text-gray-500 pb-2">
            Defendant #1 / Driver
            </h2>

            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField name="defendant1Name" label="Name" />
            <InputField name="defendant1Phone" label="Phone" />
            <InputField name="defendant1Address" label="Address" />
            <InputField name="defendant1Carrier" label="Carrier" />
            <InputField name="defendant1CarrierPhone" label="Carrier Phone" />
            <InputField name="defendant1Policy" label="Policy #" />
            <InputField name="defendant1Claim" label="Claim #" />
            <InputField name="defendant1Adjuster" label="Adjuster" />
            <InputField name="defendant1Insured" label="Insured" />
            </div>

            {/* Vehicle Info */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <InputField name="defendant1Year" label="Year" />
            <InputField name="defendant1Make" label="Make" />
            <InputField name="defendant1Model" label="Model" />
            </div>

            {/* Damage */}
            <TextareaField name="defendant1Damage" label="Damage" />

            {/* Defendant #2 / Owner */}
            <h2 className="text-xl font-semibold text-gray-500 pb-2 pt-6">
            Defendant #2 / Owner
            </h2>

            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField name="defendant2Name" label="Name" />
            <InputField name="defendant2Phone" label="Phone" />
            <InputField name="defendant2Address" label="Address" />
            <InputField name="defendant2Carrier" label="Carrier" />
            <InputField name="defendant2CarrierPhone" label="Carrier Phone" />
            <InputField name="defendant2Policy" label="Policy #" />
            <InputField name="defendant2Claim" label="Claim #" />
            <InputField name="defendant2Adjuster" label="Adjuster" />
            <InputField name="defendant2Insured" label="Insured" />
            </div>

            {/* Vehicle Info */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <InputField name="defendant2Year" label="Year" />
            <InputField name="defendant2Make" label="Make" />
            <InputField name="defendant2Model" label="Model" />
            </div>

            {/* Damage */}
            <TextareaField name="defendant2Damage" label="Damage" />
        </motion.div>
        )}



        {/* Step 4 */}
        {step === 3 && (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6 w-full"
        >
            {/* Client Automobile Insurance */}
            <h2 className="text-xl font-semibold  pb-2 text-gray-500">Client Automobile Insurance</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField name="autoName" label="Name" />
            <InputField name="autoPhone" label="Phone" />
            <InputField name="autoAddress" label="Address" />
            <InputField name="autoCarrier" label="Carrier" />
            <InputField name="autoAgent" label="Agent" />
            <InputField name="autoPolicy" label="Policy #" />
            <InputField name="autoClaim" label="Claim #" />
            <InputField name="autoAdjuster" label="Adjuster" />
            <InputField name="autoInsured" label="Insured" />
            </div>

            {/* Client Health Insurance */}
            <h2 className="text-xl font-semibold  pb-2 pt-6 text-gray-500">Client Health Insurance</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField name="healthCarrier" label="Carrier" />
            <InputField name="healthPhone" label="Phone #" />
            <InputField name="healthType" label="Type of Health Insurance (PPO / HMO)" />
            <InputField name="healthAddress" label="Address" />
            <InputField name="healthGroup" label="Group #" />
            <InputField name="healthPolicy" label="Policy #" />
            </div>

            {/* Medicare */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <RadioGroup name="medicare" label="Medicare" options={["Yes", "No"]} />
            </div>
            <InputField name="medicareNumber" label="Medicare #" />
            </div>

            {/* Medicaid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <RadioGroup name="medicaid" label="Medicaid" options={["Yes", "No"]} />
            </div>
            <InputField name="medicaidNumber" label="Medicaid #" />
            </div>
        </motion.div>
        )}


        {/* Step 5 */}
        {step === 4 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4 w-full">
            <RadioGroup
            name="ambulance"
            label="Transported by ambulance?"
            options={["Yes", "No"]}
            />
            <InputField
            name="ambulanceCompany"
            label="Name of Ambulance Company"
            />
            <RadioGroup
            name="admitted"
            label="Were you admitted?"
            options={["Yes", "No"]}
            />
            <InputField
            name="lengthOfStay"
            label="Length of stay"
            />

            <div className="space-y-6">
            {[1, 2, 3].map((num) => (
                <div key={num} className=" p-2 rounded-2xl  ">
                <h3 className="font-semibold text-lg mb-2 text-gray-500">Doctor / Hospital {num}</h3>
                <InputField name={`doctorHospital${num}`} label="Doctor / Hospital Name" />
                <InputField name={`address${num}`} label="Address" />
                <InputField name={`phone${num}`} label="Phone Number" />
                <InputField name={`treatmentDate${num}`} label="Date(s) of Treatment" type="date" />
                </div>
            ))}
            </div>
        </motion.div>
        )}

        {/* Step 6 */}
        {step === 5 && (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6 w-full"
        >
            <TextareaField
            name="bodyPartsAffected"
            label="Describe all parts of the body affected by this accident"
            
            />

            <TextareaField
            name="priorInjuries"
            label="Describe any prior injuries"
            />

            <InputField
            name="priorInsuranceClaims"
            label="Prior Insurance Claims"
            />

            <InputField
            name="priorAttorneys"
            label="Prior Attorneys for PI or WC Injuries"
            />
        </motion.div>
        )}



        {/* Step 7 */}
        {step === 6 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center space-y-3">
            <p className="text-gray-600">
              Please review all information carefully before submitting.
            </p>
            <button
              type="submit"
              className="w-full py-3 bg-green-600 text-white font-semibold rounded-lg shadow hover:bg-green-700 transition"
            >
              Submit Form
            </button>
          </motion.div>
        )}

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

/* 🔸 InputField Component */
interface InputProps {
  name: string;
  label: string;
  type?: string;
}
export function InputField({ name, label, type = "text" }: InputProps) {
  const {
    register,
    formState: { errors },
  } = useFormContext();
  const fieldError = errors[name] as FieldError | undefined;

  return (
    <div>
      <label className="block font-medium text-gray-900 mb-1">{label}</label>
      <input
        {...register(name)}
        type={type}
        className="w-full rounded-lg border text-gray-500 border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
      />
      {fieldError && <p className="text-red-500 text-sm mt-1">{fieldError.message}</p>}
    </div>
  );
}

/* 🔸 TextareaField */
interface TextareaProps {
  name: string;
  label: string;
}
export function TextareaField({ name, label }: TextareaProps) {
  const {
    register,
    formState: { errors },
  } = useFormContext();
  const fieldError = errors[name] as FieldError | undefined;

  return (
    <div>
      <label className="block font-medium text-gray-700 mb-1">{label}</label>
      <textarea
        {...register(name)}
        rows={3}
        className="w-full text-gray-500 rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
      ></textarea>
      {fieldError && <p className="text-red-500 text-sm mt-1">{fieldError.message}</p>}
    </div>
  );
}

/* 🔸 RadioGroup */
interface RadioProps {
  name: string;
  label: string;
  options: string[];
}
export function RadioGroup({ name, label, options }: RadioProps) {
  const {
    register,
    formState: { errors },
  } = useFormContext();
  const fieldError = errors[name] as FieldError | undefined;

  return (
    <div>
      <p className="block font-medium text-gray-700 mb-1">{label}</p>
      <div className="flex gap-6 flex-wrap">
        {options.map((opt) => (
          <label key={opt} className="flex items-center gap-2 text-gray-800">
            <input
              type="radio"
              value={opt}
              {...register(name)}
              className="text-indigo-600 focus:ring-indigo-500"
            />
            {opt}
          </label>
        ))}
      </div>
      {fieldError && <p className="text-red-500 text-sm mt-1">{fieldError.message}</p>}
    </div>
  );
}
