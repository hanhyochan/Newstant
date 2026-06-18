import type { Comment } from "@/app/_newsroll/api";
import {
  currentUserId,
  getCurrentUserDisplayName,
} from "@/app/_newsroll/auth/current-user";

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

export function formatCommentDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hour = String(date.getHours()).padStart(2, "0");
  const minute = String(date.getMinutes()).padStart(2, "0");

  return `${year}.${month}.${day}. ${hour}:${minute}`;
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
