import { mockCurrentUserId } from "../mock-current-user";

const currentUserStorageKey = "newsroll.currentUser";

export type CurrentUser = {
  id: string;
  isAuthenticated: boolean;
  nickname: string;
};

export const fallbackCurrentUser: CurrentUser = {
  id: mockCurrentUserId,
  isAuthenticated: true,
  nickname: "\uCF69\uCF69\uC774",
};

const mockUserDisplayNames: Record<string, string> = {
  "user-5da62014-46f6-453f-8e3c-47bb64bdc700": "\uD584\uC2A4\uD130",
  "user-doyun": "\uB3C4\uC724",
  "user-haneul": "\uD558\uB298",
  "user-hong": "\uD64D\uAE38\uB3D9",
  "user-jiho": "\uC9C0\uD638",
  "user-jisoo": "\uC9C0\uC218",
  "user-junho": "\uC900\uD638",
  "user-kongkong": "\uCF69\uCF69\uC774",
  "user-minji": "\uBBFC\uC9C0",
  "user-seojin": "\uC11C\uC9C4",
  "user-soyeon": "\uC18C\uC5F0",
  "user-taeho": "\uD0DC\uD638",
  "user-yuna": "\uC720\uB098",
};

function readStoredCurrentUser() {
  if (typeof window === "undefined") {
    return null;
  }

  const stored =
    window.localStorage.getItem(currentUserStorageKey) ??
    window.sessionStorage.getItem(currentUserStorageKey);

  if (!stored) {
    return null;
  }

  try {
    return JSON.parse(stored) as CurrentUser;
  } catch {
    return null;
  }
}

let currentUser = fallbackCurrentUser;

export let currentUserId = currentUser.id;

export function getCurrentUserSnapshot() {
  return currentUser;
}

export function hasCurrentUserSession() {
  return currentUser.id !== fallbackCurrentUser.id;
}

export function hydrateCurrentUserSession() {
  const storedUser = readStoredCurrentUser();

  if (!storedUser) {
    return null;
  }

  currentUser = storedUser;
  currentUserId = storedUser.id;

  return storedUser;
}

export function setCurrentUserSession(
  user: Pick<CurrentUser, "id" | "nickname">,
  options: { remember: boolean },
) {
  currentUser = {
    id: user.id,
    isAuthenticated: true,
    nickname: user.nickname,
  };
  currentUserId = currentUser.id;

  if (typeof window === "undefined") {
    return;
  }

  const storage = options.remember ? window.localStorage : window.sessionStorage;
  const otherStorage = options.remember ? window.sessionStorage : window.localStorage;

  otherStorage.removeItem(currentUserStorageKey);
  storage.setItem(currentUserStorageKey, JSON.stringify(currentUser));
}

export function clearCurrentUserSession() {
  currentUser = fallbackCurrentUser;
  currentUserId = fallbackCurrentUser.id;

  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(currentUserStorageKey);
  window.sessionStorage.removeItem(currentUserStorageKey);
}

export function getCurrentUserDisplayName(userId: string) {
  return userId === currentUser.id
    ? currentUser.nickname
    : mockUserDisplayNames[userId] ?? "\uD64D\uAE38\uB3D9";
}
