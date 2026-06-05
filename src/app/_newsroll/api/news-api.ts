import { mockCurrentUserId } from "../mock-current-user";
import { createMockId, createTimestamp } from "./api-utils";
import { apiClient } from "./http-client";
import type {
  AddRecentNewsViewInput,
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
  async increaseNewsViewCount(newsId: string) {
    const news = await getNewsDetail(newsId);

    return apiClient.patch<News, Pick<News, "viewCount">>(`/news/${newsId}`, {
      viewCount: news.viewCount + 1,
    });
  },
  getRecentNewsViews(userId = mockCurrentUserId) {
    return apiClient.get<RecentNewsView[]>("/recentNewsViews", {
      userId,
      _sort: "viewedAt",
      _order: "desc",
    });
  },
  addRecentNewsView(input: AddRecentNewsViewInput) {
    return apiClient.post<RecentNewsView, RecentNewsView>("/recentNewsViews", {
      id: createMockId("recent"),
      userId: input.userId,
      newsId: input.newsId,
      viewedAt: createTimestamp(),
    });
  },
};
