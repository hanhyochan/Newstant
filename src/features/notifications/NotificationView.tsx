"use client";

import { useEffect, useState } from "react";

import {
  notificationApi,
  type AppNotification,
} from "@/app/_newsroll/api";
import { hydrateCurrentUserSession } from "@/app/_newsroll/auth/current-user";
import { WhiteBreakingNewsCardLink } from "@/design-system/components";
import { NewsRollPurpleOverlayPage } from "@/design-system/templates";

type NotificationViewProps = {
  onClose: () => void;
  onSelectNotification: (notification: AppNotification) => void;
};

type NotificationListItem = AppNotification & {
  wasRead: boolean;
};

const notificationsUpdatedEventName = "newsroll:notifications-updated";

export function NotificationView({
  onClose,
  onSelectNotification,
}: NotificationViewProps) {
  const [notifications, setNotifications] = useState<NotificationListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    let ignore = false;

    async function loadNotifications() {
      setIsLoading(true);
      setLoadError("");

      try {
        hydrateCurrentUserSession();
        await notificationApi.syncNotifications();
        const nextNotifications = await notificationApi.getNotifications();
        const hasUnreadNotifications = nextNotifications.some(
          (notification) => !notification.isRead,
        );

        if (hasUnreadNotifications) {
          await notificationApi.markNotificationsAsRead(nextNotifications);
        }

        if (!ignore) {
          const readAt = new Date().toISOString();

          setNotifications(
            nextNotifications.map((notification) => ({
              ...notification,
              isRead: true,
              readAt: notification.readAt ?? readAt,
              wasRead: notification.isRead,
            })),
          );
          window.dispatchEvent(new Event(notificationsUpdatedEventName));
        }
      } catch {
        if (!ignore) {
          setLoadError("알림을 불러오지 못했습니다.");
          setNotifications([]);
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    }

    loadNotifications();

    return () => {
      ignore = true;
    };
  }, []);

  function selectNotification(notification: NotificationListItem) {
    onSelectNotification(notification);
  }

  return (
    <NewsRollPurpleOverlayPage
      ariaLabel="알림"
      closeLabel="알림 닫기"
      onClose={onClose}
    >
      {isLoading ? (
        <p className="text_searchStatus" role="status">
          알림을 불러오는 중입니다.
        </p>
      ) : loadError ? (
        <p className="text_searchStatus" role="alert">
          {loadError}
        </p>
      ) : notifications.length > 0 ? (
        <div className="list_searchResults list_notificationResults" aria-label="알림 목록">
          {notifications.map((notification) => (
            <WhiteBreakingNewsCardLink
              className={
                notification.wasRead ? "newsroll_notificationCard_read" : undefined
              }
              key={notification.id}
              onClick={() => selectNotification(notification)}
              title={`${notification.title} ${notification.body}`}
              updatedAt={notification.createdAt}
            />
          ))}
        </div>
      ) : (
        <p className="text_searchStatus">도착한 알림이 없습니다.</p>
      )}
    </NewsRollPurpleOverlayPage>
  );
}
