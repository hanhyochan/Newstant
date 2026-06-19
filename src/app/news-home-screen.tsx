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
import { AllNewsView } from "@/features/all-news/AllNewsView";
import {
  getNextAuthView,
  isAuthView,
} from "@/features/auth/auth-flow";
import {
  LoginView,
  SignupAgeView,
  SignupAgreementView,
  SignupCategoryView,
  SignupEmailView,
  SignupLoginIdView,
  SignupNicknameView,
  SignupPasswordView,
} from "@/features/auth/AuthViews";
import { HomeView } from "@/features/home/HomeView";
import { InfoView } from "@/features/info/InfoView";
import { MyPageView } from "@/features/my-page/MyPageView";
import { NotificationView } from "@/features/notifications/NotificationView";
import {
  getHomeArticleFromNews,
  navItems,
  type BlockedKeywordSetting,
  type BodySearchSelection,
  type BodySearchSelectionInput,
  type Tab
} from "@/features/news/NewsViews";
import {
  getPolicyItemFromWelfarePolicy,
  PolicyView,
} from "@/features/policy/PolicyView";
import { SearchView } from "@/features/search/SearchView";
import { getDataUnavailableMessage } from "@/features/shared/DataUnavailableMessage";
import {
  newsApi,
  notificationApi,
  settingsApi,
  userApi,
  welfareApi,
  type AppNotification,
  type BlockedKeywordPreference
} from "./_newsroll/api";
import {
  currentUserId,
  hydrateCurrentUserSession,
  setCurrentUserSession,
} from "./_newsroll/auth/current-user";

type View =
  | Tab
  | "notifications"
  | "search"
  | "login"
  | "signupAgreement"
  | "signupEmail"
  | "signupNickname"
  | "signupLoginId"
  | "signupPassword"
  | "signupAge"
  | "signupCategory";

type SignupDraft = {
  ageGroupId?: string;
  agreementIds?: string[];
  categoryIds?: string[];
  email?: string;
  loginId?: string;
  marketingAgreed?: boolean;
  nickname?: string;
  password?: string;
};

