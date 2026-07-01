import { useCallback, useEffect, useState } from "react";

import {
  newsApi,
  type ArticleReactionType,
} from "@/app/_newsroll/api";
import { currentUserId } from "@/app/_newsroll/auth/current-user";

export type ArticleReaction = ArticleReactionType | null;
export type ArticleReactionCounts = Record<ArticleReactionType, number>;

export const emptyArticleReactionCounts: ArticleReactionCounts = {
  dislike: 0,
  like: 0,
  neutral: 0,
};

function getArticleReactionCounts(
  reactions: { type: ArticleReactionType }[],
): ArticleReactionCounts {
  return reactions.reduce<ArticleReactionCounts>(
    (counts, reaction) => ({
      ...counts,
      [reaction.type]: counts[reaction.type] + 1,
    }),
    { ...emptyArticleReactionCounts },
  );
}

export function useArticleReaction({
  newsId,
  onAfterChange,
  userId = currentUserId,
}: {
  newsId?: string;
  onAfterChange?: () => Promise<void> | void;
  userId?: string;
}) {
  const [reaction, setReaction] = useState<ArticleReaction>(null);
  const [articleReactionId, setArticleReactionId] = useState<string | null>(null);
  const [articleReactionCounts, setArticleReactionCounts] = useState<ArticleReactionCounts>(
    { ...emptyArticleReactionCounts },
  );

  useEffect(() => {
    let ignore = false;

    async function loadArticleReactionState() {
      if (!newsId) {
        setReaction(null);
        setArticleReactionId(null);
        setArticleReactionCounts({ ...emptyArticleReactionCounts });
        return;
      }

      const [nextReaction, nextReactions] = await Promise.all([
        newsApi.getNewsReaction(newsId, userId),
        newsApi.getNewsReactions(newsId),
      ]);

      if (!ignore) {
        setReaction(nextReaction?.type ?? null);
        setArticleReactionId(nextReaction?.id ?? null);
        setArticleReactionCounts(getArticleReactionCounts(nextReactions));
      }
    }

    loadArticleReactionState().catch(() => {
      if (!ignore) {
        setReaction(null);
        setArticleReactionId(null);
        setArticleReactionCounts({ ...emptyArticleReactionCounts });
      }
    });

    return () => {
      ignore = true;
    };
  }, [newsId, userId]);

  const toggleArticleReaction = useCallback(async (nextReaction: ArticleReaction) => {
    if (!newsId) {
      return;
    }

    const previousReaction = reaction;

    setReaction(nextReaction);
    setArticleReactionCounts((currentCounts) => {
      const nextCounts = { ...currentCounts };

      if (previousReaction) {
        nextCounts[previousReaction] = Math.max(0, nextCounts[previousReaction] - 1);
      }
      if (nextReaction) {
        nextCounts[nextReaction] += 1;
      }

      return nextCounts;
    });

    if (nextReaction === null) {
      if (articleReactionId) {
        setArticleReactionId(null);
        await newsApi.removeNewsReaction(articleReactionId);
      }
      return;
    }

    if (articleReactionId) {
      await newsApi.updateNewsReaction(articleReactionId, nextReaction);
      await onAfterChange?.();
      return;
    }

    const createdReaction = await newsApi.addNewsReaction({
      newsId,
      type: nextReaction,
      userId,
    });
    await onAfterChange?.();

    setArticleReactionId(createdReaction.id);
  }, [articleReactionId, newsId, onAfterChange, reaction, userId]);

  return {
    articleReactionCounts,
    reaction,
    toggleArticleReaction,
  };
}
