import InputField from "../inputs/InputField";
import TextareaField from "../inputs/TextareaField";

export default function DefendantInfoStep() {
  return (
    <div className="space-y-8 w-full">
      {/* Defendant #1 / Driver */}
      <h2 className="text-xl font-semibold  text-gray-700 dark:text-gray-200  pb-2">
        Defendant #1 / Driver
      </h2>
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <InputField name="defendant1Year" label="Year" />
        <InputField name="defendant1Make" label="Make" />
        <InputField name="defendant1Model" label="Model" />
      </div>

      <TextareaField name="defendant1Damage" label="Damage" />

      {/* Defendant #2 / Owner */}
      <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200  pb-2 pt-6">
        Defendant #2 / Owner
      </h2>
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <InputField name="defendant2Year" label="Year" />
        <InputField name="defendant2Make" label="Make" />
        <InputField name="defendant2Model" label="Model" />
      </div>

      <TextareaField name="defendant2Damage" label="Damage" />
    </div>
  );
}
