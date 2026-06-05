import { GripVertical } from "lucide-react";

function DragHandle(props: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      {...props}
      className="cursor-grab active:cursor-grabbing text-text-400 hover:text-text-600 transition-colors p-1 touch-none"
    >
      <GripVertical size={18} />
    </div>
  );
}

export default DragHandle;