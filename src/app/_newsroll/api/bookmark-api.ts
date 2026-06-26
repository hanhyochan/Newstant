import { currentUserId } from "../auth/current-user";
import { createMockId, createTimestamp } from "./api-utils";
import { apiClient } from "./http-client";
import type { AddBookmarkInput, Bookmark } from "./types";

export const bookmarkApi = {
  getBookmarks(userId = currentUserId) {
    return apiClient.get<Bookmark[]>("/bookmarks", {
      userId,
      _sort: "createdAt",
      _order: "desc",
    });
  },
  addBookmark(input: AddBookmarkInput) {
    return apiClient.post<Bookmark, Bookmark>("/bookmarks", {
      id: createMockId("bookmark"),
      userId: input.userId,
      targetType: input.targetType,
      targetId: input.targetId,
      createdAt: createTimestamp(),
    });
  },
  removeBookmark(bookmarkId: string) {
    return apiClient.delete(`/bookmarks/${bookmarkId}`);
  },
};
