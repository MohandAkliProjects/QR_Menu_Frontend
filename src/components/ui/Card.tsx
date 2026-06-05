interface CardProps {
  children: React.ReactNode;
  className?: string;
}

function Card({ children, className = "" }: CardProps) {
  return (
    <div className={`bg-card-bg rounded-2xl p-6 border border-primary-200 shadow-var(--shadow-card) ${className}`}>
      {children}
    </div>
  );
}

export default Card;