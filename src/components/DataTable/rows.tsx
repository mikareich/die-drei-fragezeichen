import { cn } from "~/utils/cn.ts";

type DataTableItemProps = React.ComponentProps<"div"> & { isTitle?: boolean };

export function DataTableItem({
  isTitle = false,
  className,
  ...props
}: DataTableItemProps): React.ReactNode {
  return (
    <div
      className={cn(
        "truncate text-left text-body",
        isTitle && "font-medium uppercase",
        className,
      )}
      {...props}
    />
  );
}

export function DataTableRow({
  className,
  ...props
}: React.ComponentProps<"li">): React.ReactNode {
  return (
    <li
      className={cn(
        "col-span-full grid grid-cols-subgrid items-center",
        className,
      )}
      {...props}
    />
  );
}

export function DataTableHeader({
  className,
  ...props
}: React.ComponentProps<"li">): React.ReactNode {
  return (
    <DataTableRow
      className={cn("text-action text-gray-500", className)}
      {...props}
    />
  );
}
