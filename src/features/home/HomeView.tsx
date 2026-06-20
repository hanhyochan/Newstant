"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState
} from "react";

import {
  newsApi
} from "@/app/_newsroll/api";
import {
  NewsBlockItem
} from "@/design-system/components";
import {
  useEnterFromRightExitMotion
} from "@/design-system/templates";

import {
  ArticleDetailContent,
  HomeReelCard,
  HomeShell,
  NewsRollStateCard,
  defaultNewsDateTime,
  filterArticlesByBlockedKeywords,
  getHomeArticleFromNews,
  getLatestBreakingNewsItem,
  type BodySearchSelection,
  type HomeArticle,
  type HomeViewMode,
} from "@/features/news/NewsViews";
import { getDataUnavailableMessage } from "@/features/shared/DataUnavailableMessage";

export function HomeView({
  blockedKeywords,
  bodySearchSelection,
  isTextLarge,
  onOpenBreakingNews,
  onOpenNotifications,
  onOpenSearch,
  onToggleTextSize,
}: {
  blockedKeywords: string[];
  bodySearchSelection?: BodySearchSelection | null;
  isTextLarge: boolean;
  onOpenBreakingNews: () => void;
  onOpenNotifications: () => void;
  onOpenSearch: () => void;
  onToggleTextSize: () => void;
}) {
  const [homeViewMode, setHomeViewMode] = useState<HomeViewMode>(
    bodySearchSelection?.kind === "news" ? "block" : "reels",
  );
  const [detailOpen, setDetailOpen] = useState(
    bodySearchSelection?.kind === "news",
  );
  const [selectedDetailArticle, setSelectedDetailArticle] =
    useState<HomeArticle | null>(
      bodySearchSelection?.kind === "news" ? bodySearchSelection.article : null,
    );
  const [articles, setArticles] = useState<HomeArticle[]>([]);
  const [isNewsLoading, setIsNewsLoading] = useState(true);
  const [newsError, setNewsError] = useState<string | null>(null);
  const closeHomeDetailImmediately = useCallback(() => {
    setDetailOpen(false);
  }, []);
  const homeDetailExitMotion = useEnterFromRightExitMotion({
    isOpen: detailOpen,
    onClose: closeHomeDetailImmediately,
  });

  function openHomeDetail(article: HomeArticle) {
    setSelectedDetailArticle(article);
    setDetailOpen(true);
  }

  useEffect(() => {
    if (bodySearchSelection?.kind !== "news") {
      return;
    }

    setHomeViewMode("block");
    openHomeDetail(bodySearchSelection.article);
  }, [bodySearchSelection]);

  useEffect(() => {
    let ignore = false;

    async function loadHomeNews() {
      setIsNewsLoading(true);
      setNewsError(null);

      try {
        const nextNews = await newsApi.getNewsList();

        if (!ignore) {
          setArticles(nextNews.map(getHomeArticleFromNews));
        }
      } catch {
        if (!ignore) {
          setNewsError(getDataUnavailableMessage("뉴스", "를"));
        }
      } finally {
        if (!ignore) {
          setIsNewsLoading(false);
        }
      }
    }

    loadHomeNews();

    return () => {
      ignore = true;
    };
  }, []);

  const visibleArticles = useMemo(
    () => filterArticlesByBlockedKeywords(articles, blockedKeywords),
    [articles, blockedKeywords],
  );
  const hasArticles = visibleArticles.length > 0;
  const latestBreakingItem = getLatestBreakingNewsItem(visibleArticles);
  const breakingTitle =
    latestBreakingItem?.title ??
    getDataUnavailableMessage("속보", "를");

  return (
    <HomeShell
      breakingItem={latestBreakingItem}
      breakingTitle={breakingTitle}
      isDetailOpen={detailOpen}
      isTextLarge={isTextLarge}
      mode={homeViewMode}
      newsCount={visibleArticles.length}
      onCloseDetail={homeDetailExitMotion.closeWithMotion}
      onOpenBreakingArticle={openHomeDetail}
      onModeChange={(nextMode) => {
        setDetailOpen(false);
        setHomeViewMode(nextMode);
      }}
      onOpenBreakingNews={onOpenBreakingNews}
      onOpenNotifications={onOpenNotifications}
      onOpenSearch={onOpenSearch}
      onToggleTextSize={onToggleTextSize}
    >
      {detailOpen ? (
        selectedDetailArticle ? (
          <ArticleDetailContent
            article={selectedDetailArticle}
            isLeaving={homeDetailExitMotion.isLeaving}
          />
        ) : null
      ) : homeViewMode === "reels" ? (
        <section
          className={`container_newsFeed${isNewsLoading || newsError || !hasArticles ? " is_emptyState" : ""}`}
          id="home-news-reels-panel"
          role="tabpanel"
          aria-labelledby="home-news-view-tab-reels"
        >
          {isNewsLoading ? (
            <NewsRollStateCard role="status">
              <p className="text_commentEmpty">뉴스를 불러오는 중입니다.</p>
            </NewsRollStateCard>
          ) : newsError ? (
            <NewsRollStateCard role="alert">
              <p className="text_commentEmpty">{newsError}</p>
            </NewsRollStateCard>
          ) : hasArticles ? (
            visibleArticles.map((article, index) => (
              <HomeReelCard
                article={article}
                index={index}
                key={article.id ?? `${article.title}-${index}`}
                recordRecentOnView={false}
              />
            ))
          ) : (
            <NewsRollStateCard>
              <p className="text_commentEmpty">표시할 뉴스가 없습니다.</p>
            </NewsRollStateCard>
          )}
        </section>
      ) : (
        <section
          className="container_newsGrid container_newsGrid_block"
          id="home-news-block-panel"
          role="tabpanel"
          aria-labelledby="home-news-view-tab-block"
        >
          <div className="wrapper_newsGridScroll">
            {isNewsLoading ? (
              <NewsRollStateCard role="status">
                <p className="text_commentEmpty">뉴스를 불러오는 중입니다.</p>
              </NewsRollStateCard>
            ) : newsError ? (
              <NewsRollStateCard role="alert">
                <p className="text_commentEmpty">{newsError}</p>
              </NewsRollStateCard>
            ) : hasArticles ? (
              visibleArticles.map((article) => (
                <NewsBlockItem
                  categoryLabel={article.category}
                  dateLabel={article.date}
                  dateTime={article.dateTime ?? defaultNewsDateTime}
                  imageAlt={article.imageAlt}
                  imageSrc={article.image}
                  key={article.id ?? article.title}
                  onClick={() => openHomeDetail(article)}
                  title={article.title}
                />
              ))
            ) : (
              <NewsRollStateCard>
                <p className="text_commentEmpty">표시할 뉴스가 없습니다.</p>
              </NewsRollStateCard>
            )}
          </div>
        </section>
      )}
    </HomeShell>
  );
}
