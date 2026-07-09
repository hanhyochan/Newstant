export function getAppPortalRoot() {
  if (typeof document === "undefined") {
    return null;
  }

  return (
    document.querySelector<HTMLElement>("[data-app-portal-root]") ??
    document.body
  );
}
