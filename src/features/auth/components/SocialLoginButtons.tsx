import { SocialLoginButton } from "@/design-system/components";
import { AuthTextActionButton } from "@/features/auth/components/AuthTextActionButton";

const socialLoginProviders = [
  "google",
  "naver",
  "kakao",
] as const;

export function SocialLoginButtons({
  onEmailLoginClick,
}: {
  onEmailLoginClick: () => void;
}) {
  return (
    <div className="wrapper_socialLoginGroup u_gapV24">
      <div className="wrapper_socialLoginOptions u_gapV16">
        <span className="text_socialLoginTitle">빠른 로그인</span>
        <div className="wrapper_socialLogin" aria-label="소셜 로그인">
          {socialLoginProviders.map((provider) => (
            <SocialLoginButton key={provider} provider={provider} />
          ))}
        </div>
      </div>
      <AuthTextActionButton onClick={onEmailLoginClick}>
        이메일로 로그인·회원가입
      </AuthTextActionButton>
    </div>
  );
}

