import { useRef, useState, type TouchEventHandler } from "react";

export type SwipeTabItem<T extends string> = {
  id: T;
};

export type UseSwipeTabNavigationOptions<T extends string> = {
  disabled?: boolean;
  items: readonly SwipeTabItem<T>[];
  onChange: (id: T) => void;
  value: T;
};

const swipeThresholdPx = 48;
const verticalSwipeTolerance = 1.2;
type SwipeMotionDirection = "fromLeft" | "fromRight";

function isInteractiveSwipeTarget(target: EventTarget | null) {
  return target instanceof Element
    ? Boolean(
        target.closest(
          [
            "input",
            "label",
            "select",
            "textarea",
            "[role='checkbox']",
            "[role='menuitem']",
            "[role='radio']",
            "[role='tab']",
            "[data-swipe-ignore='true']",
          ].join(","),
        ),
      )
    : false;
}

export function useSwipeTabNavigation<T extends string>({
  disabled = false,
  items,
  onChange,
  value,
}: UseSwipeTabNavigationOptions<T>) {
  const startPointRef = useRef<{ x: number; y: number } | null>(null);
  const [motion, setMotion] = useState<{
    direction: SwipeMotionDirection;
    isAlternate: boolean;
  } | null>(null);

  const onTouchStart: TouchEventHandler<HTMLElement> = (event) => {
    if (disabled || items.length < 2 || isInteractiveSwipeTarget(event.target)) {
      startPointRef.current = null;
      return;
    }

    const touch = event.touches[0];

    if (!touch) {
      startPointRef.current = null;
      return;
    }

    startPointRef.current = {
      x: touch.clientX,
      y: touch.clientY,
    };
  };

  const onTouchCancel: TouchEventHandler<HTMLElement> = () => {
    startPointRef.current = null;
  };

  const onTouchEnd: TouchEventHandler<HTMLElement> = (event) => {
    const startPoint = startPointRef.current;
    startPointRef.current = null;

    if (!startPoint || disabled || items.length < 2) {
      return;
    }

    const touch = event.changedTouches[0];

    if (!touch) {
      return;
    }

    const deltaX = touch.clientX - startPoint.x;
    const deltaY = touch.clientY - startPoint.y;
    const horizontalDistance = Math.abs(deltaX);
    const verticalDistance = Math.abs(deltaY);

    if (
      horizontalDistance < swipeThresholdPx ||
      horizontalDistance <= verticalDistance * verticalSwipeTolerance
    ) {
      return;
    }

    const currentIndex = items.findIndex((item) => item.id === value);

    if (currentIndex < 0) {
      return;
    }

    const nextIndex = deltaX < 0 ? currentIndex + 1 : currentIndex - 1;
    const nextItem = items[nextIndex];

    if (nextItem) {
      setMotion((current) => ({
        direction: deltaX < 0 ? "fromRight" : "fromLeft",
        isAlternate: !current?.isAlternate,
      }));
      onChange(nextItem.id);
    }
  };

  return {
    onTouchCancel,
    onTouchEnd,
    onTouchStart,
    swipeMotionClassName: motion
      ? [
          motion.direction === "fromRight"
            ? "newsroll_motion_tabSwipeFromRight"
            : "newsroll_motion_tabSwipeFromLeft",
          motion.isAlternate ? "is_motionCycleB" : "is_motionCycleA",
        ].join(" ")
      : "",
  };
}
