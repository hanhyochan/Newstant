"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type MouseEventHandler,
  type ReactNode,
} from "react";

import {
  FieldActionButton,
  ChevronRowButton,
  CheckInput,
  Icon,
  IconButton,
  Divider,
  PillTabMenu,
  PrimaryButton,
  PrimaryButtonGroup,
  getSearchHighlightTargetId,
  scrollSearchHighlightTargetIntoView,
  SearchHighlightText,
  SearchResultButton,
  SocialLoginButton,
  TextButton,
  TextInput,
} from "@/design-system/components";
import {
  NewsRollCommonLayout,
  NewsRollDetailBackButton,
  NewsRollDockedControls,
  NewsRollHeaderTop,
  NewsRollPagePanel,
  newsrollPagePanelContentSelector as pagePanelContentSelector,
  newsrollPagePanelDockedGap as pagePanelDockedGap,
  newsrollPagePanelInitialGap as pagePanelInitialGap,
  newsrollPagePanelInitialTop as pagePanelInitialTop,
} from "@/design-system/templates";
import {
  authEmailSchema,
  createSignupPasswordConfirmSchema,
  loginPasswordSchema,
  signupNicknameSchema,
  signupPasswordSchema,
  verificationCodeSchema,
} from "@/app/_newsroll/auth-validation";
import { fixedDockedPanelProps } from "@/app/_newsroll/my-info-panel-behavior";
import { useZodFieldValidation } from "@/app/_newsroll/use-zod-field-validation";
import { NewsToolbar } from "@/features/shell/NewsRollToolbar";

const socialLoginProviders = [
  "google",
  "naver",
  "kakao",
] as const;

function AuthTextActionButton({
  children,
  onClick,
}: {
  children: ReactNode;
  onClick: MouseEventHandler<HTMLButtonElement>;
}) {
  return (
    <TextButton onClick={onClick} type="button">
      {children}
    </TextButton>
  );
}

