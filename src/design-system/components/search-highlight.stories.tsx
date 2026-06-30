import type { Meta, StoryObj } from "@storybook/react";

import { SearchHighlightText } from "./search-highlight";

const meta: Meta<typeof SearchHighlightText> = {
  title: "Design System/Components/Search Highlight Text",
  component: SearchHighlightText,
  parameters: {
    layout: "centered",
  },
  args: {
    children: "뉴스롤은 맞춤 뉴스와 정책 정보를 빠르게 찾도록 돕습니다.",
    query: "뉴스",
    targetId: "storybook-search-highlight-target",
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const QueryOptions: Story = {
  render: () => (
    <div className="ds_stack" style={{ width: 420 }}>
      {["뉴스", "정책", "알림"].map((query) => (
        <p className="u_m0" key={query}>
          <SearchHighlightText query={query}>
            뉴스롤은 맞춤 뉴스와 정책 알림을 빠르게 찾도록 돕습니다.
          </SearchHighlightText>
        </p>
      ))}
    </div>
  ),
};
