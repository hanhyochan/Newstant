import { currentUserId } from "../auth/current-user";
import { createMockId, createTimestamp } from "./api-utils";
import { apiClient } from "./http-client";
import type {
  AppNotification,
  Bookmark,
  Comment,
  CommentReaction,
  CreateNotificationSettingsInput,
  Inquiry,
  News,
  NewsPlacement,
  NotificationSettings,
  UpdateNotificationSettingsInput,
  UserNewsViewTime,
  WelfarePolicy,
} from "./types";

type NotificationInput = Omit<AppNotification, "isRead" | "readAt">;

type NewsViewTimeOption = {
  id: string;
  label: string;
  time: string;
};

function createNotificationId(...parts: string[]) {
  return ["notification", ...parts].join("-").replace(/[^a-zA-Z0-9_-]/g, "_");
}

function createNotificationPayload(input: NotificationInput): AppNotification {
  return {
    ...input,
    isRead: false,
    readAt: null,
  };
}

async function createNotificationIfMissing(
  existingIds: Set<string>,
  input: NotificationInput,
) {
  if (existingIds.has(input.id)) {
    return null;
  }

  existingIds.add(input.id);

  return apiClient.post<AppNotification, AppNotification>(
    "/notifications",
    createNotificationPayload(input),
  );
}

function getDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getConfiguredNewsViewTimes(
  settings: UserNewsViewTime | null,
  options: NewsViewTimeOption[],
) {
  if (!settings) {
    return [];
  }

  if (settings.times?.length) {
    return settings.times.map((time) => ({ label: time, time }));
  }

  const optionById = new Map(options.map((option) => [option.id, option]));

  return (settings.optionIds ?? [])
    .map((optionId) => optionById.get(optionId))
    .filter((option): option is NewsViewTimeOption => Boolean(option))
    .map((option) => ({
      label: option.label,
      time: option.time,
    }));
}

