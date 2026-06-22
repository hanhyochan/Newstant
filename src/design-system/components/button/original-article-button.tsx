import type {
  AnchorHTMLAttributes,
  ButtonHTMLAttributes,
  ReactNode,
} from "react";

import { cn } from "../shared/utils";

type OriginalArticleButtonSharedProps = {
  children: ReactNode;
  className?: string;
  disabled?: boolean;
  href?: string;
};

type OriginalArticleNativeButtonProps = OriginalArticleButtonSharedProps &
  ButtonHTMLAttributes<HTMLButtonElement> & {
    href?: undefined;
  };

type OriginalArticleAnchorButtonProps = OriginalArticleButtonSharedProps &
  AnchorHTMLAttributes<HTMLAnchorElement> & {
    href: string;
  };

export type OriginalArticleButtonProps =
  | OriginalArticleNativeButtonProps
  | OriginalArticleAnchorButtonProps;

export function OriginalArticleButton({
  children,
  className,
  disabled = false,
  href,
  ...props
}: OriginalArticleButtonProps) {
  const classNames = cn("btn_originalArticle", className);

  if (href) {
    return (
      <a
        aria-disabled={disabled ? "true" : undefined}
        className={classNames}
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
      disabled={disabled}
      type="button"
      {...(props as ButtonHTMLAttributes<HTMLButtonElement>)}
    >
      {children}
    </button>
  );
}
