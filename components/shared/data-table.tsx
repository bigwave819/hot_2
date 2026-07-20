import { EmptyState } from "@/components/shared/empty-state";

export type DataTableColumn<T> = {
  header: string;
  cell: (row: T) => React.ReactNode;
  className?: string;
  headerClassName?: string;
};

export function DataTable<T>({
  columns,
  data,
  getRowId,
  emptyTitle,
  emptyDescription,
  emptyAction,
}: {
  columns: DataTableColumn<T>[];
  data: T[];
  getRowId: (row: T) => string;
  emptyTitle: string;
  emptyDescription?: string;
  emptyAction?: React.ReactNode;
}) {
  if (data.length === 0) {
    return <EmptyState title={emptyTitle} description={emptyDescription} action={emptyAction} />;
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-border bg-secondary/50">
            {columns.map((col) => (
              <th
                key={col.header}
                className={`px-4 py-3 font-medium text-muted-foreground ${col.headerClassName ?? ""}`}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr key={getRowId(row)} className="border-b border-border last:border-0 hover:bg-secondary/30">
              {columns.map((col) => (
                <td key={col.header} className={`px-4 py-3 ${col.className ?? ""}`}>
                  {col.cell(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}