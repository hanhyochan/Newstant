"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import {
  notificationApi,
  type AppNotification,
} from "@/shared/newstant/api";
import {
  getCurrentUserSnapshot,
  hydrateCurrentUserSession,
} from "@/shared/newstant/auth/current-user";
import {
  NoticeCardLink,
  NoticeCardSkeleton,
  SkeletonList,
} from "@/design-system/components";
import { PurpleOverlayPage } from "@/design-system/templates";

type NotificationViewProps = {
  onClose: () => void;
  onSelectNotification: (notification: AppNotification) => void;
};

const notificationsUpdatedEventName = "app:notifications-updated";
const notificationPollingIntervalMs = 5000;

function sortNotificationsByLatest(notifications: AppNotification[]) {
  return [...notifications].sort((first, second) => {
    return (
      new Date(second.createdAt).getTime() -
      new Date(first.createdAt).getTime()
    );
  });
}

export function NotificationView({
  onClose,
  onSelectNotification,
}: NotificationViewProps) {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const notificationsRef = useRef<AppNotification[]>([]);

  const markVisibleNotificationsAsRead = useCallback(() => {
    const visibleNotifications = notificationsRef.current;
    const hasUnreadNotifications = visibleNotifications.some(
      (notification) => !notification.isRead,
    );

    if (!hasUnreadNotifications) {
      return;
    }

    void notificationApi
      .markNotificationsAsRead(visibleNotifications)
      .then(() => {
        window.dispatchEvent(new Event(notificationsUpdatedEventName));
      })
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    let ignore = false;

    async function loadNotifications({ silent = false } = {}) {
      if (!silent) {
        setIsLoading(true);
        setLoadError("");
      }

      try {
        const storedUser =
          hydrateCurrentUserSession() ?? getCurrentUserSnapshot();

        if (!storedUser) {
          setNotifications([]);
          notificationsRef.current = [];
          return;
        }

        await notificationApi.syncNotifications(storedUser.id);
        const nextNotifications = sortNotificationsByLatest(
          await notificationApi.getNotifications(storedUser.id),
        );

        if (!ignore) {
          notificationsRef.current = nextNotifications;
          setNotifications(nextNotifications);
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
    const pollingTimer = window.setInterval(
      () => loadNotifications({ silent: true }),
      notificationPollingIntervalMs,
    );

    return () => {
      ignore = true;
      window.clearInterval(pollingTimer);
      markVisibleNotificationsAsRead();
    };
  }, [markVisibleNotificationsAsRead]);

  function closeNotifications() {
    markVisibleNotificationsAsRead();
    onClose();
  }

  function selectNotification(notification: AppNotification) {
    onSelectNotification(notification);
  }

  return (
    <PurpleOverlayPage
      ariaLabel="알림"
      closeLabel="알림 닫기"
      onClose={closeNotifications}
    >
      {isLoading ? (
        <div className="list_searchResults list_notificationResults" aria-busy="true">
          <SkeletonList
            count={5}
            renderItem={() => <NoticeCardSkeleton type="notificationUnread" />}
          />
        </div>
      ) : loadError ? (
        <p className="text_searchStatus" role="alert">
          {loadError}
        </p>
      ) : notifications.length > 0 ? (
        <div className="list_searchResults list_notificationResults" aria-label="알림 목록">
          {notifications.map((notification) => (
            <NoticeCardLink
              key={notification.id}
              onClick={() => selectNotification(notification)}
              title={`${notification.title} ${notification.body}`}
              type={
                notification.isRead ? "notificationRead" : "notificationUnread"
              }
              updatedAt={notification.createdAt}
            />
          ))}
        </div>
      ) : (
        <p className="text_searchStatus">도착한 알림이 없습니다.</p>
      )}
    </PurpleOverlayPage>
  );
}
