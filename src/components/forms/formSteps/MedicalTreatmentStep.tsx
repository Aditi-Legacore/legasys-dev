"use client";

import { useFormContext } from "react-hook-form";
import InputField from "../inputs/InputField";
import RadioGroup from "../inputs/RadioGroup";
import TextareaField from "../inputs/TextareaField";
import DateInputField from "../inputs/DateInputField";

export default function MedicalTreatmentStep() {
  const { watch } = useFormContext();

  // 👀 Watch field values
  const ambulance = watch("ambulance");
  const admitted = watch("admitted");
  const priorInjuries = watch("priorInjuries");
  const currentTreatment = watch("currentTreatment");

  return (
    <div className="space-y-6 w-full">
      {/* 1. Ambulance Section */}
      <RadioGroup
        name="ambulance"
        label="Transported by ambulance? *"
        options={["Yes", "No"]}
      />
      {ambulance === "Yes" && (
        <InputField
          name="ambulanceCompany"
          label="Name of Ambulance Company *"
        />
      )}

      {/* 2. Admitted Section */}
      <RadioGroup
        name="admitted"
        label="Were you admitted? *"
        options={["Yes", "No"]}
      />
      {admitted === "Yes" && (
        <InputField name="lengthOfStay" label="Length of stay" />
      )}

      {/* 3. Prior Injuries Section */}
      <RadioGroup
        name="priorInjuries"
        label="Any Prior Injuries? *"
        options={["Yes", "No"]}
      />
      {priorInjuries === "Yes" && (
        <div className="p-4 rounded-2xl border border-gray-300 dark:border-gray-700">
          <h3 className="font-semibold text-lg mb-2 text-gray-700 dark:text-gray-200">
            Prior Injuries Details
          </h3>
          <InputField name="priorDoctorHospital" label="Doctor/Hospital Name" />
          <InputField
            name="priorHospitalAddressPhone"
            label="Hospital Address & Phone No."
          />
          <TextareaField
            name="priorTreatmentDetails"
            label="Treatment Details"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <DateInputField
              name="priorTreatmentFrom"
              label="Treatment Date (From)"
            />
            <DateInputField
              name="priorTreatmentTo"
              label="Treatment Date (To)"
            />
          </div>
          <InputField
            name="priorInsuranceClaims"
            label="Prior Insurance Claim #"
          />
          <InputField
            name="priorAttorneys"
            label="Prior Attorneys for PI / WC Injuries"
          />
        </div>
      )}

      {/* 4. Current Treatment Section */}
      <RadioGroup
        name="currentTreatment"
        label="Is There Any Current/On going Treatments Due to Accident? *"
        options={["Yes", "No"]}
      />
      {currentTreatment === "Yes" && (
        <div className="p-4 rounded-2xl border border-gray-300 dark:border-gray-700">
          <h3 className="font-semibold text-lg mb-2 text-gray-700 dark:text-gray-200">
            Current Treatment Details
          </h3>
          <InputField
            name="currentDoctorHospital"
            label="Doctor/Hospital Name"
          />
          <InputField
            name="currentHospitalAddressPhone"
            label="Hospital Address & Phone No."
          />
          <TextareaField
            name="currentTreatmentDetails"
            label="Treatment Details"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <DateInputField
              name="currentTreatmentFrom"
              label="Treatment Date (From)"
            />
            <DateInputField
              name="currentTreatmentTo"
              label="Treatment Date (To)"
            />
          </div>
        </div>
      )}

      {/* Default Doctor/Hospital List */}
      {/* <div className="space-y-6">
        {[1, 2].map((num) => (
          <div key={num} className="p-2 rounded-2xl">
            <h3 className="font-semibold text-lg mb-2 text-gray-700 dark:text-gray-200">
              Doctor / Hospital {num}
            </h3>
            <InputField
              name={`doctorHospital${num}`}
              label="Doctor / Hospital Name"
            />
            <InputField name={`address${num}`} label="Address" />
            <InputField name={`phone${num}`} label="Phone Number" />
            <DateInputField
              name={`treatmentDate${num}`}
              label="Date(s) of Treatment"
            />
          </div>
        ))}
      </div> */}

      {/* Body Parts Affected */}
      <TextareaField
        name="bodyPartsAffected"
        label="Body Parts Affected"
      />
    </div>
  );
}
