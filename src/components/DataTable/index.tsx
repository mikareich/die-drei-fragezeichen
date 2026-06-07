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
    <div className="space-y-6">
      <header className="border-b border-theme-border">{controls}</header>

      <ol className={cn("grid grid-cols-4 gap-x-6 gap-y-4", className)}>
        {header}

        {rows}
      </ol>

      <footer className="sm:hidden w-full flex justify-end gap-2">
        <DataTablePagination form={id} />
      </footer>
    </div>
  );
}

DataTable.Controls = DataTableControls;
DataTable.Item = DataTableItem;
DataTable.Row = DataTableRow;
DataTable.Header = DataTableHeader;

export { DataTable };
