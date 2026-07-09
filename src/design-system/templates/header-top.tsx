import type { ReactNode } from "react";

import { TopFrame } from "./top-frame";

type HeaderTopProps = {
  children: ReactNode;
  className?: string;
};

export function HeaderTop({
  children,
  className,
}: HeaderTopProps) {
  return (
    <TopFrame headerBody={children} headerClassName={className} />
  );
}
