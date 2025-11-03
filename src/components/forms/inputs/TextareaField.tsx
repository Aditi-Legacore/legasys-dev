import { useFormContext, FieldError } from "react-hook-form";

interface TextareaProps {
  name: string;
  label: string;
}

export default function TextareaField({ name, label }: TextareaProps) {
  const {
    register,
    formState: { errors },
  } = useFormContext();
  const fieldError = errors[name] as FieldError | undefined;

  return (
    <div>
      <label className="block text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">
        {label}
      </label>
      <textarea
        {...register(name)}
        rows={3}
        className="
          w-full rounded-lg border px-3 py-2 transition text-base
          text-gray-800 dark:text-gray-100
          bg-white dark:bg-gray-800
          border-gray-300 dark:border-gray-600
          focus:outline-none focus:ring-2
          focus:ring-indigo-500 dark:focus:ring-indigo-400
          placeholder-gray-400 dark:placeholder-gray-500
        "
      ></textarea>
      {fieldError && (
        <p className="text-red-500 text-sm mt-1">{fieldError.message}</p>
      )}
    </div>
  );
}
