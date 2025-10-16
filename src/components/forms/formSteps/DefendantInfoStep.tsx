"use client";

import { useState } from "react";
import InputField from "../inputs/InputField";
import TextareaField from "../inputs/TextareaField";

export default function DefendantInfoStep() {
  const [defendantCount, setDefendantCount] = useState(1);

  const handleAddDefendant = () => {
    setDefendantCount((prev) => prev + 1);
  };

  const handleRemoveDefendant = (indexToRemove: number) => {
    // Remove the last one only or specific index
    setDefendantCount((prev) => prev - 1);
  };

  return (
    <div className="space-y-8 w-full">
      {[...Array(defendantCount)].map((_, index) => (
        <div
          key={index}
          className="p-4 rounded-2xl   dark:bg-gray-800 space-y-6 relative"
        >
          {/* Header with remove button */}
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200">
              Defendant #{index + 1}
            </h2>

            {/* Show remove button only if more than one defendant */}
            {defendantCount > 1 && index === defendantCount - 1 && (
              <button
                type="button"
                onClick={() => handleRemoveDefendant(index)}
                className="text-red-600 hover:text-red-800 text-sm font-medium"
              >
                ✖ Remove
              </button>
            )}
          </div>

          {/* Basic Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InputField name={`defendant${index + 1}Name`} label="Name *" />
            <InputField name={`defendant${index + 1}Address`} label="Address" />
            <InputField
              name={`defendant${index + 1}Carrier`}
              label="Insurance Carrier Name"
            />
            <InputField
              name={`defendant${index + 1}CarrierPhone`}
              label="Insurance Carrier Phone No"
            />
          </div>

          {/* Vehicle Info */}
          <div>
            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Vehicle Info
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <InputField
                name={`defendant${index + 1}Year`}
                label="Year"
              />
              <InputField
                name={`defendant${index + 1}Make`}
                label="Make"
              />
              <InputField
                name={`defendant${index + 1}Model`}
                label="Model"
              />
            </div>
          </div>

          <TextareaField
            name={`defendant${index + 1}Damage`}
            label="Damage"
          />
        </div>
      ))}

      {/* Add More Button */}
      <div className="flex justify-center">
        <button
          type="button"
          onClick={handleAddDefendant}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          + Add More Defendant
        </button>
      </div>
    </div>
  );
}
