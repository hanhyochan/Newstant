export const newsrollHomeSheetDockedGap = 40;
export const newsrollHomeSheetInitialGap = 40;
export const newsrollHomeSheetScrollSelector = ".container_newsFeed, .wrapper_newsGridScroll";
export const newsrollPagePanelDockedGap = 40;
export const newsrollPagePanelInitialGap = 40;
export const newsrollPagePanelInitialTop = 492;
export const newsrollCommentScrollDelayMs = 120;
export const newsrollDetailRevealDelayMs = 260;
export const newsrollDetailExitMotionEventName = "newsroll:detail-exit";

export const newsrollArticleContentScrollerSelector = ".wrapper_articleCardContent";
export const newsrollArticleCardSelector = ".container_articleCard";
export const newsrollNewsFeedSelector = ".container_newsFeed";
export const newsrollNewsFeedDetailSelector = ".container_newsFeed_detail";
export const newsrollPagePanelContentSelector = ".newsroll_page_panelContent";

export const newsrollHomeDockedScrollSelectors = {
  contentScroller: newsrollArticleContentScrollerSelector,
  panel: newsrollArticleCardSelector,
} as const;

export const newsrollCommentScrollRootSelectors = [
  newsrollArticleContentScrollerSelector,
  newsrollPagePanelContentSelector,
  newsrollNewsFeedDetailSelector,
  newsrollNewsFeedSelector,
] as const;
