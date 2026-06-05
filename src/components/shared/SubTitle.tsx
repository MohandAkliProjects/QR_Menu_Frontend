interface SubTitleProps {
  title: string;
  description?: string;
  showDescription?: boolean;
}

function SubTitle({ title, description, showDescription }: SubTitleProps) {
  return (
    <div className="flex flex-col gap-1">
      <h2 className="text-xl font-semibold text-dark-700">
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

export default SubTitle;