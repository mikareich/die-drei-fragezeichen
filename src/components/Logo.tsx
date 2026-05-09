import cn from "~/utils/cn";

export type LogoProps = React.ComponentProps<"div">;

export default function Logo({ className, ...props }: LogoProps) {
  return (
    <div
      className={cn(
        "text-nowrap bg-theme-primary px-4 py-3 font-bold w-fit select-none",
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
