import type { ReactNode } from "react";

import { NewsRollTopFrame } from "./top-frame";

type NewsRollHeaderTopProps = {
  children: ReactNode;
  className?: string;
};

export function NewsRollHeaderTop({
  children,
  className,
}: NewsRollHeaderTopProps) {
  return (
    <NewsRollTopFrame headerBody={children} headerClassName={className} />
  );
}
