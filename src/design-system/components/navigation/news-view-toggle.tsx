import { NewViewToggleButton } from "../button/newViewToggle-button";
import { Icon } from "../icon/icon";

export type NewsViewMode = "reels" | "block";

export type NewsViewToggleProps = {
  mode: NewsViewMode;
  onModeChange: (mode: NewsViewMode) => void;
};

const viewModeItems = [
  { id: "reels", label: "리스트형" },
  { id: "block", label: "블록형" },
] satisfies { id: NewsViewMode; label: string }[];

export function NewsViewToggle({ mode, onModeChange }: NewsViewToggleProps) {
  const panelIds: Record<NewsViewMode, string> = {
    reels: "home-news-reels-panel",
    block: "home-news-block-panel",
  };

  return (
    <NewViewToggleButton
      ariaLabel="뉴스 보기 방식"
      className="wrapper_newsViewToggle"
      getButtonClassName={() => "btn_newsViewOption"}
      getItemAriaLabel={(id) =>
        viewModeItems.find((item) => item.id === id)?.label
      }
      getPanelId={(id) => (id === mode ? panelIds[id] : undefined)}
      getTabId={(id) => `home-news-view-tab-${id}`}
      items={viewModeItems}
      onChange={onModeChange}
      renderItemContent={(item) => (
        <Icon name={item.id === "reels" ? "list" : "fourSquare"} />
      )}
      value={mode}
    />
  );
}
