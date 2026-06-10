"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import {
  newsrollDetailExitMotionEventName,
  newsrollDetailRevealDelayMs,
} from "../scroll/constants";

export function getEnterFromRightMotionClassName(isLeaving = false) {
  return `newsroll_motion_enterFromRight${isLeaving ? " is_motionLeaving" : ""}`;
}

export function hasActiveEnterFromRightMotion() {
  return Boolean(document.querySelector(".newsroll_motion_enterFromRight"));
}

export function requestEnterFromRightExitMotion() {
  window.dispatchEvent(new Event(newsrollDetailExitMotionEventName));
}

export function useEnterFromRightExitMotion({
  isOpen,
  listenForGlobalExit = true,
  onClose,
}: {
  isOpen: boolean;
  listenForGlobalExit?: boolean;
  onClose: () => void;
}) {
  const [isLeaving, setIsLeaving] = useState(false);
  const closeRef = useRef(onClose);
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    closeRef.current = onClose;
  }, [onClose]);

  const clearExitTimer = useCallback(() => {
    if (timeoutRef.current === null) {
      return;
    }

    window.clearTimeout(timeoutRef.current);
    timeoutRef.current = null;
  }, []);

  const closeWithMotion = useCallback(() => {
    if (!isOpen) {
      closeRef.current();
      return;
    }

    if (timeoutRef.current !== null) {
      return;
    }

    setIsLeaving(true);
    timeoutRef.current = window.setTimeout(() => {
      timeoutRef.current = null;
      setIsLeaving(false);
      closeRef.current();
    }, newsrollDetailRevealDelayMs);
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      return;
    }

    clearExitTimer();
    setIsLeaving(false);
  }, [clearExitTimer, isOpen]);

  useEffect(() => {
    if (!listenForGlobalExit || !isOpen) {
      return;
    }

    window.addEventListener(newsrollDetailExitMotionEventName, closeWithMotion);

    return () => {
      window.removeEventListener(newsrollDetailExitMotionEventName, closeWithMotion);
    };
  }, [closeWithMotion, isOpen, listenForGlobalExit]);

  useEffect(() => clearExitTimer, [clearExitTimer]);

  return {
    closeWithMotion,
    isLeaving,
  };
}
