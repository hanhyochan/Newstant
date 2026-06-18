import { useEffect, useMemo, useState } from "react";

import type {
  Inquiry,
  UpdateUserInput,
  User,
  UserContentAction,
  UserContentActionType,
} from "@/app/_newsroll/api";
import {
  Button,
  NewsRollDivider,
  NewsRollSwitch,
  PillTabMenu,
  TextInput,
} from "@/design-system/components";
import { getEnterFromRightMotionClassName } from "@/design-system/templates";
import { DataUnavailableMessage } from "@/features/shared/DataUnavailableMessage";

export type MyProfileSettingItemId =
  | "accountEdit"
  | "passwordReset"
  | "agreement"
  | "privacyPolicy"
  | "termsOfService"
  | "privacyConsent"
  | "marketingConsent"
  | "inquiryHistory"
  | "reportHistory"
  | "blockedHiddenSettings"
  | "appInfo"
  | "openSourceLicenses"
  | "privacyPolicyHistory"
  | "termsHistory";

type SettingMeta = {
  description: string;
  title: string;
};

const settingMeta: Record<MyProfileSettingItemId, SettingMeta> = {
  accountEdit: {
    title: "내 정보 수정",
    description: "뉴스롤에서 사용하는 기본 계정 정보를 수정합니다.",
  },
  passwordReset: {
    title: "비밀번호 찾기 / 재설정",
    description: "현재 비밀번호 확인 후 새 비밀번호로 변경합니다.",
  },
  agreement: {
    title: "약관 동의",
    description: "회원가입과 서비스 이용에 필요한 동의 상태를 확인합니다.",
  },
  privacyPolicy: {
    title: "개인정보 처리방침",
    description: "뉴스롤의 개인정보 처리 기준을 확인합니다.",
  },
  termsOfService: {
    title: "서비스 이용약관",
    description: "뉴스롤 서비스 이용에 필요한 기본 약관입니다.",
  },
  privacyConsent: {
    title: "개인정보 수집·이용 동의",
    description: "계정 생성과 맞춤형 뉴스 제공에 필요한 수집 항목입니다.",
  },
  marketingConsent: {
    title: "마케팅/알림 수신 동의",
    description: "선택 동의 항목은 언제든 변경할 수 있습니다.",
  },
  inquiryHistory: {
    title: "문의 내역",
    description: "인포메이션 1:1 문의에서 보낸 내역입니다.",
  },
  reportHistory: {
    title: "신고 내역",
    description: "다른 유저 댓글에서 신고한 내역입니다.",
  },
  blockedHiddenSettings: {
    title: "차단/숨김 설정",
    description: "다른 유저 댓글에서 차단하거나 숨긴 내역입니다.",
  },
  appInfo: {
    title: "앱정보",
    description: "뉴스롤 앱의 기본 정보를 확인합니다.",
  },
  openSourceLicenses: {
    title: "오픈소스 라이선스",
    description: "서비스에 사용된 주요 오픈소스 정보를 확인합니다.",
  },
  privacyPolicyHistory: {
    title: "개인정보 처리방침 변경 이력",
    description: "개인정보 처리방침의 주요 변경 내역입니다.",
  },
  termsHistory: {
    title: "서비스 약관 변경 이력",
    description: "서비스 이용약관의 주요 변경 내역입니다.",
  },
};

const documentSections: Partial<Record<MyProfileSettingItemId, string[]>> = {
  agreement: [
    "필수 동의 항목은 만 14세 이상 확인, 서비스 이용약관, 개인정보 수집·이용 동의입니다.",
    "선택 동의 항목은 광고성 정보 및 마케팅/알림 수신 동의이며 동의하지 않아도 기본 서비스 이용은 가능합니다.",
  ],
  privacyPolicy: [
    "뉴스롤은 회원 식별, 맞춤형 뉴스 제공, 문의 처리, 서비스 안정성 확보를 위해 필요한 범위의 개인정보를 처리합니다.",
    "보유 기간이 끝났거나 처리 목적이 달성된 개인정보는 지체 없이 파기하는 것을 원칙으로 합니다.",
  ],
  termsOfService: [
    "이 약관은 뉴스롤 서비스 이용 조건, 회원의 권리와 의무, 서비스 운영 기준을 정합니다.",
    "회원은 타인의 권리를 침해하거나 서비스 운영을 방해하는 방식으로 서비스를 이용할 수 없습니다.",
  ],
  privacyConsent: [
    "수집 항목은 이메일, 닉네임, 비밀번호, 연령대, 관심 카테고리, 서비스 이용 기록입니다.",
    "수집 목적은 회원가입, 로그인, 개인화 뉴스 제공, 고객 문의 처리, 부정 이용 방지입니다.",
  ],
  appInfo: [
    "앱 이름: NewsRoll",
    "현재 버전: 0.1.0",
    "운영 상태: mock API 기반 개발 환경",
  ],
  openSourceLicenses: [
    "Next.js, React, TypeScript, json-server 등 서비스 구현에 필요한 오픈소스 패키지를 사용합니다.",
    "정식 출시 전 패키지 목록과 라이선스 전문을 별도 고지 화면으로 확장할 예정입니다.",
  ],
  privacyPolicyHistory: [
    "2026.06.18 개인정보 처리방침 초안 등록",
    "변경 시 시행일, 변경 사유, 주요 변경 항목을 함께 표시합니다.",
  ],
  termsHistory: [
    "2026.06.18 서비스 이용약관 초안 등록",
    "변경 시 시행일, 변경 사유, 주요 변경 항목을 함께 표시합니다.",
  ],
};

