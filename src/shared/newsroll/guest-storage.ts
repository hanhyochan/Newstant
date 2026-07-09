import { guestUserId, isGuestUserId } from "./auth/current-user";
import { createMockId, createTimestamp } from "./api/api-utils";
import type {
  AddArticleReactionInput,
  AddBookmarkInput,
  AddCommentReactionInput,
  AddRecentNewsViewInput,
  AppNotification,
  ArticleReaction,
  ArticleReactionType,
  BlockedKeywordPreference,
  Bookmark,
  Comment,
  CommentReaction,
  CommentReactionType,
  CreateBlockedKeywordPreferenceInput,
  CreateCommentInput,
  CreateInquiryInput,
  CreateNotificationSettingsInput,
  CreateUserContentActionInput,
  Inquiry,
  NotificationSettings,
  PollVote,
  RecentNewsView,
  SubmitPollVoteInput,
  UpdateBlockedKeywordPreferenceInput,
  UpdateCommentInput,
  UpdateNotificationSettingsInput,
  UpdateUserNewsViewTimeInput,
  User,
  UserContentAction,
  UserNewsViewTime,
  UserPreference,
} from "./api/types";

const guestStoragePrefix = "newsroll.guest.";

type GuestStore = {
  articleReactions: ArticleReaction[];
  blockedKeywords: BlockedKeywordPreference[];
  bookmarks: Bookmark[];
  commentReactions: CommentReaction[];
  comments: Comment[];
  contentActions: UserContentAction[];
  inquiries: Inquiry[];
  notificationSettings: NotificationSettings | null;
  notifications: AppNotification[];
  pollVotes: PollVote[];
  recentNewsViews: RecentNewsView[];
  userNewsViewTimes: UserNewsViewTime | null;
  userPreferences: UserPreference[];
};

const initialGuestStore: GuestStore = {
  articleReactions: [],
  blockedKeywords: [],
  bookmarks: [],
  commentReactions: [],
  comments: [],
  contentActions: [],
  inquiries: [],
  notificationSettings: null,
  notifications: [],
  pollVotes: [],
  recentNewsViews: [],
  userNewsViewTimes: null,
  userPreferences: [
    {
      id: "guest-user-preference",
      userId: guestUserId,
      categoryIds: ["politics"],
      pressIds: ["joongang", "kukmin", "hani"],
      ageGroupId: "youth",
      updatedAt: createTimestamp(),
    },
  ],
};

export const guestUser: User = {
  id: guestUserId,
  loginId: "guest",
  nickname: "\uAC8C\uC2A4\uD2B8",
  email: "guest@newstant.local",
  password: "",
  ageGroupId: "youth",
  agreementIds: [],
  marketingAgreed: false,
  createdAt: createTimestamp(),
  updatedAt: createTimestamp(),
};

function cloneGuestStore(store: GuestStore): GuestStore {
  return JSON.parse(JSON.stringify(store)) as GuestStore;
}

function getGuestStorageKey() {
  return `${guestStoragePrefix}store`;
}

function readGuestStore(): GuestStore {
  if (typeof window === "undefined") {
    return cloneGuestStore(initialGuestStore);
  }

  const stored = window.localStorage.getItem(getGuestStorageKey());

  if (!stored) {
    const nextStore = cloneGuestStore(initialGuestStore);

    window.localStorage.setItem(getGuestStorageKey(), JSON.stringify(nextStore));
    return nextStore;
  }

  try {
    return {
      ...cloneGuestStore(initialGuestStore),
      ...(JSON.parse(stored) as Partial<GuestStore>),
    };
  } catch {
    return cloneGuestStore(initialGuestStore);
  }
}

function writeGuestStore(store: GuestStore) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(getGuestStorageKey(), JSON.stringify(store));
}

function sortDescBy<T>(items: T[], field: keyof T) {
  return [...items].sort((a, b) =>
    String(b[field]).localeCompare(String(a[field])),
  );
}

function sortAscBy<T>(items: T[], field: keyof T) {
  return [...items].sort((a, b) =>
    String(a[field]).localeCompare(String(b[field])),
  );
}

