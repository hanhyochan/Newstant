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
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const LongLabel: Story = {
  args: {
    children: "상황을 더 지켜본 뒤 판단해야 한다.",
  },
};