const moderationTabs = [
  { id: "block", label: "차단" },
  { id: "hide", label: "숨김" },
] satisfies { id: UserContentActionType; label: string }[];

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hour = String(date.getHours()).padStart(2, "0");
  const minute = String(date.getMinutes()).padStart(2, "0");

  return `${year}.${month}.${day}. ${hour}:${minute}`;
}

function getActionLabel(action: UserContentAction) {
  if (action.type === "report") {
    return "신고";
  }

  if (action.type === "block") {
    return "차단";
  }

  return "숨김";
}

function getTargetLabel(action: UserContentAction) {
  if (action.targetType === "reply") {
    return "대댓글";
  }

  if (action.targetType === "user") {
    return "유저";
  }

  return "댓글";
}

function SettingDocument({ itemId }: { itemId: MyProfileSettingItemId }) {
  const sections = documentSections[itemId] ?? [];

  return (
    <div className="wrapper_mySettingsDetailBody">
      {sections.map((section) => (
        <p className="text_mySettingsDetailBody" key={section}>
          {section}
        </p>
      ))}
    </div>
  );
}

function InquiryHistory({ inquiries }: { inquiries: Inquiry[] }) {
  if (inquiries.length === 0) {
    return <DataUnavailableMessage target="문의 내역" />;
  }

  return (
    <div className="wrapper_mySettingsList">
      {inquiries.map((inquiry, index) => (
        <article className="wrapper_mySettingsHistoryItem" key={inquiry.id}>
          {index > 0 ? <NewsRollDivider className="divider_mySection" /> : null}
          <div className="wrapper_mySettingsHistoryText">
            <span className="text_mySettingsHistoryMeta">
              {inquiry.status === "answered" ? "답변 완료" : "접수 완료"} ·{" "}
              {formatDate(inquiry.createdAt)}
            </span>
            <strong>{inquiry.title}</strong>
            <p>{inquiry.content}</p>
          </div>
        </article>
      ))}
    </div>
  );
}

