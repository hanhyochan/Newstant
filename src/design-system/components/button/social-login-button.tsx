import type { ButtonHTMLAttributes } from "react";

import { cn } from "@/design-system/utils/cn";

export type SocialLoginProvider = "google" | "naver" | "kakao";

const socialLoginIconByProvider: Record<SocialLoginProvider, string> = {
  google: "/icons/icon_google_login.svg",
  naver: "/icons/icon_naver_login.svg",
  kakao: "/icons/icon_kakao_login.svg",
};

const socialLoginLabelByProvider: Record<SocialLoginProvider, string> = {
  google: "구글 로그인",
  naver: "네이버 로그인",
  kakao: "카카오 로그인",
};

export type SocialLoginButtonProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "children"
> & {
  provider: SocialLoginProvider;
};

export function SocialLoginButton({
  className,
  provider,
  type = "button",
  ...props
}: SocialLoginButtonProps) {
  return (
    <button
      {...props}
      aria-label={socialLoginLabelByProvider[provider]}
      className={cn("btn_socialLogin", className)}
      type={type}
    >
      <img
        alt=""
        aria-hidden="true"
        className="img_socialLoginIcon"
        src={socialLoginIconByProvider[provider]}
      />
    </button>
  );
}
