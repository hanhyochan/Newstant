import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import { newsApi } from "@/shared/newstant/api";
import { currentUserId } from "@/shared/newstant/auth/current-user";
import {
  ChipLabel,
  ContentActionButton,
  Divider,
  Icon,
  IconButton,
  PrimaryButton,
  PrimaryButtonGroup,
  SearchHighlightText,
  getSearchHighlightTargetId,
  getSearchTextParagraphs,
  scrollSearchHighlightTargetIntoView,
} from "@/design-system/components";
import {
  ArticleDetailPanel,
  getEnterFromRightMotionClassName,
  commentScrollDelayMs as commentScrollDelayMs,
  useDeferredDetailScroll,
  useShareContent,
} from "@/design-system/templates";
import {
  MiniReactionControls,
  ReactionControls,
} from "@/features/news/article/article-reactions";
import { useArticleReaction } from "@/features/news/article/use-article-reaction";
import { ArticleGuideSection } from "@/features/news/article/ArticleGuideSection";
import { NewsCreatedTime } from "@/features/news/article/NewsCreatedTime";
import { ClientPortal } from "@/features/news/comments/ClientPortal";
import { CommentReactionPanel } from "@/features/news/comments/CommentReactionPanel";
import { useBookmarkTarget } from "@/features/shared/use-bookmark-target";
import {
  defaultNewsDateTime,
  type ArticleDetailOpenOptions,
  type HomeArticle,
} from "@/features/news/model";
import type { CommentId } from "@/features/comments/utils/comment-data";

const commentPanelOpenHintOffset = 132;
const articleBody = `최근 국내 부동산 시장이 다시 한번 변곡점에 서고 있다. 상반기 동안 이어졌던 거래 회복 흐름이 둔화되며, 시장 전반에 신중한 분위기가 확산되는 모습이다.

특히 수도권과 일부 광역시를 중심으로 매수 심리가 빠르게 식고 있다. 한국부동산연구원이 발표한 자료에 따르면, 기준금리 유지에도 불구하고 주택담보대출 심사 강화와 보유세 부담이 실수요자와 투자자 모두에게 압박으로 작용하고 있다.

전문가들은 당분간 가격 급등이나 급락보다는 지역별 양극화가 심화될 가능성에 주목한다. 정책 변화와 금리 방향성이 명확해지기 전까지는 관망세가 이어질 것이며, 안정적인 실거주 중심의 시장 재편이 예상된다.`;

function HomeArticleMeta({
  className = "article_meta wrapper_betweenRow u_m0",
  date,
  dateTime = defaultNewsDateTime,
}: {
  className?: string;
  date: string;
  dateTime?: string;
}) {
  return (
    <p className={className}>
      <NewsCreatedTime dateTime={dateTime}>{date}</NewsCreatedTime>
    </p>
  );
}

