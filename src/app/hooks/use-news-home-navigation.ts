import {
  useEffect,
  useRef,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";

import {
  getEnterFromRightMotionClassName,
  hasActiveEnterFromRightMotion,
  newsrollDetailRevealDelayMs as nextArticleRevealDelayMs,
  requestEnterFromRightExitMotion,
} from "@/design-system/templates";
import { isAuthView } from "@/features/auth/auth-flow";
import type { BodySearchSelection } from "@/features/search/model";
import type { Tab } from "@/features/shell/navigation";
import {
  getActiveViewResetKey,
  isProtectedView,
  type View,
} from "@/app/news-home-model";
import { hydrateCurrentUserSession } from "@/shared/newsroll/auth/current-user";

export function useNewsHomeNavigation({
  activeView,
  isAuthenticated,
  setActiveView,
  setBodySearchSelection,
  setIsAuthenticated,
}: {
  activeView: View;
  isAuthenticated: boolean;
  setActiveView: Dispatch<SetStateAction<View>>;
  setBodySearchSelection: Dispatch<SetStateAction<BodySearchSelection | null>>;
  setIsAuthenticated: Dispatch<SetStateAction<boolean>>;
}) {
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
  const activeViewResetKey = getActiveViewResetKey(activeView, viewResetKeys);

  useEffect(() => {
    if (!isAuthenticated && isProtectedView(activeView)) {
      setBodySearchSelection(null);
      setAllNewsEntryMotionClassName("");
      setIsAllNewsBreakingEntry(false);
      setSearchBackView("home");
      setActiveView("login");
    }
  }, [activeView, isAuthenticated, setActiveView, setBodySearchSelection]);

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

  return {
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
  };
}