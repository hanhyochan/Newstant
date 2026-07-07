import type { CommentId } from "@/features/comments/utils/comment-data";

export type CommentSortOrder = "latest" | "popular";
export type CommentAction = "block" | "delete" | "edit" | "hide" | "report";

export type CommentReportTarget = {
  targetId: string;
  targetType: "comment" | "reply";
  targetUserId: string;
};

export type CommentScrollTarget = {
  bottomGap?: number;
  delayMs?: number;
  id: string;
};

export const commentSortOptions: { label: string; value: CommentSortOrder }[] = [
  { label: "인기순", value: "popular" },
  { label: "최신순", value: "latest" },
];

export const myCommentActionOptions: { label: string; value: CommentAction }[] = [
  { label: "수정", value: "edit" },
  { label: "삭제", value: "delete" },
];

export const otherCommentActionOptions: { label: string; value: CommentAction }[] = [
  { label: "신고", value: "report" },
  { label: "숨기기", value: "hide" },
  { label: "차단", value: "block" },
];

export const commentReportReasons = [
  "스팸/광고",
  "욕설/비방",
  "혐오/차별",
  "개인정보 노출",
  "허위 정보",
  "기타",
];

export type CommentActionTargetId = CommentId | string;
