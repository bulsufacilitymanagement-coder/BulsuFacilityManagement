import type { ChangeEvent } from "react";

type TextAreaFieldProps = {
  label: string;
  name: string;
  value: string;
  placeholder?: string;
  required?: boolean;
  autoComplete?: string;
  rows?: number;
  onChange: (value: string) => void;
};

export function TextAreaField({
  label,
  name,
  value,
  placeholder,
  required = false,
  autoComplete,
  rows = 5,
  onChange,
}: TextAreaFieldProps) {
  function handleChange(event: ChangeEvent<HTMLTextAreaElement>) {
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

      <textarea
        id={name}
        name={name}
        value={value}
        placeholder={placeholder}
        required={required}
        autoComplete={autoComplete}
        rows={rows}
        onChange={handleChange}
        className="
          min-h-[120px]
          w-full
          resize-y
          rounded-[15px]
          border
          border-slate-200
          bg-white
          px-4
          py-3
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
