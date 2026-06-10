"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { IconButton } from "@/design-system/components";
import {
  getEnterFromRightMotionClassName,
  hasActiveEnterFromRightMotion,
  newsrollDetailRevealDelayMs as nextArticleRevealDelayMs,
  requestEnterFromRightExitMotion,
} from "@/design-system/templates";
import {
  getNextAuthView,
  getPreviousAuthView,
  isAuthView,
} from "@/features/auth/auth-flow";
import {
  LoginView,
  SignupAgeView,
  SignupAgreementView,
  SignupCategoryView,
  SignupEmailView,
  SignupNicknameView,
  SignupPasswordView,
} from "@/features/auth/AuthViews";
import { InfoView } from "@/features/info/InfoView";
import {
  QuickMenuDrawer,
  getHomeArticleFromNews,
  navItems,
  type BlockedKeywordSetting,
  type BodySearchSelection,
  type BodySearchSelectionInput,
  type HomeArticle,
  type QuickMenuRequest,
  type QuickMenuTarget,
  type Tab,
} from "@/features/news/NewsViews";
import { AllNewsView } from "@/features/all-news/AllNewsView";
import { HomeView } from "@/features/home/HomeView";
import { MyPageView } from "@/features/my-page/MyPageView";
import {
  getPolicyItemFromWelfarePolicy,
  PolicyView,
} from "@/features/policy/PolicyView";
import { SearchView } from "@/features/search/SearchView";
import {
  notificationApi,
  settingsApi,
  type BlockedKeywordPreference,
  type NotificationSettings,
} from "./_newsroll/api";
import { currentUserId } from "./_newsroll/auth/current-user";

type View =
  | Tab
  | "search"
  | "login"
  | "signupAgreement"
  | "signupEmail"
  | "signupNickname"
  | "signupPassword"
  | "signupAge"
  | "signupCategory";

function normalizeBlockedKeyword(value: string) {
  return value.trim().toLocaleLowerCase("ko-KR");
}

function getDataUnavailableMessage(target: string, particle = "을") {
  return `${target}${particle} 불러오지 못했습니다.`;
}

function getBlockedKeywordSettingsFromApi(
  items: BlockedKeywordPreference[],
): BlockedKeywordSetting[] {
  return items.map((item) => ({
    id: item.id,
    isActive: item.isActive,
    keyword: item.keyword,
  }));
}

function resetNewsRollViewport() {
  if (typeof window === "undefined") {
    return;
  }

  window.requestAnimationFrame(() => {
    const scrollTargets = [
      document.scrollingElement,
      document.documentElement,
      document.body,
      ...document.querySelectorAll<HTMLElement>(
        ".newsroll_phone, .newsroll_policy_screen, .container_myScreen, .newsroll_info_screen",
      ),
    ];

    scrollTargets.forEach((target) => {
      if (!target) {
        return;
      }

      target.scrollTop = 0;
      target.scrollLeft = 0;
    });
  });
}

