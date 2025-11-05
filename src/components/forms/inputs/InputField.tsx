import { useFormContext, FieldError } from "react-hook-form";

interface InputProps {
  name: string;
  label: string;
  type?: string;
  placeholder?: string;
   disabled?: boolean; // ✅ add this line
}

export default function InputField({ name, label, type = "text", placeholder }: InputProps) {
  const {
    register,
    formState: { errors },
  } = useFormContext();
  const fieldError = errors[name] as FieldError | undefined;

  return (
    <div>
      {/* Label */}
      <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
        {label}
      </label>

      {/* Input Field */}
      <input
        {...register(name)}
        type={type}
        placeholder={placeholder}
        className="
          w-full rounded-md border text-sm
          text-gray-900 dark:text-gray-100
          bg-white dark:bg-gray-800
          border-gray-300 dark:border-gray-600
          px-2 py-1.5
          focus:outline-none focus:ring-2
          focus:ring-indigo-500 dark:focus:ring-indigo-400
          transition
        "
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
