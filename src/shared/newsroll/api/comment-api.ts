import { createMockId, createTimestamp } from "./api-utils";
import { apiClient } from "./http-client";
import { currentUserId } from "../auth/current-user";
import { guestStorageApi } from "../guest-storage";
import type {
  AddCommentReactionInput,
  Comment,
  CommentReaction,
  CreateCommentInput,
  UpdateCommentInput,
} from "./types";

export const commentApi = {
  async getComments() {
    if (guestStorageApi.isGuestUserId(currentUserId)) {
      const [comments, guestComments] = await Promise.all([
        apiClient
          .get<Comment[]>("/comments", {
            _sort: "createdAt",
            _order: "asc",
          })
          .catch(() => []),
        guestStorageApi.getComments(),
      ]);

      return [...comments, ...guestComments];
    }

    return apiClient.get<Comment[]>("/comments", {
      _sort: "createdAt",
      _order: "asc",
    });
  },
  async getCommentsByNewsId(newsId: string) {
    if (guestStorageApi.isGuestUserId(currentUserId)) {
      const [comments, guestComments] = await Promise.all([
        apiClient
          .get<Comment[]>("/comments", {
            newsId,
            _sort: "createdAt",
            _order: "asc",
          })
          .catch(() => []),
        guestStorageApi.getCommentsByNewsId(newsId),
      ]);

      return [...comments, ...guestComments];
    }

    return apiClient.get<Comment[]>("/comments", {
      newsId,
      _sort: "createdAt",
      _order: "asc",
    });
  },
  getCommentsByUserId(userId: string) {
    if (guestStorageApi.isGuestUserId(userId)) {
      return guestStorageApi.getCommentsByUserId();
    }

    return apiClient.get<Comment[]>("/comments", {
      userId,
      _sort: "createdAt",
      _order: "desc",
    });
  },
  getCommentReactionsByUserId(userId: string) {
    if (guestStorageApi.isGuestUserId(userId)) {
      return guestStorageApi.getCommentReactionsByUserId();
    }

    return apiClient.get<CommentReaction[]>("/commentReactions", {
      userId,
    });
  },
  async getCommentReactions() {
    if (guestStorageApi.isGuestUserId(currentUserId)) {
      const [reactions, guestReactions] = await Promise.all([
        apiClient.get<CommentReaction[]>("/commentReactions").catch(() => []),
        guestStorageApi.getCommentReactions(),
      ]);

      return [...reactions, ...guestReactions];
    }

    return apiClient.get<CommentReaction[]>("/commentReactions");
  },
  createComment(input: CreateCommentInput) {
    if (guestStorageApi.isGuestUserId(input.userId)) {
      return guestStorageApi.createComment(input);
    }

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
    if (commentId.startsWith("guest-")) {
      return guestStorageApi.updateComment(commentId, input);
    }

    return apiClient.patch<Comment, UpdateCommentInput & Pick<Comment, "updatedAt">>(
      `/comments/${commentId}`,
      {
        ...input,
        updatedAt: createTimestamp(),
      },
    );
  },
  deleteComment(commentId: string) {
    if (commentId.startsWith("guest-")) {
      return guestStorageApi.deleteComment(commentId);
    }

    return apiClient.delete(`/comments/${commentId}`);
  },
  addCommentReaction(input: AddCommentReactionInput) {
    if (guestStorageApi.isGuestUserId(input.userId)) {
      return guestStorageApi.addCommentReaction(input);
    }

    return apiClient.post<CommentReaction, CommentReaction>("/commentReactions", {
      id: createMockId("comment-reaction"),
      commentId: input.commentId,
      userId: input.userId,
      type: input.type,
      createdAt: createTimestamp(),
    });
  },
  removeCommentReaction(reactionId: string) {
    if (reactionId.startsWith("guest-")) {
      return guestStorageApi.removeCommentReaction(reactionId);
    }

    return apiClient.delete(`/commentReactions/${reactionId}`);
  },
  updateCommentReaction(reactionId: string, type: CommentReaction["type"]) {
    if (reactionId.startsWith("guest-")) {
      return guestStorageApi.updateCommentReaction(reactionId, type);
    }

    return apiClient.patch<CommentReaction, Pick<CommentReaction, "type">>(
      `/commentReactions/${reactionId}`,
      { type },
    );
  },
  updateCommentReactionCounts(
    commentId: string,
    input: Pick<Comment, "likeCount" | "dislikeCount">,
  ) {
    if (commentId.startsWith("guest-")) {
      return guestStorageApi.updateCommentReactionCounts(commentId, input);
    }

    return apiClient.patch<Comment, Pick<Comment, "likeCount" | "dislikeCount">>(
      `/comments/${commentId}`,
      input,
    );
  },
};
