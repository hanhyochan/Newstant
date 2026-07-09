import { useState } from "react";

import {
  authEmailSchema,
  verificationCodeSchema,
} from "@/shared/newstant/auth-validation";
import { useZodFieldValidation } from "@/shared/newstant/use-zod-field-validation";
import { useVerificationCodeFlow } from "@/features/shared/hooks/use-verification-code-flow";

type UseEmailVerificationStepOptions = {
  failureMessage: string;
  onCheckEmail: (email: string) => Promise<boolean>;
  successMessage: string;
};

export function useEmailVerificationStep({
  failureMessage,
  onCheckEmail,
  successMessage,
}: UseEmailVerificationStepOptions) {
  const [email, setEmail] = useState("");
  const [isEmailChecked, setIsEmailChecked] = useState(false);
  const [isEmailChecking, setIsEmailChecking] = useState(false);
  const [emailCheckMessage, setEmailCheckMessage] = useState("");
  const {
    formattedVerificationTime,
    isVerificationConfirmed,
    isVerificationSent,
    resetVerificationCode,
    setVerificationCode,
    startVerificationCode: startVerificationTimer,
    verificationCode,
    confirmVerificationCode: markVerificationConfirmed,
  } = useVerificationCodeFlow();
  const emailValidation = useZodFieldValidation(authEmailSchema, email);
  const verificationCodeValidation = useZodFieldValidation(
    verificationCodeSchema,
    verificationCode,
  );
  const isEmailReady =
    emailValidation.isValid && isEmailChecked && isVerificationConfirmed;

  async function startVerificationCode() {
    emailValidation.markTouched();

    if (!emailValidation.isValid) {
      setIsEmailChecked(false);
      setEmailCheckMessage("");
      resetVerificationCode();
      return;
    }

    setIsEmailChecking(true);

    let isValidEmailTarget = false;

    try {
      isValidEmailTarget = await onCheckEmail(email.trim());
    } catch {
      isValidEmailTarget = false;
    } finally {
      setIsEmailChecking(false);
    }

    setIsEmailChecked(isValidEmailTarget);
    setEmailCheckMessage(isValidEmailTarget ? successMessage : failureMessage);

    if (!isValidEmailTarget) {
      resetVerificationCode();
      return;
    }

    startVerificationTimer();
  }

  function updateEmail(value: string) {
    setEmail(value);
    setIsEmailChecked(false);
    setEmailCheckMessage("");
    resetVerificationCode();
  }

  function confirmVerificationCode() {
    verificationCodeValidation.markTouched();

    if (verificationCodeValidation.isValid) {
      markVerificationConfirmed();
    }
  }

  return {
    confirmVerificationCode,
    email,
    emailCheckMessage,
    emailValidation,
    formattedVerificationTime,
    isEmailChecked,
    isEmailChecking,
    isEmailReady,
    isVerificationConfirmed,
    isVerificationSent,
    setVerificationCode,
    startVerificationCode,
    updateEmail,
    verificationCode,
    verificationCodeValidation,
  };
}
