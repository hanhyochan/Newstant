"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
} from "react";
import dynamic from "next/dynamic";

import { IconButton } from "@/design-system/components";
import {
  getNextAuthView,
  getPreviousAuthView,
  isAuthView,
} from "@/features/auth/auth-flow";
import {
  getSignupAgeGroupId,
  getSignupCategoryId,
  isProtectedView,
  type SignupDraft,
  type View,
} from "@/app/news-home-model";
import { useBlockedKeywords } from "@/app/hooks/use-blocked-keywords";
import { useNewsHomeBootstrap } from "@/app/hooks/use-news-home-bootstrap";
import { useNewsHomeNavigation } from "@/app/hooks/use-news-home-navigation";
import {
  getHomeArticleFromNews,
  type BlockedKeywordSetting,
} from "@/features/news/model";
import type {
  BodySearchSelection,
  BodySearchSelectionInput,
} from "@/features/search/model";
import { navItems, type Tab } from "@/features/shell/navigation";
import { getPolicyItemFromWelfarePolicy } from "@/features/policy/model";
import { ConfirmDialog } from "@/features/shared/ConfirmDialog";
import { getDataUnavailableMessage } from "@/features/shared/DataUnavailableMessage";
import {
  newsApi,
  notificationApi,
  userApi,
  welfareApi,
  type AppNotification
} from "@/shared/newsroll/api";
import {
  clearCurrentUserSession,
  currentUserId,
  getStoredCurrentUserSession,
  setCurrentUserSession,
} from "@/shared/newsroll/auth/current-user";

const AllNewsView = dynamic<any>(
  () => import("@/features/all-news/AllNewsView").then((module) => module.AllNewsView),
  { loading: () => null, ssr: false },
);
const HomeView = dynamic<any>(
  () => import("@/features/home/HomeView").then((module) => module.HomeView),
  { loading: () => null, ssr: false },
);
const InfoView = dynamic<any>(
  () => import("@/features/info/InfoView").then((module) => module.InfoView),
  { loading: () => null, ssr: false },
);
const MyPageView = dynamic<any>(
  () => import("@/features/my-page/MyPageView").then((module) => module.MyPageView),
  { loading: () => null, ssr: false },
);
const NotificationView = dynamic<any>(
  () =>
    import("@/features/notifications/NotificationView").then(
      (module) => module.NotificationView,
    ),
  { loading: () => null, ssr: false },
);
const PolicyView = dynamic<any>(
  () => import("@/features/policy/PolicyView").then((module) => module.PolicyView),
  { loading: () => null, ssr: false },
);
const SearchView = dynamic<any>(
  () => import("@/features/search/SearchView").then((module) => module.SearchView),
  { loading: () => null, ssr: false },
);
const LoginView = dynamic<any>(
  () => import("@/features/auth/login/LoginView").then((module) => module.LoginView),
  { loading: () => null, ssr: false },
);
const PasswordResetPasswordView = dynamic<any>(
  () =>
    import("@/features/auth/password-reset/PasswordResetPasswordView").then(
      (module) => module.PasswordResetPasswordView,
    ),
  { loading: () => null, ssr: false },
);
const SignupAgeView = dynamic<any>(
  () =>
    import("@/features/auth/signup/SignupAgeView").then(
      (module) => module.SignupAgeView,
    ),
  { loading: () => null, ssr: false },
);
const SignupCategoryView = dynamic<any>(
  () =>
    import("@/features/auth/signup/SignupCategoryView").then(
      (module) => module.SignupCategoryView,
    ),
  { loading: () => null, ssr: false },
);
const PasswordResetEmailView = dynamic<any>(
  () =>
    import("@/features/auth/AuthViews").then(
      (module) => module.PasswordResetEmailView,
    ),
  { loading: () => null, ssr: false },
);
const SignupAgreementView = dynamic<any>(
  () =>
    import("@/features/auth/AuthViews").then(
      (module) => module.SignupAgreementView,
    ),
  { loading: () => null, ssr: false },
);
const SignupEmailView = dynamic<any>(
  () =>
    import("@/features/auth/AuthViews").then((module) => module.SignupEmailView),
  { loading: () => null, ssr: false },
);
const SignupNicknameView = dynamic<any>(
  () =>
    import("@/features/auth/AuthViews").then(
      (module) => module.SignupNicknameView,
    ),
  { loading: () => null, ssr: false },
);
const SignupPasswordView = dynamic<any>(
  () =>
    import("@/features/auth/AuthViews").then(
      (module) => module.SignupPasswordView,
    ),
  { loading: () => null, ssr: false },
);

