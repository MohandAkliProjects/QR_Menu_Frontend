export interface Column {
  key: string;
  label: string;
  width?: string;
  center?: boolean;
  hidden?: boolean;
}

interface TableProps {
  columns: Column[];
  children: React.ReactNode;
}

function Table({ columns, children }: TableProps) {
  return (
    <div className="w-full rounded-2xl overflow-hidden border border-beige-400 shadow-[var(--shadow-card)]">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-beige-200 border-b border-beige-400">
              {columns
                .filter((col) => !col.hidden)
                .map((col) => (
                  <th
                    key={col.key}
                    className={`
                      px-4 py-4 text-xs font-semibold text-text-300
                      uppercase tracking-wider whitespace-nowrap
                      ${col.width ?? ""}
                      ${col.center ? "text-center" : "text-left"}
                    `}
                  >
                    {col.label}
                  </th>
                ))}
            </tr>
          </thead>
          <tbody>{children}</tbody>
        </table>
      </div>
    </div>
  );
}

export default Table;