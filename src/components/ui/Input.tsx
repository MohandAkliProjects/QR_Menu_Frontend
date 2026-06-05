interface InputProps {
  value: string;
  readOnly?: boolean;
  placeholder?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
}

function Input({ value, readOnly, placeholder, onChange, error }: InputProps) {
  return (
    <input
      value={value}
      readOnly={readOnly}
      placeholder={placeholder}
      onChange={onChange}
      className={`
        w-full h-12 px-4 rounded-xl
        bg-card-bg border
        text-base text-text-800
        focus:outline-none
        shadow-[var(--shadow-card)]
        transition-all duration-200
        ${error
          ? "border-error focus:border-error"
          : "border-primary-200 focus:border-primary-500"
        }
      `}
    />
  );
}

export default Input;