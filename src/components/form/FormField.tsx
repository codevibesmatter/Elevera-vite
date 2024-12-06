import { clsx } from "clsx";
import { UseFormRegister } from "react-hook-form";

interface FormFieldProps {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  register: UseFormRegister<any>;
  error?: string;
  required?: boolean;
}

export function FormField({
  label,
  name,
  type = "text",
  placeholder,
  register,
  error,
  required,
}: FormFieldProps) {
  return (
    <div className="form-control w-full">
      <label className="label" htmlFor={name}>
        <span className="label-text">
          {label}
          {required && <span className="text-error ml-1">*</span>}
        </span>
      </label>
      <input
        type={type}
        placeholder={placeholder}
        className={clsx(
          "input input-bordered w-full",
          error && "input-error"
        )}
        {...register(name)}
      />
      {error && (
        <label className="label">
          <span className="label-text-alt text-error">{error}</span>
        </label>
      )}
    </div>
  );
}
