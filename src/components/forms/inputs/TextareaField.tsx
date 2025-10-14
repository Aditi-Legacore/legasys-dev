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
      <label className="block font-medium text-gray-700 mb-1">{label}</label>
      <textarea
        {...register(name)}
        rows={3}
        className="w-full text-gray-500 rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
      ></textarea>
      {fieldError && <p className="text-red-500 text-sm mt-1">{fieldError.message}</p>}
    </div>
  );
}
