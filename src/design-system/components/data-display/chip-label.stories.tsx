import type { Meta, StoryObj } from "@storybook/react";

import { ChipLabel } from "./chip-label";

const meta: Meta<typeof ChipLabel> = {
  title: "Design System/Components/Data Display/Chip",
  component: ChipLabel,
  parameters: {
    layout: "centered",
  },
  args: {
    children: "?뺤튂",
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const LongLabel: Story = {
  args: {
    children: "?곹솴????吏耳쒕낯 ???먮떒?댁빞 ?쒕떎.",
  },
};
