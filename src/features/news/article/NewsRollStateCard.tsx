import type { ReactNode } from "react";

export function NewsRollStateCard({
  children,
  role,
}: {
  children: ReactNode;
  role?: "alert" | "status";
}) {
  return (
    <article className="container_articleCard wrapper_panelSurface_style homeStateCard">
      <div
        className="wrapper_articleCardContent wrapper_panelContent u_minH0 homeStateContent u_gap24"
        role={role}
        tabIndex={0}
      >
        {children}
      </div>
    </article>
  );
}
