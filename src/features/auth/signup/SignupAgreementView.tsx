"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import {
  ChevronRowButton,
  CheckInput,
  Icon,
  IconButton,
  Divider,
  PrimaryButton,
  PrimaryButtonGroup,
  SearchHighlightText,
  SearchResultButton,
  TextInput,
  getSearchHighlightTargetId,
  scrollSearchHighlightTargetIntoView,
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
import { fixedDockedPanelProps } from "@/shared/newsroll/my-info-panel-behavior";
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
import { AuthBackButton } from "@/features/auth/components/AuthBackButton";
import { AuthLayout } from "@/features/auth/components/AuthLayout";

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
