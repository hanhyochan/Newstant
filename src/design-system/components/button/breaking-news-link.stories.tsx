import type { Meta, StoryObj } from "@storybook/react";

import { BreakingNewsLink } from "./breaking-news-link";

const meta: Meta<typeof BreakingNewsLink> = {
  title: "Design System/Components/Breaking News Link",
  component: BreakingNewsLink,
  parameters: {
    layout: "centered",
  },
  args: {
    href: "#all-breaking-news",
    title: "정청래, ‘필버 중단’ 국민의 힘에 “대구/경북 통합 찬반 당론 먼저 정하라”",
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {};
