import { isAuthView } from "@/features/auth/auth-flow";
import type { BlockedKeywordSetting } from "@/features/news/model";
import type { Tab } from "@/features/shell/navigation";
import type { BlockedKeywordPreference } from "@/shared/newstant/api";

export type View =
  | Tab
  | "notifications"
  | "search"
  | "login"
  | "passwordResetEmail"
  | "passwordResetPassword"
  | "signupAgreement"
  | "signupEmail"
  | "signupNickname"
  | "signupPassword"
  | "signupAge"
  | "signupCategory";

export type SignupDraft = {
  ageGroupId?: string;
  agreementIds?: string[];
  categoryIds?: string[];
  email?: string;
  marketingAgreed?: boolean;
  nickname?: string;
  password?: string;
};

export function isProtectedView(view: View) {
  return !isAuthView(view);
}

export function getActiveViewResetKey(
  activeView: View,
  viewResetKeys: Record<Tab, number>,
) {
  return activeView === "search" ||
    activeView === "notifications" ||
    activeView === "login" ||
    activeView === "passwordResetEmail" ||
    activeView === "passwordResetPassword" ||
    activeView === "signupAgreement" ||
    activeView === "signupEmail" ||
    activeView === "signupNickname" ||
    activeView === "signupPassword" ||
    activeView === "signupAge" ||
    activeView === "signupCategory"
    ? 0
    : viewResetKeys[activeView];
}

export function normalizeBlockedKeyword(value: string) {
  return value.trim().toLocaleLowerCase("ko-KR");
}

export function getBlockedKeywordSettingsFromApi(
  items: BlockedKeywordPreference[],
): BlockedKeywordSetting[] {
  return items.map((item) => ({
    id: item.id,
    isActive: item.isActive,
    keyword: item.keyword,
  }));
}

export function getSignupAgeGroupId(ageId: string) {
  if (ageId === "teens") {
    return "minor";
  }

  if (ageId === "sixties") {
    return "senior";
  }

  if (ageId === "twenties") {
    return "youth";
  }

  return "middle";
}

export function getSignupCategoryId(categoryId: string) {
  return categoryId === "tech" ? "science" : categoryId;
}