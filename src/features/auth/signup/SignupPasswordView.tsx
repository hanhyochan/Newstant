"use client";

import { useMemo, useState } from "react";

import { IconButton, PrimaryButton, PrimaryButtonGroup, TextInput } from "@/design-system/components";
import {
  createSignupPasswordConfirmSchema,
  signupPasswordSchema,
} from "@/shared/newsroll/auth-validation";
import { useZodFieldValidation } from "@/shared/newsroll/use-zod-field-validation";
import { AuthBackButton } from "@/features/auth/components/AuthBackButton";
import { AuthLayout } from "@/features/auth/components/AuthLayout";
import { AuthValidationError } from "@/features/auth/components/AuthValidationError";

export function SignupPasswordView({
  onBack,
  onNext,
}: {
  onBack: () => void;
  onNext: (password: string) => void;
}) {
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isPasswordConfirmVisible, setIsPasswordConfirmVisible] = useState(false);
  const passwordConfirmSchema = useMemo(
    () => createSignupPasswordConfirmSchema(password),
    [password],
  );
  const passwordValidation = useZodFieldValidation(signupPasswordSchema, password);
  const passwordConfirmValidation = useZodFieldValidation(
    passwordConfirmSchema,
    passwordConfirm,
  );
  const isPasswordReady =
    passwordValidation.isValid && passwordConfirmValidation.isValid;
  const signupPasswordErrorId = "signup-password-error";
  const signupPasswordConfirmErrorId = "signup-password-confirm-error";

  return (
    <AuthLayout ariaLabel="회원가입 비밀번호 설정">
      <div className="wrapper_signupStepContent">
        <AuthBackButton onClick={onBack} />
        <h1 className="text_loginTitle">비밀번호 설정</h1>

        <form
          className="form_signupStep"
          onSubmit={(event) => {
            event.preventDefault();
            if (isPasswordReady) {
              onNext(password);
            }
          }}
        >
          <div className="wrapper_loginInputs">
            <div className="wrapper_authField wrapper_fieldStack u_w100 u_gap8">
              <div className="wrapper_loginPasswordField">
                <TextInput mode="dark"
                  aria-describedby={
                    passwordValidation.errorMessage ? signupPasswordErrorId : undefined
                  }
                  aria-invalid={Boolean(passwordValidation.errorMessage)}
                  aria-label="회원가입 비밀번호 입력"
                  autoComplete="new-password"
                  onBlur={passwordValidation.markTouched}
                  onChange={(event) => setPassword(event.currentTarget.value)}
                  placeholder="비밀번호"
                  state={passwordValidation.errorMessage ? "error" : "default"}
                  type={isPasswordVisible ? "text" : "password"}
                  value={password}
                  hasEndAction
                />
                <IconButton
                  aria-pressed={isPasswordVisible}
                  className="btn_loginPasswordToggle"
                  icon="eye"
                  iconSize={12}
                  label={isPasswordVisible ? "비밀번호 숨기기" : "비밀번호 보기"}
                  onClick={() => setIsPasswordVisible((current) => !current)}
                />
              </div>
              <AuthValidationError
                id={signupPasswordErrorId}
                message={passwordValidation.errorMessage}
              />
            </div>
            <div className="wrapper_authField wrapper_fieldStack u_w100 u_gap8">
              <div className="wrapper_loginPasswordField">
                <TextInput mode="dark"
                  aria-describedby={
                    passwordConfirmValidation.errorMessage
                      ? signupPasswordConfirmErrorId
                      : undefined
                  }
                  aria-invalid={Boolean(passwordConfirmValidation.errorMessage)}
                  aria-label="회원가입 비밀번호 확인 입력"
                  autoComplete="new-password"
                  onBlur={passwordConfirmValidation.markTouched}
                  onChange={(event) => setPasswordConfirm(event.currentTarget.value)}
                  placeholder="비밀번호 확인"
                  state={passwordConfirmValidation.errorMessage ? "error" : "default"}
                  type={isPasswordConfirmVisible ? "text" : "password"}
                  value={passwordConfirm}
                  hasEndAction
                />
                <IconButton
                  aria-pressed={isPasswordConfirmVisible}
                  className="btn_loginPasswordToggle"
                  icon="eye"
                  iconSize={12}
                  label={
                    isPasswordConfirmVisible
                      ? "비밀번호 확인 숨기기"
                      : "비밀번호 확인 보기"
                  }
                  onClick={() => setIsPasswordConfirmVisible((current) => !current)}
                />
              </div>
              <AuthValidationError
                id={signupPasswordConfirmErrorId}
                message={passwordConfirmValidation.errorMessage}
              />
            </div>
          </div>

          <PrimaryButtonGroup>
        <PrimaryButton
            className="btn_signupStepNext"
            disabled={!isPasswordReady}


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
