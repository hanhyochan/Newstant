import { DetailBackButton } from "@/design-system/templates";

export function AuthBackButton({ onClick }: { onClick: () => void }) {
  return (
    <DetailBackButton
      ariaLabel="이전 화면으로 돌아가기"
      className="btn_authBack"
      onClick={onClick}
    />
  );
}

