import type { KeyboardEvent } from "react";

import { Icon } from "../icon/icon";

export type NewsViewMode = "reels" | "block";

export type NewsViewToggleProps = {
  mode: NewsViewMode;
  onModeChange: (mode: NewsViewMode) => void;
};

export function NewsViewToggle({ mode, onModeChange }: NewsViewToggleProps) {
  const tabIds = {
    reels: "home-news-view-tab-reels",
    block: "home-news-view-tab-block",
  };
  const panelIds = {
    reels: "home-news-reels-panel",
    block: "home-news-block-panel",
  };

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const nextModeByKey: Partial<Record<string, NewsViewMode>> = {
      ArrowLeft: mode === "reels" ? "block" : "reels",
      ArrowRight: mode === "reels" ? "block" : "reels",
      ArrowUp: mode === "reels" ? "block" : "reels",
      ArrowDown: mode === "reels" ? "block" : "reels",
      Home: "reels",
      End: "block",
    };
    const nextMode = nextModeByKey[event.key];

    if (!nextMode) {
      return;
    }

    event.preventDefault();
    onModeChange(nextMode);
  }

  return (
    <div className="wrapper_newsViewToggle" role="tablist" aria-label="뉴스 보기 방식" onKeyDown={handleKeyDown}>
      <button
        aria-controls={panelIds.reels}
        aria-label="릴스형"
        aria-selected={mode === "reels"}
        className="btn_newsViewOption"
        id={tabIds.reels}
        onClick={() => onModeChange("reels")}
        role="tab"
        tabIndex={mode === "reels" ? 0 : -1}
        type="button"
      >
        <Icon name="list" />
      </button>
      <button
        aria-controls={panelIds.block}
        aria-label="블록형"
        aria-selected={mode === "block"}
        className="btn_newsViewOption"
        id={tabIds.block}
        onClick={() => onModeChange("block")}
        role="tab"
        tabIndex={mode === "block" ? 0 : -1}
        type="button"
      >
        <Icon name="fourSquare" />
      </button>
    </div>
  );
}