function normalizeBlockedKeyword(value: string) {
  return value.trim().toLocaleLowerCase("ko-KR");
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
  authError,
  isAuthSubmitting,
  onAddBlockedKeyword,
  onCheckSignupEmail,
  onCheckSignupLoginId,
  onCheckSignupNickname,
  onDarkModeChange,
  onDeleteBlockedKeyword,
  onToggleBlockedKeyword,
  onCloseSearch,
  onLogin,
  onSignupAgeNext,
  onSignupAgreementNext,
  onSignupCategoryNext,
  onSignupEmailNext,
  onSignupLoginIdNext,
  onSignupNicknameNext,
  onSignupPasswordNext,
  onSignupStart,
  onOpenAllNews,
  onOpenNotifications,
  onOpenSearch,
  onSelectNotification,
  onSelectSearchResult,
  onToggleTextSize,
  view,
}: {
  allNewsEntryMotionClassName?: string;
  bodySearchSelection?: BodySearchSelection | null;
  blockedKeywords: string[];
  blockedKeywordSettings: BlockedKeywordSetting[];
  isDarkMode: boolean;
  isTextLarge: boolean;
  isAllNewsBreakingEntry?: boolean;
  authError?: string;
  isAuthSubmitting: boolean;
  onAddBlockedKeyword: (keyword: string) => void;
  onCheckSignupEmail: (email: string) => Promise<boolean>;
  onCheckSignupLoginId: (loginId: string) => Promise<boolean>;
  onCheckSignupNickname: (nickname: string) => Promise<boolean>;
  onDarkModeChange: (isDarkMode: boolean) => void;
  onDeleteBlockedKeyword: (keyword: string) => void;
  onToggleBlockedKeyword: (keyword: string) => void;
  onCloseSearch: () => void;
  onLogin: (input: {
    email: string;
    isAutoLogin: boolean;
    password: string;
  }) => Promise<void>;
  onSignupAgeNext: (ageId: string) => void;
  onSignupAgreementNext: (agreements: Record<string, boolean>) => void;
  onSignupCategoryNext: (categoryIds: string[]) => Promise<void>;
  onSignupEmailNext: (email: string) => void;
  onSignupLoginIdNext: (loginId: string) => void;
  onSignupNicknameNext: (nickname: string) => void;
  onSignupPasswordNext: (password: string) => void;
  onSignupStart: () => void;
  onOpenAllNews: () => void;
  onOpenNotifications: () => void;
  onOpenSearch: () => void;
  onSelectNotification: (notification: AppNotification) => void;
  onSelectSearchResult: (selection: BodySearchSelectionInput) => void;
  onToggleTextSize: () => void;
  view: View;
}) {
  if (view === "login") {
    return (
      <LoginView
        isSubmitting={isAuthSubmitting}
        loginError={authError}
        onLogin={onLogin}
        onSignup={onSignupStart}
      />
    );
  }

  if (view === "signupAgreement") {
    return (
      <SignupAgreementView
        isTextLarge={isTextLarge}
        onNext={onSignupAgreementNext}
        onOpenNotifications={onOpenNotifications}
        onToggleTextSize={onToggleTextSize}
      />
    );
  }

  if (view === "signupEmail") {
    return (
      <SignupEmailView
        onCheckEmail={onCheckSignupEmail}
        onNext={onSignupEmailNext}
      />
    );
  }

  if (view === "signupNickname") {
    return (
      <SignupNicknameView
        onCheckNickname={onCheckSignupNickname}
        onNext={onSignupNicknameNext}
      />
    );
  }

  if (view === "signupLoginId") {
    return (
      <SignupLoginIdView
        onCheckLoginId={onCheckSignupLoginId}
        onNext={onSignupLoginIdNext}
      />
    );
  }

  if (view === "signupPassword") {
    return <SignupPasswordView onNext={onSignupPasswordNext} />;
  }

  if (view === "signupAge") {
    return <SignupAgeView onNext={onSignupAgeNext} />;
  }

  if (view === "signupCategory") {
    return (
      <SignupCategoryView
        isSubmitting={isAuthSubmitting}
        onNext={onSignupCategoryNext}
        submitError={authError}
      />
    );
  }

  if (view === "search") {
    return (
      <SearchView
        getNewsArticle={getHomeArticleFromNews}
        getPolicyItem={getPolicyItemFromWelfarePolicy}
        onClose={onCloseSearch}
        onSelectResult={onSelectSearchResult}
        unavailableMessage={getDataUnavailableMessage("검색 데이터", "를")}
      />
    );
  }

  if (view === "notifications") {
    return (
      <NotificationView
        onClose={onCloseSearch}
        onSelectNotification={onSelectNotification}
      />
    );
  }

  if (view === "all") {
    return (
      <AllNewsView
        entryMotionClassName={allNewsEntryMotionClassName}
        initialShowAllBreaking={isAllNewsBreakingEntry}
        isTextLarge={isTextLarge}
        onOpenNotifications={onOpenNotifications}
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
        onOpenNotifications={onOpenNotifications}
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
        onOpenNotifications={onOpenNotifications}
        onOpenSearch={onOpenSearch}
        onToggleTextSize={onToggleTextSize}
      />
    );
  }

  if (view === "info") {
    return (
      <InfoView
        isTextLarge={isTextLarge}
        onOpenBreakingNews={onOpenAllNews}
        onOpenNotifications={onOpenNotifications}
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
      onOpenNotifications={onOpenNotifications}
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
  const [isTextLarge, setIsTextLarge] = useState(false);
  const [authError, setAuthError] = useState("");
  const [isAuthSubmitting, setIsAuthSubmitting] = useState(false);
  const [signupDraft, setSignupDraft] = useState<SignupDraft>({});
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
    activeView === "notifications" ||
    activeView === "login" ||
    activeView === "signupAgreement" ||
    activeView === "signupEmail" ||
    activeView === "signupNickname" ||
    activeView === "signupLoginId" ||
    activeView === "signupPassword" ||
    activeView === "signupAge" ||
    activeView === "signupCategory"
      ? 0
      : viewResetKeys[activeView];

  useLayoutEffect(() => {
    resetNewsRollViewport();
  }, [activeView, activeViewResetKey]);

  const loadRootSettings = useCallback(
    async (userId = currentUserId, options: { ignore?: () => boolean } = {}) => {
      const [keywords, notifications] = await Promise.all([
        settingsApi.getBlockedKeywords(userId),
        notificationApi.getNotificationSettings(userId),
      ]);

      if (options.ignore?.()) {
        return;
      }

      setBlockedKeywordSettings(getBlockedKeywordSettingsFromApi(keywords));
      setIsDarkMode(notifications?.darkMode ?? false);
    },
    [],
  );

  useEffect(() => {
    let ignore = false;
    const storedUser = hydrateCurrentUserSession();

    if (storedUser) {
      setActiveView("home");
      loadRootSettings(storedUser.id, { ignore: () => ignore }).catch(() => undefined);
    }

    return () => {
      ignore = true;
    };
  }, [loadRootSettings]);

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
        activeView === "notifications" ||
          activeView === "login" ||
          activeView === "signupAgreement" ||
          activeView === "signupEmail" ||
          activeView === "signupNickname" ||
          activeView === "signupLoginId" ||
          activeView === "signupPassword" ||
          activeView === "signupAge" ||
          activeView === "signupCategory"
          ? "home"
          : activeView,
      );
    }

    setActiveView("search");
  }

  function openNotifications() {
    if (activeView !== "notifications") {
      setSearchBackView(
        activeView === "search" ||
          activeView === "login" ||
          activeView === "signupAgreement" ||
          activeView === "signupEmail" ||
          activeView === "signupNickname" ||
          activeView === "signupLoginId" ||
          activeView === "signupPassword" ||
          activeView === "signupAge" ||
          activeView === "signupCategory"
          ? "home"
          : activeView,
      );
    }

    setActiveView("notifications");
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

  function getSignupAgeGroupId(ageId: string) {
    if (ageId === "teens") {
      return "minor";
    }

    if (ageId === "sixties") {
      return "senior";
    }

    if (ageId === "twenties") {
      return "youth";
    }

    return "middle";
  }

  function getSignupCategoryId(categoryId: string) {
    return categoryId === "tech" ? "science" : categoryId;
  }

  async function checkSignupNickname(nickname: string) {
    const user = await userApi.getUserByNickname(nickname);

    return !user;
  }

  async function checkSignupEmail(email: string) {
    const user = await userApi.getUserByEmail(email);

    return !user;
  }

  async function checkSignupLoginId(loginId: string) {
    const user = await userApi.getUserByLoginId(loginId);

    return !user;
  }

  async function loginWithEmail(input: {
    email: string;
    isAutoLogin: boolean;
    password: string;
  }) {
    setAuthError("");
    setIsAuthSubmitting(true);

    try {
      const user = await userApi.login({
        email: input.email,
        password: input.password,
      });

      if (!user) {
        setAuthError("이메일 또는 비밀번호를 확인해 주세요.");
        return;
      }

      setCurrentUserSession(user, { remember: input.isAutoLogin });
      await loadRootSettings(user.id).catch(() => undefined);
      setActiveView("home");
    } catch {
      setAuthError("로그인 정보를 확인하지 못했습니다.");
    } finally {
      setIsAuthSubmitting(false);
    }
  }

  function startSignup() {
    setAuthError("");
    setSignupDraft({});
    setActiveView("signupAgreement");
  }

  function moveToNextAuthStepWithDraft(nextDraft: SignupDraft) {
    setAuthError("");
    setSignupDraft((current) => ({
      ...current,
      ...nextDraft,
    }));
    openNextAuthStep();
  }

  async function ensureInitialUserSettings(
    userId: string,
    input: {
      ageGroupId: string;
      categoryIds: string[];
    },
  ) {
    const [preferences, notifications] = await Promise.all([
      userApi.getUserPreferences(userId).catch(() => []),
      notificationApi.getNotificationSettings(userId).catch(() => null),
    ]);

    const tasks: Array<Promise<unknown>> = [];

    if (preferences.length === 0) {
      tasks.push(
        userApi.createUserPreferences({
          ageGroupId: input.ageGroupId,
          categoryIds: input.categoryIds,
          pressIds: ["joongang", "kukmin", "hani"],
          userId,
        }),
      );
    }

    if (!notifications) {
      tasks.push(
        notificationApi.createNotificationSettings({
          userId,
        }),
      );
    }

    await Promise.all(tasks);
  }

  async function completeSignup(categoryIds: string[]) {
    const nextDraft = {
      ...signupDraft,
      categoryIds: categoryIds.map(getSignupCategoryId),
    };

    if (
      !nextDraft.email ||
      !nextDraft.nickname ||
      !nextDraft.loginId ||
      !nextDraft.password ||
      !nextDraft.ageGroupId ||
      !nextDraft.agreementIds
    ) {
      setAuthError("회원가입 정보를 다시 확인해 주세요.");
      return;
    }

    setAuthError("");
    setIsAuthSubmitting(true);

    try {
      const existingUser = await userApi.getUserByEmail(nextDraft.email);
      const existingLoginIdUser = await userApi.getUserByLoginId(nextDraft.loginId);

      if (existingLoginIdUser && existingLoginIdUser.email !== nextDraft.email) {
        setAuthError("이미 사용 중인 아이디입니다.");
        return;
      }

      if (existingUser) {
        if (existingUser.password !== nextDraft.password) {
          setAuthError("이미 가입된 이메일입니다.");
          return;
        }

        await ensureInitialUserSettings(existingUser.id, {
          ageGroupId: nextDraft.ageGroupId,
          categoryIds: nextDraft.categoryIds ?? [],
        });
        setCurrentUserSession(existingUser, { remember: true });
        await loadRootSettings(existingUser.id).catch(() => undefined);
        setSignupDraft({});
        setActiveView("home");
        return;
      }

      const user = await userApi.createUser({
        ageGroupId: nextDraft.ageGroupId,
        agreementIds: nextDraft.agreementIds,
        categoryIds: nextDraft.categoryIds ?? [],
        email: nextDraft.email,
        loginId: nextDraft.loginId,
        marketingAgreed: Boolean(nextDraft.marketingAgreed),
        nickname: nextDraft.nickname,
        password: nextDraft.password,
      });

      await ensureInitialUserSettings(user.id, {
        ageGroupId: user.ageGroupId,
        categoryIds: nextDraft.categoryIds ?? [],
      });

      setCurrentUserSession(user, { remember: true });
      await loadRootSettings(user.id).catch(() => undefined);
      setSignupDraft({});
      setActiveView("home");
    } catch {
      setAuthError("회원가입 정보를 저장하지 못했습니다.");
    } finally {
      setIsAuthSubmitting(false);
    }
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
    setBodySearchSelection({ ...selection, id: Date.now() });
    setActiveView(nextView);
    setSearchBackView(nextView);
    setViewResetKeys((current) => ({
      ...current,
      [nextView]: current[nextView] + 1,
    }));
  }

  async function openNotificationTarget(notification: AppNotification) {
    if (notification.targetType === "news" && notification.targetId) {
      try {
        const news = await newsApi.getNewsList();
        const targetIndex = news.findIndex((item) => item.id === notification.targetId);
        const targetNews = targetIndex >= 0 ? news[targetIndex] : null;

        if (targetNews) {
          openBodySearchResult({
            article: getHomeArticleFromNews(targetNews, targetIndex),
            kind: "news",
          });
          return;
        }
      } catch {
        setActiveView("home");
        setSearchBackView("home");
        return;
      }
    }

    if (notification.targetType === "policy" && notification.targetId) {
      try {
        const policy = await welfareApi.getWelfarePolicyDetail(notification.targetId);

        openBodySearchResult({
          kind: "policy",
          policy: getPolicyItemFromWelfarePolicy(policy),
        });
        return;
      } catch {
        setActiveView("policy");
        setSearchBackView("policy");
        return;
      }
    }

    if (notification.targetType === "inquiry") {
      setActiveView("my");
      setSearchBackView("my");
      setViewResetKeys((current) => ({
        ...current,
        my: current.my + 1,
      }));
      return;
    }

    setActiveView("home");
    setSearchBackView("home");
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
        activeView === "signupLoginId" ||
        activeView === "signupPassword" ||
        activeView === "signupAge" ||
        activeView === "signupCategory"
          ? " newsroll_screen_login"
          : ""
      }${
        activeView === "search" || activeView === "notifications"
          ? " newsroll_screen_search"
          : ""
      }${isPanelView ? " newsroll_screen_panel" : ""}${
        isTextLarge ? " newsroll_text_large" : ""
      }${isDarkMode ? " newsroll_dark" : ""}`}
    >
      <div className="newsroll_phone" aria-label="NewsRoll">
        <ActiveView
          allNewsEntryMotionClassName={allNewsEntryMotionClassName}
          authError={authError}
          bodySearchSelection={bodySearchSelection}
          blockedKeywords={blockedKeywords}
          blockedKeywordSettings={blockedKeywordSettings}
          isDarkMode={isDarkMode}
          key={`${activeView}-${activeViewResetKey}`}
          isAllNewsBreakingEntry={isAllNewsBreakingEntry}
          isAuthSubmitting={isAuthSubmitting}
          isTextLarge={isTextLarge}
          onAddBlockedKeyword={addBlockedKeyword}
          onCheckSignupEmail={checkSignupEmail}
          onCheckSignupLoginId={checkSignupLoginId}
          onCheckSignupNickname={checkSignupNickname}
          onDarkModeChange={setIsDarkMode}
          onDeleteBlockedKeyword={deleteBlockedKeyword}
          onToggleBlockedKeyword={toggleBlockedKeyword}
          onCloseSearch={() => setActiveView(searchBackView)}
          onLogin={loginWithEmail}
          onOpenAllNews={openBreakingNewsView}
          onOpenNotifications={openNotifications}
          onOpenSearch={openSearch}
          onSelectNotification={openNotificationTarget}
          onSelectSearchResult={openBodySearchResult}
          onSignupAgeNext={(ageId) =>
            moveToNextAuthStepWithDraft({
              ageGroupId: getSignupAgeGroupId(ageId),
            })
          }
          onSignupAgreementNext={(agreements) =>
            moveToNextAuthStepWithDraft({
              agreementIds: Object.entries(agreements)
                .filter(([, isAgreed]) => isAgreed)
                .map(([id]) => id),
              marketingAgreed: Boolean(agreements.marketing),
            })
          }
          onSignupCategoryNext={completeSignup}
          onSignupEmailNext={(email) => moveToNextAuthStepWithDraft({ email })}
          onSignupNicknameNext={(nickname) =>
            moveToNextAuthStepWithDraft({ nickname })
          }
          onSignupLoginIdNext={(loginId) =>
            moveToNextAuthStepWithDraft({ loginId })
          }
          onSignupPasswordNext={(password) =>
            moveToNextAuthStepWithDraft({ password })
          }
          onSignupStart={startSignup}
          onToggleTextSize={() => setIsTextLarge((current) => !current)}
          view={activeView}
        />
      </div>

      {activeView !== "search" &&
      activeView !== "notifications" &&
      activeView !== "login" &&
      activeView !== "signupAgreement" &&
      activeView !== "signupEmail" &&
      activeView !== "signupNickname" &&
      activeView !== "signupLoginId" &&
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