function ActiveView({
  allNewsEntryMotionClassName = "",
  bodySearchSelection,
  blockedKeywords,
  blockedKeywordSettings,
  isDarkMode,
  isTextLarge,
  isAllNewsBreakingEntry = false,
  onAddBlockedKeyword,
  onDarkModeChange,
  onDeleteBlockedKeyword,
  onToggleBlockedKeyword,
  onCloseSearch,
  onLoginNext,
  onLoginPrevious,
  onOpenAllNews,
  onOpenMenu,
  onOpenSearch,
  onQuickMenuBack,
  onSelectSearchResult,
  onToggleTextSize,
  quickMenuRequest,
  view,
}: {
  allNewsEntryMotionClassName?: string;
  bodySearchSelection?: BodySearchSelection | null;
  blockedKeywords: string[];
  blockedKeywordSettings: BlockedKeywordSetting[];
  isDarkMode: boolean;
  isTextLarge: boolean;
  isAllNewsBreakingEntry?: boolean;
  onAddBlockedKeyword: (keyword: string) => void;
  onDarkModeChange: (isDarkMode: boolean) => void;
  onDeleteBlockedKeyword: (keyword: string) => void;
  onToggleBlockedKeyword: (keyword: string) => void;
  onCloseSearch: () => void;
  onLoginNext: () => void;
  onLoginPrevious: () => void;
  onOpenAllNews: () => void;
  onOpenMenu: () => void;
  onOpenSearch: () => void;
  onQuickMenuBack: (returnView: Tab) => void;
  onSelectSearchResult: (selection: BodySearchSelectionInput) => void;
  onToggleTextSize: () => void;
  quickMenuRequest?: QuickMenuRequest | null;
  view: View;
}) {
  if (view === "login") {
    return (
      <LoginView
        onNext={onLoginNext}
        onPrevious={onLoginPrevious}
        onSignup={onLoginNext}
      />
    );
  }

  if (view === "signupAgreement") {
    return (
      <SignupAgreementView
        isTextLarge={isTextLarge}
        onNext={onLoginNext}
        onOpenMenu={onOpenMenu}
        onPrevious={onLoginPrevious}
        onToggleTextSize={onToggleTextSize}
      />
    );
  }

  if (view === "signupEmail") {
    return <SignupEmailView onNext={onLoginNext} onPrevious={onLoginPrevious} />;
  }

  if (view === "signupNickname") {
    return (
      <SignupNicknameView onNext={onLoginNext} onPrevious={onLoginPrevious} />
    );
  }

  if (view === "signupPassword") {
    return <SignupPasswordView onNext={onLoginNext} onPrevious={onLoginPrevious} />;
  }

  if (view === "signupAge") {
    return <SignupAgeView onNext={onLoginNext} onPrevious={onLoginPrevious} />;
  }

  if (view === "signupCategory") {
    return (
      <SignupCategoryView onNext={onLoginNext} onPrevious={onLoginPrevious} />
    );
  }

  if (view === "search") {
    return (
      <SearchView
        blockedKeywords={blockedKeywords}
        getNewsArticle={getHomeArticleFromNews}
        getPolicyItem={getPolicyItemFromWelfarePolicy}
        onClose={onCloseSearch}
        onSelectResult={onSelectSearchResult}
        unavailableMessage={getDataUnavailableMessage("검색 데이터", "를")}
      />
    );
  }

  if (view === "all") {
    return (
      <AllNewsView
        blockedKeywords={blockedKeywords}
        entryMotionClassName={allNewsEntryMotionClassName}
        initialShowAllBreaking={isAllNewsBreakingEntry}
        isTextLarge={isTextLarge}
        onOpenMenu={onOpenMenu}
        onOpenSearch={onOpenSearch}
        onToggleTextSize={onToggleTextSize}
      />
    );
  }

  if (view === "policy") {
    return (
      <PolicyView
        bodySearchSelection={bodySearchSelection}
        isTextLarge={isTextLarge}
        onOpenBreakingNews={onOpenAllNews}
        onOpenMenu={onOpenMenu}
        onOpenSearch={onOpenSearch}
        onToggleTextSize={onToggleTextSize}
      />
    );
  }

  if (view === "my") {
    return (
      <MyPageView
        blockedKeywordSettings={blockedKeywordSettings}
        isDarkMode={isDarkMode}
        isTextLarge={isTextLarge}
        onAddBlockedKeyword={onAddBlockedKeyword}
        onDarkModeChange={onDarkModeChange}
        onDeleteBlockedKeyword={onDeleteBlockedKeyword}
        onToggleBlockedKeyword={onToggleBlockedKeyword}
        onOpenBreakingNews={onOpenAllNews}
        onOpenMenu={onOpenMenu}
        onOpenSearch={onOpenSearch}
        onQuickMenuBack={onQuickMenuBack}
        onToggleTextSize={onToggleTextSize}
        quickMenuRequest={quickMenuRequest}
      />
    );
  }

  if (view === "info") {
    return (
      <InfoView
        isTextLarge={isTextLarge}
        onOpenBreakingNews={onOpenAllNews}
        onOpenMenu={onOpenMenu}
        onOpenSearch={onOpenSearch}
        onToggleTextSize={onToggleTextSize}
      />
    );
  }

  return (
    <HomeView
      bodySearchSelection={bodySearchSelection}
      blockedKeywords={blockedKeywords}
      isTextLarge={isTextLarge}
      onOpenBreakingNews={onOpenAllNews}
      onOpenMenu={onOpenMenu}
      onOpenSearch={onOpenSearch}
      onToggleTextSize={onToggleTextSize}
    />
  );
}

