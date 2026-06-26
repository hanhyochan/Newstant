import { useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";

type BottomFixedActionBarProps = {
  ariaLabel: string;
  children: ReactNode;
  className?: string;
  id?: string;
  isLeaving?: boolean;
};

export const bottomFixedActionBarExitDurationMs = 260;

export function BottomFixedActionBar({
  ariaLabel,
  children,
  className,
  id,
  isLeaving = false,
}: BottomFixedActionBarProps) {
  const [isMounted, setIsMounted] = useState(false);
  const classNames = [
    "container_commentComposerFixed",
    isLeaving ? "newsroll_motion_exitDown" : "newsroll_motion_enterUp",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  return createPortal(
    <div aria-label={ariaLabel} className={classNames} id={id} role="region">
      {children}
    </div>,
    document.body,
  );
}
