export const reservedSignupNicknames = ["콩콩이", "홍길동", "관리자", "뉴스롤"];

export type SignupAgeId = "teens" | "twenties" | "thirties" | "forties" | "fifties" | "sixties";
export type SignupCategoryId =
  | "politics"
  | "economy"
  | "society"
  | "culture"
  | "world"
  | "local"
  | "sports"
  | "science";

export const signupAgeItems: Array<{ id: SignupAgeId; label: string }> = [
  { id: "teens", label: "10대" },
  { id: "twenties", label: "20대" },
  { id: "thirties", label: "30대" },
  { id: "forties", label: "40대" },
  { id: "fifties", label: "50대" },
  { id: "sixties", label: "60대 이상" },
];

export const signupCategoryItems: Array<{ id: SignupCategoryId; label: string }> = [
  { id: "politics", label: "정치" },
  { id: "economy", label: "경제" },
  { id: "society", label: "사회" },
  { id: "culture", label: "문화" },
  { id: "world", label: "국제" },
  { id: "local", label: "지역" },
  { id: "sports", label: "스포츠" },
  { id: "science", label: "IT과학" },
];
export const defaultSignupCategoryIds = signupCategoryItems.map((item) => item.id);

