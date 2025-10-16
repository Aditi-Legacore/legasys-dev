import { useFormContext, FieldError, Controller } from "react-hook-form";

interface RadioProps {
  name: string;
  label: string;
  options: string[];
}

export default function RadioGroup({ name, label, options }: RadioProps) {
  const {
    control,
    formState: { errors },
  } = useFormContext();
  const fieldError = errors[name] as FieldError | undefined;

  return (
    <div>
      <p className="block font-medium text-gray-700 mb-1">{label}</p>
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <div className="flex gap-6 flex-wrap">
            {options.map((opt) => (
              <label key={opt} className="flex items-center gap-2 text-gray-800">
                <input
                  type="radio"
                  value={opt}
                  checked={field.value === opt}
                  onChange={() => field.onChange(opt)}
                  className="text-indigo-600 focus:ring-indigo-500"
                />
                {opt}
              </label>
            ))}
          </div>
        )}
      />
      {fieldError && <p className="text-red-500 text-sm mt-1">{fieldError.message}</p>}
    </div>
  );
}
