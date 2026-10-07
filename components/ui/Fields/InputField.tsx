import type { ChangeEvent } from "react";

type InputFieldProps = {
  label: string;
  name: string;
  type?: string;
  value: string;
  placeholder?: string;
  required?: boolean;
  autoComplete?: string;
  onChange: (value: string) => void;
};

export function InputField({
  label,
  name,
  type = "text",
  value,
  placeholder,
  required = false,
  autoComplete,
  onChange,
}: InputFieldProps) {
  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    onChange(event.target.value);
  }

  return (
    <div className="w-full">
      <label
        htmlFor={name}
        className="mb-2 block text-[13px] font-semibold text-slate-700"
      >
        {label}
      </label>

      <input
        id={name}
        name={name}
        type={type}
        value={value}
        placeholder={placeholder}
        required={required}
        autoComplete={autoComplete}
        onChange={handleChange}
        className="
          h-[52px]
          w-full
          rounded-[15px]
          border
          border-slate-200
          bg-white
          px-4
          text-[16px]
          text-slate-900
          outline-none
          shadow-[0_1px_2px_rgba(0,0,0,0.03)]
          placeholder:text-slate-400
          transition-all
          duration-200
          focus:border-bulsu
          focus:ring-4
          focus:ring-bulsu/10
          disabled:bg-slate-50
          disabled:text-slate-400
        "
      />
    </div>
  );
}