export const notificationApi = {
  async getNotificationSettings(userId = currentUserId) {
    const settings = await apiClient.get<NotificationSettings[]>(
      "/notificationSettings",
      { userId },
    );

    return settings[0] ?? null;
  },
  createNotificationSettings(input: CreateNotificationSettingsInput) {
    return apiClient.post<NotificationSettings, NotificationSettings>(
      "/notificationSettings",
      {
        id: createMockId("notification"),
        userId: input.userId,
        breakingNews: input.breakingNews ?? true,
        commentReplies: input.commentReplies ?? true,
        inquiryReplies: input.inquiryReplies ?? true,
        newsViewTime: input.newsViewTime ?? true,
        policyUpdates: input.policyUpdates ?? true,
        darkMode: input.darkMode ?? false,
        updatedAt: createTimestamp(),
      },
    );
  },
  updateNotificationSettings(
    settingsId: string,
    input: UpdateNotificationSettingsInput,
  ) {
    return apiClient.patch<
      NotificationSettings,
      UpdateNotificationSettingsInput & Pick<NotificationSettings, "updatedAt">
    >(`/notificationSettings/${settingsId}`, {
      ...input,
      updatedAt: createTimestamp(),
    });
  },
  getNotifications(userId = currentUserId) {
    return apiClient.get<AppNotification[]>("/notifications", {
      _sort: "createdAt",
      _order: "desc",
      userId,
    });
  },
  markNotificationAsRead(notificationId: string) {
    return apiClient.patch<
      AppNotification,
      Pick<AppNotification, "isRead" | "readAt">
    >(`/notifications/${notificationId}`, {
      isRead: true,
      readAt: createTimestamp(),
    });
  },
  markNotificationsAsRead(notifications: AppNotification[]) {
    const unreadNotifications = notifications.filter(
      (notification) => !notification.isRead,
    );

    return Promise.all(
      unreadNotifications.map((notification) =>
        this.markNotificationAsRead(notification.id),
      ),
    );
  },
  async markAllNotificationsAsRead(userId = currentUserId) {
    const notifications = await this.getNotifications(userId);

    return this.markNotificationsAsRead(notifications);
  },
  createNotification(input: NotificationInput) {
    return apiClient.post<AppNotification, AppNotification>(
      "/notifications",
      createNotificationPayload(input),
    );
  },
  async syncNotifications(userId = currentUserId) {
    const settings = await this.getNotificationSettings(userId);

    if (!settings) {
      return [];
    }

    const [
      existingNotifications,
      news,
      breakingPlacements,
      comments,
      commentReactions,
      bookmarks,
      policies,
      inquiries,
      newsViewTimeSettings,
      newsViewTimeOptions,
    ] = await Promise.all([
      this.getNotifications(userId).catch(() => []),
      apiClient.get<News[]>("/news").catch(() => []),
      apiClient
        .get<NewsPlacement[]>("/newsPlacements", { area: "breaking" })
        .catch(() => []),
      apiClient.get<Comment[]>("/comments").catch(() => []),
      apiClient.get<CommentReaction[]>("/commentReactions").catch(() => []),
      apiClient.get<Bookmark[]>("/bookmarks", { userId }).catch(() => []),
      apiClient.get<WelfarePolicy[]>("/welfarePolicies").catch(() => []),
      apiClient.get<Inquiry[]>("/inquiries", { userId }).catch(() => []),
      apiClient
        .get<UserNewsViewTime[]>("/userNewsViewTimes", { userId })
        .catch(() => []),
      apiClient.get<NewsViewTimeOption[]>("/newsViewTimeOptions").catch(() => []),
    ]);
    const existingIds = new Set(
      existingNotifications.map((notification) => notification.id),
    );
    const newsById = new Map(news.map((item) => [item.id, item]));
    const commentById = new Map(comments.map((comment) => [comment.id, comment]));
    const myComments = comments.filter((comment) => comment.userId === userId);
    const myCommentIds = new Set(myComments.map((comment) => comment.id));
    const policyById = new Map(policies.map((policy) => [policy.id, policy]));
    const now = createTimestamp();
    const tasks: Array<Promise<AppNotification | null>> = [];

    if (settings.breakingNews) {
      breakingPlacements.forEach((placement) => {
        const breakingNews = newsById.get(placement.newsId);

        if (!breakingNews) {
          return;
        }

        tasks.push(
          createNotificationIfMissing(existingIds, {
            id: createNotificationId("breakingNews", userId, breakingNews.id),
            userId,
            type: "breakingNews",
            title: "속보 뉴스 발행",
            body: breakingNews.title,
            targetType: "news",
            targetId: breakingNews.id,
            createdAt: breakingNews.publishedAt,
          }),
        );
      });
    }

    if (settings.commentReplies) {
      comments
        .filter(
          (comment) =>
            comment.parentId &&
            myCommentIds.has(comment.parentId) &&
            comment.userId !== userId,
        )
        .forEach((reply) => {
          tasks.push(
            createNotificationIfMissing(existingIds, {
              id: createNotificationId("commentReply", userId, reply.id),
              userId,
              type: "commentReaction",
              title: "내 댓글에 대댓글이 달렸습니다",
              body: reply.content,
              targetType: "news",
              targetId: reply.newsId,
              createdAt: reply.createdAt,
            }),
          );
        });

      commentReactions
        .filter(
          (reaction) =>
            myCommentIds.has(reaction.commentId) && reaction.userId !== userId,
        )
        .forEach((reaction) => {
          const targetComment = commentById.get(reaction.commentId);

          if (!targetComment) {
            return;
          }

          tasks.push(
            createNotificationIfMissing(existingIds, {
              id: createNotificationId("commentReaction", userId, reaction.id),
              userId,
              type: "commentReaction",
              title: `내 댓글/대댓글에 ${
                reaction.type === "like" ? "좋아요" : "싫어요"
              } 반응이 달렸습니다`,
              body: targetComment.content,
              targetType: "news",
              targetId: targetComment.newsId,
              createdAt: reaction.createdAt,
            }),
          );
        });
    }

    if (settings.policyUpdates) {
      bookmarks
        .filter((bookmark) => bookmark.targetType === "welfarePolicy")
        .forEach((bookmark) => {
          const policy = policyById.get(bookmark.targetId);

          if (!policy) {
            return;
          }

          const policyUpdatedAt = new Date(policy.updatedAt).getTime();
          const policyRegisteredAt = new Date(policy.registeredAt).getTime();
          const bookmarkedAt = new Date(bookmark.createdAt).getTime();

          if (
            Number.isNaN(policyUpdatedAt) ||
            policyUpdatedAt <= policyRegisteredAt ||
            policyUpdatedAt <= bookmarkedAt
          ) {
            return;
          }

          tasks.push(
            createNotificationIfMissing(existingIds, {
              id: createNotificationId(
                "policyUpdate",
                userId,
                policy.id,
                policy.updatedAt,
              ),
              userId,
              type: "policyUpdate",
              title: "내 국가정책 업데이트",
              body: policy.title,
              targetType: "policy",
              targetId: policy.id,
              createdAt: policy.updatedAt,
            }),
          );
        });
    }

    if (settings.inquiryReplies) {
      inquiries
        .filter((inquiry) => inquiry.status === "answered" || inquiry.emailSent)
        .forEach((inquiry) => {
          tasks.push(
            createNotificationIfMissing(existingIds, {
              id: createNotificationId(
                "inquiryReply",
                userId,
                inquiry.id,
                inquiry.updatedAt,
              ),
              userId,
              type: "inquiryReply",
              title: "문의글 답변이 메일로 발송되었습니다",
              body: inquiry.title,
              targetType: "inquiry",
              targetId: inquiry.id,
              createdAt: inquiry.updatedAt,
            }),
          );
        });
    }

    if (settings.newsViewTime) {
      const date = new Date();
      const todayKey = getDateKey(date);
      const currentMinutes = date.getHours() * 60 + date.getMinutes();
      const viewTimes = getConfiguredNewsViewTimes(
        newsViewTimeSettings[0] ?? null,
        newsViewTimeOptions,
      );

      viewTimes.forEach((viewTime) => {
        const [hours = "0", minutes = "0"] = viewTime.time.split(":");
        const viewTimeMinutes = Number(hours) * 60 + Number(minutes);

        if (Number.isNaN(viewTimeMinutes) || viewTimeMinutes > currentMinutes) {
          return;
        }

        tasks.push(
          createNotificationIfMissing(existingIds, {
            id: createNotificationId("newsViewTime", userId, todayKey, viewTime.time),
            userId,
            type: "newsViewTime",
            title: "뉴스 보기 타임 알림",
            body: `${viewTime.label} 뉴스 보기 시간입니다`,
            targetType: null,
            targetId: null,
            createdAt: now,
          }),
        );
      });
    }

    return Promise.all(tasks);
  },
};
