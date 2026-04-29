import type { Meta, StoryObj } from "@storybook/react";

import { Button } from "./button";

const sizes = ["small", "medium", "large"] as const;
const radii = ["square", "rounded", "full"] as const;
const variants = ["filled", "outline"] as const;

const meta: Meta<typeof Button> = {
  title: "Design System/Components/Button",
  component: Button,
  parameters: {
    layout: "centered",
  },
  args: {
    active: false,
    children: "Button",
    radius: "rounded",
    size: "medium",
    variant: "filled",
  },
  argTypes: {
    active: { control: "boolean" },
    radius: { control: "select", options: radii },
    shape: { table: { disable: true } },
    size: { control: "select", options: sizes },
    variant: { control: "select", options: variants },
  },
};

export default meta;

type Story = StoryObj;

export const Playground: Story = {};

export const States: Story = {
  render: () => (
    <div className="ds_stack">
      <div className="ds_inline_stack">
        <Button variant="outline">Default</Button>
        <Button active variant="outline">
          Active
        </Button>
        <Button disabled variant="outline">
          Disabled
        </Button>
      </div>
      <div className="ds_inline_stack">
        <Button aria-label="Default icon" iconOnly variant="outline">
          <span aria-hidden="true" className="btn_icon_mark" />
        </Button>
        <Button active aria-label="Active icon" iconOnly variant="outline">
          <span aria-hidden="true" className="btn_icon_mark" />
        </Button>
        <Button disabled aria-label="Disabled icon" iconOnly variant="outline">
          <span aria-hidden="true" className="btn_icon_mark" />
        </Button>
      </div>
    </div>
  ),
};

export const Variants: Story = {
  render: () => (
    <div className="ds_inline_stack">
      {variants.map((variant) => (
        <Button key={variant} variant={variant}>
          {variant}
        </Button>
      ))}
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div className="ds_inline_stack">
      {sizes.map((size) => (
        <Button key={size} size={size} variant="outline">
          {size}
        </Button>
      ))}
    </div>
  ),
};

export const Radius: Story = {
  render: () => (
    <div className="ds_inline_stack">
      {radii.map((radius) => (
        <Button key={radius} radius={radius} variant="outline">
          {radius}
        </Button>
      ))}
    </div>
  ),
};

