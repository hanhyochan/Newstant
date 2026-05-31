import type { ReactNode } from "react";

import { cn } from "../shared/utils";

type ChipLabelKind = "articleCategory" | "commentChoice" | "policy" | "policyAccent";

export type ChipLabelProps = {
  children: ReactNode;
  kind: ChipLabelKind;
};

export function ChipLabel({ children, kind }: ChipLabelProps) {
  const classNameByKind: Record<ChipLabelKind, string> = {
    articleCategory: "chip_articleCategory",
    commentChoice: "badge_commentChoice",
    policy: "chip_policy",
    policyAccent: "chip_policy chip_policyAccent",
  };

  return (
    <span
      className={cn(
        "chip",
        "chip_small",
        "chip_filled",
        "chip_full",
        classNameByKind[kind],
      )}
    >
      {children}
    </span>
  );
}
