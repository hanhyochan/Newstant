import { currentUserId } from "../auth/current-user";
import { createMockId, createTimestamp } from "./api-utils";
import { apiClient } from "./http-client";
import type {
  CreateNotificationSettingsInput,
  NotificationSettings,
  UpdateNotificationSettingsInput,
} from "./types";

export const notificationApi = {
  async getNotificationSettings(userId = currentUserId) {
    const settings = await apiClient.get<NotificationSettings[]>("/notificationSettings", {
      userId,
    });

    return settings[0] ?? null;
  },
  createNotificationSettings(input: CreateNotificationSettingsInput) {
    return apiClient.post<NotificationSettings, NotificationSettings>("/notificationSettings", {
      id: createMockId("notification"),
      userId: input.userId,
      breakingNews: input.breakingNews ?? true,
      commentReplies: input.commentReplies ?? true,
      notices: input.notices ?? true,
      darkMode: input.darkMode ?? false,
      updatedAt: createTimestamp(),
    });
  },
  updateNotificationSettings(
    settingsId: string,
    input: UpdateNotificationSettingsInput,
  ) {
    return apiClient.patch<
      NotificationSettings,
      UpdateNotificationSettingsInput & Pick<NotificationSettings, "updatedAt">
    >(`/notificationSettings/${settingsId}`, {
      ...input,
      updatedAt: createTimestamp(),
    });
  },
};
