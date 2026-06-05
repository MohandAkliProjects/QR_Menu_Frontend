interface PageLoadingStateProps {
  message?: string;
}

function PageLoadingState({ message = "Loading..." }: PageLoadingStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 w-full">
      <div className="w-10 h-10 rounded-full border-2 border-primary-300 border-t-primary-700 animate-spin" />
      <p className="text-sm text-text-400">{message}</p>
    </div>
  );
}

export default PageLoadingState;
