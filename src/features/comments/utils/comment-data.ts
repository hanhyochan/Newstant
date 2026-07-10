import type { Comment } from "@/shared/newstant/api";
import {
  currentUserId,
  getCurrentUserDisplayName,
} from "@/shared/newstant/auth/current-user";

export type CommentId = string;
export type CommentReactionValue = "like" | "dislike";

export type CommentItem = {
  author: string;
  body: string;
  choice: string;
  createdAt?: string;
  date: string;
  dislikes: number;
  id: CommentId;
  isMine?: boolean;
  likes: number;
  replies: number;
  userId: string;
};

export const emptyCommentReactionCounts: Record<CommentReactionValue, number> = {
  dislike: 0,
  like: 0,
};

export function formatCommentDate(_value: string) {
  return "0000년 00월 00일";
}

export function getCommentAuthor(userId: string) {
  return getCurrentUserDisplayName(userId);
}

export function getCommentChoice(
  comment: Comment,
  guideChoices: string[],
  pollOptionLabelById: Record<string, string>,
) {
  if (comment.pollOptionId && pollOptionLabelById[comment.pollOptionId]) {
    return pollOptionLabelById[comment.pollOptionId];
  }

  return guideChoices[0] ?? "전체";
}

export function getCommentItemFromApi(
  comment: Comment,
  guideChoices: string[],
  pollOptionLabelById: Record<string, string>,
  replyCount: number,
): CommentItem {
  return {
    author: getCommentAuthor(comment.userId),
    body: comment.content,
    choice: getCommentChoice(comment, guideChoices, pollOptionLabelById),
    createdAt: comment.createdAt,
    date: formatCommentDate(comment.createdAt),
    dislikes: comment.dislikeCount,
    id: comment.id,
    isMine: comment.userId === currentUserId,
    likes: comment.likeCount,
    replies: replyCount,
    userId: comment.userId,
  };
}
