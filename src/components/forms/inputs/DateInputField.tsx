import { useFormContext, Controller } from "react-hook-form";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

export default function DateInputField({ name, label }: { name: string; label: string }) {
  const { control, setValue } = useFormContext();

  const formatDate = (date: Date) => {
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${month}/${day}/${year}`;
  };

  return (
    <div className="flex flex-col space-y-1">
      <label className="block font-medium text-gray-900 mb-1">{label}</label>
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <DatePicker
            selected={field.value ? new Date(field.value) : null}
            onChange={(date) => setValue(name, date ? date.toISOString().split('T')[0] : '')}
            dateFormat="MM/dd/yyyy"
            placeholderText="mm/dd/yyyy"
            className="w-full rounded-lg border text-gray-500 border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
          />
        )}
      />
    </div>
  );
}
