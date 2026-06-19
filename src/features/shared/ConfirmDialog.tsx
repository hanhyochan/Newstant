"use client";

import { useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";

import { Button } from "@/design-system/components";

type ConfirmDialogProps = {
  children?: ReactNode;
  message: string;
  onConfirm: () => void;
};

export function ConfirmDialog({
  children,
  message,
  onConfirm,
}: ConfirmDialogProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  return createPortal(
    <div
      aria-modal="true"
      className="container_myDialog"
      onClick={onConfirm}
      role="dialog"
    >
      <div
        className="wrapper_myDialogContent"
        onClick={(event) => event.stopPropagation()}
      >
        <h3 className="text_myDialogTitle text_confirmDialogMessage">{message}</h3>
        {children}
        <div className="wrapper_commentEditActions">
          <Button
            className="btn_commentEditSave"
            onClick={onConfirm}
            radius="rounded"
            size="large"
            type="button"
            variant="filled"
          >
            확인
          </Button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
