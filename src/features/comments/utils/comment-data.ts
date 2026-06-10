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

  return new Intl.DateTimeFormat("ko-KR", {
    day: "2-digit",
    hour: "2-digit",
    hour12: false,
    minute: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
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
  };
}
