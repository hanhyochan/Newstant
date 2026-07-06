"use client";

import { useEffect, useState, type ButtonHTMLAttributes } from "react";

import { notificationApi } from "@/shared/newsroll/api";
import {
  getCurrentUserSnapshot,
  hydrateCurrentUserSession,
} from "@/shared/newsroll/auth/current-user";
import { IconButton } from "@/design-system/components";

const notificationsUpdatedEventName = "newsroll:notifications-updated";
const notificationPollingIntervalMs = 5000;

type IdleCallbackHandle = number;

type WindowWithIdleCallback = Window & {
  requestIdleCallback?: (callback: () => void) => IdleCallbackHandle;
  cancelIdleCallback?: (handle: IdleCallbackHandle) => void;
};

function useUnreadNotificationState(isEnabled = true) {
  const [hasUnreadNotifications, setHasUnreadNotifications] = useState(false);

  useEffect(() => {
    let ignore = false;
    let hasScheduledSync = false;
    let idleHandle: IdleCallbackHandle | null = null;
    let fallbackTimer: number | null = null;

    function getStoredUser() {
      return hydrateCurrentUserSession() ?? getCurrentUserSnapshot();
    }

    async function loadUnreadNotifications() {
      if (!isEnabled) {
        setHasUnreadNotifications(false);
        return;
      }

      try {
        const storedUser = getStoredUser();

        if (!storedUser) {
          setHasUnreadNotifications(false);
          return;
        }

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

    function scheduleNotificationSync() {
      if (!isEnabled || hasScheduledSync) {
        return;
      }

      const storedUser = getStoredUser();

      if (!storedUser) {
        return;
      }

      hasScheduledSync = true;
      const runSync = () => {
        notificationApi
          .syncNotifications(storedUser.id)
          .then(() => loadUnreadNotifications())
          .catch(() => undefined);
      };
      const idleWindow = window as WindowWithIdleCallback;

      if (idleWindow.requestIdleCallback) {
        idleHandle = idleWindow.requestIdleCallback(runSync);
        return;
      }

      fallbackTimer = window.setTimeout(runSync, 1200);
    }

    loadUnreadNotifications();
    scheduleNotificationSync();

    const pollingTimer = window.setInterval(
      loadUnreadNotifications,
      notificationPollingIntervalMs,
    );

    function handleFocusOrNotificationUpdate() {
      loadUnreadNotifications();
    }

    window.addEventListener("focus", handleFocusOrNotificationUpdate);
    window.addEventListener(
      notificationsUpdatedEventName,
      handleFocusOrNotificationUpdate,
    );

    return () => {
      const idleWindow = window as WindowWithIdleCallback;

      ignore = true;
      window.clearInterval(pollingTimer);
      if (idleHandle != null && idleWindow.cancelIdleCallback) {
        idleWindow.cancelIdleCallback(idleHandle);
      }
      if (fallbackTimer != null) {
        window.clearTimeout(fallbackTimer);
      }
      window.removeEventListener("focus", handleFocusOrNotificationUpdate);
      window.removeEventListener(
        notificationsUpdatedEventName,
        handleFocusOrNotificationUpdate,
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
