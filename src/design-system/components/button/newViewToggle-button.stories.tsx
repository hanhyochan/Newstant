import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";

import { Icon } from "../icon/icon";
import { NewViewToggleButton } from "./newViewToggle-button";

const items = [
  { id: "list", label: "리스트" },
  { id: "grid", label: "그리드" },
] as const;

const meta: Meta<typeof NewViewToggleButton> = {
  title: "Design System/Components/Button/New View Toggle Button",
  component: NewViewToggleButton,
  parameters: {
    layout: "centered",
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: () => {
    const [value, setValue] = useState<(typeof items)[number]["id"]>("list");

    return (
      <NewViewToggleButton
        ariaLabel="보기 방식"
        getTabId={(id) => `storybook-view-toggle-${id}`}
        items={[...items]}
        onChange={setValue}
        value={value}
      />
    );
  },
};

export const WithCustomContent: Story = {
  render: () => {
    const [value, setValue] = useState<(typeof items)[number]["id"]>("grid");

    return (
      <NewViewToggleButton
        ariaLabel="뉴스 보기 방식"
        className="wrapper_newsViewToggle"
        getButtonClassName={() => "btn_newsViewOption"}
        getItemAriaLabel={(id) => (id === "list" ? "리스트형" : "블록형")}
        getTabId={(id) => `storybook-news-view-${id}`}
        items={[...items]}
        onChange={setValue}
        renderItemContent={(item) => (
          <Icon name={item.id === "list" ? "list" : "fourSquare"} />
        )}
        value={value}
      />
    );
  },
};
