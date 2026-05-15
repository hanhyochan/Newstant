import type { Meta, StoryObj } from "@storybook/react";

import { ChipLabel } from "./chip-label";

const meta: Meta<typeof ChipLabel> = {
  title: "Design System/Components/Chip",
  component: ChipLabel,
  parameters: {
    layout: "centered",
  },
  args: {
    children: "정치",
    kind: "articleCategory",
  },
  argTypes: {
    kind: { control: "select", options: ["articleCategory", "commentChoice"] },
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

export const ArticleCategory: Story = {};

export const CommentChoice: Story = {
  args: {
    children: "정책 지원을 먼저 확대해야 한다.",
    kind: "commentChoice",
  },
};
