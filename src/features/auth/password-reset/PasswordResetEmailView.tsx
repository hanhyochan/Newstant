"use client";

import { PrimaryButton, PrimaryButtonGroup, TextInput } from "@/design-system/components";
import { AuthBackButton } from "@/features/auth/components/AuthBackButton";
import { AuthLayout } from "@/features/auth/components/AuthLayout";
import { AuthValidationError } from "@/features/auth/components/AuthValidationError";
import { SignupFieldActionButton } from "@/features/auth/components/SignupFieldActionButton";
import { useEmailVerificationStep } from "@/features/auth/hooks/use-email-verification-step";

export function PasswordResetEmailView({
  onBack,
  onCheckEmail,
  onNext,
}: {
  onBack: () => void;
  onCheckEmail: (email: string) => Promise<boolean>;
  onNext: (email: string) => void;
}) {
  const {
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
  } = useEmailVerificationStep({
    failureMessage: "가입된 이메일을 찾을 수 없습니다.",
    onCheckEmail,
    successMessage: "인증번호를 발송했습니다.",
  });
  const passwordResetEmailErrorId = "password-reset-email-error";
  const passwordResetEmailCheckId = "password-reset-email-check";
  const passwordResetVerificationCodeErrorId =
    "password-reset-verification-code-error";
  return (
    <AuthLayout ariaLabel="비밀번호 재설정 이메일 인증">
      <div className="wrapper_signupStepContent">
        <AuthBackButton onClick={onBack} />
        <h1 className="text_loginTitle">비밀번호 재설정</h1>

        <form
          className="form_signupStep"
          onSubmit={(event) => {
            event.preventDefault();

            if (isEmailReady) {
              onNext(email.trim());
            }
          }}
        >
          <div className="wrapper_loginInputs">
            <div className="wrapper_authField wrapper_fieldStack u_w100 u_gap8">
              <div className="wrapper_signupEmailField">
                <TextInput mode="dark"
                  aria-describedby={[
                    emailValidation.errorMessage ? passwordResetEmailErrorId : "",
                    emailCheckMessage ? passwordResetEmailCheckId : "",
                  ]
                    .filter(Boolean)
                    .join(" ") || undefined}
                  aria-invalid={Boolean(emailValidation.errorMessage)}
                  aria-label="비밀번호 재설정 이메일 입력"
                  autoComplete="email"
                  autoCapitalize="none"
                  autoCorrect="off"
                  onBlur={emailValidation.markTouched}
                  onChange={(event) => updateEmail(event.currentTarget.value)}
                  placeholder="이메일"
                  spellCheck={false}
                  state={emailValidation.errorMessage ? "error" : "default"}
                  type="email"
                  value={email}
                />
                <SignupFieldActionButton
                  disabled={
                    !emailValidation.isValid ||
                    isEmailChecking ||
                    isVerificationSent ||
                    isVerificationConfirmed
                  }
                  onClick={startVerificationCode}
                >
                  인증번호 발송
                </SignupFieldActionButton>
              </div>
              <AuthValidationError
                id={passwordResetEmailErrorId}
                message={emailValidation.errorMessage}
              />
              {emailCheckMessage ? (
                <p
                  className="text_authValidation"
                  data-state={isEmailChecked ? "success" : "error"}
                  id={passwordResetEmailCheckId}
                >
                  {emailCheckMessage}
                </p>
              ) : null}
            </div>
            {isVerificationSent ? (
              <div className="wrapper_authField wrapper_fieldStack u_w100 u_gap8">
                <div className="wrapper_signupVerificationCode">
                  <div className="wrapper_signupVerificationCodeInput">
                    <TextInput mode="dark"
                      aria-describedby={
                        verificationCodeValidation.errorMessage
                          ? passwordResetVerificationCodeErrorId
                          : undefined
                      }
                      aria-invalid={Boolean(verificationCodeValidation.errorMessage)}
                      aria-label="비밀번호 재설정 인증번호 6자리 입력"
                      inputMode="numeric"
                      maxLength={6}
                      onBlur={verificationCodeValidation.markTouched}
                      onChange={(event) => {
                        setVerificationCode(event.currentTarget.value);
                      }}
                      placeholder="인증번호 6자리"
                      state={
                        verificationCodeValidation.errorMessage ? "error" : "default"
                      }
                      type="text"
                      value={verificationCode}
                    />
                    <span className="text_signupVerificationTimer">
                      {formattedVerificationTime}
                    </span>
                  </div>
                  <SignupFieldActionButton
                    disabled={isVerificationConfirmed}
                    onClick={confirmVerificationCode}
                  >
                    인증하기
                  </SignupFieldActionButton>
                </div>
                <AuthValidationError
                  id={passwordResetVerificationCodeErrorId}
                  message={verificationCodeValidation.errorMessage}
                />
                {isVerificationConfirmed ? (
                  <p className="text_authValidation" data-state="success">
                    인증이 완료되었습니다.
                  </p>
                ) : null}
              </div>
            ) : null}
          </div>

          <PrimaryButtonGroup>
        <PrimaryButton
            className="btn_signupStepNext"
            disabled={!isEmailReady}
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
