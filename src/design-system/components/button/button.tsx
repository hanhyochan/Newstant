import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";

import { cn } from "../shared/utils";

type ButtonSize = "small" | "medium" | "large";
type ButtonVariant = "filled" | "outline";
type ButtonRadius = "square" | "rounded" | "full";
type ButtonTone = "default" | "danger";

type SharedButtonProps = {
  active?: boolean;
  children?: ReactNode;
  classNameOnly?: boolean;
  className?: string;
  disabled?: boolean;
  href?: string;
  iconOnly?: boolean;
  radius?: ButtonRadius;
  shadow?: boolean;
  shape?: ButtonRadius;
  size?: ButtonSize;
  tone?: ButtonTone;
  variant?: ButtonVariant;
};

type NativeButtonProps = SharedButtonProps &
  ButtonHTMLAttributes<HTMLButtonElement> & {
    href?: undefined;
  };

type AnchorButtonProps = SharedButtonProps &
  AnchorHTMLAttributes<HTMLAnchorElement> & {
    href: string;
  };

export type ButtonProps = NativeButtonProps | AnchorButtonProps;

export function Button({
  active = false,
  children,
  className,
  classNameOnly = false,
  disabled = false,
  href,
  iconOnly = false,
  radius,
  shadow = false,
  shape,
  size = "medium",
  tone = "default",
  variant = "outline",
  ...props
}: ButtonProps) {
  const resolvedRadius = radius ?? shape ?? "rounded";

  const classes = classNameOnly
    ? className
    : cn(
        "btn",
        `btn_${size}`,
        `btn_${variant}`,
        resolvedRadius === "rounded" && "btn_rounded",
        resolvedRadius === "full" && "btn_full_rounded",
        active && "btn_active",
        tone !== "default" && `btn_${tone}`,
        iconOnly && "btn_icon",
        shadow && "btn_shadow",
        className,
      );

  if (href) {
    return (
      <a
        className={classes}
        href={disabled ? undefined : href}
        aria-disabled={disabled ? "true" : undefined}
        tabIndex={disabled ? -1 : props.tabIndex}
        {...(props as AnchorHTMLAttributes<HTMLAnchorElement>)}
      >
        {children}
      </a>
    );
  }

  return (
    <button
      className={classes}
      disabled={disabled}
      type="button"
      {...(props as ButtonHTMLAttributes<HTMLButtonElement>)}
    >
      {children}
    </button>
  );
}
