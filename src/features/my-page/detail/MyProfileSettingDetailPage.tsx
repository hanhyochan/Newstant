import { Fragment, useEffect, useMemo, useRef, useState } from "react";

import type {
  Inquiry,
  UpdateUserInput,
  User,
  UserContentAction,
  UserContentActionType,
} from "@/app/_newsroll/api";
import {
  authEmailSchema,
  signupNicknameSchema,
  verificationCodeSchema,
} from "@/app/_newsroll/auth-validation";
import { useZodFieldValidation } from "@/app/_newsroll/use-zod-field-validation";
import {
  PaginationButton,
  FieldActionButton,
  IconButton,
  PrimaryButton,
  PrimaryButtonGroup,
  NewsRollCheckBox,
  NewsRollDivider,
  NewsRollCheckField,
  PillTabMenu,
  SettingRowButton,
  TextButton,
  TextInput,
} from "@/design-system/components";
import { getEnterFromRightMotionClassName } from "@/design-system/templates";
import {
  BottomFixedActionBar,
  bottomFixedActionBarExitDurationMs,
} from "@/features/shared/BottomFixedActionBar";
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
        <PaginationButton
          direction="previous"
          disabled={!onPreviousItem}
          onClick={onPreviousItem}
        />
        <PaginationButton
          direction="next"
          disabled={!onNextItem}
          onClick={onNextItem}
        />
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
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [isReleaseBarLeaving, setIsReleaseBarLeaving] = useState(false);
  const [isReleasing, setIsReleasing] = useState(false);
  const [selectedActionIds, setSelectedActionIds] = useState<Set<string>>(
    () => new Set(),
  );
  const closeSelectionTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
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
  const selectableActionIds = useMemo(
    () => filteredActions.map((action) => action.id),
    [filteredActions],
  );
  const selectedCount = selectedActionIds.size;
  const isAllSelected =
    !isReport &&
    selectableActionIds.length > 0 &&
    selectableActionIds.every((actionId) => selectedActionIds.has(actionId));

  useEffect(() => {
    if (closeSelectionTimeoutRef.current) {
      clearTimeout(closeSelectionTimeoutRef.current);
      closeSelectionTimeoutRef.current = null;
    }

    setIsSelectionMode(false);
    setIsReleaseBarLeaving(false);
    setIsReleasing(false);
    setSelectedActionIds(new Set());
  }, [activeTab, itemId]);

  useEffect(() => {
    if (isReleaseBarLeaving) {
      return;
    }

    setSelectedActionIds((current) => {
      const selectableIdSet = new Set(selectableActionIds);
      const next = new Set(
        Array.from(current).filter((actionId) => selectableIdSet.has(actionId)),
      );

      return next.size === current.size ? current : next;
    });
  }, [isReleaseBarLeaving, selectableActionIds]);

  useEffect(
    () => () => {
      if (closeSelectionTimeoutRef.current) {
        clearTimeout(closeSelectionTimeoutRef.current);
      }
    },
    [],
  );

  function toggleAllSelection() {
    if (isReport) {
      return;
    }

    if (closeSelectionTimeoutRef.current) {
      clearTimeout(closeSelectionTimeoutRef.current);
      closeSelectionTimeoutRef.current = null;
    }

    setIsReleaseBarLeaving(false);
    setIsReleasing(false);
    setIsSelectionMode(true);
    setSelectedActionIds(isAllSelected ? new Set() : new Set(selectableActionIds));
  }

  function toggleActionSelection(actionId: string) {
    if (isReport) {
      return;
    }

    if (closeSelectionTimeoutRef.current) {
      clearTimeout(closeSelectionTimeoutRef.current);
      closeSelectionTimeoutRef.current = null;
    }

    setIsReleaseBarLeaving(false);
    setIsReleasing(false);
    setIsSelectionMode(true);
    setSelectedActionIds((current) => {
      const next = new Set(current);

      if (next.has(actionId)) {
        next.delete(actionId);
      } else {
        next.add(actionId);
      }

      return next;
    });
  }

  async function releaseSelectedActions() {
    const actionIds = Array.from(selectedActionIds);

    if (actionIds.length === 0 || isReleasing) {
      return;
    }

    setIsReleasing(true);

    try {
      await Promise.all(actionIds.map((actionId) => onDeleteAction(actionId)));
      setIsReleaseBarLeaving(true);

      if (closeSelectionTimeoutRef.current) {
        clearTimeout(closeSelectionTimeoutRef.current);
      }

      closeSelectionTimeoutRef.current = setTimeout(() => {
        setSelectedActionIds(new Set());
        setIsSelectionMode(false);
        setIsReleaseBarLeaving(false);
        setIsReleasing(false);
        closeSelectionTimeoutRef.current = null;
      }, bottomFixedActionBarExitDurationMs);
    } catch (error) {
      setIsReleasing(false);
      throw error;
    }
  }

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
      {isReport ? null : (
        <NewsRollCheckField
          checked={isAllSelected}
          className="btn_myModerationSelectAll"
          size="small"
          disabled={selectableActionIds.length === 0 || isReleasing}
          label="전체 선택"
          onChange={toggleAllSelection}
        />
      )}
      {filteredActions.length === 0 ? (
        <DataUnavailableMessage target={isReport ? "신고 내역" : "차단/숨김 내역"} />
      ) : (
        <>
          <div className="wrapper_mySettingsList">
            {filteredActions.map((action, index) => {
              const isSelected = selectedActionIds.has(action.id);
              const targetLabel = action.targetUserId
                ? userNameById.get(action.targetUserId) ?? action.targetUserId
                : action.targetId;

              return (
                <article className="wrapper_mySettingsHistoryItem" key={action.id}>
                  {index > 0 ? <NewsRollDivider className="divider_mySection" /> : null}
                  <div
                    className="wrapper_myModerationSelectableItem"
                    data-selection-mode={isSelectionMode ? "true" : "false"}
                  >
                    {!isReport && isSelectionMode ? (
                      <button
                        aria-label={`${targetLabel} 선택`}
                        aria-pressed={isSelected}
                        className="btn_myModerationItemCheck"
                        onClick={() => toggleActionSelection(action.id)}
                        type="button"
                      >
                        <NewsRollCheckBox
                          checked={isSelected}
                          className="box_myModerationItemCheck"
                          size="small"
                        />
                      </button>
                    ) : null}
                    <div className="wrapper_mySettingsHistoryText">
                      <span className="text_mySettingsHistoryMeta">
                        {formatDate(action.createdAt)}
                      </span>
                      <div className="wrapper_mySettingsHistoryHeader">
                        <strong>{targetLabel}</strong>
                      </div>
                      {isReport && action.reason ? <p>{action.reason}</p> : null}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </>
      )}
      {!isReport && selectedCount > 0 ? (
        <BottomFixedActionBar
          ariaLabel="차단 숨김 선택 해제"
          className="container_myModerationReleaseFixed"
          isLeaving={isReleaseBarLeaving}
        >
          <PrimaryButtonGroup>
        <PrimaryButton
            className="btn_myModerationRelease"
            disabled={isReleasing}
            onClick={releaseSelectedActions}
            tone="danger"
            type="button"
          >
            해제하기
          </PrimaryButton>
      </PrimaryButtonGroup>
        </BottomFixedActionBar>
      ) : null}
    </div>
  );
}

function AccountEditForm({
  onSubmit,
  user,
  users,
}: {
  onSubmit: (input: UpdateUserInput) => Promise<void>;
  user: User | null;
  users: User[];
}) {
  const verificationTimerRef = useRef<number | null>(null);
  const [nickname, setNickname] = useState(user?.nickname ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [isNicknameChecked, setIsNicknameChecked] = useState(false);
  const [isNicknameChecking, setIsNicknameChecking] = useState(false);
  const [nicknameCheckMessage, setNicknameCheckMessage] = useState("");
  const [isEmailChecked, setIsEmailChecked] = useState(false);
  const [isEmailChecking, setIsEmailChecking] = useState(false);
  const [emailCheckMessage, setEmailCheckMessage] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [isVerificationConfirmed, setIsVerificationConfirmed] = useState(false);
  const [isVerificationSent, setIsVerificationSent] = useState(false);
  const [remainingVerificationSeconds, setRemainingVerificationSeconds] = useState(0);
  const [status, setStatus] = useState<"error" | "saving" | "saved" | null>(null);
  const nicknameValidation = useZodFieldValidation(signupNicknameSchema, nickname);
  const emailValidation = useZodFieldValidation(authEmailSchema, email);
  const verificationCodeValidation = useZodFieldValidation(
    verificationCodeSchema,
    verificationCode,
  );
  const normalizedOriginalEmail = (user?.email ?? "").trim().toLocaleLowerCase("en-US");
  const normalizedEmail = email.trim().toLocaleLowerCase("en-US");
  const normalizedOriginalNickname = (user?.nickname ?? "").trim().toLocaleLowerCase("ko-KR");
  const normalizedNickname = nickname.trim().toLocaleLowerCase("ko-KR");
  const isNicknameUnchanged = normalizedNickname === normalizedOriginalNickname;
  const isEmailUnchanged = normalizedEmail === normalizedOriginalEmail;
  const isNicknameReady =
    isNicknameUnchanged || (nicknameValidation.isValid && isNicknameChecked);
  const isEmailReady =
    isEmailUnchanged ||
    (emailValidation.isValid && isEmailChecked && isVerificationConfirmed);
  const isProfileReady = isNicknameReady && isEmailReady;
  const accountNicknameErrorId = "account-edit-nickname-error";
  const accountNicknameCheckId = "account-edit-nickname-check";
  const accountEmailErrorId = "account-edit-email-error";
  const accountEmailCheckId = "account-edit-email-check";
  const accountVerificationCodeErrorId = "account-edit-verification-code-error";
  const formattedVerificationTime = `${Math.floor(
    remainingVerificationSeconds / 60,
  )}:${String(remainingVerificationSeconds % 60).padStart(2, "0")}`;

  useEffect(() => {
    setNickname(user?.nickname ?? "");
    setEmail(user?.email ?? "");
    setIsNicknameChecked(false);
    setNicknameCheckMessage("");
    setIsEmailChecked(false);
    setEmailCheckMessage("");
    resetVerificationCode();
    setStatus(null);
  }, [user]);

  useEffect(() => {
    if (!isVerificationSent || remainingVerificationSeconds <= 0) {
      return undefined;
    }

    verificationTimerRef.current = window.setTimeout(() => {
      setRemainingVerificationSeconds((current) => current - 1);
    }, 1000);

    return () => {
      if (verificationTimerRef.current !== null) {
        window.clearTimeout(verificationTimerRef.current);
        verificationTimerRef.current = null;
      }
    };
  }, [isVerificationSent, remainingVerificationSeconds]);

  useEffect(
    () => () => {
      if (verificationTimerRef.current !== null) {
        window.clearTimeout(verificationTimerRef.current);
      }
    },
    [],
  );

  function resetVerificationCode() {
    if (verificationTimerRef.current !== null) {
      window.clearTimeout(verificationTimerRef.current);
      verificationTimerRef.current = null;
    }

    setVerificationCode("");
    setIsVerificationSent(false);
    setIsVerificationConfirmed(false);
    setRemainingVerificationSeconds(0);
  }

  function updateNickname(value: string) {
    setNickname(value);
    setIsNicknameChecked(false);
    setNicknameCheckMessage("");
    setStatus(null);
  }

  function updateEmail(value: string) {
    setEmail(value);
    setIsEmailChecked(false);
    setEmailCheckMessage("");
    resetVerificationCode();
    setStatus(null);
  }

  async function checkNicknameDuplicate() {
    nicknameValidation.markTouched();

    if (!nicknameValidation.isValid) {
      setIsNicknameChecked(false);
      setNicknameCheckMessage("");
      return;
    }

    if (isNicknameUnchanged) {
      setIsNicknameChecked(true);
      setNicknameCheckMessage("현재 사용 중인 닉네임입니다.");
      return;
    }

    setIsNicknameChecking(true);

    const isDuplicated = users.some(
      (item) =>
        item.id !== user?.id &&
        item.nickname.trim().toLocaleLowerCase("ko-KR") === normalizedNickname,
    );

    setIsNicknameChecking(false);
    setIsNicknameChecked(!isDuplicated);
    setNicknameCheckMessage(
      isDuplicated ? "중복되는 닉네임입니다." : "사용 가능한 닉네임입니다.",
    );
  }

  async function startVerificationCode() {
    emailValidation.markTouched();

    if (!emailValidation.isValid) {
      setIsEmailChecked(false);
      setEmailCheckMessage("");
      resetVerificationCode();
      return;
    }

    if (isEmailUnchanged) {
      setIsEmailChecked(true);
      setEmailCheckMessage("현재 사용 중인 이메일입니다.");
      resetVerificationCode();
      return;
    }

    setIsEmailChecking(true);

    const isDuplicated = users.some(
      (item) =>
        item.id !== user?.id &&
        item.email.trim().toLocaleLowerCase("en-US") === normalizedEmail,
    );

    setIsEmailChecking(false);
    setIsEmailChecked(!isDuplicated);

    if (isDuplicated) {
      setEmailCheckMessage("이미 가입된 이메일이에요.");
      resetVerificationCode();
      return;
    }

    if (verificationTimerRef.current !== null) {
      window.clearTimeout(verificationTimerRef.current);
    }

    setEmailCheckMessage("인증번호를 발송했습니다.");
    setVerificationCode("");
    setIsVerificationConfirmed(false);
    setIsVerificationSent(true);
    setRemainingVerificationSeconds(180);
  }

  function confirmVerificationCode() {
    verificationCodeValidation.markTouched();

    if (verificationCodeValidation.isValid) {
      setIsVerificationConfirmed(true);
    }
  }

  return (
    <form
      className="form_mySettingsDetail"
      onSubmit={(event) => {
        event.preventDefault();

        nicknameValidation.markTouched();
        emailValidation.markTouched();

        if (!isProfileReady) {
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
      <div className="wrapper_mySettingsField">
        <span className="text_infoFieldLabel">닉네임</span>
        <div className="wrapper_signupEmailField">
          <TextInput
            aria-describedby={[
              nicknameValidation.errorMessage ? accountNicknameErrorId : "",
              nicknameCheckMessage ? accountNicknameCheckId : "",
            ]
              .filter(Boolean)
              .join(" ") || undefined}
            aria-invalid={Boolean(
              nicknameValidation.errorMessage ||
                (nicknameCheckMessage && !isNicknameChecked),
            )}
            aria-label="닉네임"
            autoComplete="nickname"
            maxLength={12}
            onBlur={nicknameValidation.markTouched}
            onChange={(event) => updateNickname(event.target.value)}
            placeholder="닉네임"
            state={
              nicknameValidation.errorMessage ||
              (nicknameCheckMessage && !isNicknameChecked)
                ? "error"
                : "default"
            }
            type="text"
            value={nickname}
          />
          <FieldActionButton
            disabled={
              !nicknameValidation.isValid ||
              isNicknameChecking ||
              (isNicknameChecked && !isNicknameUnchanged)
            }
            onClick={checkNicknameDuplicate}
            tone="white"
          >
            중복확인
          </FieldActionButton>
        </div>
        {nicknameValidation.errorMessage ? (
          <p className="text_authValidationError" id={accountNicknameErrorId} role="alert">
            {nicknameValidation.errorMessage}
          </p>
        ) : null}
        {nicknameCheckMessage ? (
          <p
            className="text_authValidation"
            data-state={isNicknameChecked ? "success" : "error"}
            id={accountNicknameCheckId}
          >
            {nicknameCheckMessage}
          </p>
        ) : null}
      </div>
      <div className="wrapper_mySettingsField">
        <span className="text_infoFieldLabel">이메일</span>
        <div className="wrapper_signupEmailField">
          <TextInput
            aria-describedby={[
              emailValidation.errorMessage ? accountEmailErrorId : "",
              emailCheckMessage ? accountEmailCheckId : "",
            ]
              .filter(Boolean)
              .join(" ") || undefined}
            aria-invalid={Boolean(emailValidation.errorMessage)}
            aria-label="이메일"
            autoComplete="email"
            autoCapitalize="none"
            autoCorrect="off"
            className="input_authEmailControl"
            onBlur={emailValidation.markTouched}
            onChange={(event) => updateEmail(event.target.value)}
            placeholder="이메일"
            spellCheck={false}
            state={emailValidation.errorMessage ? "error" : "default"}
            type="email"
            value={email}
          />
          <FieldActionButton
            disabled={
              !emailValidation.isValid ||
              isEmailChecking ||
              isVerificationSent ||
              isVerificationConfirmed
            }
            onClick={startVerificationCode}
            tone="white"
          >
            인증번호 발송
          </FieldActionButton>
        </div>
        {emailValidation.errorMessage ? (
          <p className="text_authValidationError" id={accountEmailErrorId} role="alert">
            {emailValidation.errorMessage}
          </p>
        ) : null}
        {emailCheckMessage ? (
          <p
            className="text_authValidation"
            data-state={isEmailChecked ? "success" : "error"}
            id={accountEmailCheckId}
          >
            {emailCheckMessage}
          </p>
        ) : null}
      </div>
      {isVerificationSent ? (
        <div className="wrapper_mySettingsField">
          <span className="text_infoFieldLabel">인증번호</span>
          <div className="wrapper_signupVerificationCode">
            <div className="wrapper_signupVerificationCodeInput">
              <TextInput
                aria-describedby={
                  verificationCodeValidation.errorMessage
                    ? accountVerificationCodeErrorId
                    : undefined
                }
                aria-invalid={Boolean(verificationCodeValidation.errorMessage)}
                aria-label="이메일 인증번호 6자리 입력"
                inputMode="numeric"
                maxLength={6}
                onBlur={verificationCodeValidation.markTouched}
                onChange={(event) => {
                  setVerificationCode(event.currentTarget.value);
                  setIsVerificationConfirmed(false);
                }}
                placeholder="인증번호 6자리"
                state={verificationCodeValidation.errorMessage ? "error" : "default"}
                type="text"
                value={verificationCode}
              />
              <span className="text_signupVerificationTimer">
                {formattedVerificationTime}
              </span>
            </div>
            <FieldActionButton
              disabled={isVerificationConfirmed}
              onClick={confirmVerificationCode}
              tone="white"
            >
              인증하기
            </FieldActionButton>
          </div>
          {verificationCodeValidation.errorMessage ? (
            <p
              className="text_authValidationError"
              id={accountVerificationCodeErrorId}
              role="alert"
            >
              {verificationCodeValidation.errorMessage}
            </p>
          ) : null}
          {isVerificationConfirmed ? (
            <p className="text_authValidation" data-state="success">
              인증이 완료되었습니다.
            </p>
          ) : null}
        </div>
      ) : null}
      {status ? (
        <p className={`text_mySettingsStatus${status === "error" ? " is_error" : ""}`}>
          {status === "saving"
            ? "저장 중입니다."
            : status === "saved"
              ? "저장되었습니다."
              : "중복확인과 이메일 인증을 확인해주세요."}
        </p>
      ) : null}
      <div className="wrapper_mySettingsBottomActions">
        <PrimaryButtonGroup>
        <PrimaryButton
          disabled={status === "saving" || !isProfileReady}
          type="submit"
        >
          저장
        </PrimaryButton>
      </PrimaryButtonGroup>
        <TextButton
          tone="danger"
          type="button"
        >
          회원탈퇴
        </TextButton>
      </div>
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
          onChange={(event) => onChange(event.target.value)}
          type={isVisible ? "text" : "password"}
          value={value}
          wrapperClassName="input_loginPassword"
        />
        <IconButton
          aria-pressed={isVisible}
          className="btn_loginPasswordToggle btn_mySettingsPasswordToggle"
          icon="eye"
          iconSize={12}
          label={isVisible ? `${label} 숨기기` : `${label} 보기`}
          onClick={onToggleVisible}
        />
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
      <PrimaryButtonGroup>
        <PrimaryButton
        disabled={status === "saving"}
        type="submit"
      >
        변경
      </PrimaryButton>
      </PrimaryButtonGroup>
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
      <SettingRowButton
        checked={isAgreed}
        label="마케팅/알림 수신 동의"
        onClick={() => setIsAgreed((current) => !current)}
      />
      {status ? (
        <p className={`text_mySettingsStatus${status === "error" ? " is_error" : ""}`}>
          {status === "saving"
            ? "저장 중입니다."
            : status === "saved"
              ? "저장되었습니다."
              : "저장하지 못했습니다."}
        </p>
      ) : null}
      <PrimaryButtonGroup>
        <PrimaryButton
        disabled={status === "saving"}
        onClick={() => {
          setStatus("saving");
          onSubmit({ marketingAgreed: isAgreed })
            .then(() => setStatus("saved"))
            .catch(() => setStatus("error"));
        }}
        type="button"
      >
        저장
      </PrimaryButton>
      </PrimaryButtonGroup>
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
      className={`container_mySettingsPage ${itemId === "accountEdit" ? "is_mySettingsAccountEdit " : ""}${isInquiryDetailOpen ? "is_mySettingsNestedDetail " : ""}${getEnterFromRightMotionClassName(isLeaving)}`}
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
        <AccountEditForm onSubmit={onUserSubmit} user={user} users={users} />
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
