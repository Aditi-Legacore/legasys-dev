import InputField from "../inputs/InputField";
import RadioGroup from "../inputs/RadioGroup";

export default function PlaintiffInfoStep() {
  return (
    <div className="space-y-4 w-full">
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
    </div>
  );
}
