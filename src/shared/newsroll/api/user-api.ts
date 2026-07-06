import { currentUserId } from "../auth/current-user";
import { createMockId, createTimestamp } from "./api-utils";
import { createSessionResourceCache } from "./cache";
import { apiClient } from "./http-client";
import type { CreateUserInput, UpdateUserInput, User, UserPreference } from "./types";

function normalizeEmail(email: string) {
  return email.trim().toLocaleLowerCase("en-US");
}

function normalizeLoginId(loginId: string) {
  return loginId.trim().toLocaleLowerCase("en-US");
}

const userPreferencesCache = createSessionResourceCache(
  (userId: string = currentUserId) =>
    apiClient.get<UserPreference[]>("/userPreferences", {
      userId,
    }),
  (userId: string = currentUserId) => userId,
);

export function invalidateUserPreferencesCache(userId?: string) {
  if (userId) {
    userPreferencesCache.invalidate(userId);
    return;
  }

  userPreferencesCache.clear();
}

export const userApi = {
  getUsers() {
    return apiClient.get<User[]>("/users");
  },
  getCurrentUser(userId = currentUserId) {
    return apiClient.get<User>(`/users/${userId}`);
  },
  async getUserByEmail(email: string) {
    const users = await apiClient.get<User[]>("/users", {
      email: normalizeEmail(email),
    });

    return users[0] ?? null;
  },
  async getUserByNickname(nickname: string) {
    const users = await apiClient.get<User[]>("/users", {
      nickname: nickname.trim(),
    });

    return users[0] ?? null;
  },
  async getUserByLoginId(loginId: string) {
    const users = await apiClient.get<User[]>("/users", {
      loginId: normalizeLoginId(loginId),
    });

    return users[0] ?? null;
  },
  async login(input: Pick<User, "email"> & { password: string }) {
    const user = await userApi.getUserByEmail(input.email);

    if (!user || user.password !== input.password) {
      return null;
    }

    return user;
  },
  createUser(input: CreateUserInput) {
    const timestamp = createTimestamp();

    return apiClient.post<User, User>("/users", {
      id: createMockId("user"),
      loginId: normalizeLoginId(input.loginId),
      nickname: input.nickname.trim(),
      email: normalizeEmail(input.email),
      password: input.password,
      ageGroupId: input.ageGroupId,
      agreementIds: input.agreementIds,
      marketingAgreed: input.marketingAgreed,
      createdAt: timestamp,
      updatedAt: timestamp,
    });
  },
  updateUser(userId: string, input: UpdateUserInput) {
    const nextInput = {
      ...input,
      email: input.email ? normalizeEmail(input.email) : undefined,
      loginId: input.loginId ? normalizeLoginId(input.loginId) : undefined,
      nickname: input.nickname?.trim(),
      updatedAt: createTimestamp(),
    };

    return apiClient.patch<User, UpdateUserInput & { updatedAt: string }>(
      `/users/${userId}`,
      nextInput,
    );
  },
  getUserPreferences(userId = currentUserId) {
    return userPreferencesCache.get(userId);
  },
  async createUserPreferences(input: Omit<UserPreference, "id" | "updatedAt">) {
    const preference = await apiClient.post<UserPreference, UserPreference>("/userPreferences", {
      id: createMockId("user-preference"),
      userId: input.userId,
      categoryIds: input.categoryIds,
      pressIds: input.pressIds,
      ageGroupId: input.ageGroupId,
      updatedAt: createTimestamp(),
    });

    invalidateUserPreferencesCache(input.userId);

    return preference;
  },
  async updateUserPreferences(preferenceId: string, input: Partial<UserPreference>) {
    const preference = await apiClient.patch<UserPreference, Partial<UserPreference>>(
      `/userPreferences/${preferenceId}`,
      {
        ...input,
        updatedAt: createTimestamp(),
      },
    );

    invalidateUserPreferencesCache(preference.userId ?? input.userId);

    return preference;
  },
};
