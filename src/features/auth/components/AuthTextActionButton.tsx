import type { MouseEventHandler, ReactNode } from "react";

import { TextButton } from "@/design-system/components";

export function AuthTextActionButton({
  children,
  onClick,
}: {
  children: ReactNode;
  onClick: MouseEventHandler<HTMLButtonElement>;
}) {
  return (
    <TextButton onClick={onClick} type="button">
      {children}
    </TextButton>
  );
}

