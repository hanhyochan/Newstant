"use client";

import { useEffect, useState, type ButtonHTMLAttributes } from "react";

import { notificationApi } from "@/app/_newsroll/api";
import {
  getCurrentUserSnapshot,
  hydrateCurrentUserSession,
} from "@/app/_newsroll/auth/current-user";
import { IconButton } from "@/design-system/components";

const notificationsUpdatedEventName = "newsroll:notifications-updated";
const notificationPollingIntervalMs = 5000;

function useUnreadNotificationState(isEnabled = true) {
  const [hasUnreadNotifications, setHasUnreadNotifications] = useState(false);

  useEffect(() => {
    let ignore = false;

    async function loadUnreadNotifications() {
      if (!isEnabled) {
        setHasUnreadNotifications(false);
        return;
      }

      try {
        const storedUser =
          hydrateCurrentUserSession() ?? getCurrentUserSnapshot();

        if (!storedUser) {
          setHasUnreadNotifications(false);
          return;
        }

        await notificationApi.syncNotifications(storedUser.id);
        const notifications = await notificationApi.getNotifications(storedUser.id);

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
    const pollingTimer = window.setInterval(
      loadUnreadNotifications,
      notificationPollingIntervalMs,
    );

    window.addEventListener("focus", loadUnreadNotifications);
    window.addEventListener(notificationsUpdatedEventName, loadUnreadNotifications);

    return () => {
      ignore = true;
      window.clearInterval(pollingTimer);
      window.removeEventListener("focus", loadUnreadNotifications);
      window.removeEventListener(
        notificationsUpdatedEventName,
        loadUnreadNotifications,
      );
    };
  }, [isEnabled]);

  return hasUnreadNotifications;
}

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
  const hasUnreadNotifications = useUnreadNotificationState(showNotifications);

  return (
    <div className="toolbar" aria-label="상단 도구">
      <IconButton
        aria-label="글자 크기"
        aria-pressed={isTextLarge}
        className="text_size_button"
        icon="sizeIncrease"
        label="글자 크기"
        onClick={onToggleTextSize}
      />
      {showSearch ? (
        <IconButton
          className="toolbar_icon"
          icon="search"
          label="검색"
          onClick={onOpenSearch}
        />
      ) : null}
      {showNotifications ? (
        <IconButton
          className="toolbar_icon"
          hasUnreadIndicator={hasUnreadNotifications}
          icon="alarm"
          label="알림"
          onClick={onOpenNotifications}
        />
      ) : null}
    </div>
  );
}

type DockedAlarmButtonProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "children"
> & {
  isPressed?: boolean;
};

export function DockedAlarmButton({
  className,
  isPressed,
  type = "button",
  ...props
}: DockedAlarmButtonProps) {
  const label = props["aria-label"] ?? "속보";

  return (
    <IconButton
      aria-pressed={isPressed ?? props["aria-pressed"]}
      className={["homeDockedAlarm", className].filter(Boolean).join(" ")}
      icon="policy"
      label={label}
      tone="primary"
      type={type}
      variant="shaped"
      {...props}
    />
  );
}
