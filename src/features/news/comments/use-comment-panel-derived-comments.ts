import { useMemo } from "react";

import type { Comment, UserContentAction } from "@/shared/newsroll/api";
import {
  emptyCommentReactionCounts,
  getCommentItemFromApi,
  type CommentId,
  type CommentItem,
} from "@/features/comments/utils/comment-data";
import type { CommentSortOrder } from "@/features/news/comments/comment-panel-model";

type CommentReactionCountsById = Record<
  string,
  { dislike: number; like: number }
>;

type UseCommentPanelDerivedCommentsOptions = {
  activeChoice: string;
  apiComments: Comment[];
  commentEditedValues: Record<string, string>;
  commentReactionCounts: CommentReactionCountsById;
  contentActions: UserContentAction[];
  deletedCommentIds: CommentId[];
  deletedReplyIds: string[];
  guideChoices: string[];
  myCommentsOnly: boolean;
  pollOptionLabelById: Record<string, string>;
  sortOrder: CommentSortOrder;
};

export function useCommentPanelDerivedComments({
  activeChoice,
  apiComments,
  commentEditedValues,
  commentReactionCounts,
  contentActions,
  deletedCommentIds,
  deletedReplyIds,
  guideChoices,
  myCommentsOnly,
  pollOptionLabelById,
  sortOrder,
}: UseCommentPanelDerivedCommentsOptions) {
  const deletedCommentIdSet = useMemo(
    () => new Set(deletedCommentIds),
    [deletedCommentIds],
  );
  const deletedReplyIdSet = useMemo(
    () => new Set(deletedReplyIds),
    [deletedReplyIds],
  );
  const blockedUserIdSet = useMemo(
    () =>
      new Set(
        contentActions
          .filter((action) => action.type === "block" && action.targetUserId)
          .map((action) => action.targetUserId as string),
      ),
    [contentActions],
  );
  const hiddenCommentIdSet = useMemo(
    () =>
      new Set(
        contentActions
          .filter(
            (action) =>
              action.type === "hide" && action.targetType === "comment",
          )
          .map((action) => action.targetId),
      ),
    [contentActions],
  );
  const hiddenReplyIdSet = useMemo(
    () =>
      new Set(
        contentActions
          .filter(
            (action) => action.type === "hide" && action.targetType === "reply",
          )
          .map((action) => action.targetId),
      ),
    [contentActions],
  );
  const commentsByParentId = useMemo(() => {
    const groups: Record<string, Comment[]> = {};

    apiComments.forEach((comment) => {
      if (!comment.parentId) {
        return;
      }

      groups[comment.parentId] = [...(groups[comment.parentId] ?? []), comment];
    });

    return groups;
  }, [apiComments]);
  const allComments = useMemo(
    () =>
      apiComments
        .filter((comment) => !comment.parentId)
        .map((comment) =>
          getCommentItemFromApi(
            comment,
            guideChoices,
            pollOptionLabelById,
            commentsByParentId[comment.id]?.length ?? 0,
          ),
        )
        .map((comment) => {
          const editedBody = commentEditedValues[String(comment.id)];

          return editedBody ? { ...comment, body: editedBody } : comment;
        })
        .filter(
          (comment) =>
            !deletedCommentIdSet.has(comment.id) &&
            !hiddenCommentIdSet.has(comment.id) &&
            !blockedUserIdSet.has(comment.userId),
        ),
    [
      apiComments,
      blockedUserIdSet,
      commentEditedValues,
      commentsByParentId,
      deletedCommentIdSet,
      guideChoices,
      hiddenCommentIdSet,
      pollOptionLabelById,
    ],
  );

  function getCommentReactionCounts(comment: { id: string }) {
    const counts = commentReactionCounts[comment.id] ?? emptyCommentReactionCounts;

    return {
      dislikes: counts.dislike,
      likes: counts.like,
    };
  }

  function getCommentPopularity(comment: CommentItem) {
    const { likes } = getCommentReactionCounts(comment);
    return likes + comment.replies;
  }

  const visibleComments = useMemo(
    () =>
      allComments
        .filter((comment) => (myCommentsOnly ? comment.isMine : true))
        .filter((comment) =>
          activeChoice === "all" ? true : comment.choice === activeChoice,
        )
        .sort((a, b) => {
          if (sortOrder === "latest") {
            return (
              new Date(b.createdAt ?? 0).getTime() -
              new Date(a.createdAt ?? 0).getTime()
            );
          }

          return (
            getCommentPopularity(b) - getCommentPopularity(a) ||
            new Date(b.createdAt ?? 0).getTime() -
              new Date(a.createdAt ?? 0).getTime()
          );
        }),
    [
      activeChoice,
      allComments,
      commentReactionCounts,
      myCommentsOnly,
      sortOrder,
    ],
  );

  return {
    allComments,
    blockedUserIdSet,
    commentsByParentId,
    deletedReplyIdSet,
    getCommentReactionCounts,
    hiddenReplyIdSet,
    visibleComments,
  };
}
