export const homeSheetDockedGap = 40;
export const homeSheetInitialGap = 40;
export const homeSheetScrollSelector = ".container_newsFeed, .wrapper_newsGridScroll";
export const pagePanelDockedGap = 40;
export const pagePanelInitialGap = 40;
export const pagePanelInitialTop = 492;
export const commentScrollDelayMs = 120;
export const detailRevealDelayMs = 260;
export const detailExitMotionEventName = "app:detail-exit";

export const articleContentScrollerSelector = ".wrapper_articleCardContent";
export const articleCardSelector = ".container_articleCard";
export const newsFeedSelector = ".container_newsFeed";
export const newsFeedDetailSelector = ".container_newsFeed_detail";
export const pagePanelContentSelector = ".page_panelContent";

export const homeDockedScrollSelectors = {
  contentScroller: articleContentScrollerSelector,
  panel: articleCardSelector,
} as const;

export const commentScrollRootSelectors = [
  articleContentScrollerSelector,
  pagePanelContentSelector,
  newsFeedDetailSelector,
  newsFeedSelector,
] as const;
