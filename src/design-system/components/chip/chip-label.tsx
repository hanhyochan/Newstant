import type { ReactNode } from "react";

export type ChipLabelProps = {
  children: ReactNode;
};

export function ChipLabel({ children }: ChipLabelProps) {
  return <span className="chip">{children}</span>;
}
