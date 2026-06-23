import type { Meta, StoryObj } from "@storybook/react";

import { NoticeCardLink } from "./notice-card-link";

const meta: Meta<typeof NoticeCardLink> = {
  title: "Design System/Components/Notice Card Link",
  component: NoticeCardLink,
  parameters: {
    layout: "centered",
  },
  args: {
    href: "#all-breaking-news",
    showIcon: true,
    title: "정청래, ‘필버 중단’ 국민의 힘에 “대구/경북 통합 찬반 당론 먼저 정하라”",
    type: "breaking",
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {};
