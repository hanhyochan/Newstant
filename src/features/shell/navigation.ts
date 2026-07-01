import type { IconName } from "@/design-system/components";

export type Tab = "home" | "all" | "policy" | "my" | "info";
export type NavigationItem = { icon: IconName; label: string; tab: Tab };

export const navItems: NavigationItem[] = [
  { icon: "home", label: "메인화면", tab: "home" },
  { icon: "allNews", label: "전체 뉴스", tab: "all" },
  { icon: "policy", label: "국가정책", tab: "policy" },
  { icon: "myPage", label: "마이페이지", tab: "my" },
  { icon: "information", label: "인포메이션", tab: "info" },
];
