import { useFormContext, FieldError } from "react-hook-form";

interface InputProps {
  name: string;
  label: string;
  type?: string;
  placeholder?: string;
}

export default function InputField({ name, label, type = "text",placeholder  }: InputProps) {
  const {
    register,
    formState: { errors },
  } = useFormContext();
  const fieldError = errors[name] as FieldError | undefined;

  return (
    <div>
      <label className="block font-medium text-gray-900 mb-1">{label}</label>
      <input
        {...register(name)}
        type={type}
        placeholder={placeholder}
        className="w-full rounded-lg border text-gray-500 border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
      />
      {fieldError && <p className="text-red-500 text-sm mt-1">{fieldError.message}</p>}
    </div>
  );
}
