import { Root, Slottable } from "@radix-ui/react-slot";
import { cva } from "class-variance-authority";
import React from "react";
import { cn } from "~/utils/cn.ts";

type ButtonProps = React.ComponentProps<"button"> & {
  prefixIcon?: React.ReactNode;
  suffixIcon?: React.ReactNode;
  mode?: "filled" | "outlined";
  asChild?: boolean;
};

const buttonStyles: (props: Pick<ButtonProps, "mode" | "disabled">) => string =
  cva(
    "flex px-4 py-3 gap-3 border items-center text-action leading-none cursor-pointer transition focus:outlined select-none",
    {
      variants: {
        mode: {
          filled:
            "bg-theme-primary border-2 border-theme-primary text-theme-foreground",
          outlined: "bg-theme-background border-theme-border text-theme-text",
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

export function Button({
  prefixIcon,
  suffixIcon,
  mode = "filled",
  className,
  asChild,
  children,
  disabled = false,
  ...props
}: ButtonProps): React.ReactNode {
  let Comp: "button" | typeof Root = "button";
  if (asChild) {
    Comp = Root;
  }

  let slottedChildren = children && (
    <span className="flex-1 truncate">{children}</span>
  );

  if (React.isValidElement<HTMLElement>(children)) {
    slottedChildren = React.cloneElement(
      children,
      children.props,
      <span className="flex-1 truncate">
        {children.props.children as React.ReactNode}
      </span>,
    );
  }

  return (
    <Comp
      className={cn(buttonStyles({ mode, disabled }), className)}
      disabled={disabled}
      {...props}
    >
      {prefixIcon && (
        <span className="shrink-0 text-theme-text-subtle">{prefixIcon}</span>
      )}

      <Slottable>{slottedChildren}</Slottable>

      {suffixIcon && (
        <span className="shrink-0 text-theme-text-subtle">{suffixIcon}</span>
      )}
    </Comp>
  );
}
