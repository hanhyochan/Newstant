"use client";

import { useEffect, useState } from "react";

import { notificationApi } from "@/app/_newsroll/api";
import { hydrateCurrentUserSession } from "@/app/_newsroll/auth/current-user";
import {
  DockedAlarmButton as NewsRollDockedAlarmButton,
  IconButton,
  TextSizeButton,
} from "@/design-system/components";

const notificationsUpdatedEventName = "newsroll:notifications-updated";

export function NewsToolbar({
  isTextLarge,
  onOpenNotifications,
  onOpenSearch,
  showNotifications = true,
  showSearch = true,
  onToggleTextSize,
}: {
  isTextLarge: boolean;
  onOpenNotifications: () => void;
  onOpenSearch: () => void;
  showNotifications?: boolean;
  showSearch?: boolean;
  onToggleTextSize: () => void;
}) {
  const [hasUnreadNotifications, setHasUnreadNotifications] = useState(false);

  useEffect(() => {
    let ignore = false;

    async function loadUnreadNotifications() {
      if (!showNotifications) {
        setHasUnreadNotifications(false);
        return;
      }

      try {
        hydrateCurrentUserSession();
        await notificationApi.syncNotifications();
        const notifications = await notificationApi.getNotifications();

        if (!ignore) {
          setHasUnreadNotifications(
            notifications.some((notification) => !notification.isRead),
          );
        }
      } catch {
        if (!ignore) {
          setHasUnreadNotifications(false);
        }
      }
    }

    loadUnreadNotifications();
    window.addEventListener("focus", loadUnreadNotifications);
    window.addEventListener(notificationsUpdatedEventName, loadUnreadNotifications);

    return () => {
      ignore = true;
      window.removeEventListener("focus", loadUnreadNotifications);
      window.removeEventListener(notificationsUpdatedEventName, loadUnreadNotifications);
    };
  }, [showNotifications]);

  return (
    <div className="newsroll_toolbar" aria-label="상단 도구">
      <TextSizeButton aria-label="글자 크기" aria-pressed={isTextLarge} onClick={onToggleTextSize} />
      {showSearch ? (
        <IconButton
          baseClassName="newsroll_toolbar_icon"
          icon="search"
          label="검색"
          onClick={onOpenSearch}
        />
      ) : null}
      {showNotifications ? (
        <IconButton
          baseClassName="newsroll_toolbar_icon"
          className={hasUnreadNotifications ? "has_unread_notification" : undefined}
          icon="alarm"
          label="알림"
          onClick={onOpenNotifications}
        />
      ) : null}
    </div>
  );
}

export function DockedAlarmButton({
  isPressed,
  onClick,
}: {
  isPressed: boolean;
  onClick: () => void;
}) {
  return (
    <NewsRollDockedAlarmButton aria-label="속보 알림" aria-pressed={isPressed} onClick={onClick} />
  );
}