function NewsRollSplashScreen() {
  return (
    <section className="container_newsrollSplash" aria-label="NewsRoll 로딩">
      <img
        alt=""
        aria-hidden="true"
        className="box_newsrollSplashLogo"
        height={57}
        src="/images/logo.svg"
        width={90}
      />
    </section>
  );
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
        ".phone, .policy_screen, .container_myScreen, .info_screen",
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
        blockedKeywords={blockedKeywords}
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
  const {
    addBlockedKeyword,
    blockedKeywords,
    blockedKeywordSettings,
    deleteBlockedKeyword,
    loadBlockedKeywordSettings,
    toggleBlockedKeyword,
  } = useBlockedKeywords();  const {
    activeViewResetKey,
    allNewsEntryMotionClassName,
    isAllNewsBreakingEntry,
    openBreakingNewsView,
    openDefaultTab,
    openNotifications,
    openSearch,
    requireAuthenticatedView,
    searchBackView,
    setAllNewsEntryMotionClassName,
    setIsAllNewsBreakingEntry,
    setSearchBackView,
    setViewResetKeys,
  } = useNewsHomeNavigation({
    activeView,
    isAuthenticated,
    setActiveView,
    setBodySearchSelection,
    setIsAuthenticated,
  });

  useLayoutEffect(() => {
    resetNewsRollViewport();
  }, [activeView, activeViewResetKey]);

  const loadRootSettings = useCallback(
    async (userId = currentUserId, options: { ignore?: () => boolean } = {}) => {
      const [, notifications] = await Promise.all([
        loadBlockedKeywordSettings(userId, options),
        notificationApi.getNotificationSettings(userId),
      ]);

      if (options.ignore?.()) {
        return;
      }

      setIsDarkMode(notifications?.darkMode ?? false);
    },
    [loadBlockedKeywordSettings],
  );

  const warmInitialContentData = useCallback((userId = currentUserId) => {
    void Promise.allSettled([
      userApi.getUserPreferences(userId),
      newsApi.getNewsList(),
      newsApi.getRecentNewsViews(userId),
      welfareApi.getWelfarePolicyList("all"),
    ]);
  }, []);

  const loadInitialContentData = useCallback(
    async (userId = currentUserId, options: { ignore?: () => boolean } = {}) => {
      await loadRootSettings(userId, options);

      if (!options.ignore?.()) {
        warmInitialContentData(userId);
      }
    },
    [loadRootSettings, warmInitialContentData],
  );

  useNewsHomeBootstrap({
    loadInitialContentData,
    setActiveView,
    setIsAuthenticated,
    setIsSplashVisible,
  });

  function openNextAuthStep() {
    setActiveView((current) => {
      if (!isAuthView(current)) {
        return "signupAgreement";
      }

      const nextAuthView = getNextAuthView(current);

      return nextAuthView === "home" ? "signupAgreement" : nextAuthView;
    });
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
      <main className="screen screen_splash">
        <div className="phone" aria-label="NewsRoll">
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
      className={`screen${effectiveView === "home" ? " screen_home" : ""}${
        effectiveView === "all" ? " screen_all" : ""
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
          ? " screen_login"
          : ""
      }${
        effectiveView === "search" || effectiveView === "notifications"
          ? " screen_search"
          : ""
      }${isEffectivePanelView ? " screen_panel" : ""}${
        isTextLarge ? " text_large" : ""
      }${isDarkMode ? " dark" : ""}`}
    >
      <div className="phone" aria-label="NewsRoll">
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
        <nav className="bottom_nav" aria-label="하단 탐색">
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
