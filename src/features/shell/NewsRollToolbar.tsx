"use client";

import { useEffect, useState } from "react";

import { notificationApi } from "@/app/_newsroll/api";
import { hydrateCurrentUserSession } from "@/app/_newsroll/auth/current-user";
import { Button, Icon, IconButton } from "@/design-system/components";

const notificationsUpdatedEventName = "newsroll:notifications-updated";

export function NewsToolbar({
  isTextLarge,
  onOpenNotifications,
  onOpenSearch,
  showSearch = true,
  onToggleTextSize,
}: {
  isTextLarge: boolean;
  onOpenNotifications: () => void;
  onOpenSearch: () => void;
  showSearch?: boolean;
  onToggleTextSize: () => void;
}) {
  const [hasUnreadNotifications, setHasUnreadNotifications] = useState(false);

  useEffect(() => {
    let ignore = false;

    async function loadUnreadNotifications() {
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
  }, []);

  return (
    <div className="newsroll_toolbar" aria-label="상단 도구">
      <Button
        aria-label="글자 크기"
        aria-pressed={isTextLarge}
        classNameOnly
        className="newsroll_text_size_button"
        onClick={onToggleTextSize}
        size="medium"
        variant="filled"
      >
        <Icon name="sizeIncrease" />
      </Button>
      {showSearch ? (
        <IconButton
          baseClassName="newsroll_toolbar_icon"
          icon="search"
          label="검색"
          onClick={onOpenSearch}
        />
      ) : null}
      <IconButton
        baseClassName="newsroll_toolbar_icon"
        className={hasUnreadNotifications ? "has_unread_notification" : undefined}
        icon="alarm"
        label="알림"
        onClick={onOpenNotifications}
      />
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
    <Button
      aria-label="속보 알림"
      aria-pressed={isPressed}
      className="newsroll_homeDockedAlarm"
      iconOnly
      onClick={onClick}
      radius="full"
      size="large"
      variant="outline"
    >
      <Icon name="policy" />
    </Button>
  );
}
