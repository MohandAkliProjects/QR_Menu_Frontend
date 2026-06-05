interface TableCellProps {
  children: React.ReactNode;
  center?: boolean;
  hidden?: boolean;
}

function TableCell({ children, center = true, hidden = false }: TableCellProps) {
  if (hidden) return null;
  return (
    <td className={`px-4 py-4 ${center ? "text-center" : "text-left"}`}>
      {children}
    </td>
  );
}

export default TableCell;