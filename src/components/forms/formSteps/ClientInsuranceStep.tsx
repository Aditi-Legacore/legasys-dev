import InputField from "../inputs/InputField";
import RadioGroup from "../inputs/RadioGroup";

export default function ClientInsuranceStep() {
  return (
    <div className="space-y-6 w-full">
      {/* Client Automobile Insurance */}
      <h2 className="text-xl font-semibold pb-2 text-gray-500">
        Client Automobile Insurance
      </h2>
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
      <h2 className="text-xl font-semibold pb-2 pt-6 text-gray-500">
        Client Health Insurance
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InputField name="healthCarrier" label="Carrier" />
        <InputField name="healthPhone" label="Phone #" />
        <InputField
          name="healthType"
          label="Type of Health Insurance (PPO / HMO)"
        />
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
    </div>
  );
}
