"use client";

import { useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";

import { Button } from "@/design-system/components";

type ConfirmDialogProps = {
  children?: ReactNode;
  cancelLabel?: string;
  confirmLabel?: string;
  message: string;
  onCancel?: () => void;
  onConfirm: () => void;
};

export function ConfirmDialog({
  cancelLabel = "취소",
  children,
  confirmLabel = "확인",
  message,
  onCancel,
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
      onClick={onCancel ?? onConfirm}
      role="dialog"
    >
      <div
        className="wrapper_myDialogContent"
        onClick={(event) => event.stopPropagation()}
      >
        <h3 className="text_myDialogTitle text_confirmDialogMessage">{message}</h3>
        {children}
        <div className="wrapper_commentEditActions">
          {onCancel ? (
            <Button
              className="btn_commentEditCancel"
              onClick={onCancel}
              radius="rounded"
              size="large"
              type="button"
              variant="filled"
            >
              {cancelLabel}
            </Button>
          ) : null}
          <Button
            className="btn_commentEditSave"
            onClick={onConfirm}
            radius="rounded"
            size="large"
            type="button"
            variant="filled"
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
