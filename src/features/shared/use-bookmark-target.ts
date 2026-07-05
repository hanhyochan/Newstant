import { useCallback, useEffect, useState } from "react";

import { bookmarkApi, type BookmarkTargetType } from "@/shared/newsroll/api";
import { currentUserId } from "@/shared/newsroll/auth/current-user";

type UseBookmarkTargetOptions = {
  enabled?: boolean;
  onAfterAdd?: () => Promise<void> | void;
  targetId?: string;
  targetType: BookmarkTargetType;
  userId?: string;
};

export function useBookmarkTarget({
  enabled = true,
  onAfterAdd,
  targetId,
  targetType,
  userId = currentUserId,
}: UseBookmarkTargetOptions) {
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [bookmarkId, setBookmarkId] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;

    async function loadBookmarkState() {
      if (!enabled) {
        setIsBookmarked(false);
        setBookmarkId(null);
        return;
      }

      if (!targetId) {
        setIsBookmarked(false);
        setBookmarkId(null);
        return;
      }

      const bookmarks = await bookmarkApi.getBookmarks(userId);
      const bookmark = bookmarks.find(
        (entry) => entry.targetType === targetType && entry.targetId === targetId,
      );

      if (!ignore) {
        setIsBookmarked(Boolean(bookmark));
        setBookmarkId(bookmark?.id ?? null);
      }
    }

    loadBookmarkState().catch(() => {
      if (!ignore) {
        setIsBookmarked(false);
        setBookmarkId(null);
      }
    });

    return () => {
      ignore = true;
    };
  }, [enabled, targetId, targetType, userId]);

  const toggleBookmark = useCallback(async () => {
    if (!enabled) {
      return;
    }

    if (!targetId) {
      setIsBookmarked((current) => !current);
      return;
    }

    if (isBookmarked && bookmarkId) {
      setIsBookmarked(false);
      setBookmarkId(null);
      await bookmarkApi.removeBookmark(bookmarkId);
      return;
    }

    const bookmark = await bookmarkApi.addBookmark({
      targetId,
      targetType,
      userId,
    });
    await onAfterAdd?.();

    setIsBookmarked(true);
    setBookmarkId(bookmark.id);
  }, [bookmarkId, enabled, isBookmarked, onAfterAdd, targetId, targetType, userId]);

  return {
    isBookmarked,
    toggleBookmark,
  };
}
