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
  nickname: "콩콩이",
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
  return userId === currentUser.id ? currentUser.nickname : "홍길동";
}
