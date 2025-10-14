import InputField from "../inputs/InputField";
import RadioGroup from "../inputs/RadioGroup";
import TextareaField from "../inputs/TextareaField";

export default function AccidentInfoStep() {
  return (
    <div className="space-y-4 w-full">
      <InputField name="accidentDate" label="Date of Accident" type="date" />
      <InputField name="accidentTime" label="Time" type="time" />
      <RadioGroup
        name="caseType"
        label="Type of Case"
        options={["Auto Accident", "Slip & Fall", "Other"]}
      />
      <InputField name="policeCase" label="Police Dept. & Case No." />
      <InputField name="accidentLocation" label="Location" />
      <RadioGroup name="seatBelt" label="Wearing Seat Belt?" options={["Yes", "No"]} />
      <InputField name="seatBeltReason" label="If No, Why?" />
      <TextareaField name="accidentDescription" label="Accident Description" />
    </div>
  );
}
