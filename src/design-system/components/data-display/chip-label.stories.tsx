import type { Meta, StoryObj } from "@storybook/react";

import { ChipLabel } from "./chip-label";

const meta: Meta<typeof ChipLabel> = {
  title: "Design System/Components/Data Display/Chip Label",
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
    children: "지역사회 정책 브리핑",
  },
};

export const CategoryOptions: Story = {
  render: () => (
    <div className="ds_inline_stack">
      {["정치", "경제", "사회", "복지", "알림"].map((label) => (
        <ChipLabel key={label}>{label}</ChipLabel>
      ))}
    </div>
  ),
};
