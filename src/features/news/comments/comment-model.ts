import type { CommentItem } from "@/features/comments/utils/comment-data";

const commentBodies = [
  "예시텍스트예시텍스트예시텍스트예시텍스트예시텍스트예시텍스트예시텍스트예시텍스트예시텍스트예시텍스트예시텍스트예시텍스트예시텍스트예시텍스트...",
  "예시텍스트예시텍스트예시텍스트예시텍스트예시텍스트예시텍스트예시텍스트예시텍스트예시텍스트예시텍스트예시텍스트예시텍스트...",
  "예시텍스트예시텍스트예시텍스트예시텍스트예시텍스트예시텍스트예시텍스트예시텍스트예시텍스트예시텍스트예시텍스트...",
];

export const commentTemplates: Omit<CommentItem, "choice">[] = [
  {
    author: "콩콩이",
    body: commentBodies[0],
    date: "0000년 00월 00일",
    dislikes: 0,
    id: "template-comment-1",
    likes: 0,
    replies: 13,
    userId: "template-user-1",
  },
  {
    author: "콩콩이",
    body: commentBodies[1],
    date: "0000년 00월 00일",
    dislikes: 0,
    id: "template-comment-2",
    likes: 0,
    replies: 13,
    userId: "template-user-2",
  },
  {
    author: "콩콩이",
    body: commentBodies[2],
    date: "0000년 00월 00일",
    dislikes: 0,
    id: "template-comment-3",
    likes: 0,
    replies: 13,
    userId: "template-user-3",
  },
];

export const commentReplyTemplates = [
  {
    author: "콩콩이",
    body: "예시텍스트예시텍스트예시텍스트예시텍스트예시텍스트예시텍스트예시텍스트예시텍스트예시텍스트예시텍스트예시텍스트~~",
    choice: "아모른직다",
    date: "0000년 00월 00일",
    dislikes: 0,
    isMine: true,
    likes: 0,
  },
  {
    author: "콩콩이",
    body: "예시텍스트예시텍스트예시텍스트예시텍스트예시텍스트예시텍스트예시텍스트예시텍스트예시텍스트예시텍스트~~",
    choice: "아모른직다",
    date: "0000년 00월 00일",
    dislikes: 0,
    likes: 0,
  },
];

export type CommentReplyItem = (typeof commentReplyTemplates)[number] & {
  id: string;
  isMine?: boolean;
  userId?: string;
};
