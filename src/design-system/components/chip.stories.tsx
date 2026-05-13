import type { Meta, StoryObj } from "@storybook/react";

import { Chip } from "./chip";

const sizes = ["small", "medium", "large"] as const;
const radii = ["square", "rounded", "full"] as const;
const variants = ["filled", "outline", "gray_line_outline"] as const;

const meta: Meta<typeof Chip> = {
  title: "Design System/Components/Chip",
  component: Chip,
  parameters: {
    layout: "centered",
  },
  args: {
    active: false,
    children: "Chip",
    radius: "full",
    size: "small",
    variant: "filled",
  },
  argTypes: {
    active: { control: "boolean" },
    chipSize: { table: { disable: true } },
    radius: { control: "select", options: radii },
    size: { control: "select", options: sizes },
    variant: { control: "select", options: variants },
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const States: Story = {
  render: () => (
    <div className="ds_inline_stack">
      <Chip>Default</Chip>
      <Chip active>Active</Chip>
      <Chip disabled>Disabled</Chip>
    </div>
  ),
};

export const Variants: Story = {
  render: () => (
    <div className="ds_inline_stack">
      {variants.map((variant) => (
        <Chip key={variant} variant={variant}>
          {variant}
        </Chip>
      ))}
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div className="ds_inline_stack">
      {sizes.map((size) => (
        <Chip key={size} size={size}>
          {size}
        </Chip>
      ))}
    </div>
  ),
};

export const Radius: Story = {
  render: () => (
    <div className="ds_inline_stack">
      {radii.map((radius) => (
        <Chip key={radius} radius={radius}>
          {radius}
        </Chip>
      ))}
    </div>
  ),
};

