export function getNewsrollPortalRoot() {
  if (typeof document === "undefined") {
    return null;
  }

  return (
    document.querySelector<HTMLElement>("[data-newsroll-portal-root]") ??
    document.body
  );
}
