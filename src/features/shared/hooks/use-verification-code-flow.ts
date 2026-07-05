import { useCallback, useEffect, useRef, useState } from "react";

const defaultVerificationDurationSeconds = 180;

type UseVerificationCodeFlowOptions = {
  resetOnExpire?: boolean;
};

export function useVerificationCodeFlow(
  durationSeconds = defaultVerificationDurationSeconds,
  { resetOnExpire = true }: UseVerificationCodeFlowOptions = {},
) {
  const timerRef = useRef<number | null>(null);
  const [verificationCode, setVerificationCode] = useState("");
  const [isVerificationConfirmed, setIsVerificationConfirmed] = useState(false);
  const [isVerificationSent, setIsVerificationSent] = useState(false);
  const [remainingVerificationSeconds, setRemainingVerificationSeconds] = useState(0);

  const clearTimer = useCallback(() => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const resetVerificationCode = useCallback(() => {
    clearTimer();
    setVerificationCode("");
    setIsVerificationSent(false);
    setIsVerificationConfirmed(false);
    setRemainingVerificationSeconds(0);
  }, [clearTimer]);

  const startVerificationCode = useCallback(() => {
    clearTimer();
    setVerificationCode("");
    setIsVerificationConfirmed(false);
    setIsVerificationSent(true);
    setRemainingVerificationSeconds(durationSeconds);
  }, [clearTimer, durationSeconds]);

  const updateVerificationCode = useCallback((value: string) => {
    setVerificationCode(value);
    setIsVerificationConfirmed(false);
  }, []);

  const confirmVerificationCode = useCallback(() => {
    setIsVerificationConfirmed(true);
  }, []);

  useEffect(() => {
    if (!isVerificationSent || remainingVerificationSeconds <= 0) {
      return undefined;
    }

    timerRef.current = window.setTimeout(() => {
      setRemainingVerificationSeconds((current) => current - 1);
    }, 1000);

    return clearTimer;
  }, [clearTimer, isVerificationSent, remainingVerificationSeconds]);

  useEffect(() => {
    if (resetOnExpire && isVerificationSent && remainingVerificationSeconds === 0) {
      resetVerificationCode();
    }
  }, [
    isVerificationSent,
    remainingVerificationSeconds,
    resetOnExpire,
    resetVerificationCode,
  ]);

  useEffect(() => clearTimer, [clearTimer]);

  const formattedVerificationTime = `${Math.floor(
    remainingVerificationSeconds / 60,
  )}:${String(remainingVerificationSeconds % 60).padStart(2, "0")}`;

  return {
    confirmVerificationCode,
    formattedVerificationTime,
    isVerificationConfirmed,
    isVerificationSent,
    remainingVerificationSeconds,
    resetVerificationCode,
    setIsVerificationConfirmed,
    setVerificationCode: updateVerificationCode,
    startVerificationCode,
    verificationCode,
  };
}
