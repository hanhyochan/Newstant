export const signupViewOrder = [
  "signupAgreement",
  "signupEmail",
  "signupNickname",
  "signupPassword",
  "signupAge",
  "signupCategory",
] as const;

export type SignupView = (typeof signupViewOrder)[number];
export type PasswordResetView = "passwordResetEmail" | "passwordResetPassword";
export type AuthView = "login" | SignupView | PasswordResetView;

export function isAuthView(view: string): view is AuthView {
  return (
    view === "login" ||
    view === "passwordResetEmail" ||
    view === "passwordResetPassword" ||
    signupViewOrder.includes(view as SignupView)
  );
}

export function getNextAuthView(
  currentView: AuthView,
): AuthView | "home" {
  if (currentView === "login") {
    return signupViewOrder[0];
  }

  if (currentView === "passwordResetEmail") {
    return "passwordResetPassword";
  }

  if (currentView === "passwordResetPassword") {
    return "login";
  }

  const currentIndex = signupViewOrder.indexOf(currentView);

  return signupViewOrder[currentIndex + 1] ?? "home";
}

export function getPreviousAuthView(currentView: AuthView): AuthView {
  if (currentView === "passwordResetPassword") {
    return "passwordResetEmail";
  }

  if (currentView === "passwordResetEmail") {
    return "login";
  }

  if (currentView === "login" || currentView === signupViewOrder[0]) {
    return "login";
  }

  const currentIndex = signupViewOrder.indexOf(currentView);

  return signupViewOrder[currentIndex - 1] ?? "login";
}
