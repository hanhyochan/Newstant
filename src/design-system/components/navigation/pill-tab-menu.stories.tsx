import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";

import { PillTabMenu } from "./pill-tab-menu";

const items = [
  { id: "all", label: "전체" },
  { id: "first", label: "어쩌구 저쩌구해서 어케 해야한다." },
  { id: "second", label: "상황을 더 지켜본 뒤 판단해야 한다." },
  { id: "third", label: "정책 지원을 먼저 확대해야 한다." },
];

const meta: Meta<typeof PillTabMenu> = {
  title: "Design System/Components/Pill Tab Menu",
  component: PillTabMenu,
  parameters: {
    layout: "centered",
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: () => {
    const [value, setValue] = useState("all");

    return (
      <PillTabMenu
        ariaLabel="탭 메뉴"
        className="wrapper_commentTabs"
        items={items}
        onChange={setValue}
        value={value}
      />
    );
  },
};
