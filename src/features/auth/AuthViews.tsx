"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

import {
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
} from "@/shared/newsroll/auth-validation";
import { fixedDockedPanelProps } from "@/shared/newsroll/my-info-panel-behavior";
import { useZodFieldValidation } from "@/shared/newsroll/use-zod-field-validation";
import { useVerificationCodeFlow } from "@/features/shared/hooks/use-verification-code-flow";
import { NewsToolbar } from "@/features/shell/NewsRollToolbar";
import {
  createSignupAgreementSearchResults,
  getAgreementSearchRootId,
  signupAgreementDetails,
  signupAgreementItems,
  type SignupAgreementDetail,
  type SignupAgreementKey,
  type SignupAgreementSearchResult,
  type SignupAgreementSearchTarget,
} from "@/features/auth/signup-agreement-model";
import {
  defaultSignupCategoryIds,
  reservedSignupNicknames,
  signupAgeItems,
  signupCategoryItems,
  type SignupAgeId,
  type SignupCategoryId,
} from "@/features/auth/signup-profile-model";
import { AuthBackButton } from "@/features/auth/components/AuthBackButton";
import { AuthLayout } from "@/features/auth/components/AuthLayout";
import { AuthTextActionButton } from "@/features/auth/components/AuthTextActionButton";
import { AuthValidationError } from "@/features/auth/components/AuthValidationError";
import { SignupFieldActionButton } from "@/features/auth/components/SignupFieldActionButton";
import { SocialLoginButtons } from "@/features/auth/components/SocialLoginButtons";
export { LoginView } from "@/features/auth/login/LoginView";
export { PasswordResetPasswordView } from "@/features/auth/password-reset/PasswordResetPasswordView";
export { SignupAgeView } from "@/features/auth/signup/SignupAgeView";
export { SignupCategoryView } from "@/features/auth/signup/SignupCategoryView";

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
      className="sheetFrame container_authAgreementScreen"
      dockedGap={pagePanelDockedGap}
      initialGap={pagePanelInitialGap}
      {...fixedDockedPanelProps}
      minInitialTop={pagePanelInitialTop}
      sheetClassName="sheetFrameSheet container_homeSheet"
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
            className="motion_dockedPop allDockedControls panelHeaderRow"
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
    <section className="search_page" aria-label="동의 문구 통합검색">
      <div className="toolbar search_top" aria-label="검색 도구">
        <IconButton
          className="toolbar_icon search_close"
          icon="close"
          label="동의 본문으로 돌아가기"
          onClick={onBack}
        />
      </div>

      <div className="wrapper_searchContent">
        <form
          className="form_searchComposer motion_enterUp"
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
  const [email, setEmail] = useState("");
  const [isEmailChecked, setIsEmailChecked] = useState(false);
  const [isEmailChecking, setIsEmailChecking] = useState(false);
  const [emailCheckMessage, setEmailCheckMessage] = useState("");
  const {
    formattedVerificationTime,
    isVerificationConfirmed,
    isVerificationSent,
    resetVerificationCode,
    setVerificationCode,
    startVerificationCode: startVerificationTimer,
    verificationCode,
    confirmVerificationCode: markVerificationConfirmed,
  } = useVerificationCodeFlow();
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
  async function startVerificationCode() {
    const isAvailable = await checkEmailDuplicate();

    if (!isAvailable) {
      return;
    }

    startVerificationTimer();
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
      markVerificationConfirmed();
    }
  }

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
            <div className="wrapper_authField wrapper_fieldStack u_w100">
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
              <div className="wrapper_authField wrapper_fieldStack u_w100">
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

export function PasswordResetEmailView({
  onBack,
  onCheckEmail,
  onNext,
}: {
  onBack: () => void;
  onCheckEmail: (email: string) => Promise<boolean>;
  onNext: (email: string) => void;
}) {
  const [email, setEmail] = useState("");
  const [isEmailChecked, setIsEmailChecked] = useState(false);
  const [isEmailChecking, setIsEmailChecking] = useState(false);
  const [emailCheckMessage, setEmailCheckMessage] = useState("");
  const {
    formattedVerificationTime,
    isVerificationConfirmed,
    isVerificationSent,
    resetVerificationCode,
    setVerificationCode,
    startVerificationCode: startVerificationTimer,
    verificationCode,
    confirmVerificationCode: markVerificationConfirmed,
  } = useVerificationCodeFlow();
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

    startVerificationTimer();
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
      markVerificationConfirmed();
    }
  }

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
            <div className="wrapper_authField wrapper_fieldStack u_w100">
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
              <div className="wrapper_authField wrapper_fieldStack u_w100">
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
            <div className="wrapper_authField wrapper_fieldStack u_w100">
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
            <div className="wrapper_authField wrapper_fieldStack u_w100">
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
            <div className="wrapper_authField wrapper_fieldStack u_w100">
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

