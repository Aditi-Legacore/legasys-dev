import { useFormContext } from "react-hook-form";
import DateInputField from "../inputs/DateInputField";
import InputField from "../inputs/InputField";
// import RadioGroup from "../inputs/RadioGroup";
import TextareaField from "../inputs/TextareaField";
import RadioGroup from "../inputs/RadioGroup";

export default function AccidentInfoStep() {
  const { watch } = useFormContext();
  const passenger = watch("passenger"); // watch the radio button value
  return (
    <div className="space-y-4 w-full">
      {/* <InputField name="accidentDate" label="Date of Accident *" type="date" /> */}
      <DateInputField name="accidentDate" label="Date of Accident *" />
      <InputField name="accidentTime" label="Time" type="time" />
      {/* <RadioGroup
        name="caseType"
        label="Type of Case"
        options={["Auto Accident", "Slip & Fall", "Other"]}
      />
      <InputField name="policeCase" label="Police Dept. & Case No." /> */}
      <InputField name="accidentLocation" label="Accident Location *" />
      {/* <RadioGroup name="seatBelt" label="Wearing Seat Belt?" options={["Yes", "No"]} />
      <InputField name="seatBeltReason" label="If No, Why?" /> */}
      <TextareaField name="accidentDescription" label="Accident Description *" />

      {/* Passenger/Child Radio */}
      <RadioGroup
        name="passenger"
        label="Any Passenger/Child?"
        options={["Yes", "No"]}
      />

      {passenger === "Yes" && (
        <InputField
          name="passengerName"
          label="Passenger/Child Name *"
          placeholder="Enter passenger or child name"
        />
      )}

      {/* Were you at work */}
      <InputField
        name="workAtAccident"
        label="Were You at Work at Time of Accident?"
        placeholder="e.g. Yes, at office"
      />
      
    </div>
  );
}
