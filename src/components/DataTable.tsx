// API
// 	<DataTable>
// 		<DataTable.Controller>...</DataTable.Controller>
//
// 		<DataTable.Header>
// 			<DataTable.Item>...</DataDable.Item>
// 			...
// 		</DataTable.Header>
//
// 		<DataTable.Row>
// 			<DataTable.Item>...</DataTable.Item>
// 			<DataTable.Item asTitle>...</DataTable.Item>
// 			...
// 		</DataTable.Row>
// 	</DataTable>

import { cn } from "~/utils/cn.ts";
import { Button } from "./Button.tsx";
import { Input } from "./Input.tsx";

type DataTableItemProps = React.ComponentProps<"div"> & { isTitle?: boolean };

type DataTableProps = {
  children: React.ReactNode | React.ReactNode[];
  className: string;
};

function DataTableItem({
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

type DataTableRowProps = React.ComponentProps<"li">;

function DataTableRow({
  className,
  ...props
}: DataTableRowProps): React.ReactNode {
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

type DataTableHeaderProps = DataTableRowProps;

function DataTableHeader({
  className,
  ...props
}: DataTableHeaderProps): React.ReactNode {
  return (
    <DataTableRow
      className={cn("text-action text-gray-500", className)}
      {...props}
    />
  );
}

function DataTable({ children, className }: DataTableProps): React.ReactNode {
  // biome-ignore lint/style/noMagicNumbers: temp
  const pageSlice = [3, 4, 5, 6, 7];

  return (
    <div className="space-y-6">
      <header>
        <form className="mb-2 flex w-full gap-2">
          <Input
            className="h-stretch"
            placeholder="Input data..."
            autoComplete="off"
          />

          <span className="flex-1" />

          {pageSlice.map((pageNumber) => (
            <Button
              key={pageNumber}
              asChild={true}
              mode="outlined"
              className="focus-within:outlined aspect-square w-auto"
            >
              <label>
                {pageNumber}
                <input type="radio" name="page" className="-z-1 absolute" />
              </label>
            </Button>
          ))}
        </form>

        <hr className="text-theme-border" />
      </header>

      <ol className={cn("grid grid-cols-4 gap-x-6 gap-y-4", className)}>
        {children}
      </ol>
    </div>
  );
}

DataTable.Item = DataTableItem;
DataTable.Row = DataTableRow;
DataTable.Header = DataTableHeader;

export { DataTable };
