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

export function getNextAuthView(currentView: AuthView) {
  if (currentView === "login") {
    return signupViewOrder[0];
  }

  const currentIndex = signupViewOrder.indexOf(currentView);

  return signupViewOrder[currentIndex + 1] ?? "home";
}
