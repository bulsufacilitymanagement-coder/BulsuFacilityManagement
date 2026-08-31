import { InputField } from "./InputField";

type EmailFieldProps = {
  label: string;
  name: string;
  value: string;
  placeholder?: string;
  required?: boolean;
  autoComplete?: string;
  onChange: (value: string) => void;
};

export function EmailField({
  label,
  name,
  value,
  placeholder,
  required = false,
  autoComplete,
  onChange,
}: EmailFieldProps) {
  return (
    <InputField
      label={label}
      name={name}
      type="email"
      value={value}
      placeholder={placeholder}
      required={required}
      autoComplete={autoComplete}
      onChange={onChange}
    />
  );
}
