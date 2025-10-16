import { useFormContext } from "react-hook-form";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

export default function DateInputField({ name, label }: { name: string; label: string }) {
  const { setValue, watch } = useFormContext();
  const value = watch(name);

  return (
    <div className="flex flex-col space-y-1">
      <label className="block font-medium text-gray-900 mb-1">{label}</label>
      <DatePicker
        selected={value ? new Date(value) : null}
        onChange={(date) => setValue(name, date)}
        dateFormat="MM/dd/yyyy"
        placeholderText="mm/dd/yyyy"
        className="w-full rounded-lg border text-gray-500 border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
      />
    </div>
  );
}
