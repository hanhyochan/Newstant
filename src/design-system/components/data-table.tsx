import { cn } from "./utils";

type DataTableRadius = "square" | "rounded" | "full";
type DataTableVariant = "filled" | "outline" | "gray_line_outline";

export type DataTableProps = {
  radius?: DataTableRadius;
  variant?: DataTableVariant;
  wrapperClassName?: string;
};

export function DataTable({
  radius = "rounded",
  variant = "gray_line_outline",
  wrapperClassName,
}: DataTableProps) {
  return (
    <div
      className={cn(
        "table_wrap",
        `table_wrap_${variant}`,
        radius === "square" && "table_wrap_square",
        radius === "rounded" && "table_wrap_rounded",
        radius === "full" && "table_wrap_full",
        wrapperClassName,
      )}
    >
      <table className="data_table">
        <caption>NewsRoll design-system table sample</caption>
        <thead>
          <tr>
            <th scope="col">Name</th>
            <th scope="col">Type</th>
            <th scope="col">Status</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <th scope="row">Primary source</th>
            <td>RSS</td>
            <td>Ready</td>
          </tr>
          <tr>
            <th scope="row">User profile</th>
            <td>Account</td>
            <td>Draft</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
