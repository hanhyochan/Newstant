import type { Meta, StoryObj } from "@storybook/react";

import { NewsCardMeta } from "./news-meta";

const meta: Meta<typeof NewsCardMeta> = {
  title: "Design System/Components/Button/News/News Card Meta",
  component: NewsCardMeta,
  parameters: {
    layout: "centered",
  },
  args: {
    date: "0000년 00월 00일",
    dateTime: "2026-06-30T09:30:00",
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {};
