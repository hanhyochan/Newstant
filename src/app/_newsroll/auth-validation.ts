import { z } from "zod";

const requiredMessage = "필수값을 입력해 주세요.";

const requiredText = (message = requiredMessage) => z.string().trim().min(1, message);

export const authEmailSchema = requiredText("이메일을 입력해 주세요.").email(
  "이메일 형식으로 입력해 주세요.",
);

export const loginPasswordSchema = requiredText("비밀번호를 입력해 주세요.");

export const signupLoginIdSchema = requiredText("아이디를 입력해 주세요.")
  .min(4, "아이디를 4자 이상 입력해 주세요.")
  .max(20, "아이디를 20자 이하로 입력해 주세요.")
  .regex(
    /^[A-Za-z0-9_]+$/,
    "아이디는 영문, 숫자, 밑줄만 사용할 수 있어요.",
  );

export const signupNicknameSchema = requiredText("닉네임을 입력해 주세요.")
  .min(2, "닉네임을 2자 이상 입력해 주세요.")
  .max(12, "닉네임을 12자 이하로 입력해 주세요.")
  .regex(
    /^[가-힣A-Za-z0-9_]+$/,
    "닉네임은 한글, 영문, 숫자, 밑줄만 사용할 수 있어요.",
  );

export const signupPasswordSchema = requiredText("비밀번호를 입력해 주세요.")
  .min(8, "비밀번호를 8자 이상 입력해 주세요.")
  .regex(/[A-Za-z]/, "비밀번호에 영문을 포함해 주세요.")
  .regex(/\d/, "비밀번호에 숫자를 포함해 주세요.");

export const verificationCodeSchema = requiredText("인증번호를 입력해 주세요.").regex(
  /^\d{6}$/,
  "인증번호 6자리를 숫자로 입력해 주세요.",
);

export function createSignupPasswordConfirmSchema(password: string) {
  return requiredText("비밀번호 확인을 입력해 주세요.").refine(
    (value) => value === password,
    {
      message: "비밀번호가 일치하지 않습니다.",
    },
  );
}
