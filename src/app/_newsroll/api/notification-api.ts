import { mockCurrentUserId } from "../mock-current-user";
import { createTimestamp } from "./api-utils";
import { apiClient } from "./http-client";
import type { NotificationSettings, UpdateNotificationSettingsInput } from "./types";

export const notificationApi = {
  async getNotificationSettings(userId = mockCurrentUserId) {
    const settings = await apiClient.get<NotificationSettings[]>("/notificationSettings", {
      userId,
    });

    return settings[0] ?? null;
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
