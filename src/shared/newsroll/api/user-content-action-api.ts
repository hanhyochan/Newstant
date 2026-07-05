import { currentUserId } from "../auth/current-user";
import { createMockId, createTimestamp } from "./api-utils";
import { apiClient } from "./http-client";
import type {
  CreateUserContentActionInput,
  UserContentAction,
} from "./types";

export const userContentActionApi = {
  async getActions(userId = currentUserId) {
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
    return apiClient.delete(`/commentReports/${actionId}`);
  },
};
