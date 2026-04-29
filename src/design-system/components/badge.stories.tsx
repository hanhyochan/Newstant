import type { Meta, StoryObj } from "@storybook/react";

import { Badge } from "./badge";

const sizes = ["small", "medium"] as const;
const radii = ["square", "rounded", "full"] as const;
const variants = ["filled", "outline", "gray_line_outline"] as const;

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
    radius: { control: "select", options: radii },
    size: { control: "select", options: sizes },
    variant: { control: "select", options: variants },
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Variants: Story = {
  render: () => (
    <div className="ds_inline_stack">
      {variants.map((variant) => (
        <Badge key={variant} variant={variant}>
          {variant}
        </Badge>
      ))}
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div className="ds_inline_stack">
      {sizes.map((size) => (
        <Badge key={size} size={size}>
          {size}
        </Badge>
      ))}
    </div>
  ),
};

export const Radius: Story = {
  render: () => (
    <div className="ds_inline_stack">
      {radii.map((radius) => (
        <Badge key={radius} radius={radius}>
          {radius}
        </Badge>
      ))}
    </div>
  ),
};

