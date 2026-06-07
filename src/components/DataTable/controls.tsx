import { cn } from "~/utils/cn.ts";
import { Button } from "../Button.tsx";

type DataTablePaginationProps = React.ComponentProps<"div"> & { form: string };

type DataTableControlsProps = React.ComponentProps<"form"> & { id: string };

export function DataTableControls({
  className,
  children,
  id,
  ...props
}: DataTableControlsProps): React.ReactNode {
  return (
    <form
      id={id}
      className={cn("mb-2 flex items-center w-full sm:gap-2", className)}
      {...props}
    >
      {children}

      <span className="flex-1" />

      <DataTablePagination className="not-sm:hidden" form={id} />
    </form>
  );
}

export function DataTablePagination({
  className,
  form,
  ...props
}: DataTablePaginationProps): React.ReactNode {
  // biome-ignore lint/style/noMagicNumbers: temp
  const pageSlice = [3, 4, 5, 6, 7];

  return (
    <div className={cn("flex gap-2", className)} {...props}>
      {pageSlice.map((pageNumber) => (
        <Button
          key={pageNumber}
          asChild={true}
          mode="outlined"
          className="focus-within:outlined aspect-square w-auto"
        >
          <label>
            {pageNumber}
            <input
              form={form}
              type="radio"
              name="page"
              className="-z-1 absolute"
            />
          </label>
        </Button>
      ))}
    </div>
  );
}
