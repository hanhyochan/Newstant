import type { Meta, StoryObj } from "@storybook/react";

import { NewsCardMeta } from "./news-meta";

const meta: Meta<typeof NewsCardMeta> = {
  title: "Design System/Components/Button/News/News Card Meta",
  component: NewsCardMeta,
  parameters: {
    layout: "centered",
  },
  args: {
    date: "2026년 6월 30일 09:30",
    dateTime: "2026-06-30T09:30:00",
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {};
