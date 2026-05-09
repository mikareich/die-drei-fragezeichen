import { cva } from "class-variance-authority";
import React from "react";
import cn from "~/utils/cn";

export const inputContainerStyles = cva(
  `flex items-center px-4 py-3 gap-3 bg-theme-background border border-theme-border
  leading-none text-theme-text w-min transition cursor-text`,
  {
    variants: {
      disabled: {
        true: "cursor-not-allowed",
        false:
          "focus-within:bg-theme-background-accent focus-within:outlined hover:bg-theme-background-accent",
      },
    },
  },
);

export const inputStyles = cva(
  "outline-0 flex-1 min-w-0 placeholder:text-theme-text-subtle disabled:cursor-not-allowed",
);

type InputProps = React.ComponentProps<"input"> & {
  prefixIcon?: React.ReactNode;
  suffixIcon?: React.ReactNode;
};

export default function Input({
  prefixIcon,
  suffixIcon,
  className,
  id,
  disabled,
  ...props
}: InputProps) {
  const fallbackId = React.useId();
  id ||= fallbackId;

  return (
    <label
      className={cn(inputContainerStyles({ disabled }), className)}
      htmlFor={id}
    >
      {prefixIcon && (
        <span className="shrink-0 text-theme-text-subtle">{prefixIcon}</span>
      )}

      <input id={id} className={inputStyles()} disabled={disabled} {...props} />

      {suffixIcon && (
        <span className="shrink-0 text-theme-text-subtle">{suffixIcon}</span>
      )}
    </label>
  );
}
