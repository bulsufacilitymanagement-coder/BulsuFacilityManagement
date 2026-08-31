import { Eye, EyeOff } from "lucide-react";
import type { ChangeEvent } from "react";

type PasswordFieldProps = {
  label: string;
  name: string;
  value: string;
  placeholder?: string;
  required?: boolean;
  autoComplete?: string;
  showPassword: boolean;
  onTogglePassword: () => void;
  onChange: (value: string) => void;
};

export function PasswordField({
  label,
  name,
  value,
  placeholder,
  required = false,
  autoComplete,
  showPassword,
  onTogglePassword,
  onChange,
}: PasswordFieldProps) {
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

      <div className="relative">
        <input
          id={name}
          name={name}
          type={showPassword ? "text" : "password"}
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
            pl-4
            pr-12
            text-[16px]
            text-slate-900
            outline-none
            shadow-[0_1px_2px_rgba(0,0,0,0.03)]
            placeholder:text-slate-400
            transition-all
            duration-200
            focus:border-[#A6192E]
            focus:ring-4
            focus:ring-[#A6192E]/10
          "
        />

        <button
          type="button"
          aria-label={showPassword ? "Hide password" : "Show password"}
          onClick={onTogglePassword}
          className="
            absolute
            right-2
            top-1/2
            flex
            h-10
            w-10
            -translate-y-1/2
            items-center
            justify-center
            rounded-xl
            text-slate-400
            transition-colors
            hover:bg-slate-100
            hover:text-slate-700
            active:bg-slate-200
          "
        >
          {showPassword ? (
            <EyeOff className="h-[19px] w-[19px]" strokeWidth={2} />
          ) : (
            <Eye className="h-[19px] w-[19px]" strokeWidth={2} />
          )}
        </button>
      </div>
    </div>
  );
}
