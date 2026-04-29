import type { Meta, StoryObj } from "@storybook/react";

import { Badge } from "./badge";

const meta: Meta<typeof Badge> = {
  title: "Design System/Components/Badge",
  component: Badge,
  parameters: {
    layout: "centered",
  },
  args: {
    children: "Badge",
    radius: "full",
    size: "small",
    variant: "filled",
  },
  argTypes: {
    badgeSize: { table: { disable: true } },
    radius: { control: "select", options: ["square", "rounded", "full"] },
    size: { control: "select", options: ["small", "medium"] },
    variant: {
      control: "select",
      options: ["filled", "outline", "gray_line_outline"],
    },
  },
};

export default meta;

type Story = StoryObj;

export const Playground: Story = {};

export const Variants: Story = {
  render: () => (
    <div className="ds_inline_stack">
      <Badge>Filled</Badge>
      <Badge variant="outline">Outline</Badge>
      <Badge variant="gray_line_outline">Gray line</Badge>
      <Badge size="medium">Medium</Badge>
    </div>
  ),
};
