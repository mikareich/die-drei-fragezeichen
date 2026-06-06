import { cn } from "~/utils/cn.ts";

export type LogoProps = React.ComponentProps<"div">;

export function Logo({ className, ...props }: LogoProps): React.ReactNode {
  return (
    <div
      className={cn(
        "w-fit select-none text-nowrap bg-theme-primary px-4 py-3 font-bold",
        className,
      )}
      {...props}
    >
      <span className="inline-block text-brand-white">?</span>
      <span className="inline-block text-brand-red">?</span>
      <span className="inline-block text-brand-blue">?</span>

      <span className="ml-3 text-theme-foreground">Das Archiv</span>
    </div>
  );
}
