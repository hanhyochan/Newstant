import type { ButtonHTMLAttributes, HTMLAttributes, ReactNode } from "react";

import { cn } from "../shared/utils";

export type NewsRollCheckBoxProps = Omit<HTMLAttributes<HTMLSpanElement>, "children"> & {
  checked?: boolean;
  size?: "medium" | "small";
};

export function NewsRollCheckBox({
  checked = false,
  className,
  size = "medium",
  ...props
}: NewsRollCheckBoxProps) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "box_newsrollCheck",
        `box_newsrollCheck_${size}`,
        checked && "is_checked",
        className,
      )}
      {...props}
    >
      {checked ? "✓" : ""}
    </span>
  );
}

export type NewsRollCheckFieldProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "children"
> & {
  checked?: boolean;
  label: ReactNode;
  size?: "medium" | "small";
};

export function NewsRollCheckField({
  checked = false,
  className,
  label,
  size = "medium",
  ...props
}: NewsRollCheckFieldProps) {
  return (
    <button
      aria-pressed={checked}
      className={cn(
        "btn_newsrollCheckField",
        `btn_newsrollCheckField_${size}`,
        className,
      )}
      type="button"
      {...props}
    >
      <NewsRollCheckBox checked={checked} size={size} />
      <span>{label}</span>
    </button>
  );
}

export type NewsRollSmallCheckFieldProps = Omit<NewsRollCheckFieldProps, "size">;

export function NewsRollSmallCheckField(props: NewsRollSmallCheckFieldProps) {
  return <NewsRollCheckField {...props} size="small" />;
}

export type NewsRollMediumCheckFieldProps = Omit<NewsRollCheckFieldProps, "size">;

export function NewsRollMediumCheckField(props: NewsRollMediumCheckFieldProps) {
  return <NewsRollCheckField {...props} size="medium" />;
}
