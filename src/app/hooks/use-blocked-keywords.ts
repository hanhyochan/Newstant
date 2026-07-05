import { useCallback, useMemo, useState } from "react";

import {
  getBlockedKeywordSettingsFromApi,
  normalizeBlockedKeyword,
} from "@/app/news-home-model";
import { currentUserId } from "@/shared/newsroll/auth/current-user";
import { settingsApi } from "@/shared/newsroll/api";
import type { BlockedKeywordSetting } from "@/features/news/model";

export function useBlockedKeywords() {
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

  const loadBlockedKeywordSettings = useCallback(
    async (userId = currentUserId, options: { ignore?: () => boolean } = {}) => {
      const keywords = await settingsApi.getBlockedKeywords(userId);

      if (options.ignore?.()) {
        return;
      }

      setBlockedKeywordSettings(getBlockedKeywordSettingsFromApi(keywords));
    },
    [],
  );

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

  return {
    addBlockedKeyword,
    blockedKeywords,
    blockedKeywordSettings,
    deleteBlockedKeyword,
    loadBlockedKeywordSettings,
    toggleBlockedKeyword,
  };
}