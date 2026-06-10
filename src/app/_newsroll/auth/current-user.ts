import { mockCurrentUserId } from "../mock-current-user";

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

export const currentUserId = fallbackCurrentUser.id;

export function getCurrentUserSnapshot() {
  return fallbackCurrentUser;
}

export function getCurrentUserDisplayName(userId: string) {
  return userId === fallbackCurrentUser.id ? fallbackCurrentUser.nickname : "홍길동";
}
