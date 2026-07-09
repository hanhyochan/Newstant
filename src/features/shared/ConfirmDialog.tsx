"use client";

import { useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";

import { getAppPortalRoot } from "@/features/shared/app-portal-root";

import { PrimaryButton, PrimaryButtonGroup } from "@/design-system/components";

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
      className="container_dialog"
      onClick={onCancel ?? onConfirm}
      role="dialog"
    >
      <div
        className="wrapper_dialogContent"
        onClick={(event) => event.stopPropagation()}
      >
        <h3 className="text_myDialogTitle text_confirmDialogMessage">{message}</h3>
        {children}
        <PrimaryButtonGroup columns={onCancel ? 2 : 1}>
          {onCancel ? (
            <PrimaryButton
              onClick={onCancel}
              tone="neutral"
              type="button"
            >
              {cancelLabel}
            </PrimaryButton>
          ) : null}
          <PrimaryButton
            onClick={onConfirm}
            type="button"
          >
            {confirmLabel}
          </PrimaryButton>
        </PrimaryButtonGroup>
      </div>
    </div>,
    getAppPortalRoot() ?? document.body,
  );
}
