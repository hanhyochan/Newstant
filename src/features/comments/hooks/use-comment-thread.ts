import { useCallback, useEffect, useState } from "react";

import {
  commentApi,
  pollApi,
  type Comment,
  type CommentReaction,
} from "@/app/_newsroll/api";
import { currentUserId } from "@/app/_newsroll/auth/current-user";
import {
  emptyCommentReactionCounts,
  type CommentId,
  type CommentReactionValue,
} from "../utils/comment-data";

export function useCommentThread(newsId?: string) {
  const [apiComments, setApiComments] = useState<Comment[]>([]);
  const [commentReactions, setCommentReactions] = useState<
    Record<CommentId, CommentReactionValue | null>
  >({});
  const [commentReactionRows, setCommentReactionRows] = useState<
    Record<CommentId, CommentReaction>
  >({});
  const [commentReactionCounts, setCommentReactionCounts] = useState<
    Record<CommentId, Record<CommentReactionValue, number>>
  >({});
  const [commentLoadFailed, setCommentLoadFailed] = useState(false);
  const [pollOptionLabelById, setPollOptionLabelById] = useState<Record<string, string>>(
    {},
  );

  const clearCommentThread = useCallback((failed = false) => {
    setApiComments([]);
    setCommentReactions({});
    setCommentReactionRows({});
    setCommentReactionCounts({});
    setPollOptionLabelById({});
    setCommentLoadFailed(failed);
  }, []);

  const reloadComments = useCallback(async () => {
    if (!newsId) {
      clearCommentThread(false);
      return;
    }

    const [nextComments, userReactions, allReactions, pollDetail] = await Promise.all([
      commentApi.getCommentsByNewsId(newsId),
      commentApi.getCommentReactionsByUserId(currentUserId),
      commentApi.getCommentReactions(),
      pollApi.getPoll(newsId),
    ]);
    const commentIdSet = new Set(nextComments.map((comment) => comment.id));
    const reactionRows = Object.fromEntries(
      userReactions
        .filter((reaction) => commentIdSet.has(reaction.commentId))
        .map((reaction) => [reaction.commentId, reaction]),
    );
    const reactionCounts = allReactions
      .filter((reaction) => commentIdSet.has(reaction.commentId))
      .reduce<Record<CommentId, Record<CommentReactionValue, number>>>(
        (counts, reaction) => {
          const currentCounts = counts[reaction.commentId] ?? {
            ...emptyCommentReactionCounts,
          };

          counts[reaction.commentId] = {
            ...currentCounts,
            [reaction.type]: currentCounts[reaction.type] + 1,
          };

          return counts;
        },
        {},
      );
    const reactionValues = Object.fromEntries(
      Object.entries(reactionRows).map(([commentId, reaction]) => [
        commentId,
        reaction.type,
      ]),
    );

    setApiComments(nextComments);
    setCommentReactionRows(reactionRows);
    setCommentReactionCounts(reactionCounts);
    setCommentReactions(reactionValues);
    setCommentLoadFailed(false);
    setPollOptionLabelById(
      Object.fromEntries(
        pollDetail?.options.map((option) => [option.id, option.label]) ?? [],
      ),
    );
  }, [clearCommentThread, newsId]);

  useEffect(() => {
    reloadComments().catch(() => {
      clearCommentThread(true);
    });
  }, [clearCommentThread, reloadComments]);

  return {
    apiComments,
    commentLoadFailed,
    commentReactionCounts,
    commentReactionRows,
    commentReactions,
    pollOptionLabelById,
    reloadComments,
    setApiComments,
    setCommentReactionCounts,
    setCommentReactions,
  };
}
