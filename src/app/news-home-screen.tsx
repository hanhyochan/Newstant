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
  getPreviousAuthView,
  isAuthView,
} from "@/features/auth/auth-flow";
import {
  LoginView,
  PasswordResetEmailView,
  PasswordResetPasswordView,
  SignupAgeView,
  SignupAgreementView,
  SignupCategoryView,
  SignupEmailView,
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
import { ConfirmDialog } from "@/features/shared/ConfirmDialog";
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
  clearCurrentUserSession,
  currentUserId,
  getStoredCurrentUserSession,
  hydrateCurrentUserSession,
  setCurrentUserSession,
} from "./_newsroll/auth/current-user";

type View =
  | Tab
  | "notifications"
  | "search"
  | "login"
  | "passwordResetEmail"
  | "passwordResetPassword"
  | "signupAgreement"
  | "signupEmail"
  | "signupNickname"
  | "signupPassword"
  | "signupAge"
  | "signupCategory";

type SignupDraft = {
  ageGroupId?: string;
  agreementIds?: string[];
  categoryIds?: string[];
  email?: string;
  marketingAgreed?: boolean;
  nickname?: string;
  password?: string;
};

function isProtectedView(view: View) {
  return !isAuthView(view);
}

function NewsRollSplashScreen() {
  return (
    <section className="container_newsrollSplash" aria-label="NewsRoll 로딩">
      <span aria-hidden="true" className="box_newsrollSplashLogo" />
    </section>
  );
}

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
  onCheckSignupNickname,
  onAuthBack,
  onDarkModeChange,
  onDeleteBlockedKeyword,
  onToggleBlockedKeyword,
  onCloseSearch,
  onLogin,
  onLogout,
  onCheckPasswordResetEmail,
  onPasswordResetEmailNext,
  onPasswordResetPasswordSubmit,
  onPasswordResetStart,
  onSignupAgeNext,
  onSignupAgreementNext,
  onSignupCategoryNext,
  onSignupEmailNext,
  onSignupNicknameNext,
  onSignupPasswordNext,
  onSignupStart,
  onOpenBreakingNews,
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
  onCheckSignupNickname: (nickname: string) => Promise<boolean>;
  onAuthBack: () => void;
  onDarkModeChange: (isDarkMode: boolean) => void;
  onDeleteBlockedKeyword: (keyword: string) => void;
  onToggleBlockedKeyword: (keyword: string) => void;
  onCloseSearch: () => void;
  onLogin: (input: {
    email: string;
    isAutoLogin: boolean;
    password: string;
  }) => Promise<void>;
  onLogout: () => void;
  onCheckPasswordResetEmail: (email: string) => Promise<boolean>;
  onPasswordResetEmailNext: (email: string) => void;
  onPasswordResetPasswordSubmit: (input: {
    nextPassword: string;
  }) => Promise<void>;
  onPasswordResetStart: () => void;
  onSignupAgeNext: (ageId: string) => void;
  onSignupAgreementNext: (agreements: Record<string, boolean>) => void;
  onSignupCategoryNext: (categoryIds: string[]) => Promise<void>;
  onSignupEmailNext: (email: string) => void;
  onSignupNicknameNext: (nickname: string) => void;
  onSignupPasswordNext: (password: string) => void;
  onSignupStart: () => void;
  onOpenBreakingNews: () => void;
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
        onPasswordResetStart={onPasswordResetStart}
        onSignup={onSignupStart}
      />
    );
  }

  if (view === "passwordResetEmail") {
    return (
      <PasswordResetEmailView
        onBack={onAuthBack}
        onCheckEmail={onCheckPasswordResetEmail}
        onNext={onPasswordResetEmailNext}
      />
    );
  }

  if (view === "passwordResetPassword") {
    return (
      <PasswordResetPasswordView
        onBack={onAuthBack}
        onSubmit={onPasswordResetPasswordSubmit}
        submitError={authError}
      />
    );
  }

  if (view === "signupAgreement") {
    return (
      <SignupAgreementView
        isTextLarge={isTextLarge}
        onBack={onAuthBack}
        onNext={onSignupAgreementNext}
        onOpenBreakingNews={onOpenBreakingNews}
        onToggleTextSize={onToggleTextSize}
      />
    );
  }

  if (view === "signupEmail") {
    return (
      <SignupEmailView
        onBack={onAuthBack}
        onCheckEmail={onCheckSignupEmail}
        onNext={onSignupEmailNext}
      />
    );
  }

  if (view === "signupNickname") {
    return (
      <SignupNicknameView
        onBack={onAuthBack}
        onCheckNickname={onCheckSignupNickname}
        onNext={onSignupNicknameNext}
      />
    );
  }

  if (view === "signupPassword") {
    return <SignupPasswordView onBack={onAuthBack} onNext={onSignupPasswordNext} />;
  }

  if (view === "signupAge") {
    return <SignupAgeView onBack={onAuthBack} onNext={onSignupAgeNext} />;
  }

  if (view === "signupCategory") {
    return (
      <SignupCategoryView
        isSubmitting={isAuthSubmitting}
        onBack={onAuthBack}
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
        onOpenBreakingNews={onOpenBreakingNews}
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
        onOpenBreakingNews={onOpenBreakingNews}
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
        onLogout={onLogout}
        onOpenBreakingNews={onOpenBreakingNews}
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
        onOpenBreakingNews={onOpenBreakingNews}
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
      onOpenBreakingNews={onOpenBreakingNews}
      onOpenNotifications={onOpenNotifications}
      onOpenSearch={onOpenSearch}
      onToggleTextSize={onToggleTextSize}
    />
  );
}

