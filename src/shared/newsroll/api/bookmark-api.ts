import { currentUserId } from "../auth/current-user";
import { createMockId, createTimestamp } from "./api-utils";
import { guestStorageApi } from "../guest-storage";
import { apiClient } from "./http-client";
import type { AddBookmarkInput, Bookmark } from "./types";

export const bookmarkApi = {
  getBookmarks(userId = currentUserId) {
    if (guestStorageApi.isGuestUserId(userId)) {
      return guestStorageApi.getBookmarks();
    }

    return apiClient.get<Bookmark[]>("/bookmarks", {
      userId,
      _sort: "createdAt",
      _order: "desc",
    });
  },
  addBookmark(input: AddBookmarkInput) {
    if (guestStorageApi.isGuestUserId(input.userId)) {
      return guestStorageApi.addBookmark(input);
    }

    return apiClient.post<Bookmark, Bookmark>("/bookmarks", {
      id: createMockId("bookmark"),
      userId: input.userId,
      targetType: input.targetType,
      targetId: input.targetId,
      createdAt: createTimestamp(),
    });
  },
  removeBookmark(bookmarkId: string) {
    if (bookmarkId.startsWith("guest-")) {
      return guestStorageApi.removeBookmark(bookmarkId);
    }

    return apiClient.delete(`/bookmarks/${bookmarkId}`);
  },
};
