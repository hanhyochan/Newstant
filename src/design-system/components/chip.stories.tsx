import type { Meta, StoryObj } from "@storybook/react";

import { Chip } from "./chip";

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
    size: "medium",
    variant: "gray_line_outline",
  },
  argTypes: {
    active: { control: "boolean" },
    chipSize: { table: { disable: true } },
    radius: { control: "select", options: ["square", "rounded", "full"] },
    size: { control: "select", options: ["small", "medium", "large"] },
    variant: {
      control: "select",
      options: ["filled", "outline", "gray_line_outline"],
    },
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

const sizes = ["small", "medium", "large"] as const;
const radii = ["square", "rounded", "full"] as const;
const variants = ["filled", "outline", "gray_line_outline"] as const;

export const Playground: Story = {};

export const AllOptions: Story = {
  render: () => (
    <div className="ds_stack">
      <section className="ds_stack">
        <strong className="type-label_1">States</strong>
        <div className="ds_inline_stack">
          <Chip>Default</Chip>
          <Chip active>Active</Chip>
          <Chip disabled>Disabled</Chip>
        </div>
      </section>

      <section className="ds_stack">
        <strong className="type-label_1">Variants</strong>
        <div className="ds_inline_stack">
          {variants.map((variant) => (
            <Chip key={variant} variant={variant}>
              {variant}
            </Chip>
          ))}
        </div>
      </section>

      <section className="ds_stack">
        <strong className="type-label_1">Sizes</strong>
        <div className="ds_inline_stack">
          {sizes.map((size) => (
            <Chip key={size} size={size}>
              {size}
            </Chip>
          ))}
        </div>
      </section>

      <section className="ds_stack">
        <strong className="type-label_1">Radius</strong>
        <div className="ds_inline_stack">
          {radii.map((radius) => (
            <Chip key={radius} radius={radius}>
              {radius}
            </Chip>
          ))}
        </div>
      </section>
    </div>
  ),
};

export const Variants: Story = {
  render: () => (
    <div className="ds_inline_stack">
      <Chip variant="filled">Filled</Chip>
      <Chip variant="outline">Outline</Chip>
      <Chip variant="gray_line_outline">Gray line</Chip>
      <Chip active>Active</Chip>
      <Chip disabled>Disabled</Chip>
    </div>
  ),
};
