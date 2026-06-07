import type React from "react";
import { cn } from "~/utils/cn.ts";
import { Button } from "../Button.tsx";
import { Input } from "../Input.tsx";
import { DataTableHeader, DataTableItem, DataTableRow } from "./rows.tsx";

type DataTableProps = {
  children: React.ReactNode | React.ReactNode[];
  className: string;
};

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