function ModerationHistory({
  actions,
  itemId,
  onDeleteAction,
}: {
  actions: UserContentAction[];
  itemId: MyProfileSettingItemId;
  onDeleteAction: (actionId: string) => Promise<void>;
}) {
  const [activeTab, setActiveTab] = useState<UserContentActionType>("block");
  const [pendingActionId, setPendingActionId] = useState<string | null>(null);
  const isReport = itemId === "reportHistory";
  const filteredActions = useMemo(
    () =>
      actions.filter((action) =>
        isReport ? action.type === "report" : action.type === activeTab,
      ),
    [actions, activeTab, isReport],
  );

  return (
    <div className="wrapper_mySettingsDetailBody">
      {isReport ? null : (
        <PillTabMenu
          ariaLabel="차단 숨김 내역"
          className="tab_myCategoryMenu"
          items={moderationTabs}
          onChange={setActiveTab}
          role="tablist"
          value={activeTab}
        />
      )}
      {filteredActions.length === 0 ? (
        <DataUnavailableMessage target={isReport ? "신고 내역" : "차단/숨김 내역"} />
      ) : (
        <div className="wrapper_mySettingsList">
          {filteredActions.map((action, index) => (
            <article className="wrapper_mySettingsHistoryItem" key={action.id}>
              {index > 0 ? <NewsRollDivider className="divider_mySection" /> : null}
              <div className="wrapper_mySettingsHistoryText">
                <span className="text_mySettingsHistoryMeta">
                  {getActionLabel(action)} · {getTargetLabel(action)} ·{" "}
                  {formatDate(action.createdAt)}
                </span>
                <strong>{action.targetUserId ?? action.targetId}</strong>
                {isReport ? null : (
                  <Button
                    className="btn_mySettingsHistoryAction"
                    disabled={pendingActionId === action.id}
                    onClick={() => {
                      setPendingActionId(action.id);
                      onDeleteAction(action.id).finally(() => {
                        setPendingActionId(null);
                      });
                    }}
                    radius="rounded"
                    size="medium"
                    type="button"
                    variant="outline"
                  >
                    {pendingActionId === action.id ? "처리 중" : "해제"}
                  </Button>
                )}
                <p>{action.reason ?? "사용자 메뉴에서 등록된 내역입니다."}</p>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

function AccountEditForm({
  onSubmit,
  user,
}: {
  onSubmit: (input: UpdateUserInput) => Promise<void>;
  user: User | null;
}) {
  const [nickname, setNickname] = useState(user?.nickname ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [ageGroupId, setAgeGroupId] = useState(user?.ageGroupId ?? "");
  const [status, setStatus] = useState<"error" | "saving" | "saved" | null>(null);

  useEffect(() => {
    setNickname(user?.nickname ?? "");
    setEmail(user?.email ?? "");
    setAgeGroupId(user?.ageGroupId ?? "");
  }, [user]);

  return (
    <form
      className="form_mySettingsDetail"
      onSubmit={(event) => {
        event.preventDefault();

        if (!nickname.trim() || !email.trim() || !ageGroupId.trim()) {
          setStatus("error");
          return;
        }

        setStatus("saving");
        onSubmit({
          ageGroupId: ageGroupId.trim(),
          email: email.trim(),
          nickname: nickname.trim(),
        })
          .then(() => setStatus("saved"))
          .catch(() => setStatus("error"));
      }}
    >
      <label className="wrapper_mySettingsField">
        <span className="text_infoFieldLabel">닉네임</span>
        <TextInput
          aria-label="닉네임"
          inputSize="large"
          onChange={(event) => setNickname(event.target.value)}
          radius="rounded"
          type="text"
          value={nickname}
          variant="outline"
        />
      </label>
      <label className="wrapper_mySettingsField">
        <span className="text_infoFieldLabel">이메일</span>
        <TextInput
          aria-label="이메일"
          inputSize="large"
          onChange={(event) => setEmail(event.target.value)}
          radius="rounded"
          type="email"
          value={email}
          variant="outline"
        />
      </label>
      <label className="wrapper_mySettingsField">
        <span className="text_infoFieldLabel">연령대</span>
        <TextInput
          aria-label="연령대"
          inputSize="large"
          onChange={(event) => setAgeGroupId(event.target.value)}
          radius="rounded"
          type="text"
          value={ageGroupId}
          variant="outline"
        />
      </label>
      {status ? (
        <p className={`text_mySettingsStatus${status === "error" ? " is_error" : ""}`}>
          {status === "saving"
            ? "저장 중입니다."
            : status === "saved"
              ? "저장되었습니다."
              : "입력값을 확인해주세요."}
        </p>
      ) : null}
      <Button
        disabled={status === "saving"}
        radius="rounded"
        size="large"
        type="submit"
        variant="filled"
      >
        저장
      </Button>
    </form>
  );
}

function PasswordResetForm({
  onSubmit,
}: {
  onSubmit: (currentPassword: string, nextPassword: string) => Promise<void>;
}) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [nextPassword, setNextPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [status, setStatus] = useState<"error" | "saving" | "saved" | null>(null);

  return (
    <form
      className="form_mySettingsDetail"
      onSubmit={(event) => {
        event.preventDefault();

        if (
          !currentPassword ||
          nextPassword.length < 8 ||
          nextPassword !== confirmPassword
        ) {
          setStatus("error");
          return;
        }

        setStatus("saving");
        onSubmit(currentPassword, nextPassword)
          .then(() => {
            setCurrentPassword("");
            setNextPassword("");
            setConfirmPassword("");
            setStatus("saved");
          })
          .catch(() => setStatus("error"));
      }}
    >
      <label className="wrapper_mySettingsField">
        <span className="text_infoFieldLabel">현재 비밀번호</span>
        <TextInput
          aria-label="현재 비밀번호"
          inputSize="large"
          onChange={(event) => setCurrentPassword(event.target.value)}
          radius="rounded"
          type="password"
          value={currentPassword}
          variant="outline"
        />
      </label>
      <label className="wrapper_mySettingsField">
        <span className="text_infoFieldLabel">새 비밀번호</span>
        <TextInput
          aria-label="새 비밀번호"
          inputSize="large"
          onChange={(event) => setNextPassword(event.target.value)}
          radius="rounded"
          type="password"
          value={nextPassword}
          variant="outline"
        />
      </label>
      <label className="wrapper_mySettingsField">
        <span className="text_infoFieldLabel">새 비밀번호 확인</span>
        <TextInput
          aria-label="새 비밀번호 확인"
          inputSize="large"
          onChange={(event) => setConfirmPassword(event.target.value)}
          radius="rounded"
          type="password"
          value={confirmPassword}
          variant="outline"
        />
      </label>
      {status ? (
        <p className={`text_mySettingsStatus${status === "error" ? " is_error" : ""}`}>
          {status === "saving"
            ? "변경 중입니다."
            : status === "saved"
              ? "비밀번호가 변경되었습니다."
              : "비밀번호를 확인해주세요."}
        </p>
      ) : null}
      <Button
        disabled={status === "saving"}
        radius="rounded"
        size="large"
        type="submit"
        variant="filled"
      >
        변경
      </Button>
    </form>
  );
}

function MarketingConsentForm({
  onSubmit,
  user,
}: {
  onSubmit: (input: UpdateUserInput) => Promise<void>;
  user: User | null;
}) {
  const [isAgreed, setIsAgreed] = useState(user?.marketingAgreed ?? false);
  const [status, setStatus] = useState<"error" | "saving" | "saved" | null>(null);

  useEffect(() => {
    setIsAgreed(user?.marketingAgreed ?? false);
  }, [user]);

  return (
    <div className="form_mySettingsDetail">
      <button
        aria-pressed={isAgreed}
        className="btn_mySettingRow"
        onClick={() => setIsAgreed((current) => !current)}
        type="button"
      >
        <span className="text_mySettingLabel">마케팅/알림 수신 동의</span>
        <NewsRollSwitch checked={isAgreed} />
      </button>
      {status ? (
        <p className={`text_mySettingsStatus${status === "error" ? " is_error" : ""}`}>
          {status === "saving"
            ? "저장 중입니다."
            : status === "saved"
              ? "저장되었습니다."
              : "저장하지 못했습니다."}
        </p>
      ) : null}
      <Button
        disabled={status === "saving"}
        onClick={() => {
          setStatus("saving");
          onSubmit({ marketingAgreed: isAgreed })
            .then(() => setStatus("saved"))
            .catch(() => setStatus("error"));
        }}
        radius="rounded"
        size="large"
        type="button"
        variant="filled"
      >
        저장
      </Button>
    </div>
  );
}

export function MyProfileSettingDetailPage({
  actions,
  inquiries,
  isLeaving,
  itemId,
  onDeleteContentAction,
  onPasswordSubmit,
  onUserSubmit,
  user,
}: {
  actions: UserContentAction[];
  inquiries: Inquiry[];
  isLeaving: boolean;
  itemId: MyProfileSettingItemId;
  onDeleteContentAction: (actionId: string) => Promise<void>;
  onPasswordSubmit: (currentPassword: string, nextPassword: string) => Promise<void>;
  onUserSubmit: (input: UpdateUserInput) => Promise<void>;
  user: User | null;
}) {
  const meta = settingMeta[itemId];

  return (
    <div
      className={`container_mySettingsPage ${getEnterFromRightMotionClassName(isLeaving)}`}
    >
      <section className="container_mySettingsDetailSection">
        <h2 className="text_myTimeTitle">{meta.title}</h2>
        <p className="text_mySettingsDescription">{meta.description}</p>
      </section>
      <NewsRollDivider className="divider_mySection" />
      {itemId === "accountEdit" ? (
        <AccountEditForm onSubmit={onUserSubmit} user={user} />
      ) : itemId === "passwordReset" ? (
        <PasswordResetForm onSubmit={onPasswordSubmit} />
      ) : itemId === "marketingConsent" ? (
        <MarketingConsentForm onSubmit={onUserSubmit} user={user} />
      ) : itemId === "inquiryHistory" ? (
        <InquiryHistory inquiries={inquiries} />
      ) : itemId === "reportHistory" || itemId === "blockedHiddenSettings" ? (
        <ModerationHistory
          actions={actions}
          itemId={itemId}
          onDeleteAction={onDeleteContentAction}
        />
      ) : (
        <SettingDocument itemId={itemId} />
      )}
    </div>
  );
}
