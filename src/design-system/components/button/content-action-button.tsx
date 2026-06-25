import type {
  AnchorHTMLAttributes,
  ButtonHTMLAttributes,
  ReactNode,
} from "react";

import { cn } from "../shared/utils";

type ContentActionButtonSharedProps = {
  children: ReactNode;
  className?: string;
  disabled?: boolean;
  href?: string;
  tone?: "dark" | "light";
};

type ContentActionNativeButtonProps = ContentActionButtonSharedProps &
  ButtonHTMLAttributes<HTMLButtonElement> & {
    href?: undefined;
  };

type ContentActionAnchorButtonProps = ContentActionButtonSharedProps &
  AnchorHTMLAttributes<HTMLAnchorElement> & {
    href: string;
  };

export type ContentActionButtonProps =
  | ContentActionNativeButtonProps
  | ContentActionAnchorButtonProps;

export function ContentActionButton({
  children,
  className,
  disabled = false,
  href,
  tone = "light",
  ...props
}: ContentActionButtonProps) {
  const classNames = cn("btn_originalArticle", className);

  if (href) {
    return (
      <a
        aria-disabled={disabled ? "true" : undefined}
        className={classNames}
        data-tone={tone}
        href={disabled ? undefined : href}
        tabIndex={disabled ? -1 : props.tabIndex}
        {...(props as AnchorHTMLAttributes<HTMLAnchorElement>)}
      >
        {children}
      </a>
    );
  }

  return (
    <button
      className={classNames}
      data-tone={tone}
      disabled={disabled}
      type="button"
      {...(props as ButtonHTMLAttributes<HTMLButtonElement>)}
    >
      {children}
    </button>
  );
}
