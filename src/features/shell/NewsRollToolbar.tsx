"use client";

import { Button, Icon, IconButton } from "@/design-system/components";

export function NewsToolbar({
  isTextLarge,
  onOpenMenu,
  onOpenSearch,
  showMenu = true,
  showSearch = true,
  onToggleTextSize,
}: {
  isTextLarge: boolean;
  onOpenMenu: () => void;
  onOpenSearch: () => void;
  showMenu?: boolean;
  showSearch?: boolean;
  onToggleTextSize: () => void;
}) {
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
      {showMenu ? (
        <IconButton
          baseClassName="newsroll_toolbar_icon"
          icon="menu"
          label="메뉴"
          onClick={onOpenMenu}
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
      <Icon name="alarm" />
    </Button>
  );
}