export function clearGuestStorage() {
  if (typeof window === "undefined") {
    return;
  }

  Object.keys(window.localStorage)
    .filter((key) => key.startsWith(guestStoragePrefix))
    .forEach((key) => window.localStorage.removeItem(key));
}

export const guestStorageApi = {
  isGuestUserId,
  getUser() {
    return Promise.resolve(guestUser);
  },
  getUsers() {
    return Promise.resolve([guestUser]);
  },
  getUserPreferences() {
    return Promise.resolve(readGuestStore().userPreferences);
  },
  updateUserPreferences(preferenceId: string, input: Partial<UserPreference>) {
    const store = readGuestStore();
    const updatedAt = createTimestamp();
    let nextPreference = store.userPreferences.find(
      (preference) => preference.id === preferenceId,
    );

    if (!nextPreference) {
      nextPreference = {
        id: preferenceId,
        userId: guestUserId,
        categoryIds: ["politics"],
        pressIds: ["joongang", "kukmin", "hani"],
        ageGroupId: "youth",
        updatedAt,
      };
      store.userPreferences.push(nextPreference);
    }

    Object.assign(nextPreference, input, { userId: guestUserId, updatedAt });
    writeGuestStore(store);

    return Promise.resolve(nextPreference);
  },
  getBookmarks() {
    return Promise.resolve(sortDescBy(readGuestStore().bookmarks, "createdAt"));
  },
  addBookmark(input: AddBookmarkInput) {
    const store = readGuestStore();
    const existing = store.bookmarks.find(
      (bookmark) =>
        bookmark.userId === guestUserId &&
        bookmark.targetId === input.targetId &&
        bookmark.targetType === input.targetType,
    );

    if (existing) {
      return Promise.resolve(existing);
    }

    const bookmark: Bookmark = {
      id: createMockId("guest-bookmark"),
      userId: guestUserId,
      targetType: input.targetType,
      targetId: input.targetId,
      createdAt: createTimestamp(),
    };

    store.bookmarks.unshift(bookmark);
    writeGuestStore(store);

    return Promise.resolve(bookmark);
  },
  removeBookmark(bookmarkId: string) {
    const store = readGuestStore();

    store.bookmarks = store.bookmarks.filter((bookmark) => bookmark.id !== bookmarkId);
    writeGuestStore(store);

    return Promise.resolve();
  },
  getNewsReaction(newsId: string) {
    return Promise.resolve(
      readGuestStore().articleReactions.find(
        (reaction) => reaction.newsId === newsId,
      ) ?? null,
    );
  },
  getNewsReactions(newsId: string) {
    return Promise.resolve(
      readGuestStore().articleReactions.filter(
        (reaction) => reaction.newsId === newsId,
      ),
    );
  },
  addNewsReaction(input: AddArticleReactionInput) {
    const store = readGuestStore();
    const reaction: ArticleReaction = {
      id: createMockId("guest-article-reaction"),
      newsId: input.newsId,
      userId: guestUserId,
      type: input.type,
      createdAt: createTimestamp(),
    };

    store.articleReactions = store.articleReactions.filter(
      (item) => item.newsId !== input.newsId,
    );
    store.articleReactions.push(reaction);
    writeGuestStore(store);

    return Promise.resolve(reaction);
  },
  updateNewsReaction(reactionId: string, type: ArticleReactionType) {
    const store = readGuestStore();
    const reaction = store.articleReactions.find((item) => item.id === reactionId);

    if (reaction) {
      reaction.type = type;
      writeGuestStore(store);
    }

    return Promise.resolve(reaction ?? null);
  },
  removeNewsReaction(reactionId: string) {
    const store = readGuestStore();

    store.articleReactions = store.articleReactions.filter(
      (reaction) => reaction.id !== reactionId,
    );
    writeGuestStore(store);

    return Promise.resolve();
  },
  getRecentNewsViews() {
    return Promise.resolve(
      sortDescBy(readGuestStore().recentNewsViews, "viewedAt"),
    );
  },
  addRecentNewsView(input: AddRecentNewsViewInput) {
    const store = readGuestStore();
    const viewedAt = createTimestamp();
    const existing = store.recentNewsViews.find(
      (view) => view.newsId === input.newsId,
    );

    if (existing) {
      existing.viewedAt = viewedAt;
      writeGuestStore(store);
      return Promise.resolve(existing);
    }

    const recentView: RecentNewsView = {
      id: createMockId("guest-recent"),
      userId: guestUserId,
      newsId: input.newsId,
      viewedAt,
    };

    store.recentNewsViews.unshift(recentView);
    writeGuestStore(store);

    return Promise.resolve(recentView);
  },
  deleteRecentNewsView(viewId: string) {
    const store = readGuestStore();

    store.recentNewsViews = store.recentNewsViews.filter((view) => view.id !== viewId);
    writeGuestStore(store);

    return Promise.resolve();
  },
  getComments() {
    return Promise.resolve(sortAscBy(readGuestStore().comments, "createdAt"));
  },
  getCommentsByNewsId(newsId: string) {
    return Promise.resolve(
      sortAscBy(
        readGuestStore().comments.filter((comment) => comment.newsId === newsId),
        "createdAt",
      ),
    );
  },
  getCommentsByUserId() {
    return Promise.resolve(sortDescBy(readGuestStore().comments, "createdAt"));
  },
  createComment(input: CreateCommentInput) {
    const store = readGuestStore();
    const now = createTimestamp();
    const comment: Comment = {
      id: createMockId("guest-comment"),
      newsId: input.newsId,
      userId: guestUserId,
      parentId: input.parentId ?? null,
      pollOptionId: input.pollOptionId ?? null,
      content: input.content,
      likeCount: 0,
      dislikeCount: 0,
      replyCount: 0,
      createdAt: now,
      updatedAt: now,
    };

    store.comments.push(comment);

    if (comment.parentId) {
      const parent = store.comments.find((item) => item.id === comment.parentId);

      if (parent) {
        parent.replyCount += 1;
      }
    }

    writeGuestStore(store);

    return Promise.resolve(comment);
  },
  updateComment(commentId: string, input: UpdateCommentInput) {
    const store = readGuestStore();
    const comment = store.comments.find((item) => item.id === commentId);

    if (!comment) {
      return Promise.resolve(null);
    }

    comment.content = input.content;
    comment.updatedAt = createTimestamp();
    writeGuestStore(store);

    return Promise.resolve(comment);
  },
  deleteComment(commentId: string) {
    const store = readGuestStore();
    const deletedIds = new Set<string>([commentId]);

    store.comments
      .filter((comment) => comment.parentId === commentId)
      .forEach((comment) => deletedIds.add(comment.id));
    store.comments = store.comments.filter((comment) => !deletedIds.has(comment.id));
    store.commentReactions = store.commentReactions.filter(
      (reaction) => !deletedIds.has(reaction.commentId),
    );
    writeGuestStore(store);

    return Promise.resolve();
  },
  getCommentReactions() {
    return Promise.resolve(readGuestStore().commentReactions);
  },
  getCommentReactionsByUserId() {
    return Promise.resolve(readGuestStore().commentReactions);
  },
  addCommentReaction(input: AddCommentReactionInput) {
    const store = readGuestStore();
    const reaction: CommentReaction = {
      id: createMockId("guest-comment-reaction"),
      commentId: input.commentId,
      userId: guestUserId,
      type: input.type,
      createdAt: createTimestamp(),
    };

    store.commentReactions = store.commentReactions.filter(
      (item) => item.commentId !== input.commentId,
    );
    store.commentReactions.push(reaction);
    writeGuestStore(store);

    return Promise.resolve(reaction);
  },
  updateCommentReaction(reactionId: string, type: CommentReactionType) {
    const store = readGuestStore();
    const reaction = store.commentReactions.find((item) => item.id === reactionId);

    if (reaction) {
      reaction.type = type;
      writeGuestStore(store);
    }

    return Promise.resolve(reaction ?? null);
  },
  removeCommentReaction(reactionId: string) {
    const store = readGuestStore();

    store.commentReactions = store.commentReactions.filter(
      (reaction) => reaction.id !== reactionId,
    );
    writeGuestStore(store);

    return Promise.resolve();
  },
  updateCommentReactionCounts(
    commentId: string,
    input: Pick<Comment, "likeCount" | "dislikeCount">,
  ) {
    const store = readGuestStore();
    const comment = store.comments.find((item) => item.id === commentId);

    if (comment) {
      comment.likeCount = input.likeCount;
      comment.dislikeCount = input.dislikeCount;
      writeGuestStore(store);
    }

    return Promise.resolve(comment ?? null);
  },
  getPollVotes() {
    return Promise.resolve(readGuestStore().pollVotes);
  },
  getPollVotesByUserId() {
    return Promise.resolve(sortDescBy(readGuestStore().pollVotes, "createdAt"));
  },
  submitPollVote(input: SubmitPollVoteInput) {
    const store = readGuestStore();
    const vote: PollVote = {
      id: createMockId("guest-poll-vote"),
      pollId: input.pollId,
      pollOptionId: input.pollOptionId,
      userId: guestUserId,
      createdAt: createTimestamp(),
    };

    store.pollVotes = store.pollVotes.filter((item) => item.pollId !== input.pollId);
    store.pollVotes.push(vote);
    writeGuestStore(store);

    return Promise.resolve(vote);
  },
  updatePollVote(voteId: string, pollOptionId: string) {
    const store = readGuestStore();
    const vote = store.pollVotes.find((item) => item.id === voteId);

    if (vote) {
      vote.pollOptionId = pollOptionId;
      vote.createdAt = createTimestamp();
      writeGuestStore(store);
    }

    return Promise.resolve(vote ?? null);
  },
  removePollVote(voteId: string) {
    const store = readGuestStore();

    store.pollVotes = store.pollVotes.filter((vote) => vote.id !== voteId);
    writeGuestStore(store);

    return Promise.resolve();
  },
  getNotificationSettings() {
    return Promise.resolve(readGuestStore().notificationSettings);
  },
  createNotificationSettings(input: CreateNotificationSettingsInput) {
    const store = readGuestStore();
    const settings: NotificationSettings = {
      id: "guest-notification-settings",
      userId: guestUserId,
      breakingNews: input.breakingNews ?? true,
      commentReplies: input.commentReplies ?? true,
      inquiryReplies: input.inquiryReplies ?? true,
      newsViewTime: input.newsViewTime ?? true,
      policyUpdates: input.policyUpdates ?? true,
      darkMode: input.darkMode ?? false,
      updatedAt: createTimestamp(),
    };

    store.notificationSettings = settings;
    writeGuestStore(store);

    return Promise.resolve(settings);
  },
  updateNotificationSettings(
    settingsId: string,
    input: UpdateNotificationSettingsInput,
  ) {
    const store = readGuestStore();
    const settings = store.notificationSettings ?? {
      id: settingsId,
      userId: guestUserId,
      breakingNews: true,
      commentReplies: true,
      inquiryReplies: true,
      newsViewTime: true,
      policyUpdates: true,
      darkMode: false,
      updatedAt: createTimestamp(),
    };

    store.notificationSettings = {
      ...settings,
      ...input,
      id: settings.id,
      userId: guestUserId,
      updatedAt: createTimestamp(),
    };
    writeGuestStore(store);

    return Promise.resolve(store.notificationSettings);
  },
  getNotifications() {
    return Promise.resolve(sortDescBy(readGuestStore().notifications, "createdAt"));
  },
  createNotification(input: Omit<AppNotification, "isRead" | "readAt">) {
    const store = readGuestStore();
    const notification: AppNotification = {
      ...input,
      userId: guestUserId,
      isRead: false,
      readAt: null,
    };

    store.notifications.unshift(notification);
    writeGuestStore(store);

    return Promise.resolve(notification);
  },
  markNotificationAsRead(notificationId: string) {
    const store = readGuestStore();
    const notification = store.notifications.find((item) => item.id === notificationId);

    if (notification) {
      notification.isRead = true;
      notification.readAt = createTimestamp();
      writeGuestStore(store);
    }

    return Promise.resolve(notification ?? null);
  },
  markAllNotificationsAsRead() {
    const store = readGuestStore();
    const readAt = createTimestamp();

    store.notifications = store.notifications.map((notification) => ({
      ...notification,
      isRead: true,
      readAt,
    }));
    writeGuestStore(store);

    return Promise.resolve(store.notifications);
  },
  syncNotifications() {
    return Promise.resolve(readGuestStore().notifications);
  },
  getUserNewsViewTimes() {
    return Promise.resolve(readGuestStore().userNewsViewTimes);
  },
  createUserNewsViewTimes(userId: string, times: string[]) {
    const store = readGuestStore();
    const settings: UserNewsViewTime = {
      id: "guest-news-view-time",
      userId: guestUserId,
      times,
      updatedAt: createTimestamp(),
    };

    store.userNewsViewTimes = settings;
    writeGuestStore(store);

    return Promise.resolve(settings);
  },
  updateUserNewsViewTimes(
    settingsId: string,
    input: UpdateUserNewsViewTimeInput,
  ) {
    const store = readGuestStore();
    const settings = store.userNewsViewTimes ?? {
      id: settingsId,
      userId: guestUserId,
      times: ["07:00", "21:00"],
      updatedAt: createTimestamp(),
    };

    store.userNewsViewTimes = {
      ...settings,
      ...input,
      id: settings.id,
      userId: guestUserId,
      updatedAt: createTimestamp(),
    };
    writeGuestStore(store);

    return Promise.resolve(store.userNewsViewTimes);
  },
  getBlockedKeywords() {
    return Promise.resolve(sortAscBy(readGuestStore().blockedKeywords, "createdAt"));
  },
  createBlockedKeyword(input: CreateBlockedKeywordPreferenceInput) {
    const store = readGuestStore();
    const now = createTimestamp();
    const keyword: BlockedKeywordPreference = {
      id: createMockId("guest-blocked-keyword"),
      userId: guestUserId,
      keyword: input.keyword,
      isActive: input.isActive,
      createdAt: now,
      updatedAt: now,
    };

    store.blockedKeywords.push(keyword);
    writeGuestStore(store);

    return Promise.resolve(keyword);
  },
  updateBlockedKeyword(
    keywordId: string,
    input: UpdateBlockedKeywordPreferenceInput,
  ) {
    const store = readGuestStore();
    const keyword = store.blockedKeywords.find((item) => item.id === keywordId);

    if (keyword) {
      Object.assign(keyword, input, { updatedAt: createTimestamp() });
      writeGuestStore(store);
    }

    return Promise.resolve(keyword ?? null);
  },
  deleteBlockedKeyword(keywordId: string) {
    const store = readGuestStore();

    store.blockedKeywords = store.blockedKeywords.filter(
      (keyword) => keyword.id !== keywordId,
    );
    writeGuestStore(store);

    return Promise.resolve();
  },
  getInquiries() {
    return Promise.resolve(sortDescBy(readGuestStore().inquiries, "createdAt"));
  },
  createInquiry(input: CreateInquiryInput) {
    const store = readGuestStore();
    const now = createTimestamp();
    const inquiry: Inquiry = {
      id: createMockId("guest-inquiry"),
      userId: guestUserId,
      typeId: input.typeId,
      title: input.title,
      content: input.content,
      status: "received",
      createdAt: now,
      updatedAt: now,
    };

    store.inquiries.unshift(inquiry);
    writeGuestStore(store);

    return Promise.resolve(inquiry);
  },
  getActions() {
    return Promise.resolve(sortDescBy(readGuestStore().contentActions, "createdAt"));
  },
  createAction(input: CreateUserContentActionInput) {
    const store = readGuestStore();
    const now = createTimestamp();
    const action: UserContentAction = {
      id: createMockId("guest-content-action"),
      ...input,
      userId: guestUserId,
      createdAt: now,
      updatedAt: now,
    };

    store.contentActions.unshift(action);
    writeGuestStore(store);

    return Promise.resolve(action);
  },
  deleteAction(actionId: string) {
    const store = readGuestStore();

    store.contentActions = store.contentActions.filter(
      (action) => action.id !== actionId,
    );
    writeGuestStore(store);

    return Promise.resolve();
  },
};
