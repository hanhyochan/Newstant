"use client";

import { useState } from "react";

import { PrimaryButton, PrimaryButtonGroup, TextInput } from "@/design-system/components";
import { signupNicknameSchema } from "@/shared/newsroll/auth-validation";
import { useZodFieldValidation } from "@/shared/newsroll/use-zod-field-validation";
import { reservedSignupNicknames } from "@/features/auth/signup-profile-model";
import { AuthBackButton } from "@/features/auth/components/AuthBackButton";
import { AuthLayout } from "@/features/auth/components/AuthLayout";
import { AuthValidationError } from "@/features/auth/components/AuthValidationError";
import { SignupFieldActionButton } from "@/features/auth/components/SignupFieldActionButton";

export function SignupNicknameView({
  onBack,
  onCheckNickname,
  onNext,
}: {
  onBack: () => void;
  onCheckNickname: (nickname: string) => Promise<boolean>;
  onNext: (nickname: string) => void;
}) {
  const [nickname, setNickname] = useState("");
  const [isNicknameChecked, setIsNicknameChecked] = useState(false);
  const [isNicknameChecking, setIsNicknameChecking] = useState(false);
  const [nicknameCheckMessage, setNicknameCheckMessage] = useState("");
  const nicknameValidation = useZodFieldValidation(signupNicknameSchema, nickname);
  const isNicknameReady = nicknameValidation.isValid && isNicknameChecked;
  const hasNicknameCheckError = Boolean(nicknameCheckMessage && !isNicknameChecked);
  const signupNicknameErrorId = "signup-nickname-error";
  const signupNicknameCheckId = "signup-nickname-check";

  async function checkNicknameDuplicate() {
    nicknameValidation.markTouched();

    if (!nicknameValidation.isValid) {
      setIsNicknameChecked(false);
      setNicknameCheckMessage("");
      return;
    }

    const normalizedNickname = nickname.trim().toLocaleLowerCase("ko-KR");
    const isDuplicated = reservedSignupNicknames.some(
      (item) => item.toLocaleLowerCase("ko-KR") === normalizedNickname,
    );
    setIsNicknameChecking(true);

    let isAvailable = false;

    try {
      isAvailable = isDuplicated ? false : await onCheckNickname(nickname.trim());
    } catch {
      isAvailable = false;
    }

    setIsNicknameChecking(false);
    setIsNicknameChecked(isAvailable);
    setNicknameCheckMessage(
      !isAvailable
        ? "중복되는 닉네임입니다."
        : "사용 가능한 닉네임입니다.",
    );
  }

  function updateNickname(value: string) {
    setNickname(value);
    setIsNicknameChecked(false);
    setNicknameCheckMessage("");
  }

  return (
    <AuthLayout ariaLabel="회원가입 닉네임 설정">
      <div className="wrapper_signupStepContent">
        <AuthBackButton onClick={onBack} />
        <h1 className="text_loginTitle">닉네임 설정</h1>

        <form
          className="form_signupStep"
          onSubmit={(event) => {
            event.preventDefault();
            if (isNicknameReady) {
              onNext(nickname.trim());
            }
          }}
        >
          <div className="wrapper_loginInputs">
            <div className="wrapper_authField wrapper_fieldStack u_w100 u_gap8">
              <div className="wrapper_signupEmailField">
                <TextInput mode="dark"
                  aria-describedby={[
                    nicknameValidation.errorMessage ? signupNicknameErrorId : "",
                    nicknameCheckMessage ? signupNicknameCheckId : "",
                  ]
                    .filter(Boolean)
                    .join(" ") || undefined}
                  aria-invalid={Boolean(
                    nicknameValidation.errorMessage || hasNicknameCheckError,
                  )}
                  aria-label="회원가입 닉네임 입력"
                  autoComplete="nickname"
                  maxLength={12}
                  onBlur={nicknameValidation.markTouched}
                  onChange={(event) => updateNickname(event.currentTarget.value)}
                  placeholder="닉네임"
                  state={
                    nicknameValidation.errorMessage || hasNicknameCheckError
                      ? "error"
                      : "default"
                  }
                  type="text"
                  value={nickname}
                />
                <SignupFieldActionButton
                  disabled={
                    !nicknameValidation.isValid ||
                    isNicknameChecking ||
                    isNicknameChecked
                  }
                  onClick={checkNicknameDuplicate}
                >
                  중복확인
                </SignupFieldActionButton>
              </div>
              <AuthValidationError
                id={signupNicknameErrorId}
                message={nicknameValidation.errorMessage}
              />
              {nicknameCheckMessage ? (
                <p
                  className="text_authValidation"
                  data-state={isNicknameChecked ? "success" : "error"}
                  id={signupNicknameCheckId}
                >
                  {nicknameCheckMessage}
                </p>
              ) : null}
            </div>
          </div>

          <PrimaryButtonGroup>
        <PrimaryButton
            className="btn_signupStepNext"
            disabled={!isNicknameReady}


            type="submit"

          >
            다음
          </PrimaryButton>
      </PrimaryButtonGroup>
        </form>
      </div>
    </AuthLayout>
  );
}