export function NewsHomeScreen() {
  const [activeView, setActiveView] = useState<View>(() =>
    getStoredCurrentUserSession() ? "home" : "login",
  );
  const [isAuthenticated, setIsAuthenticated] = useState(() =>
    Boolean(getStoredCurrentUserSession()),
  );
  const [isSplashVisible, setIsSplashVisible] = useState(true);
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
  const [passwordResetEmail, setPasswordResetEmail] = useState("");
  const [isPasswordResetCompleteDialogOpen, setIsPasswordResetCompleteDialogOpen] =
    useState(false);
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
  const activeViewResetKey =
    activeView === "search" ||
    activeView === "notifications" ||
    activeView === "login" ||
    activeView === "passwordResetEmail" ||
    activeView === "passwordResetPassword" ||
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

  const loadInitialContentData = useCallback(
    async (userId = currentUserId, options: { ignore?: () => boolean } = {}) => {
      await Promise.allSettled([
        loadRootSettings(userId, options),
        userApi.getUserPreferences(userId),
        newsApi.getNewsList(),
        newsApi.getRecentNewsViews(userId),
        welfareApi.getWelfarePolicyList("all"),
      ]);
    },
    [loadRootSettings],
  );

  useEffect(() => {
    let ignore = false;
    async function boot() {
      setIsSplashVisible(true);
      const storedUser = hydrateCurrentUserSession();

      if (storedUser) {
        setIsAuthenticated(true);
        setActiveView("home");
        await loadInitialContentData(storedUser.id, { ignore: () => ignore });
      } else {
        setIsAuthenticated(false);
        setActiveView("login");
        await Promise.resolve();
      }

      if (!ignore) {
        setIsSplashVisible(false);
      }
    }

    boot().catch(() => {
      if (!ignore) {
        setIsAuthenticated(false);
        setActiveView("login");
        setIsSplashVisible(false);
      }
    });

    return () => {
      ignore = true;
    };
  }, [loadInitialContentData]);

  useEffect(() => {
    if (!isAuthenticated && isProtectedView(activeView)) {
      setBodySearchSelection(null);
      setAllNewsEntryMotionClassName("");
      setIsAllNewsBreakingEntry(false);
      setSearchBackView("home");
      setActiveView("login");
    }
  }, [activeView, isAuthenticated]);

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

  function requireAuthenticatedView() {
    const storedUser = hydrateCurrentUserSession();

    if (storedUser) {
      setIsAuthenticated(true);
      return true;
    }

    setIsAuthenticated(false);
    setBodySearchSelection(null);
    setAllNewsEntryMotionClassName("");
    setIsAllNewsBreakingEntry(false);
    setSearchBackView("home");
    setActiveView("login");
    return false;
  }

  function openSearch() {
    if (!requireAuthenticatedView()) {
      return;
    }

    if (activeView !== "search") {
      setSearchBackView(
        activeView === "notifications" || isAuthView(activeView) ? "home" : activeView,
      );
    }

    setActiveView("search");
  }

  function openNotifications() {
    if (!requireAuthenticatedView()) {
      return;
    }

    if (activeView !== "notifications") {
      setSearchBackView(
        activeView === "search" || isAuthView(activeView) ? "home" : activeView,
      );
    }

    setActiveView("notifications");
  }

  function openDefaultTab(tab: Tab) {
    if (!requireAuthenticatedView()) {
      return;
    }

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
    if (!requireAuthenticatedView()) {
      return;
    }

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
      if (!isAuthView(current)) {
        return "signupAgreement";
      }

      const nextAuthView = getNextAuthView(current);

      return nextAuthView === "home" ? "signupAgreement" : nextAuthView;
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

  async function checkPasswordResetEmail(email: string) {
    const user = await userApi.getUserByEmail(email);

    return Boolean(user);
  }

  function startPasswordReset() {
    setAuthError("");
    setPasswordResetEmail("");
    setActiveView("passwordResetEmail");
  }

  function moveToPasswordResetPassword(email: string) {
    setAuthError("");
    setPasswordResetEmail(email);
    setActiveView("passwordResetPassword");
  }

  async function resetPassword(input: { nextPassword: string }) {
    if (!passwordResetEmail) {
      setAuthError("이메일 인증을 다시 진행해 주세요.");
      setActiveView("passwordResetEmail");
      return;
    }

    setAuthError("");
    setIsAuthSubmitting(true);

    try {
      const user = await userApi.getUserByEmail(passwordResetEmail);

      if (!user) {
        setAuthError("가입된 이메일을 찾을 수 없습니다.");
        setActiveView("passwordResetEmail");
        return;
      }

      await userApi.updateUser(user.id, {
        password: input.nextPassword,
      });

      setPasswordResetEmail("");
      setIsPasswordResetCompleteDialogOpen(true);
    } catch {
      setAuthError("비밀번호를 변경하지 못했습니다.");
    } finally {
      setIsAuthSubmitting(false);
    }
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
      setIsAuthenticated(true);
      setIsSplashVisible(true);
      await loadInitialContentData(user.id).catch(() => undefined);
      setActiveView("home");
      setIsSplashVisible(false);
    } catch {
      setAuthError("로그인 정보를 확인하지 못했습니다.");
      setIsSplashVisible(false);
    } finally {
      setIsAuthSubmitting(false);
    }
  }

  function logout() {
    clearCurrentUserSession();
    setIsAuthenticated(false);
    setIsSplashVisible(false);
    setAuthError("");
    setSignupDraft({});
    setPasswordResetEmail("");
    setBodySearchSelection(null);
    setAllNewsEntryMotionClassName("");
    setIsAllNewsBreakingEntry(false);
    setSearchBackView("home");
    setActiveView("login");
  }

  function startSignup() {
    setAuthError("");
    setIsAuthenticated(false);
    setSignupDraft({});
    setPasswordResetEmail("");
    setActiveView("signupAgreement");
  }

  function moveToPreviousAuthStep() {
    setAuthError("");
    setActiveView((current) => {
      if (!isAuthView(current)) {
        return "login";
      }

      return getPreviousAuthView(current);
    });
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
      const existingNicknameUser = await userApi.getUserByNickname(nextDraft.nickname);

      if (existingNicknameUser && existingNicknameUser.email !== nextDraft.email) {
        setAuthError("이미 사용 중인 닉네임입니다.");
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
        setIsAuthenticated(true);
        setIsSplashVisible(true);
        await loadInitialContentData(existingUser.id).catch(() => undefined);
        setSignupDraft({});
        setActiveView("home");
        setIsSplashVisible(false);
        return;
      }

      const user = await userApi.createUser({
        ageGroupId: nextDraft.ageGroupId,
        agreementIds: nextDraft.agreementIds,
        categoryIds: nextDraft.categoryIds ?? [],
        email: nextDraft.email,
        loginId: nextDraft.nickname,
        marketingAgreed: Boolean(nextDraft.marketingAgreed),
        nickname: nextDraft.nickname,
        password: nextDraft.password,
      });

      await ensureInitialUserSettings(user.id, {
        ageGroupId: user.ageGroupId,
        categoryIds: nextDraft.categoryIds ?? [],
      });

      setCurrentUserSession(user, { remember: true });
      setIsAuthenticated(true);
      setIsSplashVisible(true);
      await loadInitialContentData(user.id).catch(() => undefined);
      setSignupDraft({});
      setActiveView("home");
      setIsSplashVisible(false);
    } catch {
      setAuthError("회원가입 정보를 저장하지 못했습니다.");
      setIsSplashVisible(false);
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
    if (!requireAuthenticatedView()) {
      return;
    }

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
    if (!requireAuthenticatedView()) {
      return;
    }

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

  if (isSplashVisible) {
    return (
      <main className="newsroll_screen newsroll_screen_splash">
        <div className="newsroll_phone" aria-label="NewsRoll">
          <NewsRollSplashScreen />
        </div>
      </main>
    );
  }

  const effectiveView: View =
    !isAuthenticated && isProtectedView(activeView) ? "login" : activeView;
  const isEffectivePanelView =
    effectiveView === "policy" || effectiveView === "my" || effectiveView === "info";

  return (
    <main
      className={`newsroll_screen${effectiveView === "home" ? " newsroll_screen_home" : ""}${
        effectiveView === "all" ? " newsroll_screen_all" : ""
      }${
        effectiveView === "login" ||
        effectiveView === "passwordResetEmail" ||
        effectiveView === "passwordResetPassword" ||
        effectiveView === "signupAgreement" ||
        effectiveView === "signupEmail" ||
        effectiveView === "signupNickname" ||
        effectiveView === "signupPassword" ||
        effectiveView === "signupAge" ||
        effectiveView === "signupCategory"
          ? " newsroll_screen_login"
          : ""
      }${
        effectiveView === "search" || effectiveView === "notifications"
          ? " newsroll_screen_search"
          : ""
      }${isEffectivePanelView ? " newsroll_screen_panel" : ""}${
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
          key={`${effectiveView}-${activeViewResetKey}`}
          isAllNewsBreakingEntry={isAllNewsBreakingEntry}
          isAuthSubmitting={isAuthSubmitting}
          isTextLarge={isTextLarge}
          onAddBlockedKeyword={addBlockedKeyword}
          onAuthBack={moveToPreviousAuthStep}
          onCheckPasswordResetEmail={checkPasswordResetEmail}
          onCheckSignupEmail={checkSignupEmail}
          onCheckSignupNickname={checkSignupNickname}
          onDarkModeChange={setIsDarkMode}
          onDeleteBlockedKeyword={deleteBlockedKeyword}
          onToggleBlockedKeyword={toggleBlockedKeyword}
          onCloseSearch={() => setActiveView(searchBackView)}
          onLogin={loginWithEmail}
          onLogout={logout}
          onOpenBreakingNews={openBreakingNewsView}
          onOpenNotifications={openNotifications}
          onOpenSearch={openSearch}
          onPasswordResetEmailNext={moveToPasswordResetPassword}
          onPasswordResetPasswordSubmit={resetPassword}
          onPasswordResetStart={startPasswordReset}
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
          onSignupPasswordNext={(password) =>
            moveToNextAuthStepWithDraft({ password })
          }
          onSignupStart={startSignup}
          onToggleTextSize={() => setIsTextLarge((current) => !current)}
          view={effectiveView}
        />
      </div>

      {isPasswordResetCompleteDialogOpen ? (
        <ConfirmDialog
          message="비밀번호가 재설정되었습니다."
          onConfirm={() => {
            setIsPasswordResetCompleteDialogOpen(false);
            setActiveView("login");
          }}
        />
      ) : null}

      {isAuthenticated &&
      effectiveView !== "search" &&
      effectiveView !== "notifications" &&
      effectiveView !== "login" &&
      effectiveView !== "passwordResetEmail" &&
      effectiveView !== "passwordResetPassword" &&
      effectiveView !== "signupAgreement" &&
      effectiveView !== "signupEmail" &&
      effectiveView !== "signupNickname" &&
      effectiveView !== "signupPassword" &&
      effectiveView !== "signupAge" &&
      effectiveView !== "signupCategory" ? (
        <nav className="newsroll_bottom_nav" aria-label="하단 탐색">
          {navItems.map((item) => (
            <IconButton
              aria-current={effectiveView === item.tab ? "page" : undefined}
              icon={item.icon}
              key={item.label}
              label={item.label}
              onClick={() => openDefaultTab(item.tab)}
              variant="bottomNav"
            />
          ))}
        </nav>
      ) : null}
    </main>
  );
}
