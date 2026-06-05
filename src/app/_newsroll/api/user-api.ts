import { mockCurrentUserId } from "../mock-current-user";
import { createTimestamp } from "./api-utils";
import { apiClient } from "./http-client";
import type { User, UserPreference } from "./types";

export const userApi = {
  getCurrentUser(userId = mockCurrentUserId) {
    return apiClient.get<User>(`/users/${userId}`);
  },
  getUserPreferences(userId = mockCurrentUserId) {
    return apiClient.get<UserPreference[]>("/userPreferences", {
      userId,
    });
  },
  updateUserPreferences(preferenceId: string, input: Partial<UserPreference>) {
    return apiClient.patch<UserPreference, Partial<UserPreference>>(
      `/userPreferences/${preferenceId}`,
      {
        ...input,
        updatedAt: createTimestamp(),
      },
    );
  },
};
