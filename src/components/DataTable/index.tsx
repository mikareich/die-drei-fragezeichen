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

import React from "react";
import { cn } from "~/utils/cn.ts";
import { DataTableControls, DataTablePagination } from "./controls.tsx";
import { DataTableHeader, DataTableItem, DataTableRow } from "./rows.tsx";

type DataTableProps = {
  children: React.ReactNode[];
  className: string;
  id: string;
};

function isValidChild(
  child: React.ReactNode,
): child is React.ReactElement<unknown, React.JSXElementConstructor<unknown>> {
  return (
    React.isValidElement<React.ReactElement>(child) &&
    typeof child.type === "function"
  );
}

function extractChildren(children: DataTableProps["children"]): {
  controls: React.ReactNode;
  header: React.ReactNode;
  rows: React.ReactNode[];
} {
  let controls: React.ReactNode;
  let header: React.ReactNode;
  const rows: React.ReactNode[] = [];

  const invalidChildError = new Error("Invalid child used in DataTable");

  for (const child of children) {
    if (!isValidChild(child)) {
      throw invalidChildError;
    }

    switch (child.type.name) {
      case DataTableControls.name: {
        controls = child;
        break;
      }

      case DataTableHeader.name: {
        header = child;
        break;
      }

      case DataTableRow.name: {
        rows.push(child);
        break;
      }

      default:
        throw invalidChildError;
    }
  }

  return {
    controls,
    header,
    rows,
  };
}

function DataTable({
  children,
  className,
  id,
}: DataTableProps): React.ReactNode {
  const { controls, header, rows } = extractChildren(children);

  return (
    <div className="space-y-6 grid gap-y-6 gap-x-2 grid-cols-[1fr_auto] w-full">
      {controls}

      <hr className="text-theme-border col-span-2 -my-6" />

      <ol
        className={cn(
          "grid col-span-2 row-start-2 grid-cols-4 gap-x-6 gap-y-4",
          className,
        )}
      >
        {header}

        {rows}
      </ol>

      <DataTablePagination
        className="col-span-2 sm:col-span-1 sm:col-start-2 sm:row-start-1"
        form={id}
      />
    </div>
  );
}

DataTable.Controls = DataTableControls;
DataTable.Item = DataTableItem;
DataTable.Row = DataTableRow;
DataTable.Header = DataTableHeader;

export { DataTable };