export function HomeReelCard({
  article,
  commentPanelOpen,
  framed = true,
  headingLevel = "h2",
  index,
  initialCommentId,
  initialReplyTargetId,
  initialSearchQuery,
  initialSearchTargetKey,
  initialScrollTarget,
  onCommentPanelOpenChange,
  recordRecentOnView = true,
}: {
  article: HomeArticle;
  commentPanelOpen?: boolean;
  framed?: boolean;
  headingLevel?: "h1" | "h2";
  index: number | string;
  initialCommentId?: CommentId;
  initialReplyTargetId?: CommentId;
  initialSearchQuery?: string;
  initialSearchTargetKey?: string;
  initialScrollTarget?: ArticleDetailOpenOptions["scrollTarget"];
  onCommentPanelOpenChange?: (open: boolean) => void;
  recordRecentOnView?: boolean;
}) {
  const { isBookmarked, toggleBookmark } = useBookmarkTarget({
    onAfterAdd: recordArticleActivity,
    targetId: article.id,
    targetType: "news",
  });
  const [internalCommentPanelOpen, setInternalCommentPanelOpen] = useState(
    initialCommentId != null || initialReplyTargetId != null,
  );
  const {
    articleReactionCounts,
    reaction,
    toggleArticleReaction,
  } = useArticleReaction({
    newsId: article.id,
    onAfterChange: recordArticleActivity,
  });
  const [isMiniReactionCardVisible, setIsMiniReactionCardVisible] = useState(false);
  const [isArticleReactionReached, setIsArticleReactionReached] = useState(false);
  const cardRef = useRef<HTMLElement>(null);
  const articleReactionRef = useRef<HTMLDivElement>(null);
  const hasTrackedViewRef = useRef(false);
  const numericIndex = typeof index === "number" ? index : 0;
  const commentPanelId = `home-comment-panel-${index}`;
  const articleContentId = `home-article-content-${index}`;
  const articleGuideId = `home-article-guide-${index}`;
  const articleTitleId = `home-article-title-${index}`;
  const articleBodyParagraphs = getSearchTextParagraphs(article.body ?? articleBody);
  const articleBodySearchIndex = initialSearchTargetKey?.startsWith("body-")
    ? Number(initialSearchTargetKey.replace("body-", ""))
    : initialSearchTargetKey === "body" && initialSearchQuery?.trim()
      ? articleBodyParagraphs.findIndex((paragraph) =>
          paragraph
            .toLocaleLowerCase("ko-KR")
            .includes(initialSearchQuery.trim().toLocaleLowerCase("ko-KR")),
        )
      : -1;
  const articleSearchTargetKey =
    initialSearchTargetKey?.startsWith("body") && articleBodySearchIndex >= 0
      ? `body-${articleBodySearchIndex}`
      : initialSearchTargetKey;
  const articleSearchTargetId = getSearchHighlightTargetId(
    articleContentId,
    articleSearchTargetKey,
  );
  const isArticleBodySearchTarget = initialSearchTargetKey?.startsWith("body");
  const ArticleTitle = headingLevel;
  const shareArticle = useShareContent({
    text: article.body ?? article.title,
    title: article.title,
  });
  const isCommentPanelOpen =
    commentPanelOpen ?? internalCommentPanelOpen;
  const setCommentPanelOpen = useCallback(
    (nextOpen: boolean | ((currentOpen: boolean) => boolean)) => {
      const resolvedOpen =
        typeof nextOpen === "function"
          ? nextOpen(isCommentPanelOpen)
          : nextOpen;

      if (commentPanelOpen === undefined) {
        setInternalCommentPanelOpen(resolvedOpen);
      }
      onCommentPanelOpenChange?.(resolvedOpen);
    },
    [commentPanelOpen, isCommentPanelOpen, onCommentPanelOpenChange],
  );

  function scrollCommentPanelOpenHint() {
    window.setTimeout(() => {
      window.requestAnimationFrame(() => {
        const scroller = document.getElementById(articleContentId);

        if (!(scroller instanceof HTMLElement)) {
          return;
        }

        const maxScroll = Math.max(0, scroller.scrollHeight - scroller.clientHeight);

        if (maxScroll <= 0) {
          return;
        }

        const nextScrollTop = Math.min(
          maxScroll,
          scroller.scrollTop + commentPanelOpenHintOffset,
        );
        const prefersReducedMotion = window.matchMedia(
          "(prefers-reduced-motion: reduce)",
        ).matches;

        scroller.scrollTo({
          behavior: prefersReducedMotion ? "auto" : "smooth",
          top: nextScrollTop,
        });
      });
    }, commentScrollDelayMs);
  }

  function handleCommentPanelToggle() {
    if (!isCommentPanelOpen) {
      scrollCommentPanelOpenHint();
    }

    setCommentPanelOpen((current) => !current);
  }


  useEffect(() => {
    hasTrackedViewRef.current = false;
  }, [article.id]);

  useEffect(() => {
    if (!article.id || hasTrackedViewRef.current) {
      return;
    }

    function trackView() {
      if (!article.id || hasTrackedViewRef.current) {
        return;
      }

      hasTrackedViewRef.current = true;
      const recentViewRequest = recordRecentOnView
        ? newsApi.addRecentNewsView({
            newsId: article.id,
            userId: currentUserId,
          })
        : Promise.resolve(undefined);

      recentViewRequest.catch(() => undefined);
    }

    if (!framed) {
      trackView();
      return;
    }

    const target = cardRef.current;

    if (!target || typeof IntersectionObserver === "undefined") {
      trackView();
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting && entry.intersectionRatio >= 0.5)) {
          trackView();
          observer.disconnect();
        }
      },
      { threshold: [0.5] },
    );

    observer.observe(target);

    return () => {
      observer.disconnect();
    };
  }, [article.id, framed, recordRecentOnView]);


  useEffect(() => {
    if (!framed) {
      setIsMiniReactionCardVisible(true);
      return;
    }

    const target = cardRef.current;

    if (!target || typeof IntersectionObserver === "undefined") {
      setIsMiniReactionCardVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        setIsMiniReactionCardVisible(
          Boolean(entry?.isIntersecting && entry.intersectionRatio >= 0.55),
        );
      },
      { threshold: [0, 0.55, 0.75] },
    );

    observer.observe(target);

    return () => {
      observer.disconnect();
    };
  }, [article.id, framed]);

  useEffect(() => {
    const scroller = document.getElementById(articleContentId);
    const target = articleReactionRef.current;

    if (!(scroller instanceof HTMLElement) || !target) {
      setIsArticleReactionReached(false);
      return;
    }

    const scrollerNode = scroller;
    const targetNode = target;

    function updateArticleReactionReached() {
      const scrollerRect = scrollerNode.getBoundingClientRect();
      const targetRect = targetNode.getBoundingClientRect();

      setIsArticleReactionReached(targetRect.top <= scrollerRect.bottom);
    }

    updateArticleReactionReached();
    scrollerNode.addEventListener("scroll", updateArticleReactionReached, {
      passive: true,
    });
    window.addEventListener("resize", updateArticleReactionReached);

    return () => {
      scrollerNode.removeEventListener("scroll", updateArticleReactionReached);
      window.removeEventListener("resize", updateArticleReactionReached);
    };
  }, [
    article.id,
    articleContentId,
    isCommentPanelOpen,
    isMiniReactionCardVisible,
  ]);

  async function recordArticleActivity() {
    if (!article.id) {
      return;
    }

    await newsApi
      .addRecentNewsView({
        newsId: article.id,
        userId: currentUserId,
      })
      .catch(() => undefined);
  }


  useEffect(() => {
    if (initialCommentId == null && initialReplyTargetId == null) {
      return;
    }

    setCommentPanelOpen(true);
  }, [initialCommentId, initialReplyTargetId, setCommentPanelOpen]);
  useDeferredDetailScroll({
    bottomGap: 80,
    delayMs: commentScrollDelayMs,
    enabled: initialScrollTarget === "poll",
    resetKey: article.id ?? article.title,
    targetId: initialScrollTarget === "poll" ? articleGuideId : null,
  });

  useEffect(() => {
    if (
      initialScrollTarget !== "bodySearch" ||
      !initialSearchTargetKey ||
      !initialSearchQuery?.trim()
    ) {
      return;
    }

    scrollSearchHighlightTargetIntoView(articleSearchTargetId);
  }, [
    articleSearchTargetId,
    initialScrollTarget,
    initialSearchQuery,
    initialSearchTargetKey,
  ]);

  const isMiniArticleReactionVisible =
    isMiniReactionCardVisible && !isArticleReactionReached;

  const articleContent = (
    <div
      aria-labelledby={articleTitleId}
      className="wrapper_articleCardContent wrapper_panelContent u_minH0 u_gap24"
      id={articleContentId}
      role="region"
      tabIndex={0}
    >
      <div className="wrapper_contentMeta u_gap16">
        <div
          className="wrapper_articleKicker wrapper_betweenRow"
        >
          <ChipLabel>
            <SearchHighlightText
              query={
                initialSearchTargetKey === "category" ? initialSearchQuery : ""
              }
              targetId={
                initialSearchTargetKey === "category"
                  ? getSearchHighlightTargetId(articleContentId, "category")
                  : undefined
              }
            >
              {article.category}
            </SearchHighlightText>
          </ChipLabel>
        </div>
        <ArticleTitle id={articleTitleId}>
          <SearchHighlightText
            query={initialSearchTargetKey === "title" ? initialSearchQuery : ""}
            targetId={
              initialSearchTargetKey === "title"
                ? getSearchHighlightTargetId(articleContentId, "title")
                : undefined
            }
          >
            {article.title}
          </SearchHighlightText>
        </ArticleTitle>
        <div className="wrapper_articleMetaActions wrapper_betweenRow">
          <HomeArticleMeta
            date={article.date}
            dateTime={article.dateTime}
          />
          <div className="wrapper_articleActions wrapper_actionGroup u_itemsCenter" aria-label="기사 도구" role="group">
            <IconButton
              icon="share"
              label="공유"
              onClick={() => {
                void shareArticle();
              }}
              variant="articleTool"
            />
            <IconButton
              aria-pressed={isBookmarked}
              icon="bookmark"
              label="북마크"
              onClick={() => {
                void toggleBookmark();
              }}
              variant="articleTool"
            />
          </div>
        </div>
      </div>
      <img alt={article.imageAlt} src={article.image} />
      <section className="wrapper_articleBody" aria-label="기사 본문">
        {articleBodyParagraphs.map((paragraph, paragraphIndex) => {
          const paragraphTargetKey = `body-${paragraphIndex}`;
          return (
            <p className="text_articleBody" key={`${article.id ?? article.title}-body-${paragraphIndex}`}>
              <SearchHighlightText
                query={isArticleBodySearchTarget ? initialSearchQuery : ""}
                targetId={
                  articleSearchTargetKey === paragraphTargetKey
                    ? getSearchHighlightTargetId(articleContentId, paragraphTargetKey)
                    : undefined
                }
              >
                {paragraph}
              </SearchHighlightText>
            </p>
          );
        })}
      </section>

      <div
        className="wrapper_articleSource"
        id={`${articleContentId}-search-source`}
      >
        <div className="wrapper_articleSourcePublisher">
          <img
            className="img_articlePublisherLogo"
            src="/icons/icon_my_page_active.svg"
            alt=""
            width={24}
            height={24}
          />
          <span className="text_articlePublisherName">
            {article.pressName ??
              (numericIndex % 2 === 0 ? "국민일보" : "중앙일보")}
          </span>
        </div>
        <Divider
          aria-hidden="true"
          className="divider_articleSource"
          orientation="vertical"
        />
        <span className="text_articleReporter">
          {article.reporterName ?? "홍길동 기자"}
        </span>
      </div>

      <ContentActionButton
        href="https://example.com/original-news"
      >
        기사 원문 보기
      </ContentActionButton>

      <ReactionControls
        counts={articleReactionCounts}
        reaction={reaction}
        rootRef={articleReactionRef}
        onReactionChange={(nextReaction) => {
          void toggleArticleReaction(nextReaction);
        }}
      />

      <ArticleGuideSection
        id={articleGuideId}
        kind={article.guideKind ?? "stacked"}
        newsId={article.id}
      />

      <PrimaryButtonGroup>
        <PrimaryButton
        aria-controls={isCommentPanelOpen ? commentPanelId : undefined}
        aria-expanded={isCommentPanelOpen}
        leftIcon={<Icon name="chat" />}
        onClick={handleCommentPanelToggle}
      >
        댓글 반응보기
        </PrimaryButton>
      </PrimaryButtonGroup>
      {isCommentPanelOpen ? (
        <CommentReactionPanel
          guideKind={article.guideKind ?? "stacked"}
          id={commentPanelId}
          initialCommentId={initialCommentId}
          initialReplyTargetId={initialReplyTargetId}
          newsId={article.id}
        />
      ) : null}
      <ClientPortal>
        <MiniReactionControls
          counts={articleReactionCounts}
          isVisible={isMiniArticleReactionVisible}
          reaction={reaction}
          onReactionChange={(nextReaction) => {
            void toggleArticleReaction(nextReaction);
          }}
        />
      </ClientPortal>
    </div>
  );

  if (!framed) {
    return articleContent;
  }

  return (
    <article
      aria-labelledby={articleTitleId}
      className="container_articleCard wrapper_panelSurface_style"
      ref={cardRef}
    >
      {articleContent}
    </article>
  );
}

export function ArticleDetailContent({
  article,
  backLabel,
  initialCommentId,
  initialReplyTargetId,
  initialSearchQuery,
  initialSearchTargetKey,
  initialScrollTarget,
  isLeaving = false,
  onBack,
}: {
  article: HomeArticle;
  backLabel?: string;
  initialCommentId?: CommentId;
  initialReplyTargetId?: CommentId;
  initialSearchQuery?: string;
  initialSearchTargetKey?: string;
  initialScrollTarget?: ArticleDetailOpenOptions["scrollTarget"];
  isLeaving?: boolean;
  onBack?: () => void;
}) {
  return (
    <ArticleDetailPanel
      ariaLabel="기사 상세"
      backLabel={backLabel}
      className={getEnterFromRightMotionClassName(isLeaving)}
      labelledBy="home-article-title-detail"
      onBack={onBack}
    >
      <HomeReelCard
        article={article}
        framed={false}
        headingLevel="h1"
        initialCommentId={initialCommentId}
        initialReplyTargetId={initialReplyTargetId}
        initialSearchQuery={initialSearchQuery}
        initialSearchTargetKey={initialSearchTargetKey}
        initialScrollTarget={initialScrollTarget}
        index="detail"
      />
    </ArticleDetailPanel>
  );
}


