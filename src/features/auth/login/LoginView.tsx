import { useState } from "react";

import {
  CheckInput,
  IconButton,
  PrimaryButton,
  PrimaryButtonGroup,
  TextInput,
} from "@/design-system/components";
import {
  authEmailSchema,
  loginPasswordSchema,
} from "@/shared/newstant/auth-validation";
import { useZodFieldValidation } from "@/shared/newstant/use-zod-field-validation";
import { AuthBackButton } from "@/features/auth/components/AuthBackButton";
import { AuthLayout } from "@/features/auth/components/AuthLayout";
import { AuthTextActionButton } from "@/features/auth/components/AuthTextActionButton";
import { AuthValidationError } from "@/features/auth/components/AuthValidationError";
import { SocialLoginButtons } from "@/features/auth/components/SocialLoginButtons";

export function LoginView({
  isSubmitting = false,
  loginError,
  onLogin,
  onGuestEnter,
  onPasswordResetStart,
  onSignup,
}: {
  isSubmitting?: boolean;
  loginError?: string;
  onLogin: (input: {
    email: string;
    isAutoLogin: boolean;
    password: string;
  }) => Promise<void> | void;
  onGuestEnter: () => Promise<void> | void;
  onPasswordResetStart: () => void;
  onSignup: () => void;
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isAutoLogin, setIsAutoLogin] = useState(false);
  const [isEmailLoginVisible, setIsEmailLoginVisible] = useState(false);
  const emailValidation = useZodFieldValidation(authEmailSchema, email);
  const passwordValidation = useZodFieldValidation(
    loginPasswordSchema,
    password,
  );
  const isLoginReady = emailValidation.isValid && passwordValidation.isValid;
  const loginEmailErrorId = "login-email-error";
  const loginPasswordErrorId = "login-password-error";

  return (
    <AuthLayout
      ariaLabel="로그인"
      className={
        !isEmailLoginVisible ? "container_authLayout_loginLanding" : undefined
      }
    >
      {!isEmailLoginVisible ? (
        <div className="wrapper_loginContent wrapper_loginLandingContent">
          <h1 className="text_loginLandingHero">뉴스를 인스턴트처럼!</h1>
          <SocialLoginButtons
            onEmailLoginClick={() => setIsEmailLoginVisible(true)}
          />
        </div>
      ) : (
        <div className="wrapper_loginContent wrapper_loginEmailContent">
          <AuthBackButton onClick={() => setIsEmailLoginVisible(false)} />
          <h1 className="text_loginTitle">뉴스를 인스턴트처럼!</h1>

          <form
            className="form_login"
            onSubmit={(event) => {
              event.preventDefault();

              if (isLoginReady && !isSubmitting) {
                onLogin({ email, isAutoLogin, password });
              }
            }}
          >
            <div className="wrapper_loginInputs">
              <div className="wrapper_authField wrapper_fieldStack u_w100 u_gap8">
                <TextInput
                  mode="dark"
                  aria-describedby={
                    emailValidation.errorMessage ? loginEmailErrorId : undefined
                  }
                  aria-invalid={Boolean(emailValidation.errorMessage)}
                  aria-label="이메일 입력"
                  autoComplete="email"
                  autoCapitalize="none"
                  autoCorrect="off"
                  onBlur={emailValidation.markTouched}
                  onChange={(event) => setEmail(event.currentTarget.value)}
                  placeholder="이메일"
                  spellCheck={false}
                  state={emailValidation.errorMessage ? "error" : "default"}
                  type="email"
                  value={email}
                />
                <AuthValidationError
                  id={loginEmailErrorId}
                  message={emailValidation.errorMessage}
                />
              </div>
              <div className="wrapper_authField wrapper_fieldStack u_w100 u_gap8">
                <div className="wrapper_loginPasswordField">
                  <TextInput
                    mode="dark"
                    aria-describedby={
                      passwordValidation.errorMessage
                        ? loginPasswordErrorId
                        : undefined
                    }
                    aria-invalid={Boolean(passwordValidation.errorMessage)}
                    aria-label="비밀번호 입력"
                    autoComplete="current-password"
                    onBlur={passwordValidation.markTouched}
                    onChange={(event) => setPassword(event.currentTarget.value)}
                    placeholder="비밀번호"
                    state={
                      passwordValidation.errorMessage ? "error" : "default"
                    }
                    type={isPasswordVisible ? "text" : "password"}
                    value={password}
                    hasEndAction
                  />
                  <IconButton
                    aria-pressed={isPasswordVisible}
                    className="btn_loginPasswordToggle"
                    icon="eye"
                    iconSize={12}
                    label={
                      isPasswordVisible ? "비밀번호 숨기기" : "비밀번호 보기"
                    }
                    onClick={() => setIsPasswordVisible((current) => !current)}
                  />
                </div>
                <AuthValidationError
                  id={loginPasswordErrorId}
                  message={passwordValidation.errorMessage}
                />
              </div>
              <PrimaryButtonGroup>
                <PrimaryButton
                  className="btn_loginSubmit"
                  disabled={!isLoginReady || isSubmitting}
                  type="submit"
                >
                  로그인
                </PrimaryButton>
              </PrimaryButtonGroup>
              <AuthValidationError
                id="login-submit-error"
                message={loginError}
              />
              <div className="wrapper_loginActions">
                <CheckInput
                  checked={isAutoLogin}
                  role="autoLogin"
                  size="md"
                  label="자동 로그인"
                  onChange={() => setIsAutoLogin((current) => !current)}
                />
                <AuthTextActionButton onClick={onPasswordResetStart}>
                  비밀번호가 기억나지 않으신가요?
                </AuthTextActionButton>
              </div>
            </div>

            <div className="wrapper_loginSignup">
              <AuthTextActionButton onClick={onSignup}>
                회원가입
              </AuthTextActionButton>
            </div>
          </form>
        </div>
      )}
      <button
        className="btn_authGuestBypass"
        onClick={onGuestEnter}
        type="button"
      >
        우회하기
      </button>
    </AuthLayout>
  );
}
