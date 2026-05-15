import type { ReactNode } from "react";

type ChipLabelKind = "articleCategory" | "commentChoice";

export type ChipLabelProps = {
  children: ReactNode;
  kind: ChipLabelKind;
};

export function ChipLabel({ children, kind }: ChipLabelProps) {
  const className = kind === "articleCategory" ? "chip_articleCategory" : "badge_commentChoice";

  return <span className={className}>{children}</span>;
}
