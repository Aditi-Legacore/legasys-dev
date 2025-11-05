import { useFormContext } from "react-hook-form";
import DateInputField from "../inputs/DateInputField";
import InputField from "../inputs/InputField";
import TextareaField from "../inputs/TextareaField";
import RadioGroup from "../inputs/RadioGroup";
import { useState } from "react";

export default function AccidentInfoStep() {
  const { watch } = useFormContext();
  const passenger = watch("passenger"); // watch radio button
  const hospitalized = watch("hospitalized"); // watch nested field if needed

  return (
    <div className="space-y-4 w-full">
      <DateInputField name="accidentDate" label="Date of Accident *" />
      <InputField name="accidentTime" label="Time" type="time" />
      <InputField name="accidentLocation" label="Accident Location *" />
      <TextareaField name="accidentDescription" label="Accident Description *" />

      {/* Passenger/Child Radio */}
      <RadioGroup
        name="passenger"
        label="Any Passenger/Child?"
        options={["Yes", "No"]}
      />

      {passenger === "Yes" && (
        <div className="p-4 border rounded-lg text-gray-900 dark:text-gray-100
          bg-white dark:bg-gray-800
          border-gray-300 dark:border-gray-600
          px-3 py-2 
          focus:outline-none focus:ring-2 
          focus:ring-indigo-500 dark:focus:ring-indigo-400 
          transition space-y-3">
          <h3 className="font-semibold text-lg">Passenger/Child Details</h3>

          <InputField
            name="passengerName"
            label="Passenger/Child Name *"
            placeholder="Enter passenger or child name"
          />

          <InputField
            name="passengerAge"
            label="Age"
            placeholder="Enter age"
            type="number"
          />

          <InputField
            name="relationshipToYou"
            label="Relationship to You"
            placeholder="e.g., Child, Friend, Spouse"
          />

          <TextareaField
            name="injuryDescription"
            label="Injury Description"
            // placeholder="Describe any injuries sustained"
          />

          <RadioGroup
            name="hospitalized"
            label="Was Hospitalized?"
            options={["Yes", "No"]}
          />

          {hospitalized === "Yes" && (
            <>
              <InputField
                name="hospitalName"
                label="Hospital Name"
                // placeholder="Enter hospital name"
              />
              <TextareaField
                name="treatmentDetails"
                label="Treatment Details"
                // placeholder="Describe treatment received"
              />
            </>
          )}

          <RadioGroup
            name="seatbeltUsed"
            label="Was Seatbelt/Child Seat Used?"
            options={["Yes", "No"]}
          />
        </div>
      )}

      <InputField
        name="workAtAccident"
        label="Were You at Work at Time of Accident?"
        placeholder="e.g. Yes, at office"
      />
    </div>
  );
}
