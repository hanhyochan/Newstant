import type { ReactNode } from "react";

import { FieldActionButton } from "@/design-system/components";

export function SignupFieldActionButton({
  children,
  disabled,
  onClick,
}: {
  children: ReactNode;
  disabled: boolean;
  onClick: () => void | Promise<void>;
}) {
  return (
    <FieldActionButton
      disabled={disabled}
      onClick={onClick}
      type="button"
    >
      {children}
    </FieldActionButton>
  );
}

