import { Fragment, useEffect, useMemo, useState } from "react";

import type {
  Inquiry,
  UpdateUserInput,
  User,
  UserContentAction,
  UserContentActionType,
} from "@/app/_newsroll/api";
import {
  Button,
  Icon,
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

const compactHeaderSettingItemIds = new Set<MyProfileSettingItemId>([
  "inquiryHistory",
  "reportHistory",
  "blockedHiddenSettings",
]);

const hiddenDescriptionSettingItemIds = new Set<MyProfileSettingItemId>([
  "accountEdit",
  "passwordReset",
]);

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

function InquiryDetailContent({
  inquiry,
  onNextItem,
  onPreviousItem,
  replyEmail,
}: {
  inquiry: Inquiry;
  onNextItem?: () => void;
  onPreviousItem?: () => void;
  replyEmail?: string;
}) {
  const inquiryReplyEmail = inquiry.replyEmail ?? replyEmail;

  return (
    <div className="newsroll_policy_detail_content">
      <div className="newsroll_policy_detail_main">
      <div className="newsroll_policy_detail_header">
        <div className="newsroll_policy_detail_titleMeta">
          <div className="newsroll_policy_detail_body">
            <h1>{inquiry.title}</h1>
          </div>

          <div className="wrapper_articleMetaActions newsroll_policy_detail_meta_actions">
            <div className="newsroll_policy_detail_dates">
              <span>{formatDate(inquiry.createdAt)}</span>
            </div>
          </div>
        </div>
      </div>

      <NewsRollDivider className="newsroll_policy_detail_actions_divider" />

      <p className="newsroll_policy_detail_summary">{inquiry.content}</p>
      {inquiryReplyEmail ? (
        <p className="text_mySettingsDetailBody">
          답변은 {inquiryReplyEmail}로 발송됩니다.
        </p>
      ) : null}
      </div>

      <div
        className="newsroll_policy_detail_pagination"
        role="group"
        aria-label="문의 이전글 다음글"
      >
        <Button
          className="btn_originalArticle newsroll_policy_detail_page_button"
          classNameOnly
          disabled={!onPreviousItem}
          onClick={onPreviousItem}
          type="button"
        >
          <Icon name="arrow" />
          이전글
        </Button>
        <Button
          className="btn_originalArticle newsroll_policy_detail_page_button"
          classNameOnly
          disabled={!onNextItem}
          onClick={onNextItem}
          type="button"
        >
          다음글
          <Icon name="arrow" />
        </Button>
      </div>
    </div>
  );
}

function InquiryHistory({
  inquiries,
  replyEmail,
  selectedInquiryId,
  onSelectInquiry,
}: {
  inquiries: Inquiry[];
  replyEmail?: string;
  selectedInquiryId: string | null;
  onSelectInquiry: (inquiryId: string | null) => void;
}) {
  const selectedInquiryIndex = inquiries.findIndex(
    (inquiry) => inquiry.id === selectedInquiryId,
  );
  const selectedInquiry =
    selectedInquiryIndex >= 0 ? inquiries[selectedInquiryIndex] : null;

  if (selectedInquiry) {
    return (
      <InquiryDetailContent
        inquiry={selectedInquiry}
        onNextItem={
          selectedInquiryIndex < inquiries.length - 1
            ? () => onSelectInquiry(inquiries[selectedInquiryIndex + 1].id)
            : undefined
        }
        onPreviousItem={
          selectedInquiryIndex > 0
            ? () => onSelectInquiry(inquiries[selectedInquiryIndex - 1].id)
            : undefined
        }
        replyEmail={replyEmail}
      />
    );
  }

  if (inquiries.length === 0) {
    return <DataUnavailableMessage target="문의 내역" />;
  }

  return (
    <div className="newsroll_policy_items">
      {inquiries.map((inquiry, index) => (
        <Fragment key={inquiry.id}>
          <button
            className="newsroll_policy_list_item"
            onClick={() => onSelectInquiry(inquiry.id)}
            type="button"
          >
            <div className="wrapper_policyItemContent wrapper_myInquiryItemContent">
              <h2>{inquiry.title}</h2>
              <div className="newsroll_policy_dates">
                <span>{formatDate(inquiry.createdAt)}</span>
              </div>
            </div>
          </button>
          {index < inquiries.length - 1 ? (
            <NewsRollDivider className="newsroll_policy_itemDivider" />
          ) : null}
        </Fragment>
      ))}
    </div>
  );
}

function ModerationHistory({
  actions,
  itemId,
  onDeleteAction,
  users,
}: {
  actions: UserContentAction[];
  itemId: MyProfileSettingItemId;
  onDeleteAction: (actionId: string) => Promise<void>;
  users: User[];
}) {
  const [activeTab, setActiveTab] = useState<UserContentActionType>("block");
  const [pendingActionId, setPendingActionId] = useState<string | null>(null);
  const isReport = itemId === "reportHistory";
  const userNameById = useMemo(
    () => new Map(users.map((user) => [user.id, user.nickname])),
    [users],
  );
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
                  {formatDate(action.createdAt)}
                </span>
                <div className="wrapper_mySettingsHistoryHeader">
                  <strong>
                    {action.targetUserId
                      ? userNameById.get(action.targetUserId) ?? action.targetUserId
                      : action.targetId}
                  </strong>
                  {isReport ? null : (
                    <button
                      aria-pressed="true"
                      className="btn_textAction btn_mySettingsReleaseAction"
                      disabled={pendingActionId === action.id}
                      onClick={() => {
                        setPendingActionId(action.id);
                        onDeleteAction(action.id).finally(() => {
                          setPendingActionId(null);
                        });
                      }}
                      type="button"
                    >
                      {pendingActionId === action.id ? "\uCC98\uB9AC \uC911" : "\uD574\uC81C"}
                    </button>
                  )}
                </div>
                {isReport && action.reason ? <p>{action.reason}</p> : null}
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
  const [status, setStatus] = useState<"error" | "saving" | "saved" | null>(null);

  useEffect(() => {
    setNickname(user?.nickname ?? "");
    setEmail(user?.email ?? "");
  }, [user]);

  return (
    <form
      className="form_mySettingsDetail"
      onSubmit={(event) => {
        event.preventDefault();

        if (!nickname.trim() || !email.trim()) {
          setStatus("error");
          return;
        }

        setStatus("saving");
        onSubmit({
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

function SettingsPasswordField({
  autoComplete,
  isVisible,
  label,
  onChange,
  onToggleVisible,
  value,
}: {
  autoComplete: string;
  isVisible: boolean;
  label: string;
  onChange: (value: string) => void;
  onToggleVisible: () => void;
  value: string;
}) {
  return (
    <label className="wrapper_mySettingsField">
      <span className="text_infoFieldLabel">{label}</span>
      <div className="wrapper_loginPasswordField">
        <TextInput
          aria-label={label}
          autoComplete={autoComplete}
          inputSize="large"
          onChange={(event) => onChange(event.target.value)}
          radius="rounded"
          type={isVisible ? "text" : "password"}
          value={value}
          variant="outline"
          wrapperClassName="input_loginPassword"
        />
        <button
          aria-label={isVisible ? `${label} 숨기기` : `${label} 보기`}
          aria-pressed={isVisible}
          className="btn_loginPasswordToggle btn_mySettingsPasswordToggle"
          onClick={onToggleVisible}
          type="button"
        >
          <Icon name="eye" />
        </button>
      </div>
    </label>
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
  const [isCurrentPasswordVisible, setIsCurrentPasswordVisible] = useState(false);
  const [isNextPasswordVisible, setIsNextPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);
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
      <SettingsPasswordField
        autoComplete="current-password"
        isVisible={isCurrentPasswordVisible}
        label="현재 비밀번호"
        onChange={setCurrentPassword}
        onToggleVisible={() => setIsCurrentPasswordVisible((current) => !current)}
        value={currentPassword}
      />
      <SettingsPasswordField
        autoComplete="new-password"
        isVisible={isNextPasswordVisible}
        label="새 비밀번호"
        onChange={setNextPassword}
        onToggleVisible={() => setIsNextPasswordVisible((current) => !current)}
        value={nextPassword}
      />
      <SettingsPasswordField
        autoComplete="new-password"
        isVisible={isConfirmPasswordVisible}
        label="새 비밀번호 확인"
        onChange={setConfirmPassword}
        onToggleVisible={() => setIsConfirmPasswordVisible((current) => !current)}
        value={confirmPassword}
      />
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
  users,
}: {
  actions: UserContentAction[];
  inquiries: Inquiry[];
  isLeaving: boolean;
  itemId: MyProfileSettingItemId;
  onDeleteContentAction: (actionId: string) => Promise<void>;
  onPasswordSubmit: (currentPassword: string, nextPassword: string) => Promise<void>;
  onUserSubmit: (input: UpdateUserInput) => Promise<void>;
  user: User | null;
  users: User[];
}) {
  const meta = settingMeta[itemId];
  const [selectedInquiryId, setSelectedInquiryId] = useState<string | null>(null);
  const shouldUseCompactHeader = compactHeaderSettingItemIds.has(itemId);
  const shouldHideDescription = hiddenDescriptionSettingItemIds.has(itemId);
  const isInquiryDetailOpen =
    itemId === "inquiryHistory" &&
    inquiries.some((inquiry) => inquiry.id === selectedInquiryId);
  const shouldShowHeader = !isInquiryDetailOpen;
  const shouldShowDivider =
    shouldShowHeader &&
    !shouldUseCompactHeader &&
    itemId !== "accountEdit" &&
    itemId !== "passwordReset";

  useEffect(() => {
    setSelectedInquiryId(null);
  }, [itemId]);

  return (
    <div
      className={`container_mySettingsPage ${isInquiryDetailOpen ? "is_mySettingsNestedDetail " : ""}${getEnterFromRightMotionClassName(isLeaving)}`}
    >
      {shouldShowHeader ? (
        <section className="container_mySettingsDetailSection">
          <h2 className="text_myTimeTitle">{meta.title}</h2>
          {shouldUseCompactHeader || shouldHideDescription ? null : (
            <p className="text_mySettingsDescription">{meta.description}</p>
          )}
        </section>
      ) : null}
      {shouldShowDivider ? <NewsRollDivider className="divider_mySection" /> : null}
      {itemId === "accountEdit" ? (
        <AccountEditForm onSubmit={onUserSubmit} user={user} />
      ) : itemId === "passwordReset" ? (
        <PasswordResetForm onSubmit={onPasswordSubmit} />
      ) : itemId === "marketingConsent" ? (
        <MarketingConsentForm onSubmit={onUserSubmit} user={user} />
      ) : itemId === "inquiryHistory" ? (
        <InquiryHistory
          inquiries={inquiries}
          onSelectInquiry={setSelectedInquiryId}
          replyEmail={user?.email}
          selectedInquiryId={selectedInquiryId}
        />
      ) : itemId === "reportHistory" || itemId === "blockedHiddenSettings" ? (
        <ModerationHistory
          actions={actions}
          itemId={itemId}
          onDeleteAction={onDeleteContentAction}
          users={users}
        />
      ) : (
        <SettingDocument itemId={itemId} />
      )}
    </div>
  );
}
