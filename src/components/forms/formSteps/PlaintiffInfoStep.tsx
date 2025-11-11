import DateInputField from "../inputs/DateInputField";
import InputField from "../inputs/InputField";
import RadioGroup from "../inputs/RadioGroup";

export default function PlaintiffInfoStep() {
  return (
    <div className="space-y-4 w-full">
      <InputField name="clientName" label="Client Name *" />
      <RadioGroup name="gender" label="Gender *" options={["Male", "Female"]} />
      <DateInputField name="dob" label="Date of Birth" />
      <InputField name="phone" label="Phone *" />
      <InputField name="email" label="Email *" type="email" />
      <InputField name="address" label="Address" />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <InputField name="city" label="City" />
        <InputField name="zip" label="Zip" />
      </div>
      <InputField name="ssn" label="Social Security Number(SSN)" />
    </div>
  );
}
