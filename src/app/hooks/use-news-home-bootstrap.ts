import { useEffect, type Dispatch, type SetStateAction } from "react";

import type { View } from "@/app/news-home-model";
import { hydrateCurrentUserSession } from "@/shared/newstant/auth/current-user";

type LoadInitialContentData = (
  userId?: string,
  options?: { ignore?: () => boolean },
) => Promise<void>;

const initialContentDataTimeoutMs = 3500;

function waitForInitialContentData(loadPromise: Promise<void>) {
  return new Promise<void>((resolve, reject) => {
    let isSettled = false;
    const timeoutId = window.setTimeout(() => {
      if (isSettled) {
        return;
      }

      isSettled = true;
      resolve();
    }, initialContentDataTimeoutMs);

    loadPromise.then(
      () => {
        if (isSettled) {
          return;
        }

        isSettled = true;
        window.clearTimeout(timeoutId);
        resolve();
      },
      (error) => {
        if (isSettled) {
          return;
        }

        isSettled = true;
        window.clearTimeout(timeoutId);
        reject(error);
      },
    );
  });
}

export function useNewsHomeBootstrap({
  loadInitialContentData,
  setActiveView,
  setIsAuthenticated,
  setIsSplashVisible,
}: {
  loadInitialContentData: LoadInitialContentData;
  setActiveView: Dispatch<SetStateAction<View>>;
  setIsAuthenticated: Dispatch<SetStateAction<boolean>>;
  setIsSplashVisible: Dispatch<SetStateAction<boolean>>;
}) {
  useEffect(() => {
    let ignore = false;
    async function boot() {
      setIsSplashVisible(true);
      const storedUser = hydrateCurrentUserSession();

      if (storedUser) {
        setIsAuthenticated(true);
        setActiveView("home");
        await waitForInitialContentData(
          loadInitialContentData(storedUser.id, { ignore: () => ignore }),
        );
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
  }, [loadInitialContentData, setActiveView, setIsAuthenticated, setIsSplashVisible]);
}