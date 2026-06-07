import { mockCurrentUserId } from "../mock-current-user";
import { createMockId, createTimestamp } from "./api-utils";
import { apiClient } from "./http-client";
import type {
  BlockedKeywordPreference,
  CreateBlockedKeywordPreferenceInput,
  UpdateBlockedKeywordPreferenceInput,
  UpdateUserNewsViewTimeInput,
  UserNewsViewTime,
} from "./types";

export const settingsApi = {
  async getUserNewsViewTimes(userId = mockCurrentUserId) {
    const settings = await apiClient.get<UserNewsViewTime[]>("/userNewsViewTimes", {
      userId,
    });

    return settings[0] ?? null;
  },
  updateUserNewsViewTimes(
    settingsId: string,
    input: UpdateUserNewsViewTimeInput,
  ) {
    return apiClient.patch<
      UserNewsViewTime,
      UpdateUserNewsViewTimeInput & Pick<UserNewsViewTime, "updatedAt">
    >(`/userNewsViewTimes/${settingsId}`, {
      ...input,
      updatedAt: createTimestamp(),
    });
  },
  createUserNewsViewTimes(userId: string, times: string[]) {
    return apiClient.post<UserNewsViewTime, UserNewsViewTime>("/userNewsViewTimes", {
      id: createMockId("view-time"),
      userId,
      times,
      updatedAt: createTimestamp(),
    });
  },
  getBlockedKeywords(userId = mockCurrentUserId) {
    return apiClient.get<BlockedKeywordPreference[]>("/blockedKeywordSettings", {
      userId,
      _sort: "createdAt",
      _order: "asc",
    });
  },
  createBlockedKeyword(input: CreateBlockedKeywordPreferenceInput) {
    const now = createTimestamp();

    return apiClient.post<BlockedKeywordPreference, BlockedKeywordPreference>(
      "/blockedKeywordSettings",
      {
        id: createMockId("blocked-keyword"),
        userId: input.userId,
        keyword: input.keyword,
        isActive: input.isActive,
        createdAt: now,
        updatedAt: now,
      },
    );
  },
  updateBlockedKeyword(
    keywordId: string,
    input: UpdateBlockedKeywordPreferenceInput,
  ) {
    return apiClient.patch<
      BlockedKeywordPreference,
      UpdateBlockedKeywordPreferenceInput & Pick<BlockedKeywordPreference, "updatedAt">
    >(`/blockedKeywordSettings/${keywordId}`, {
      ...input,
      updatedAt: createTimestamp(),
    });
  },
  deleteBlockedKeyword(keywordId: string) {
    return apiClient.delete(`/blockedKeywordSettings/${keywordId}`);
  },
};
