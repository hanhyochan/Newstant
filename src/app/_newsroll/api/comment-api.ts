import { createMockId, createTimestamp } from "./api-utils";
import { apiClient } from "./http-client";
import type {
  AddCommentReactionInput,
  Comment,
  CommentReaction,
  CreateCommentInput,
  UpdateCommentInput,
} from "./types";

export const commentApi = {
  getComments() {
    return apiClient.get<Comment[]>("/comments", {
      _sort: "createdAt",
      _order: "asc",
    });
  },
  getCommentsByNewsId(newsId: string) {
    return apiClient.get<Comment[]>("/comments", {
      newsId,
      _sort: "createdAt",
      _order: "asc",
    });
  },
  getCommentsByUserId(userId: string) {
    return apiClient.get<Comment[]>("/comments", {
      userId,
      _sort: "createdAt",
      _order: "desc",
    });
  },
  getCommentReactionsByUserId(userId: string) {
    return apiClient.get<CommentReaction[]>("/commentReactions", {
      userId,
    });
  },
  getCommentReactions() {
    return apiClient.get<CommentReaction[]>("/commentReactions");
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
  addCommentReaction(input: AddCommentReactionInput) {
    return apiClient.post<CommentReaction, CommentReaction>("/commentReactions", {
      id: createMockId("comment-reaction"),
      commentId: input.commentId,
      userId: input.userId,
      type: input.type,
      createdAt: createTimestamp(),
    });
  },
  removeCommentReaction(reactionId: string) {
    return apiClient.delete(`/commentReactions/${reactionId}`);
  },
  updateCommentReaction(reactionId: string, type: CommentReaction["type"]) {
    return apiClient.patch<CommentReaction, Pick<CommentReaction, "type">>(
      `/commentReactions/${reactionId}`,
      { type },
    );
  },
  updateCommentReactionCounts(
    commentId: string,
    input: Pick<Comment, "likeCount" | "dislikeCount">,
  ) {
    return apiClient.patch<Comment, Pick<Comment, "likeCount" | "dislikeCount">>(
      `/comments/${commentId}`,
      input,
    );
  },
};
