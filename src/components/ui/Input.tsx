interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
}

//if u want to add a custom one just add the className and the props you want to use 
function Input({ error, ...props }: InputProps) {
  return (
    <input
      {...props}
      className={`
        w-full h-12 px-4 rounded-xl
        bg-card-bg border
        text-base text-text-800
        focus:outline-none
        shadow-(--shadow-card)
        transition-all duration-200
        ${
          error
            ? "border-error focus:border-error"
            : "border-primary-200 focus:border-primary-500"
        }
      `}
    />
  );
}

export default Input;