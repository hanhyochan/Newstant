"use client";

import {
  forwardRef,
  type HTMLAttributes,
  type ReactNode,
  type Ref,
} from "react";

type NewsRollCommonLayoutProps = HTMLAttributes<HTMLElement> & {
  children: ReactNode;
  sheetClassName?: string;
  sheetRef?: Ref<HTMLDivElement>;
  sheetProps?: HTMLAttributes<HTMLDivElement>;
  top: ReactNode;
  topClassName?: string;
  topRef?: Ref<HTMLDivElement>;
  topProps?: HTMLAttributes<HTMLDivElement>;
};

function mergeClassNames(...classNames: Array<string | undefined>) {
  return classNames.filter(Boolean).join(" ");
}

export const NewsRollCommonLayout = forwardRef<HTMLElement, NewsRollCommonLayoutProps>(function NewsRollCommonLayout({
  children,
  className,
  sheetClassName,
  sheetProps,
  sheetRef,
  top,
  topClassName,
  topProps,
  topRef,
  ...rootProps
}, rootRef) {
  return (
    <section
      {...rootProps}
      className={mergeClassNames("newsroll_common_layout", className)}
      ref={rootRef}
    >
      <div
        {...topProps}
        className={mergeClassNames("newsroll_common_top", topClassName, topProps?.className)}
        ref={topRef}
      >
        {top}
      </div>
      <div
        {...sheetProps}
        className={mergeClassNames("newsroll_common_sheet", sheetClassName, sheetProps?.className)}
        ref={sheetRef}
      >
        {children}
      </div>
    </section>
  );
});
