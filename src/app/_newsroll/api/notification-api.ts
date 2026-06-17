import { currentUserId } from "../auth/current-user";
import { createMockId, createTimestamp } from "./api-utils";
import { apiClient } from "./http-client";
import type {
  AppNotification,
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
  getNotifications(userId = currentUserId) {
    return apiClient.get<AppNotification[]>("/notifications", {
      _sort: "createdAt",
      _order: "desc",
      userId,
    });
  },
  markNotificationAsRead(notificationId: string) {
    return apiClient.patch<
      AppNotification,
      Pick<AppNotification, "isRead" | "readAt">
    >(`/notifications/${notificationId}`, {
      isRead: true,
      readAt: createTimestamp(),
    });
  },
  async markAllNotificationsAsRead(userId = currentUserId) {
    const notifications = await this.getNotifications(userId);
    const unreadNotifications = notifications.filter((notification) => !notification.isRead);

    return Promise.all(
      unreadNotifications.map((notification) =>
        this.markNotificationAsRead(notification.id),
      ),
    );
  },
};
