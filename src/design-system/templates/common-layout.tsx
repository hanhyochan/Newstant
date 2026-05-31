"use client";

import {
  forwardRef,
  type HTMLAttributes,
  type ReactNode,
  type Ref,
  type RefCallback,
} from "react";

import { useDockedSheet } from "./hooks/use-docked-sheet";

type NewsRollCommonLayoutProps = HTMLAttributes<HTMLElement> & {
  children: ReactNode;
  dockedClassName?: string;
  dockedControlsSelector?: string;
  dockedGap?: number;
  fixedInitialTop?: number;
  initialGap?: number;
  initiallyDocked?: boolean;
  lockSheetPosition?: boolean;
  minInitialTop?: number;
  movingSheet?: boolean;
  sheetClassName?: string;
  sheetNestedScrollResetSelector?: string;
  sheetRef?: Ref<HTMLDivElement>;
  sheetScrollSelector?: string;
  sheetProps?: HTMLAttributes<HTMLDivElement>;
  top: ReactNode;
  topClassName?: string;
  topRef?: Ref<HTMLDivElement>;
  topProps?: HTMLAttributes<HTMLDivElement>;
};

function mergeClassNames(...classNames: Array<string | undefined>) {
  return classNames.filter(Boolean).join(" ");
}

function assignRef<T>(ref: Ref<T> | undefined, value: T | null) {
  if (!ref) {
    return;
  }

  if (typeof ref === "function") {
    ref(value);
    return;
  }

  (ref as { current: T | null }).current = value;
}

function mergeRefs<T>(...refs: Array<Ref<T> | undefined>): RefCallback<T> {
  return (value) => {
    refs.forEach((ref) => assignRef(ref, value));
  };
}

export const NewsRollCommonLayout = forwardRef<HTMLElement, NewsRollCommonLayoutProps>(function NewsRollCommonLayout({
  children,
  className,
  dockedClassName = "is_newsrollSheetDocked",
  dockedControlsSelector,
  dockedGap = 16,
  fixedInitialTop,
  initialGap = 40,
  initiallyDocked = false,
  lockSheetPosition = false,
  minInitialTop,
  movingSheet = false,
  sheetClassName,
  sheetNestedScrollResetSelector,
  sheetProps,
  sheetRef,
  sheetScrollSelector,
  top,
  topClassName = "container_home newsroll_sheetFrameTop",
  topProps,
  topRef,
  ...rootProps
}, rootRef) {
  const {
    onTouchCancelCapture,
    onTouchEndCapture,
    onTouchMoveCapture,
    onTouchStartCapture,
    onWheelCapture,
    ...sectionProps
  } = rootProps;
  const dockedSheet = useDockedSheet({
    children,
    dockedControlsSelector,
    dockedGap,
    fixedInitialTop,
    initialGap,
    initiallyDocked,
    lockSheetPosition,
    minInitialTop,
    movingSheet,
    onTouchCancelCapture,
    onTouchEndCapture,
    onTouchMoveCapture,
    onTouchStartCapture,
    onWheelCapture,
    sheetNestedScrollResetSelector,
    sheetScrollSelector,
    top,
  });

  return (
    <section
      {...sectionProps}
      className={mergeClassNames(
        "newsroll_common_layout",
        movingSheet ? "newsroll_common_layout_movingSheet" : undefined,
        movingSheet && dockedSheet.isSheetDocked ? dockedClassName : undefined,
        className,
      )}
      onTouchCancelCapture={movingSheet ? dockedSheet.handleTouchCancel : onTouchCancelCapture}
      onTouchEndCapture={movingSheet ? dockedSheet.handleTouchEnd : onTouchEndCapture}
      onTouchMoveCapture={movingSheet ? dockedSheet.handleTouchMove : onTouchMoveCapture}
      onTouchStartCapture={movingSheet ? dockedSheet.handleTouchStart : onTouchStartCapture}
      onWheelCapture={movingSheet ? dockedSheet.handleWheel : onWheelCapture}
      ref={mergeRefs(dockedSheet.rootRef, rootRef)}
    >
      <div
        {...topProps}
        className={mergeClassNames("newsroll_common_top", topClassName, topProps?.className)}
        ref={mergeRefs(dockedSheet.topRef, topRef)}
      >
        {top}
      </div>
      <div
        {...sheetProps}
        className={mergeClassNames("newsroll_common_sheet", sheetClassName, sheetProps?.className)}
        ref={mergeRefs(dockedSheet.sheetRef, sheetRef)}
      >
        {children}
      </div>
    </section>
  );
});
