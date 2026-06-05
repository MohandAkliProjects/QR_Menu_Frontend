interface PageHeaderProps {
  title: string;
  description?: string;
  showDescription?: boolean;
}

function PageHeader({ title, description, showDescription }: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-1">
      <h2 className="text-2xl font-semibold text-dark-700">
        {title}
      </h2>

      {description && showDescription && (
        <p className="text-base text-text-400 ">
          {description}
        </p>
      )}
    </div>
  );
}

export default PageHeader;