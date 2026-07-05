import type { ReactNode } from "react";

export function AuthLayout({
  ariaLabel,
  children,
  className,
}: {
  ariaLabel: string;
  children: ReactNode;
  className?: string;
}) {
  const classNames = ["container_authLayout", className]
    .filter(Boolean)
    .join(" ");

  return (
    <section className={classNames} aria-label={ariaLabel}>
      {children}
    </section>
  );
}

