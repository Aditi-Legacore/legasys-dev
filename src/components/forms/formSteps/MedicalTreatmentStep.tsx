import InputField from "../inputs/InputField";
import RadioGroup from "../inputs/RadioGroup";

export default function MedicalTreatmentStep() {
  return (
    <div className="space-y-4 w-full">
      <RadioGroup
        name="ambulance"
        label="Transported by ambulance?"
        options={["Yes", "No"]}
      />
      <InputField name="ambulanceCompany" label="Name of Ambulance Company" />

      <RadioGroup
        name="admitted"
        label="Were you admitted?"
        options={["Yes", "No"]}
      />
      <InputField name="lengthOfStay" label="Length of stay" />

      <div className="space-y-6">
        {[1, 2, 3].map((num) => (
          <div key={num} className="p-2 rounded-2xl">
            <h3 className="font-semibold text-lg mb-2 text-gray-500">
              Doctor / Hospital {num}
            </h3>
            <InputField name={`doctorHospital${num}`} label="Doctor / Hospital Name" />
            <InputField name={`address${num}`} label="Address" />
            <InputField name={`phone${num}`} label="Phone Number" />
            <InputField
              name={`treatmentDate${num}`}
              label="Date(s) of Treatment"
              type="date"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
