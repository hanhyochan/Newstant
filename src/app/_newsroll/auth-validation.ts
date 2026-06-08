import { z } from "zod";

const requiredMessage = "필수값을 입력해 주세요.";

const requiredText = (message = requiredMessage) => z.string().trim().min(1, message);

export const authEmailSchema = requiredText("이메일을 입력해 주세요.").email(
  "이메일 형식으로 입력해 주세요.",
);

export const loginPasswordSchema = requiredText("비밀번호를 입력해 주세요.");

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
