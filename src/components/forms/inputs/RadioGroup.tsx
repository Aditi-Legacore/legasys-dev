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
      {/* Label */}
      <p className="block font-medium text-gray-900 dark:text-gray-100 mb-1">
        {label}
      </p>

      {/* Radio Buttons */}
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <div className="flex gap-6 flex-wrap">
            {options.map((opt) => (
              <label
                key={opt}
                className="flex items-center gap-2 text-gray-800 dark:text-gray-200"
              >
                <input
                  type="radio"
                  value={opt}
                  checked={field.value === opt}
                  onChange={() => field.onChange(opt)}
                  className="
                    text-indigo-600 dark:text-indigo-400
                    focus:ring-indigo-500 dark:focus:ring-indigo-400
                    bg-white dark:bg-gray-800
                    border-gray-300 dark:border-gray-600
                  "
                />
                {opt}
              </label>
            ))}
          </div>
        )}
      />

      {/* Error Message */}
      {fieldError && (
        <p className="text-red-500 dark:text-red-400 text-sm mt-1">
          {fieldError.message}
        </p>
      )}
    </div>
  );
}