export function NewsHomeScreen() {
  const [activeView, setActiveView] = useState<View>("login");
  const [searchBackView, setSearchBackView] = useState<Tab>("home");
  const viewNavigationTimerRef = useRef<number | null>(null);
  const allNewsEntryMotionTimerRef = useRef<number | null>(null);
  const [viewResetKeys, setViewResetKeys] = useState<Record<Tab, number>>({
    all: 0,
    home: 0,
    info: 0,
    my: 0,
    policy: 0,
  });
  const [allNewsEntryMotionClassName, setAllNewsEntryMotionClassName] =
    useState("");
  const [isAllNewsBreakingEntry, setIsAllNewsBreakingEntry] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isQuickMenuOpen, setIsQuickMenuOpen] = useState(false);
  const [quickMenuRequest, setQuickMenuRequest] =
    useState<QuickMenuRequest | null>(null);
  const [isTextLarge, setIsTextLarge] = useState(false);
  const [bodySearchSelection, setBodySearchSelection] =
    useState<BodySearchSelection | null>(null);
  const [blockedKeywordSettings, setBlockedKeywordSettings] = useState<
    BlockedKeywordSetting[]
  >([]);
  const blockedKeywords = useMemo(
    () =>
      blockedKeywordSettings
        .filter((setting) => setting.isActive)
        .map((setting) => setting.keyword),
    [blockedKeywordSettings],
  );
  const isPanelView =
    activeView === "policy" || activeView === "my" || activeView === "info";
  const activeViewResetKey =
    activeView === "search" ||
    activeView === "login" ||
    activeView === "signupAgreement" ||
    activeView === "signupEmail" ||
    activeView === "signupNickname" ||
    activeView === "signupPassword" ||
    activeView === "signupAge" ||
    activeView === "signupCategory"
      ? 0
      : viewResetKeys[activeView];

  useLayoutEffect(() => {
    resetNewsRollViewport();
  }, [activeView, activeViewResetKey]);

  useEffect(() => {
    let ignore = false;

    async function loadRootSettings() {
      const [keywords, notifications] = await Promise.all([
        settingsApi.getBlockedKeywords(currentUserId),
        notificationApi.getNotificationSettings(currentUserId),
      ]);

      if (ignore) {
        return;
      }

      setBlockedKeywordSettings(getBlockedKeywordSettingsFromApi(keywords));
      setIsDarkMode(notifications?.darkMode ?? false);
    }

    loadRootSettings().catch(() => undefined);

    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    return () => {
      if (viewNavigationTimerRef.current !== null) {
        window.clearTimeout(viewNavigationTimerRef.current);
      }

      if (allNewsEntryMotionTimerRef.current !== null) {
        window.clearTimeout(allNewsEntryMotionTimerRef.current);
      }
    };
  }, []);

  function openSearch() {
    if (activeView !== "search") {
      setSearchBackView(
        activeView === "login" ||
          activeView === "signupAgreement" ||
          activeView === "signupEmail" ||
          activeView === "signupNickname" ||
          activeView === "signupPassword" ||
          activeView === "signupAge" ||
          activeView === "signupCategory"
          ? "home"
          : activeView,
      );
    }

    setActiveView("search");
  }

  function openDefaultTab(tab: Tab) {
    const moveToTab = () => {
      setAllNewsEntryMotionClassName("");
      setIsAllNewsBreakingEntry(false);
      setBodySearchSelection(null);
      setActiveView(tab);
      setSearchBackView(tab);
      setViewResetKeys((current) => ({
        ...current,
        [tab]: current[tab] + 1,
      }));
    };

    if (hasActiveEnterFromRightMotion()) {
      requestEnterFromRightExitMotion();

      if (viewNavigationTimerRef.current !== null) {
        window.clearTimeout(viewNavigationTimerRef.current);
      }

      viewNavigationTimerRef.current = window.setTimeout(() => {
        viewNavigationTimerRef.current = null;
        moveToTab();
      }, nextArticleRevealDelayMs);

      return;
    }

    moveToTab();
  }

  function openBreakingNewsView() {
    const moveToBreakingNews = () => {
      setAllNewsEntryMotionClassName(getEnterFromRightMotionClassName());
      setIsAllNewsBreakingEntry(true);
      setBodySearchSelection(null);
      setActiveView("all");
      setSearchBackView("all");
      setViewResetKeys((current) => ({
        ...current,
        all: current.all + 1,
      }));

      if (allNewsEntryMotionTimerRef.current !== null) {
        window.clearTimeout(allNewsEntryMotionTimerRef.current);
      }

      allNewsEntryMotionTimerRef.current = window.setTimeout(() => {
        allNewsEntryMotionTimerRef.current = null;
        setAllNewsEntryMotionClassName("");
      }, nextArticleRevealDelayMs);
    };

    if (hasActiveEnterFromRightMotion()) {
      requestEnterFromRightExitMotion();

      if (viewNavigationTimerRef.current !== null) {
        window.clearTimeout(viewNavigationTimerRef.current);
      }

      viewNavigationTimerRef.current = window.setTimeout(() => {
        viewNavigationTimerRef.current = null;
        moveToBreakingNews();
      }, nextArticleRevealDelayMs);

      return;
    }

    moveToBreakingNews();
  }

  function openNextAuthStep() {
    setActiveView((current) => {
      return isAuthView(current) ? getNextAuthView(current) : "home";
    });
  }

  function openPreviousAuthStep() {
    setActiveView((current) => {
      return isAuthView(current) && current !== "login"
        ? getPreviousAuthView(current)
        : "home";
    });
  }

  function openQuickMenuTarget(target: QuickMenuTarget) {
    const returnView: Tab =
      activeView === "search"
        ? searchBackView
        : isAuthView(activeView)
          ? "home"
          : activeView;

    setIsQuickMenuOpen(false);
    setAllNewsEntryMotionClassName("");
    setIsAllNewsBreakingEntry(false);
    setBodySearchSelection(null);
    setActiveView("my");
    setSearchBackView(returnView);
    setQuickMenuRequest({ id: Date.now(), returnView, target });
    setViewResetKeys((current) => ({
      ...current,
      my: current.my + 1,
    }));
  }

  function returnFromQuickMenuTarget(returnView: Tab) {
    setQuickMenuRequest(null);
    setAllNewsEntryMotionClassName("");
    setIsAllNewsBreakingEntry(false);
    setBodySearchSelection(null);
    setActiveView(returnView);
    setSearchBackView(returnView);
    setViewResetKeys((current) => ({
      ...current,
      [returnView]: current[returnView] + 1,
    }));
  }

  function addBlockedKeyword(keyword: string) {
    const normalizedKeyword = normalizeBlockedKeyword(keyword);

    if (!normalizedKeyword) {
      return;
    }

    if (
      blockedKeywordSettings.some(
        (item) => normalizeBlockedKeyword(item.keyword) === normalizedKeyword,
      )
    ) {
      return;
    }

    setBlockedKeywordSettings((current) => {
      const hasSameKeyword = current.some(
        (item) => normalizeBlockedKeyword(item.keyword) === normalizedKeyword,
      );

      return hasSameKeyword
        ? current
        : [...current, { isActive: true, keyword: keyword.trim() }];
    });

    settingsApi
      .createBlockedKeyword({
        isActive: true,
        keyword: keyword.trim(),
        userId: currentUserId,
      })
      .then((createdKeyword) => {
        setBlockedKeywordSettings((current) =>
          current.map((item) =>
            !item.id && normalizeBlockedKeyword(item.keyword) === normalizedKeyword
              ? {
                  id: createdKeyword.id,
                  isActive: createdKeyword.isActive,
                  keyword: createdKeyword.keyword,
                }
              : item,
          ),
        );
      })
      .catch(() => undefined);
  }

  function toggleBlockedKeyword(keyword: string) {
    const targetKeyword = blockedKeywordSettings.find(
      (setting) => setting.keyword === keyword,
    );
    const nextIsActive = !targetKeyword?.isActive;

    setBlockedKeywordSettings((current) =>
      current.map((setting) =>
        setting.keyword === keyword
          ? { ...setting, isActive: !setting.isActive }
          : setting,
      ),
    );

    if (targetKeyword?.id) {
      settingsApi
        .updateBlockedKeyword(targetKeyword.id, { isActive: nextIsActive })
        .catch(() => undefined);
    }
  }

  function deleteBlockedKeyword(keyword: string) {
    const targetKeyword = blockedKeywordSettings.find(
      (setting) => setting.keyword === keyword,
    );

    setBlockedKeywordSettings((current) =>
      current.filter((setting) => setting.keyword !== keyword),
    );

    if (targetKeyword?.id) {
      settingsApi.deleteBlockedKeyword(targetKeyword.id).catch(() => undefined);
    }
  }

  function openBodySearchResult(selection: BodySearchSelectionInput) {
    const nextView = selection.kind === "news" ? "home" : "policy";

    setAllNewsEntryMotionClassName("");
    setIsAllNewsBreakingEntry(false);
    setQuickMenuRequest(null);
    setBodySearchSelection({ ...selection, id: Date.now() });
    setActiveView(nextView);
    setSearchBackView(nextView);
    setViewResetKeys((current) => ({
      ...current,
      [nextView]: current[nextView] + 1,
    }));
  }

  return (
    <main
      className={`newsroll_screen${activeView === "home" ? " newsroll_screen_home" : ""}${
        activeView === "all" ? " newsroll_screen_all" : ""
      }${
        activeView === "login" ||
        activeView === "signupAgreement" ||
        activeView === "signupEmail" ||
        activeView === "signupNickname" ||
        activeView === "signupPassword" ||
        activeView === "signupAge" ||
        activeView === "signupCategory"
          ? " newsroll_screen_login"
          : ""
      }${
        activeView === "search" ? " newsroll_screen_search" : ""
      }${isPanelView ? " newsroll_screen_panel" : ""}${
        isTextLarge ? " newsroll_text_large" : ""
      }${isDarkMode ? " newsroll_dark" : ""}`}
    >
      <div className="newsroll_phone" aria-label="NewsRoll">
        <ActiveView
          allNewsEntryMotionClassName={allNewsEntryMotionClassName}
          bodySearchSelection={bodySearchSelection}
          blockedKeywords={blockedKeywords}
          blockedKeywordSettings={blockedKeywordSettings}
          isDarkMode={isDarkMode}
          key={`${activeView}-${activeViewResetKey}`}
          isAllNewsBreakingEntry={isAllNewsBreakingEntry}
          isTextLarge={isTextLarge}
          onAddBlockedKeyword={addBlockedKeyword}
          onDarkModeChange={setIsDarkMode}
          onDeleteBlockedKeyword={deleteBlockedKeyword}
          onToggleBlockedKeyword={toggleBlockedKeyword}
          onCloseSearch={() => setActiveView(searchBackView)}
          onLoginNext={openNextAuthStep}
          onLoginPrevious={openPreviousAuthStep}
          onOpenAllNews={openBreakingNewsView}
          onOpenMenu={() => setIsQuickMenuOpen(true)}
          onOpenSearch={openSearch}
          onQuickMenuBack={returnFromQuickMenuTarget}
          onSelectSearchResult={openBodySearchResult}
          onToggleTextSize={() => setIsTextLarge((current) => !current)}
          quickMenuRequest={quickMenuRequest}
          view={activeView}
        />
      </div>
      <QuickMenuDrawer
        isOpen={isQuickMenuOpen}
        isDarkMode={isDarkMode}
        onClose={() => setIsQuickMenuOpen(false)}
        onNavigate={openQuickMenuTarget}
      />

      {activeView !== "search" &&
      activeView !== "login" &&
      activeView !== "signupAgreement" &&
      activeView !== "signupEmail" &&
      activeView !== "signupNickname" &&
      activeView !== "signupPassword" &&
      activeView !== "signupAge" &&
      activeView !== "signupCategory" ? (
        <nav className="newsroll_bottom_nav" aria-label="하단 탐색">
          {navItems.map((item) => (
            <IconButton
              aria-current={activeView === item.tab ? "page" : undefined}
              baseClassName="newsroll_nav_item"
              icon={item.icon}
              key={item.label}
              label={item.label}
              onClick={() => openDefaultTab(item.tab)}
            />
          ))}
        </nav>
      ) : null}
    </main>
  );
}
