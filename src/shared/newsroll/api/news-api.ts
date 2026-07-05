import { currentUserId } from "../auth/current-user";
import { createMockId, createTimestamp } from "./api-utils";
import { apiClient } from "./http-client";
import type {
  AddArticleReactionInput,
  AddRecentNewsViewInput,
  ArticleReaction,
  ArticleReactionType,
  News,
  NewsCategory,
  NewsListItem,
  Press,
  RecentNewsView,
} from "./types";

function getNewsDetail(newsId: string) {
  return apiClient.get<News>(`/news/${newsId}`);
}

export const newsApi = {
  async getNewsList() {
    const [news, categories, presses] = await Promise.all([
      apiClient.get<News[]>("/news", {
        _sort: "publishedAt",
        _order: "desc",
      }),
      apiClient.get<NewsCategory[]>("/newsCategories"),
      apiClient.get<Press[]>("/presses"),
    ]);
    const categoryById = new Map(
      categories.map((category) => [category.id, category]),
    );
    const pressById = new Map(presses.map((press) => [press.id, press]));

    return news.map<NewsListItem>((item) => ({
      ...item,
      category: categoryById.get(item.categoryId),
      press: pressById.get(item.pressId),
    }));
  },
  getNewsDetail,
  async getNewsReaction(newsId: string, userId = currentUserId) {
    const reactions = await apiClient.get<ArticleReaction[]>("/articleReactions", {
      newsId,
      userId,
    });

    return reactions[0] ?? null;
  },
  getNewsReactions(newsId: string) {
    return apiClient.get<ArticleReaction[]>("/articleReactions", {
      newsId,
    });
  },
  addNewsReaction(input: AddArticleReactionInput) {
    return apiClient.post<ArticleReaction, ArticleReaction>("/articleReactions", {
      id: createMockId("article-reaction"),
      newsId: input.newsId,
      userId: input.userId,
      type: input.type,
      createdAt: createTimestamp(),
    });
  },
  updateNewsReaction(reactionId: string, type: ArticleReactionType) {
    return apiClient.patch<ArticleReaction, Pick<ArticleReaction, "type">>(
      `/articleReactions/${reactionId}`,
      { type },
    );
  },
  removeNewsReaction(reactionId: string) {
    return apiClient.delete(`/articleReactions/${reactionId}`);
  },
  getRecentNewsViews(userId = currentUserId) {
    return apiClient.get<RecentNewsView[]>("/recentNewsViews", {
      userId,
      _sort: "viewedAt",
      _order: "desc",
    });
  },
  async addRecentNewsView(input: AddRecentNewsViewInput) {
    const existingViews = await apiClient.get<RecentNewsView[]>("/recentNewsViews", {
      newsId: input.newsId,
      userId: input.userId,
    });
    const viewedAt = createTimestamp();
    const existingView = existingViews[0];

    if (existingView) {
      return apiClient.patch<RecentNewsView, Pick<RecentNewsView, "viewedAt">>(
        `/recentNewsViews/${existingView.id}`,
        { viewedAt },
      );
    }

    return apiClient.post<RecentNewsView, RecentNewsView>("/recentNewsViews", {
      id: createMockId("recent"),
      userId: input.userId,
      newsId: input.newsId,
      viewedAt,
    });
  },
  deleteRecentNewsView(viewId: string) {
    return apiClient.delete(`/recentNewsViews/${viewId}`);
  },
};
