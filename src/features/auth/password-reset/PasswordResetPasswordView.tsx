import {
  useMemo,
  useState,
} from "react";

import {
  IconButton,
  PrimaryButton,
  PrimaryButtonGroup,
  TextInput,
} from "@/design-system/components";
import {
  createSignupPasswordConfirmSchema,
  signupPasswordSchema,
} from "@/shared/newsroll/auth-validation";
import { useZodFieldValidation } from "@/shared/newsroll/use-zod-field-validation";
import { AuthBackButton } from "@/features/auth/components/AuthBackButton";
import { AuthLayout } from "@/features/auth/components/AuthLayout";
import { AuthValidationError } from "@/features/auth/components/AuthValidationError";

export function PasswordResetPasswordView({
  onBack,
  onSubmit,
  submitError,
}: {
  onBack: () => void;
  onSubmit: (input: { nextPassword: string }) => Promise<void>;
  submitError?: string;
}) {
  const [nextPassword, setNextPassword] = useState("");
  const [nextPasswordConfirm, setNextPasswordConfirm] = useState("");
  const [isNextPasswordVisible, setIsNextPasswordVisible] = useState(false);
  const [isNextPasswordConfirmVisible, setIsNextPasswordConfirmVisible] =
    useState(false);
  const nextPasswordConfirmSchema = useMemo(
    () => createSignupPasswordConfirmSchema(nextPassword),
    [nextPassword],
  );
  const nextPasswordValidation = useZodFieldValidation(
    signupPasswordSchema,
    nextPassword,
  );
  const nextPasswordConfirmValidation = useZodFieldValidation(
    nextPasswordConfirmSchema,
    nextPasswordConfirm,
  );
  const isPasswordResetReady =
    nextPasswordValidation.isValid &&
    nextPasswordConfirmValidation.isValid;
  const nextPasswordErrorId = "password-reset-next-password-error";
  const nextPasswordConfirmErrorId = "password-reset-next-password-confirm-error";

  return (
    <AuthLayout ariaLabel="새 비밀번호 설정">
      <div className="wrapper_signupStepContent">
        <AuthBackButton onClick={onBack} />
        <h1 className="text_loginTitle">새 비밀번호 설정</h1>

        <form
          className="form_signupStep"
          onSubmit={(event) => {
            event.preventDefault();

            if (isPasswordResetReady) {
              onSubmit({
                nextPassword,
              });
            }
          }}
        >
          <div className="wrapper_loginInputs">
            <div className="wrapper_authField wrapper_fieldStack u_w100">
              <div className="wrapper_loginPasswordField">
                <TextInput mode="dark"
                  aria-describedby={
                    nextPasswordValidation.errorMessage ? nextPasswordErrorId : undefined
                  }
                  aria-invalid={Boolean(nextPasswordValidation.errorMessage)}
                  aria-label="새 비밀번호 입력"
                  autoComplete="new-password"
                  onBlur={nextPasswordValidation.markTouched}
                  onChange={(event) => setNextPassword(event.currentTarget.value)}
                  placeholder="비밀번호"
                  state={nextPasswordValidation.errorMessage ? "error" : "default"}
                  type={isNextPasswordVisible ? "text" : "password"}
                  value={nextPassword}
                  hasEndAction
                />
                <IconButton
                  aria-pressed={isNextPasswordVisible}
                  className="btn_loginPasswordToggle"
                  icon="eye"
                  iconSize={12}
                  label={
                    isNextPasswordVisible ? "새 비밀번호 숨기기" : "새 비밀번호 보기"
                  }
                  onClick={() => setIsNextPasswordVisible((current) => !current)}
                />
              </div>
              <AuthValidationError
                id={nextPasswordErrorId}
                message={nextPasswordValidation.errorMessage}
              />
            </div>
            <div className="wrapper_authField wrapper_fieldStack u_w100">
              <div className="wrapper_loginPasswordField">
                <TextInput mode="dark"
                  aria-describedby={
                    nextPasswordConfirmValidation.errorMessage
                      ? nextPasswordConfirmErrorId
                      : undefined
                  }
                  aria-invalid={Boolean(nextPasswordConfirmValidation.errorMessage)}
                  aria-label="새 비밀번호 다시 입력"
                  autoComplete="new-password"
                  onBlur={nextPasswordConfirmValidation.markTouched}
                  onChange={(event) =>
                    setNextPasswordConfirm(event.currentTarget.value)
                  }
                  placeholder="비밀번호 확인"
                  state={
                    nextPasswordConfirmValidation.errorMessage ? "error" : "default"
                  }
                  type={isNextPasswordConfirmVisible ? "text" : "password"}
                  value={nextPasswordConfirm}
                  hasEndAction
                />
                <IconButton
                  aria-pressed={isNextPasswordConfirmVisible}
                  className="btn_loginPasswordToggle"
                  icon="eye"
                  iconSize={12}
                  label={
                    isNextPasswordConfirmVisible
                      ? "새 비밀번호 확인 숨기기"
                      : "새 비밀번호 확인 보기"
                  }
                  onClick={() =>
                    setIsNextPasswordConfirmVisible((current) => !current)
                  }
                />
              </div>
              <AuthValidationError
                id={nextPasswordConfirmErrorId}
                message={nextPasswordConfirmValidation.errorMessage}
              />
            </div>
          </div>

          <PrimaryButtonGroup>
        <PrimaryButton
            className="btn_signupStepNext"
            disabled={!isPasswordResetReady}
            type="submit"
          >
            비밀번호 재설정
          </PrimaryButton>
      </PrimaryButtonGroup>
          <AuthValidationError id="password-reset-submit-error" message={submitError} />
        </form>
      </div>
    </AuthLayout>
  );
}

