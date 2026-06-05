import { createMockId, createTimestamp } from "./api-utils";
import { apiClient } from "./http-client";
import type { Comment, CreateCommentInput, UpdateCommentInput } from "./types";

export const commentApi = {
  getCommentsByNewsId(newsId: string) {
    return apiClient.get<Comment[]>("/comments", {
      newsId,
      _sort: "createdAt",
      _order: "asc",
    });
  },
  createComment(input: CreateCommentInput) {
    const now = createTimestamp();

    return apiClient.post<Comment, Comment>("/comments", {
      id: createMockId("comment"),
      newsId: input.newsId,
      userId: input.userId,
      parentId: input.parentId ?? null,
      pollOptionId: input.pollOptionId ?? null,
      content: input.content,
      likeCount: 0,
      dislikeCount: 0,
      replyCount: 0,
      createdAt: now,
      updatedAt: now,
    });
  },
  updateComment(commentId: string, input: UpdateCommentInput) {
    return apiClient.patch<Comment, UpdateCommentInput & Pick<Comment, "updatedAt">>(
      `/comments/${commentId}`,
      {
        ...input,
        updatedAt: createTimestamp(),
      },
    );
  },
  deleteComment(commentId: string) {
    return apiClient.delete(`/comments/${commentId}`);
  },
};
