export const signupViewOrder = [
  "signupAgreement",
  "signupEmail",
  "signupNickname",
  "signupPassword",
  "signupAge",
  "signupCategory",
] as const;

export type SignupView = (typeof signupViewOrder)[number];
export type AuthView = "login" | SignupView;

export function isAuthView(view: string): view is AuthView {
  return view === "login" || signupViewOrder.includes(view as SignupView);
}

export function getNextAuthView(currentView: AuthView): SignupView | "home" {
  if (currentView === "login") {
    return signupViewOrder[0];
  }

  const currentIndex = signupViewOrder.indexOf(currentView);

  return signupViewOrder[currentIndex + 1] ?? "home";
}

export function getPreviousAuthView(currentView: AuthView): AuthView {
  if (currentView === "login" || currentView === signupViewOrder[0]) {
    return "login";
  }

  const currentIndex = signupViewOrder.indexOf(currentView);

  return signupViewOrder[currentIndex - 1] ?? "login";
}
