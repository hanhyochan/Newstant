import { currentUserId } from "../auth/current-user";
import { createMockId, createTimestamp } from "./api-utils";
import { guestStorageApi } from "../guest-storage";
import { apiClient } from "./http-client";
import type {
  CreateUserContentActionInput,
  UserContentAction,
} from "./types";

export const userContentActionApi = {
  async getActions(userId = currentUserId) {
    if (guestStorageApi.isGuestUserId(userId)) {
      return guestStorageApi.getActions();
    }

    const actions = await apiClient.get<
      Array<UserContentAction & { commentId?: string }>
    >("/commentReports", {
      _order: "desc",
      _sort: "createdAt",
      userId,
    });

    return actions.map((action) => ({
      ...action,
      targetId: action.targetId ?? action.commentId ?? "",
      targetType: action.targetType ?? "comment",
    }));
  },
  createAction(input: CreateUserContentActionInput) {
    if (guestStorageApi.isGuestUserId(input.userId)) {
      return guestStorageApi.createAction(input);
    }

    const timestamp = createTimestamp();

    return apiClient.post<UserContentAction, UserContentAction>(
      "/commentReports",
      {
        id: createMockId("comment-action"),
        ...input,
        createdAt: timestamp,
        updatedAt: timestamp,
      },
    );
  },
  deleteAction(actionId: string) {
    if (actionId.startsWith("guest-")) {
      return guestStorageApi.deleteAction(actionId);
    }

    return apiClient.delete(`/commentReports/${actionId}`);
  },
};
