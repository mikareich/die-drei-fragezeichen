import * as Slot from "@radix-ui/react-slot";
import { cva } from "class-variance-authority";
import React from "react";
import cn from "~/utils/cn";

const buttonStyles = cva(
  "flex px-4 py-3 gap-3 border items-center text-action cursor-pointer transition focus:outlined select-none",
  {
    variants: {
      mode: {
        filled:
          "bg-theme-primary border-2 border-theme-primary text-theme-foreground",
        outlined: "bg-transparent border-theme-border text-theme-text",
      },
      disabled: {
        true: "cursor-not-allowed opacity-50",
      },
    },
    compoundVariants: [
      {
        disabled: false,
        mode: "filled",
        className: "focus:bg-theme-primary/80 hover:bg-theme-primary/80",
      },
      {
        disabled: false,
        mode: "outlined",
        className:
          "focus:bg-theme-background-accent hover:bg-theme-background-accent",
      },
      {
        disabled: true,
        mode: "outlined",
        className: "bg-theme-background-accent",
      },
    ],
  },
);

type ButtonProps = React.ComponentProps<"button"> & {
  prefixIcon?: React.ReactNode;
  suffixIcon?: React.ReactNode;
  mode?: "filled" | "outlined";
  asChild?: boolean;
};

export default function Button({
  prefixIcon,
  suffixIcon,
  mode = "filled",
  className,
  asChild,
  children,
  disabled,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot.Root : "button";

  const slottedChildren = React.isValidElement<HTMLElement>(children)
    ? React.cloneElement(
        children,
        children.props,
        <span className="flex-1 truncate">
          {children.props.children as React.ReactNode}
        </span>,
      )
    : children && <span className="flex-1 truncate">{children}</span>;

  return (
    <Comp
      className={cn(buttonStyles({ mode, disabled }), className)}
      disabled={disabled}
      {...props}
    >
      {prefixIcon && (
        <span className="shrink-0 text-theme-text-subtle">{prefixIcon}</span>
      )}

      <Slot.Slottable>{slottedChildren}</Slot.Slottable>

      {suffixIcon && (
        <span className="shrink-0 text-theme-text-subtle">{suffixIcon}</span>
      )}
    </Comp>
  );
}