function SocialLoginButtons({
  onEmailLoginClick,
}: {
  onEmailLoginClick: () => void;
}) {
  return (
    <div className="wrapper_socialLoginGroup">
      <div className="wrapper_socialLoginOptions">
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

function AuthValidationError({
  id,
  message,
}: {
  id: string;
  message?: string;
}) {
  return message ? (
    <p className="text_authValidationError" id={id} role="alert">
      {message}
    </p>
  ) : null;
}

function SignupFieldActionButton({
  children,
  disabled,
  onClick,
}: {
  children: ReactNode;
  disabled: boolean;
  onClick: () => void | Promise<void>;
}) {
  return (
    <FieldActionButton
      disabled={disabled}
      onClick={onClick}
      type="button"
    >
      {children}
    </FieldActionButton>
  );
}

function AuthBackButton({ onClick }: { onClick: () => void }) {
  return (
    <NewsRollDetailBackButton
      ariaLabel="이전 화면으로 돌아가기"
      className="btn_authBack"
      onClick={onClick}
    />
  );
}

export function LoginView({
  isSubmitting = false,
  loginError,
  onLogin,
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
  onPasswordResetStart: () => void;
  onSignup: () => void;
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isAutoLogin, setIsAutoLogin] = useState(false);
  const [isEmailLoginVisible, setIsEmailLoginVisible] = useState(false);
  const emailValidation = useZodFieldValidation(authEmailSchema, email);
  const passwordValidation = useZodFieldValidation(loginPasswordSchema, password);
  const isLoginReady = emailValidation.isValid && passwordValidation.isValid;
  const loginEmailErrorId = "login-email-error";
  const loginPasswordErrorId = "login-password-error";

  return (
    <AuthLayout
      ariaLabel="로그인"
      className={!isEmailLoginVisible ? "container_authLayout_loginLanding" : undefined}
    >
      {!isEmailLoginVisible ? (
        <div className="wrapper_loginContent wrapper_loginLandingContent">
          <h1 className="text_loginLandingHero">세상을 스크롤하다</h1>
          <SocialLoginButtons onEmailLoginClick={() => setIsEmailLoginVisible(true)} />
        </div>
      ) : (
      <div className="wrapper_loginContent wrapper_loginEmailContent">
        <AuthBackButton onClick={() => setIsEmailLoginVisible(false)} />
        <h1 className="text_loginTitle">세상을 스크롤하다</h1>

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
            <div className="wrapper_authField wrapper_fieldStack">
              <TextInput mode="dark"
                aria-describedby={emailValidation.errorMessage ? loginEmailErrorId : undefined}
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
            <div className="wrapper_authField wrapper_fieldStack">
              <div className="wrapper_loginPasswordField">
                <TextInput mode="dark"
                  aria-describedby={
                    passwordValidation.errorMessage ? loginPasswordErrorId : undefined
                  }
                  aria-invalid={Boolean(passwordValidation.errorMessage)}
                  aria-label="비밀번호 입력"
                  autoComplete="current-password"
                  onBlur={passwordValidation.markTouched}
                  onChange={(event) => setPassword(event.currentTarget.value)}
                  placeholder="비밀번호"
                  state={passwordValidation.errorMessage ? "error" : "default"}
                  type={isPasswordVisible ? "text" : "password"}
                  value={password}
                  hasEndAction
                />
                <IconButton
                  aria-pressed={isPasswordVisible}
                  className="btn_loginPasswordToggle"
                  icon="eye"
                  iconSize={12}
                  label={isPasswordVisible ? "비밀번호 숨기기" : "비밀번호 보기"}
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
            <AuthValidationError id="login-submit-error" message={loginError} />
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
    </AuthLayout>
  );
}

function AuthLayout({
  ariaLabel,
  children,
  className,
}: {
  ariaLabel: string;
  children: ReactNode;
  className?: string;
}) {
  const classNames = ["container_authLayout", className]
    .filter(Boolean)
    .join(" ");

  return (
    <section className={classNames} aria-label={ariaLabel}>
      {children}
    </section>
  );
}

type SignupAgreementKey = "age" | "terms" | "privacy" | "marketing";

const signupAgreementItems: Array<{
  id: SignupAgreementKey;
  required: boolean;
  title: string;
}> = [
  {
    id: "age",
    required: true,
    title: "만 14세 이상입니다",
  },
  {
    id: "terms",
    required: true,
    title: "서비스 이용약관 동의",
  },
  {
    id: "privacy",
    required: true,
    title: "개인정보 수집·이용 동의",
  },
  {
    id: "marketing",
    required: false,
    title: "광고성 정보 수신 동의",
  },
];

const signupAgreementDetails: Record<
  SignupAgreementKey,
  {
    source: string;
    title: string;
    sections: Array<{
      body: string[];
      heading: string;
    }>;
  }
> = {
  age: {
    source: "개인정보보호위원회 아동·청소년 개인정보 보호 안내 기준",
    title: "만 14세 이상 확인",
    sections: [
      {
        heading: "확인 사항",
        body: [
          "NewsRoll은 별도의 법정대리인 동의 절차를 제공하기 전까지 만 14세 이상 이용자를 대상으로 회원가입을 진행합니다.",
          "만 14세 미만 아동의 개인정보를 수집·이용하려면 법정대리인에게 필요한 사항을 알리고 동의를 받아야 합니다.",
          "가입자는 본인이 만 14세 이상임을 확인하며, 사실과 다른 정보로 가입한 경우 서비스 이용이 제한될 수 있습니다.",
        ],
      },
    ],
  },
  terms: {
    source: "공정거래위원회 전자상거래 표준약관 구조 참고",
    title: "서비스 이용약관",
    sections: [
      {
        heading: "목적",
        body: [
          "이 약관은 NewsRoll이 제공하는 뉴스 탐색, 맞춤 추천, 댓글, 투표, 알림 등 서비스의 이용 조건과 절차를 정합니다.",
          "회원은 이 약관에 동의한 뒤 서비스를 이용할 수 있으며, 서비스 이용 과정에서 관련 법령과 운영 정책을 준수해야 합니다.",
        ],
      },
      {
        heading: "회원 계정 및 이용 제한",
        body: [
          "회원은 정확한 정보를 바탕으로 계정을 생성해야 하며, 계정과 비밀번호 관리 책임은 회원에게 있습니다.",
          "타인의 권리 침해, 서비스 운영 방해, 허위 정보 입력, 불법적 목적의 이용이 확인되면 서비스 이용이 제한될 수 있습니다.",
        ],
      },
      {
        heading: "서비스 변경",
        body: [
          "NewsRoll은 서비스 안정성, 운영상 필요, 법령 변경 등에 따라 기능의 일부를 변경하거나 중단할 수 있습니다.",
          "중요한 변경 사항은 서비스 화면 또는 공지사항을 통해 안내합니다.",
        ],
      },
    ],
  },
  privacy: {
    source: "개인정보 포털 개인정보 수집·이용 동의 양식 예시 참고",
    title: "개인정보 수집·이용 동의",
    sections: [
      {
        heading: "수집·이용 목적",
        body: [
          "회원 식별, 계정 생성, 로그인, 맞춤형 뉴스 추천, 관심 카테고리 설정, 알림 설정, 문의 응대 및 서비스 품질 개선을 위해 개인정보를 이용합니다.",
        ],
      },
      {
        heading: "수집 항목",
        body: [
          "필수 항목은 이메일, 비밀번호, 만 14세 이상 여부, 서비스 이용 기록입니다.",
          "선택 항목은 연령대, 관심 카테고리, 관심 언론사, 가리고 싶은 키워드, 뉴스 보기 시간, 알림 설정입니다.",
        ],
      },
      {
        heading: "보유·이용 기간 및 거부 권리",
        body: [
          "개인정보는 회원 탈퇴 또는 수집·이용 목적 달성 시까지 보유하며, 관계 법령에 따라 보관이 필요한 정보는 해당 기간 동안 보관합니다.",
          "개인정보 수집·이용 동의를 거부할 수 있으나, 필수 항목에 동의하지 않으면 회원가입과 맞춤형 서비스 이용이 제한될 수 있습니다.",
        ],
      },
    ],
  },
  marketing: {
    source: "KISA 불법스팸 방지를 위한 정보통신망법 안내서 참고",
    title: "광고성 정보 수신 동의",
    sections: [
      {
        heading: "수신 목적 및 내용",
        body: [
          "NewsRoll은 이벤트, 서비스 업데이트, 맞춤 혜택, 프로모션 안내 등 광고성 정보를 이메일 또는 카카오톡 등으로 전송할 수 있습니다.",
          "광고성 정보는 이용자의 명시적 동의가 있는 경우에만 전송하며, 서비스 이용에 필수적인 고지와는 구분됩니다.",
        ],
      },
      {
        heading: "동의 철회 및 확인",
        body: [
          "이용자는 언제든지 광고성 정보 수신 동의를 철회할 수 있으며, 철회 후에는 광고성 정보가 전송되지 않습니다.",
          "광고성 정보 수신 동의 사실은 관련 법령과 안내 기준에 따라 주기적으로 확인될 수 있습니다.",
        ],
      },
      {
        heading: "선택 동의 안내",
        body: [
          "광고성 정보 수신 동의는 선택 사항이며, 동의하지 않아도 회원가입과 기본 서비스 이용에는 제한이 없습니다.",
        ],
      },
    ],
  },
};

type SignupAgreementDetail = (typeof signupAgreementDetails)[SignupAgreementKey];

type SignupAgreementSearchTarget = {
  agreementId: SignupAgreementKey;
  query: string;
  targetKey: string;
};

type SignupAgreementSearchResult = SignupAgreementSearchTarget & {
  agreementTitle: string;
  label: string;
  snippet: string;
};

function normalizeAgreementSearchQuery(query: string) {
  return query.trim().toLocaleLowerCase("ko-KR");
}

function getAgreementSearchRootId(
  agreementId: SignupAgreementKey,
  targetKey: string,
) {
  return `signup-agreement-${agreementId}-${targetKey}`;
}

function getAgreementSearchSnippet(text: string, query: string) {
  const normalizedText = text.toLocaleLowerCase("ko-KR");
  const normalizedQuery = normalizeAgreementSearchQuery(query);
  const matchIndex = normalizedText.indexOf(normalizedQuery);

  if (matchIndex === -1) {
    return text;
  }

  const start = Math.max(0, matchIndex - 32);
  const end = Math.min(text.length, matchIndex + query.trim().length + 72);

  return `${start > 0 ? "..." : ""}${text.slice(start, end)}${
    end < text.length ? "..." : ""
  }`;
}

function createSignupAgreementSearchResults(
  query: string,
): SignupAgreementSearchResult[] {
  const normalizedQuery = normalizeAgreementSearchQuery(query);

  if (!normalizedQuery) {
    return [];
  }

  return signupAgreementItems.flatMap((item) => {
    const agreement = signupAgreementDetails[item.id];
    const fields: Array<{ label: string; targetKey: string; text: string }> = [
      {
        label: "제목",
        targetKey: "title",
        text: agreement.title,
      },
      ...agreement.sections.flatMap((section, sectionIndex) => [
        {
          label: section.heading,
          targetKey: `section-${sectionIndex}-heading`,
          text: section.heading,
        },
        ...section.body.map((paragraph, paragraphIndex) => ({
          label: section.heading,
          targetKey: `section-${sectionIndex}-paragraph-${paragraphIndex}`,
          text: paragraph,
        })),
      ]),
      {
        label: "참고 기준",
        targetKey: "source",
        text: agreement.source,
      },
    ];

    return fields
      .filter((field) =>
        field.text.toLocaleLowerCase("ko-KR").includes(normalizedQuery),
      )
      .map((field) => ({
        agreementId: item.id,
        agreementTitle: agreement.title,
        label: field.label,
        query: query.trim(),
        snippet: getAgreementSearchSnippet(field.text, query),
        targetKey: field.targetKey,
      }));
  });
}

function SignupAgreementDetailView({
  agreement,
  agreementId,
  isTextLarge,
  onBack,
  onOpenBreakingNews,
  onOpenSearch,
  searchTarget,
  onToggleTextSize,
}: {
  agreement: SignupAgreementDetail;
  agreementId: SignupAgreementKey;
  isTextLarge: boolean;
  onBack: () => void;
  onOpenBreakingNews: () => void;
  onOpenSearch: () => void;
  searchTarget?: SignupAgreementSearchTarget | null;
  onToggleTextSize: () => void;
}) {
  const highlightedQuery =
    searchTarget?.agreementId === agreementId ? searchTarget.query : "";

  useEffect(() => {
    if (!searchTarget || searchTarget.agreementId !== agreementId) {
      return;
    }

    window.requestAnimationFrame(() => {
      scrollSearchHighlightTargetIntoView(
        getSearchHighlightTargetId(
          getAgreementSearchRootId(agreementId, searchTarget.targetKey),
        ),
      );
    });
  }, [agreementId, searchTarget]);

  return (
    <NewsRollCommonLayout
      aria-label={agreement.title}
      className="newsroll_sheetFrame container_authAgreementScreen"
      dockedGap={pagePanelDockedGap}
      initialGap={pagePanelInitialGap}
      {...fixedDockedPanelProps}
      minInitialTop={pagePanelInitialTop}
      sheetClassName="newsroll_sheetFrameSheet container_homeSheet"
      sheetScrollSelector={pagePanelContentSelector}
      top={
        <NewsRollHeaderTop>
          <NewsToolbar
            isTextLarge={isTextLarge}
            onOpenNotifications={onOpenBreakingNews}
            onOpenSearch={onOpenSearch}
            showNotifications={false}
            onToggleTextSize={onToggleTextSize}
          />
          <NewsRollDockedControls
            className="newsroll_motion_dockedPop newsroll_allDockedControls newsroll_panelHeaderRow"
            isDetailOpen
          >
            <NewsRollDetailBackButton
              ariaLabel="회원가입 동의로 돌아가기"
              onClick={onBack}
            />
          </NewsRollDockedControls>
        </NewsRollHeaderTop>
      }
    >
      <NewsRollPagePanel ariaLabel={`${agreement.title} 본문 영역`}>
        <div className="wrapper_authAgreementDetail">
          <h1 className="text_loginTitle">
            <SearchHighlightText
              query={highlightedQuery}
              targetId={
                highlightedQuery
                  ? getSearchHighlightTargetId(
                      getAgreementSearchRootId(agreementId, "title"),
                    )
                  : undefined
              }
            >
              {agreement.title}
            </SearchHighlightText>
          </h1>

          <div className="wrapper_authAgreementArticle">
            {agreement.sections.map((section, sectionIndex) => (
              <section className="wrapper_authAgreementSection" key={section.heading}>
                <h2>
                  <SearchHighlightText
                    query={highlightedQuery}
                    targetId={
                      highlightedQuery
                        ? getSearchHighlightTargetId(
                            getAgreementSearchRootId(
                              agreementId,
                              `section-${sectionIndex}-heading`,
                            ),
                          )
                        : undefined
                    }
                  >
                    {section.heading}
                  </SearchHighlightText>
                </h2>
                {section.body.map((paragraph, paragraphIndex) => (
                  <p key={paragraph}>
                    <SearchHighlightText
                      query={highlightedQuery}
                      targetId={
                        highlightedQuery
                          ? getSearchHighlightTargetId(
                              getAgreementSearchRootId(
                                agreementId,
                                `section-${sectionIndex}-paragraph-${paragraphIndex}`,
                              ),
                            )
                          : undefined
                      }
                    >
                      {paragraph}
                    </SearchHighlightText>
                  </p>
                ))}
              </section>
            ))}
            <p className="text_authAgreementSource">
              참고 기준:{" "}
              <SearchHighlightText
                query={highlightedQuery}
                targetId={
                  highlightedQuery
                    ? getSearchHighlightTargetId(
                        getAgreementSearchRootId(agreementId, "source"),
                      )
                    : undefined
                }
              >
                {agreement.source}
              </SearchHighlightText>
            </p>
          </div>
        </div>
      </NewsRollPagePanel>
    </NewsRollCommonLayout>
  );
}

function SignupAgreementSearchView({
  onBack,
  onSelectResult,
}: {
  onBack: () => void;
  onSelectResult: (result: SignupAgreementSearchResult) => void;
}) {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const trimmedQuery = query.trim();
  const searchResults = useMemo(
    () => createSignupAgreementSearchResults(query),
    [query],
  );

  useEffect(() => {
    window.requestAnimationFrame(() => {
      inputRef.current?.focus();
    });
  }, []);

  return (
    <section className="newsroll_search_page" aria-label="동의 문구 통합검색">
      <div className="newsroll_toolbar newsroll_search_top" aria-label="검색 도구">
        <IconButton
          className="newsroll_toolbar_icon newsroll_search_close"
          icon="close"
          label="동의 본문으로 돌아가기"
          onClick={onBack}
        />
      </div>

      <div className="wrapper_searchContent">
        <form
          className="form_searchComposer newsroll_motion_enterUp"
          onSubmit={(event) => event.preventDefault()}
        >
          <TextInput
            aria-label="동의 문구 검색"
            mode="dark"
            name="agreement-search"
            onChange={(event) => setQuery(event.currentTarget.value)}
            placeholder="검색 키워드를 입력해주세요"
            ref={inputRef}
            rightSlot={<Icon name="search" />}
            type="search"
            value={query}
          />
        </form>

        {trimmedQuery ? (
          searchResults.length > 0 ? (
            <div className="list_searchResults" aria-label="동의 문구 검색 결과">
              {searchResults.map((result, index) => (
                <SearchResultButton
                  key={`${result.agreementId}-${result.targetKey}-${index}`}
                  onClick={() => onSelectResult(result)}
                  meta={result.label}
                  snippet={
                    <SearchHighlightText query={trimmedQuery}>
                      {result.snippet}
                    </SearchHighlightText>
                  }
                  title={result.agreementTitle}
                />
              ))}
            </div>
          ) : (
            <p className="text_searchStatus">검색 결과가 없습니다.</p>
          )
        ) : null}
      </div>
    </section>
  );
}

export function SignupAgreementView({
  isTextLarge,
  onBack,
  onNext,
  onOpenBreakingNews,
  onToggleTextSize,
}: {
  isTextLarge: boolean;
  onBack: () => void;
  onNext: (agreements: Record<SignupAgreementKey, boolean>) => void;
  onOpenBreakingNews: () => void;
  onToggleTextSize: () => void;
}) {
  const [agreements, setAgreements] = useState<Record<SignupAgreementKey, boolean>>({
    age: false,
    marketing: false,
    privacy: false,
    terms: false,
  });
  const [detailAgreementId, setDetailAgreementId] = useState<SignupAgreementKey | null>(
    null,
  );
  const [isAgreementSearchOpen, setIsAgreementSearchOpen] = useState(false);
  const [agreementSearchTarget, setAgreementSearchTarget] =
    useState<SignupAgreementSearchTarget | null>(null);
  const requiredAgreements = signupAgreementItems.filter((item) => item.required);
  const isAllChecked = signupAgreementItems.every((item) => agreements[item.id]);
  const isAllRequiredChecked = requiredAgreements.every((item) => agreements[item.id]);

  function toggleAgreement(id: SignupAgreementKey) {
    setAgreements((current) => ({
      ...current,
      [id]: !current[id],
    }));
  }

  function toggleAllAgreements() {
    const nextChecked = !isAllChecked;

    setAgreements({
      age: nextChecked,
      marketing: nextChecked,
      privacy: nextChecked,
      terms: nextChecked,
    });
  }

  if (isAgreementSearchOpen) {
    return (
      <SignupAgreementSearchView
        onBack={() => setIsAgreementSearchOpen(false)}
        onSelectResult={(result) => {
          setDetailAgreementId(result.agreementId);
          setAgreementSearchTarget(result);
          setIsAgreementSearchOpen(false);
        }}
      />
    );
  }

  if (detailAgreementId) {
    return (
      <SignupAgreementDetailView
        agreement={signupAgreementDetails[detailAgreementId]}
        agreementId={detailAgreementId}
        isTextLarge={isTextLarge}
        onBack={() => {
          setDetailAgreementId(null);
          setAgreementSearchTarget(null);
        }}
        onOpenBreakingNews={onOpenBreakingNews}
        onOpenSearch={() => setIsAgreementSearchOpen(true)}
        searchTarget={agreementSearchTarget}
        onToggleTextSize={onToggleTextSize}
      />
    );
  }

  return (
    <AuthLayout ariaLabel="회원가입 동의">
      <div className="wrapper_loginContent wrapper_signupAgreementContent">
        <AuthBackButton onClick={onBack} />
        <h1 className="text_loginTitle">회원가입 동의</h1>

        <div className="wrapper_signupAgreementBody">
          <div className="wrapper_signupAgreementList">
            {signupAgreementItems.map((item) => (
              <ChevronRowButton
                checked={agreements[item.id]}
                chevronLabel={`${item.title} 상세 보기`}
                inputProps={{ required: item.required }}
                key={item.id}
                name="signupAgreements"
                onChange={() => toggleAgreement(item.id)}
                onChevronClick={() => {
                  setAgreementSearchTarget(null);
                  setDetailAgreementId(item.id);
                }}
                rowType="checkbox"
                value={item.id}
              >
                {`(${item.required ? "필수" : "선택"}) ${item.title}`}
              </ChevronRowButton>
            ))}

            <Divider className="divider_signupAgreementAll" />

            <div className="wrapper_signupAgreementAll">
              <CheckInput
                checked={isAllChecked}
                role="agreementAll"
                size="lg"
                label="전체 동의"
                onChange={toggleAllAgreements}
              />
            </div>
          </div>

          <PrimaryButtonGroup>
        <PrimaryButton
            className="btn_signupAgreementNext"
            disabled={!isAllRequiredChecked}
            onClick={() => onNext(agreements)}



          >
            다음
          </PrimaryButton>
      </PrimaryButtonGroup>
        </div>
      </div>
    </AuthLayout>
  );
}

export function SignupEmailView({
  onBack,
  onCheckEmail,
  onNext,
}: {
  onBack: () => void;
  onCheckEmail: (email: string) => Promise<boolean>;
  onNext: (email: string) => void;
}) {
  const verificationTimerRef = useRef<number | null>(null);
  const [email, setEmail] = useState("");
  const [isEmailChecked, setIsEmailChecked] = useState(false);
  const [isEmailChecking, setIsEmailChecking] = useState(false);
  const [emailCheckMessage, setEmailCheckMessage] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [isVerificationConfirmed, setIsVerificationConfirmed] = useState(false);
  const [isVerificationSent, setIsVerificationSent] = useState(false);
  const [remainingVerificationSeconds, setRemainingVerificationSeconds] = useState(0);
  const emailValidation = useZodFieldValidation(authEmailSchema, email);
  const verificationCodeValidation = useZodFieldValidation(
    verificationCodeSchema,
    verificationCode,
  );
  const isEmailReady =
    emailValidation.isValid && isEmailChecked && isVerificationConfirmed;
  const signupEmailErrorId = "signup-email-error";
  const signupEmailCheckId = "signup-email-check";
  const signupVerificationCodeErrorId = "signup-verification-code-error";
  const formattedVerificationTime = `${Math.floor(
    remainingVerificationSeconds / 60,
  )}:${String(remainingVerificationSeconds % 60).padStart(2, "0")}`;

  function resetVerificationCode() {
    if (verificationTimerRef.current !== null) {
      window.clearTimeout(verificationTimerRef.current);
      verificationTimerRef.current = null;
    }

    setIsVerificationSent(false);
    setIsVerificationConfirmed(false);
    setRemainingVerificationSeconds(0);
  }

  async function startVerificationCode() {
    const isAvailable = await checkEmailDuplicate();

    if (!isAvailable) {
      return;
    }

    if (verificationTimerRef.current !== null) {
      window.clearTimeout(verificationTimerRef.current);
    }

    setVerificationCode("");
    setIsVerificationConfirmed(false);
    setIsVerificationSent(true);
    setRemainingVerificationSeconds(180);
  }

  async function checkEmailDuplicate() {
    emailValidation.markTouched();

    if (!emailValidation.isValid) {
      setIsEmailChecked(false);
      setEmailCheckMessage("");
      resetVerificationCode();
      return false;
    }

    setIsEmailChecking(true);

    let isAvailable = false;

    try {
      isAvailable = await onCheckEmail(email.trim());
    } catch {
      isAvailable = false;
    } finally {
      setIsEmailChecking(false);
    }

    setIsEmailChecked(isAvailable);
    setEmailCheckMessage(
      !isAvailable
        ? "이미 가입된 이메일이에요."
        : "사용 가능한 이메일이에요.",
    );

    if (!isAvailable) {
      resetVerificationCode();
    }

    return isAvailable;
  }

  function updateEmail(value: string) {
    setEmail(value);
    setIsEmailChecked(false);
    setEmailCheckMessage("");
    resetVerificationCode();
  }

  function confirmVerificationCode() {
    verificationCodeValidation.markTouched();

    if (verificationCodeValidation.isValid) {
      setIsVerificationConfirmed(true);
    }
  }

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

  useEffect(() => {
    if (isVerificationSent && remainingVerificationSeconds === 0) {
      resetVerificationCode();
    }
  }, [isVerificationSent, remainingVerificationSeconds]);

  useEffect(
    () => () => {
      if (verificationTimerRef.current !== null) {
        window.clearTimeout(verificationTimerRef.current);
      }
    },
    [],
  );

  return (
    <AuthLayout ariaLabel="회원가입 이메일 인증">
      <div className="wrapper_signupStepContent">
        <AuthBackButton onClick={onBack} />
        <h1 className="text_loginTitle">이메일 인증</h1>

        <form
          className="form_signupStep"
          onSubmit={(event) => {
            event.preventDefault();
            if (isEmailReady) {
              onNext(email.trim());
            }
          }}
        >
          <div className="wrapper_loginInputs">
            <div className="wrapper_authField wrapper_fieldStack">
              <div className="wrapper_signupEmailField">
                <TextInput mode="dark"
                  aria-describedby={[
                    emailValidation.errorMessage ? signupEmailErrorId : "",
                    emailCheckMessage ? signupEmailCheckId : "",
                  ]
                    .filter(Boolean)
                    .join(" ") || undefined}
                  aria-invalid={Boolean(emailValidation.errorMessage)}
                  aria-label="회원가입 이메일 입력"
                  autoComplete="email"
                  autoCapitalize="none"
                  autoCorrect="off"
                  onBlur={emailValidation.markTouched}
                  onChange={(event) => updateEmail(event.currentTarget.value)}
                  placeholder="이메일"
                  spellCheck={false}
                  state={emailValidation.errorMessage ? "error" : "default"}
                  type="email"
                  value={email}
                />
                <SignupFieldActionButton
                  disabled={
                    !emailValidation.isValid ||
                    isEmailChecking ||
                    isVerificationSent ||
                    isVerificationConfirmed
                  }
                  onClick={startVerificationCode}
                >
                  인증번호 발송
                </SignupFieldActionButton>
              </div>
              <AuthValidationError
                id={signupEmailErrorId}
                message={emailValidation.errorMessage}
              />
              {emailCheckMessage ? (
                <p
                  className="text_authValidation"
                  data-state={isEmailChecked ? "success" : "error"}
                  id={signupEmailCheckId}
                >
                  {emailCheckMessage}
                </p>
              ) : null}
            </div>
            {isVerificationSent ? (
              <div className="wrapper_authField wrapper_fieldStack">
                <div className="wrapper_signupVerificationCode">
                  <div className="wrapper_signupVerificationCodeInput">
                    <TextInput mode="dark"
                      aria-describedby={
                        verificationCodeValidation.errorMessage
                          ? signupVerificationCodeErrorId
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
                      state={
                        verificationCodeValidation.errorMessage ? "error" : "default"
                      }
                      type="text"
                      value={verificationCode}
                    />
                    <span className="text_signupVerificationTimer">
                      {formattedVerificationTime}
                    </span>
                  </div>
                  <SignupFieldActionButton
                    disabled={isVerificationConfirmed}
                    onClick={confirmVerificationCode}
                  >
                    인증하기
                  </SignupFieldActionButton>
                </div>
                <AuthValidationError
                  id={signupVerificationCodeErrorId}
                  message={verificationCodeValidation.errorMessage}
                />
                {isVerificationConfirmed ? (
                  <p className="text_authValidation" data-state="success">
                    인증이 완료되었습니다.
                  </p>
                ) : null}
              </div>
            ) : null}
          </div>

          <PrimaryButtonGroup>
        <PrimaryButton
            className="btn_signupStepNext"
            disabled={!isEmailReady}


            type="submit"

          >
            다음
          </PrimaryButton>
      </PrimaryButtonGroup>
        </form>
      </div>
    </AuthLayout>
  );
}

const reservedSignupNicknames = ["콩콩이", "홍길동", "관리자", "뉴스롤"];

export function PasswordResetEmailView({
  onBack,
  onCheckEmail,
  onNext,
}: {
  onBack: () => void;
  onCheckEmail: (email: string) => Promise<boolean>;
  onNext: (email: string) => void;
}) {
  const verificationTimerRef = useRef<number | null>(null);
  const [email, setEmail] = useState("");
  const [isEmailChecked, setIsEmailChecked] = useState(false);
  const [isEmailChecking, setIsEmailChecking] = useState(false);
  const [emailCheckMessage, setEmailCheckMessage] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [isVerificationConfirmed, setIsVerificationConfirmed] = useState(false);
  const [isVerificationSent, setIsVerificationSent] = useState(false);
  const [remainingVerificationSeconds, setRemainingVerificationSeconds] = useState(0);
  const emailValidation = useZodFieldValidation(authEmailSchema, email);
  const verificationCodeValidation = useZodFieldValidation(
    verificationCodeSchema,
    verificationCode,
  );
  const isEmailReady =
    emailValidation.isValid && isEmailChecked && isVerificationConfirmed;
  const passwordResetEmailErrorId = "password-reset-email-error";
  const passwordResetEmailCheckId = "password-reset-email-check";
  const passwordResetVerificationCodeErrorId =
    "password-reset-verification-code-error";
  const formattedVerificationTime = `${Math.floor(
    remainingVerificationSeconds / 60,
  )}:${String(remainingVerificationSeconds % 60).padStart(2, "0")}`;

  function resetVerificationCode() {
    if (verificationTimerRef.current !== null) {
      window.clearTimeout(verificationTimerRef.current);
      verificationTimerRef.current = null;
    }

    setIsVerificationSent(false);
    setIsVerificationConfirmed(false);
    setRemainingVerificationSeconds(0);
  }

  async function startVerificationCode() {
    emailValidation.markTouched();

    if (!emailValidation.isValid) {
      setIsEmailChecked(false);
      setEmailCheckMessage("");
      resetVerificationCode();
      return;
    }

    setIsEmailChecking(true);

    let isRegistered = false;

    try {
      isRegistered = await onCheckEmail(email.trim());
    } catch {
      isRegistered = false;
    } finally {
      setIsEmailChecking(false);
    }

    setIsEmailChecked(isRegistered);
    setEmailCheckMessage(
      isRegistered
        ? "인증번호를 발송했습니다."
        : "가입된 이메일을 찾을 수 없습니다.",
    );

    if (!isRegistered) {
      resetVerificationCode();
      return;
    }

    if (verificationTimerRef.current !== null) {
      window.clearTimeout(verificationTimerRef.current);
    }

    setVerificationCode("");
    setIsVerificationConfirmed(false);
    setIsVerificationSent(true);
    setRemainingVerificationSeconds(180);
  }

  function updateEmail(value: string) {
    setEmail(value);
    setIsEmailChecked(false);
    setEmailCheckMessage("");
    resetVerificationCode();
  }

  function confirmVerificationCode() {
    verificationCodeValidation.markTouched();

    if (verificationCodeValidation.isValid) {
      setIsVerificationConfirmed(true);
    }
  }

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

  useEffect(() => {
    if (isVerificationSent && remainingVerificationSeconds === 0) {
      resetVerificationCode();
    }
  }, [isVerificationSent, remainingVerificationSeconds]);

  useEffect(
    () => () => {
      if (verificationTimerRef.current !== null) {
        window.clearTimeout(verificationTimerRef.current);
      }
    },
    [],
  );

  return (
    <AuthLayout ariaLabel="비밀번호 재설정 이메일 인증">
      <div className="wrapper_signupStepContent">
        <AuthBackButton onClick={onBack} />
        <h1 className="text_loginTitle">비밀번호 재설정</h1>

        <form
          className="form_signupStep"
          onSubmit={(event) => {
            event.preventDefault();

            if (isEmailReady) {
              onNext(email.trim());
            }
          }}
        >
          <div className="wrapper_loginInputs">
            <div className="wrapper_authField wrapper_fieldStack">
              <div className="wrapper_signupEmailField">
                <TextInput mode="dark"
                  aria-describedby={[
                    emailValidation.errorMessage ? passwordResetEmailErrorId : "",
                    emailCheckMessage ? passwordResetEmailCheckId : "",
                  ]
                    .filter(Boolean)
                    .join(" ") || undefined}
                  aria-invalid={Boolean(emailValidation.errorMessage)}
                  aria-label="비밀번호 재설정 이메일 입력"
                  autoComplete="email"
                  autoCapitalize="none"
                  autoCorrect="off"
                  onBlur={emailValidation.markTouched}
                  onChange={(event) => updateEmail(event.currentTarget.value)}
                  placeholder="이메일"
                  spellCheck={false}
                  state={emailValidation.errorMessage ? "error" : "default"}
                  type="email"
                  value={email}
                />
                <SignupFieldActionButton
                  disabled={
                    !emailValidation.isValid ||
                    isEmailChecking ||
                    isVerificationSent ||
                    isVerificationConfirmed
                  }
                  onClick={startVerificationCode}
                >
                  인증번호 발송
                </SignupFieldActionButton>
              </div>
              <AuthValidationError
                id={passwordResetEmailErrorId}
                message={emailValidation.errorMessage}
              />
              {emailCheckMessage ? (
                <p
                  className="text_authValidation"
                  data-state={isEmailChecked ? "success" : "error"}
                  id={passwordResetEmailCheckId}
                >
                  {emailCheckMessage}
                </p>
              ) : null}
            </div>
            {isVerificationSent ? (
              <div className="wrapper_authField wrapper_fieldStack">
                <div className="wrapper_signupVerificationCode">
                  <div className="wrapper_signupVerificationCodeInput">
                    <TextInput mode="dark"
                      aria-describedby={
                        verificationCodeValidation.errorMessage
                          ? passwordResetVerificationCodeErrorId
                          : undefined
                      }
                      aria-invalid={Boolean(verificationCodeValidation.errorMessage)}
                      aria-label="비밀번호 재설정 인증번호 6자리 입력"
                      inputMode="numeric"
                      maxLength={6}
                      onBlur={verificationCodeValidation.markTouched}
                      onChange={(event) => {
                        setVerificationCode(event.currentTarget.value);
                        setIsVerificationConfirmed(false);
                      }}
                      placeholder="인증번호 6자리"
                      state={
                        verificationCodeValidation.errorMessage ? "error" : "default"
                      }
                      type="text"
                      value={verificationCode}
                    />
                    <span className="text_signupVerificationTimer">
                      {formattedVerificationTime}
                    </span>
                  </div>
                  <SignupFieldActionButton
                    disabled={isVerificationConfirmed}
                    onClick={confirmVerificationCode}
                  >
                    인증하기
                  </SignupFieldActionButton>
                </div>
                <AuthValidationError
                  id={passwordResetVerificationCodeErrorId}
                  message={verificationCodeValidation.errorMessage}
                />
                {isVerificationConfirmed ? (
                  <p className="text_authValidation" data-state="success">
                    인증이 완료되었습니다.
                  </p>
                ) : null}
              </div>
            ) : null}
          </div>

          <PrimaryButtonGroup>
        <PrimaryButton
            className="btn_signupStepNext"
            disabled={!isEmailReady}
            type="submit"
          >
            다음
          </PrimaryButton>
      </PrimaryButtonGroup>
        </form>
      </div>
    </AuthLayout>
  );
}

export function PasswordResetPasswordView({
  onBack,
  onSubmit,
  submitError,
}: {
  onBack: () => void;
  onSubmit: (input: { nextPassword: string }) => Promise<void>;
  submitError?: string;
}) {
  const [nextPassword, setNextPassword] = useState("");
  const [nextPasswordConfirm, setNextPasswordConfirm] = useState("");
  const [isNextPasswordVisible, setIsNextPasswordVisible] = useState(false);
  const [isNextPasswordConfirmVisible, setIsNextPasswordConfirmVisible] =
    useState(false);
  const nextPasswordConfirmSchema = useMemo(
    () => createSignupPasswordConfirmSchema(nextPassword),
    [nextPassword],
  );
  const nextPasswordValidation = useZodFieldValidation(
    signupPasswordSchema,
    nextPassword,
  );
  const nextPasswordConfirmValidation = useZodFieldValidation(
    nextPasswordConfirmSchema,
    nextPasswordConfirm,
  );
  const isPasswordResetReady =
    nextPasswordValidation.isValid &&
    nextPasswordConfirmValidation.isValid;
  const nextPasswordErrorId = "password-reset-next-password-error";
  const nextPasswordConfirmErrorId = "password-reset-next-password-confirm-error";

  return (
    <AuthLayout ariaLabel="새 비밀번호 설정">
      <div className="wrapper_signupStepContent">
        <AuthBackButton onClick={onBack} />
        <h1 className="text_loginTitle">새 비밀번호 설정</h1>

        <form
          className="form_signupStep"
          onSubmit={(event) => {
            event.preventDefault();

            if (isPasswordResetReady) {
              onSubmit({
                nextPassword,
              });
            }
          }}
        >
          <div className="wrapper_loginInputs">
            <div className="wrapper_authField wrapper_fieldStack">
              <div className="wrapper_loginPasswordField">
                <TextInput mode="dark"
                  aria-describedby={
                    nextPasswordValidation.errorMessage ? nextPasswordErrorId : undefined
                  }
                  aria-invalid={Boolean(nextPasswordValidation.errorMessage)}
                  aria-label="새 비밀번호 입력"
                  autoComplete="new-password"
                  onBlur={nextPasswordValidation.markTouched}
                  onChange={(event) => setNextPassword(event.currentTarget.value)}
                  placeholder="새 비밀번호 입력"
                  state={nextPasswordValidation.errorMessage ? "error" : "default"}
                  type={isNextPasswordVisible ? "text" : "password"}
                  value={nextPassword}
                  hasEndAction
                />
                <IconButton
                  aria-pressed={isNextPasswordVisible}
                  className="btn_loginPasswordToggle"
                  icon="eye"
                  iconSize={12}
                  label={
                    isNextPasswordVisible ? "새 비밀번호 숨기기" : "새 비밀번호 보기"
                  }
                  onClick={() => setIsNextPasswordVisible((current) => !current)}
                />
              </div>
              <AuthValidationError
                id={nextPasswordErrorId}
                message={nextPasswordValidation.errorMessage}
              />
            </div>
            <div className="wrapper_authField wrapper_fieldStack">
              <div className="wrapper_loginPasswordField">
                <TextInput mode="dark"
                  aria-describedby={
                    nextPasswordConfirmValidation.errorMessage
                      ? nextPasswordConfirmErrorId
                      : undefined
                  }
                  aria-invalid={Boolean(nextPasswordConfirmValidation.errorMessage)}
                  aria-label="새 비밀번호 다시 입력"
                  autoComplete="new-password"
                  onBlur={nextPasswordConfirmValidation.markTouched}
                  onChange={(event) =>
                    setNextPasswordConfirm(event.currentTarget.value)
                  }
                  placeholder="새 비밀번호 다시 입력하기"
                  state={
                    nextPasswordConfirmValidation.errorMessage ? "error" : "default"
                  }
                  type={isNextPasswordConfirmVisible ? "text" : "password"}
                  value={nextPasswordConfirm}
                  hasEndAction
                />
                <IconButton
                  aria-pressed={isNextPasswordConfirmVisible}
                  className="btn_loginPasswordToggle"
                  icon="eye"
                  iconSize={12}
                  label={
                    isNextPasswordConfirmVisible
                      ? "새 비밀번호 확인 숨기기"
                      : "새 비밀번호 확인 보기"
                  }
                  onClick={() =>
                    setIsNextPasswordConfirmVisible((current) => !current)
                  }
                />
              </div>
              <AuthValidationError
                id={nextPasswordConfirmErrorId}
                message={nextPasswordConfirmValidation.errorMessage}
              />
            </div>
          </div>

          <PrimaryButtonGroup>
        <PrimaryButton
            className="btn_signupStepNext"
            disabled={!isPasswordResetReady}
            type="submit"
          >
            비밀번호 재설정
          </PrimaryButton>
      </PrimaryButtonGroup>
          <AuthValidationError id="password-reset-submit-error" message={submitError} />
        </form>
      </div>
    </AuthLayout>
  );
}

export function SignupNicknameView({
  onBack,
  onCheckNickname,
  onNext,
}: {
  onBack: () => void;
  onCheckNickname: (nickname: string) => Promise<boolean>;
  onNext: (nickname: string) => void;
}) {
  const [nickname, setNickname] = useState("");
  const [isNicknameChecked, setIsNicknameChecked] = useState(false);
  const [isNicknameChecking, setIsNicknameChecking] = useState(false);
  const [nicknameCheckMessage, setNicknameCheckMessage] = useState("");
  const nicknameValidation = useZodFieldValidation(signupNicknameSchema, nickname);
  const isNicknameReady = nicknameValidation.isValid && isNicknameChecked;
  const hasNicknameCheckError = Boolean(nicknameCheckMessage && !isNicknameChecked);
  const signupNicknameErrorId = "signup-nickname-error";
  const signupNicknameCheckId = "signup-nickname-check";

  async function checkNicknameDuplicate() {
    nicknameValidation.markTouched();

    if (!nicknameValidation.isValid) {
      setIsNicknameChecked(false);
      setNicknameCheckMessage("");
      return;
    }

    const normalizedNickname = nickname.trim().toLocaleLowerCase("ko-KR");
    const isDuplicated = reservedSignupNicknames.some(
      (item) => item.toLocaleLowerCase("ko-KR") === normalizedNickname,
    );
    setIsNicknameChecking(true);

    let isAvailable = false;

    try {
      isAvailable = isDuplicated ? false : await onCheckNickname(nickname.trim());
    } catch {
      isAvailable = false;
    }

    setIsNicknameChecking(false);
    setIsNicknameChecked(isAvailable);
    setNicknameCheckMessage(
      !isAvailable
        ? "중복되는 닉네임입니다."
        : "사용 가능한 닉네임입니다.",
    );
  }

  function updateNickname(value: string) {
    setNickname(value);
    setIsNicknameChecked(false);
    setNicknameCheckMessage("");
  }

  return (
    <AuthLayout ariaLabel="회원가입 닉네임 설정">
      <div className="wrapper_signupStepContent">
        <AuthBackButton onClick={onBack} />
        <h1 className="text_loginTitle">닉네임 설정</h1>

        <form
          className="form_signupStep"
          onSubmit={(event) => {
            event.preventDefault();
            if (isNicknameReady) {
              onNext(nickname.trim());
            }
          }}
        >
          <div className="wrapper_loginInputs">
            <div className="wrapper_authField wrapper_fieldStack">
              <div className="wrapper_signupEmailField">
                <TextInput mode="dark"
                  aria-describedby={[
                    nicknameValidation.errorMessage ? signupNicknameErrorId : "",
                    nicknameCheckMessage ? signupNicknameCheckId : "",
                  ]
                    .filter(Boolean)
                    .join(" ") || undefined}
                  aria-invalid={Boolean(
                    nicknameValidation.errorMessage || hasNicknameCheckError,
                  )}
                  aria-label="회원가입 닉네임 입력"
                  autoComplete="nickname"
                  maxLength={12}
                  onBlur={nicknameValidation.markTouched}
                  onChange={(event) => updateNickname(event.currentTarget.value)}
                  placeholder="닉네임"
                  state={
                    nicknameValidation.errorMessage || hasNicknameCheckError
                      ? "error"
                      : "default"
                  }
                  type="text"
                  value={nickname}
                />
                <SignupFieldActionButton
                  disabled={
                    !nicknameValidation.isValid ||
                    isNicknameChecking ||
                    isNicknameChecked
                  }
                  onClick={checkNicknameDuplicate}
                >
                  중복확인
                </SignupFieldActionButton>
              </div>
              <AuthValidationError
                id={signupNicknameErrorId}
                message={nicknameValidation.errorMessage}
              />
              {nicknameCheckMessage ? (
                <p
                  className="text_authValidation"
                  data-state={isNicknameChecked ? "success" : "error"}
                  id={signupNicknameCheckId}
                >
                  {nicknameCheckMessage}
                </p>
              ) : null}
            </div>
          </div>

          <PrimaryButtonGroup>
        <PrimaryButton
            className="btn_signupStepNext"
            disabled={!isNicknameReady}


            type="submit"

          >
            다음
          </PrimaryButton>
      </PrimaryButtonGroup>
        </form>
      </div>
    </AuthLayout>
  );
}

export function SignupPasswordView({
  onBack,
  onNext,
}: {
  onBack: () => void;
  onNext: (password: string) => void;
}) {
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isPasswordConfirmVisible, setIsPasswordConfirmVisible] = useState(false);
  const passwordConfirmSchema = useMemo(
    () => createSignupPasswordConfirmSchema(password),
    [password],
  );
  const passwordValidation = useZodFieldValidation(signupPasswordSchema, password);
  const passwordConfirmValidation = useZodFieldValidation(
    passwordConfirmSchema,
    passwordConfirm,
  );
  const isPasswordReady =
    passwordValidation.isValid && passwordConfirmValidation.isValid;
  const signupPasswordErrorId = "signup-password-error";
  const signupPasswordConfirmErrorId = "signup-password-confirm-error";

  return (
    <AuthLayout ariaLabel="회원가입 비밀번호 설정">
      <div className="wrapper_signupStepContent">
        <AuthBackButton onClick={onBack} />
        <h1 className="text_loginTitle">비밀번호 설정</h1>

        <form
          className="form_signupStep"
          onSubmit={(event) => {
            event.preventDefault();
            if (isPasswordReady) {
              onNext(password);
            }
          }}
        >
          <div className="wrapper_loginInputs">
            <div className="wrapper_authField wrapper_fieldStack">
              <div className="wrapper_loginPasswordField">
                <TextInput mode="dark"
                  aria-describedby={
                    passwordValidation.errorMessage ? signupPasswordErrorId : undefined
                  }
                  aria-invalid={Boolean(passwordValidation.errorMessage)}
                  aria-label="회원가입 비밀번호 입력"
                  autoComplete="new-password"
                  onBlur={passwordValidation.markTouched}
                  onChange={(event) => setPassword(event.currentTarget.value)}
                  placeholder="비밀번호"
                  state={passwordValidation.errorMessage ? "error" : "default"}
                  type={isPasswordVisible ? "text" : "password"}
                  value={password}
                  hasEndAction
                />
                <IconButton
                  aria-pressed={isPasswordVisible}
                  className="btn_loginPasswordToggle"
                  icon="eye"
                  iconSize={12}
                  label={isPasswordVisible ? "비밀번호 숨기기" : "비밀번호 보기"}
                  onClick={() => setIsPasswordVisible((current) => !current)}
                />
              </div>
              <AuthValidationError
                id={signupPasswordErrorId}
                message={passwordValidation.errorMessage}
              />
            </div>
            <div className="wrapper_authField wrapper_fieldStack">
              <div className="wrapper_loginPasswordField">
                <TextInput mode="dark"
                  aria-describedby={
                    passwordConfirmValidation.errorMessage
                      ? signupPasswordConfirmErrorId
                      : undefined
                  }
                  aria-invalid={Boolean(passwordConfirmValidation.errorMessage)}
                  aria-label="회원가입 비밀번호 확인 입력"
                  autoComplete="new-password"
                  onBlur={passwordConfirmValidation.markTouched}
                  onChange={(event) => setPasswordConfirm(event.currentTarget.value)}
                  placeholder="비밀번호 확인"
                  state={passwordConfirmValidation.errorMessage ? "error" : "default"}
                  type={isPasswordConfirmVisible ? "text" : "password"}
                  value={passwordConfirm}
                  hasEndAction
                />
                <IconButton
                  aria-pressed={isPasswordConfirmVisible}
                  className="btn_loginPasswordToggle"
                  icon="eye"
                  iconSize={12}
                  label={
                    isPasswordConfirmVisible
                      ? "비밀번호 확인 숨기기"
                      : "비밀번호 확인 보기"
                  }
                  onClick={() => setIsPasswordConfirmVisible((current) => !current)}
                />
              </div>
              <AuthValidationError
                id={signupPasswordConfirmErrorId}
                message={passwordConfirmValidation.errorMessage}
              />
            </div>
          </div>

          <PrimaryButtonGroup>
        <PrimaryButton
            className="btn_signupStepNext"
            disabled={!isPasswordReady}


            type="submit"

          >
            다음
          </PrimaryButton>
      </PrimaryButtonGroup>
        </form>
      </div>
    </AuthLayout>
  );
}

type SignupAgeId = "teens" | "twenties" | "thirties" | "forties" | "fifties" | "sixties";
type SignupCategoryId =
  | "politics"
  | "economy"
  | "society"
  | "culture"
  | "world"
  | "local"
  | "sports"
  | "science";

const signupAgeItems: Array<{ id: SignupAgeId; label: string }> = [
  { id: "teens", label: "10대" },
  { id: "twenties", label: "20대" },
  { id: "thirties", label: "30대" },
  { id: "forties", label: "40대" },
  { id: "fifties", label: "50대" },
  { id: "sixties", label: "60대 이상" },
];

const signupCategoryItems: Array<{ id: SignupCategoryId; label: string }> = [
  { id: "politics", label: "정치" },
  { id: "economy", label: "경제" },
  { id: "society", label: "사회" },
  { id: "culture", label: "문화" },
  { id: "world", label: "국제" },
  { id: "local", label: "지역" },
  { id: "sports", label: "스포츠" },
  { id: "science", label: "IT과학" },
];
const defaultSignupCategoryIds = signupCategoryItems.map((item) => item.id);

export function SignupAgeView({
  onBack,
  onNext,
}: {
  onBack: () => void;
  onNext: (ageId: SignupAgeId) => void;
}) {
  const [selectedAge, setSelectedAge] = useState<SignupAgeId | null>(null);

  return (
    <AuthLayout ariaLabel="나의 연령대 선택">
      <div className="wrapper_signupStepContent">
        <AuthBackButton onClick={onBack} />
        <h1 className="text_loginTitle">나의 연령대 선택</h1>

        <form
          className="form_signupStep"
          onSubmit={(event) => {
            event.preventDefault();
            if (selectedAge) {
              onNext(selectedAge);
            }
          }}
        >
          <PillTabMenu
            ariaLabel="나의 연령대 선택"
            className="wrapper_authTabMenu wrapper_tabScroller"
            getItemState={(id) => (selectedAge === id ? "active" : "default")}
            items={signupAgeItems}
            onChange={setSelectedAge}
            role="group"
            value={selectedAge ?? signupAgeItems[0].id}
          />

          <PrimaryButtonGroup>
        <PrimaryButton
            className="btn_signupStepNext"
            disabled={!selectedAge}


            type="submit"

          >
            다음
          </PrimaryButton>
      </PrimaryButtonGroup>
        </form>
      </div>
    </AuthLayout>
  );
}

export function SignupCategoryView({
  isSubmitting = false,
  onBack,
  submitError,
  onNext,
}: {
  isSubmitting?: boolean;
  onBack: () => void;
  submitError?: string;
  onNext: (categoryIds: SignupCategoryId[]) => Promise<void> | void;
}) {
  const [selectedCategories, setSelectedCategories] = useState<SignupCategoryId[]>(
    defaultSignupCategoryIds,
  );
  const tabValue = selectedCategories[0] ?? signupCategoryItems[0].id;

  function toggleCategory(categoryId: SignupCategoryId) {
    setSelectedCategories((current) =>
      current.includes(categoryId)
        ? current.filter((id) => id !== categoryId)
        : [...current, categoryId],
    );
  }

  return (
    <AuthLayout ariaLabel="관심 카테고리 선택">
      <div className="wrapper_signupStepContent">
        <AuthBackButton onClick={onBack} />
        <h1 className="text_loginTitle">관심 카테고리 선택</h1>

        <form
          className="form_signupStep"
          onSubmit={(event) => {
            event.preventDefault();
            if (selectedCategories.length > 0 && !isSubmitting) {
              onNext(selectedCategories);
            }
          }}
        >
          <PillTabMenu
            ariaLabel="관심 카테고리 선택"
            className="wrapper_authTabMenu wrapper_tabScroller"
            getItemState={(id) => (selectedCategories.includes(id) ? "active" : "default")}
            items={signupCategoryItems}
            keyboardNavigation={false}
            onChange={toggleCategory}
            role="group"
            value={tabValue}
          />

          <PrimaryButtonGroup>
        <PrimaryButton
            className="btn_signupStepNext"
            disabled={selectedCategories.length === 0 || isSubmitting}


            type="submit"

          >
            시작하기
          </PrimaryButton>
      </PrimaryButtonGroup>
          <AuthValidationError id="signup-submit-error" message={submitError} />
        </form>
      </div>
    </AuthLayout>
  );
}

