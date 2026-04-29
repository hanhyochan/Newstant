import type { Meta, StoryObj } from "@storybook/react";

import { Button } from "./button";

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
    radius: { control: "select", options: ["square", "rounded", "full"] },
    size: { control: "select", options: ["small", "medium", "large"] },
    shape: { table: { disable: true } },
    variant: { control: "select", options: ["filled", "outline"] },
  },
};

export default meta;

type Story = StoryObj;

const sizes = ["small", "medium", "large"] as const;
const radii = ["square", "rounded", "full"] as const;
const variants = ["filled", "outline"] as const;

export const Playground: Story = {};

export const AllOptions: Story = {
  render: () => (
    <div className="ds_stack">
      <section className="ds_stack">
        <strong className="type-label_1">States</strong>
        <div className="ds_inline_stack">
          <Button variant="outline">Default</Button>
          <Button active variant="outline">
            Active
          </Button>
          <Button disabled variant="outline">
            Disabled
          </Button>
        </div>
      </section>

      <section className="ds_stack">
        <strong className="type-label_1">Variants</strong>
        <div className="ds_inline_stack">
          {variants.map((variant) => (
            <Button key={variant} variant={variant}>
              {variant}
            </Button>
          ))}
        </div>
      </section>

      <section className="ds_stack">
        <strong className="type-label_1">Sizes</strong>
        <div className="ds_inline_stack">
          {sizes.map((size) => (
            <Button key={size} size={size} variant="outline">
              {size}
            </Button>
          ))}
        </div>
      </section>

      <section className="ds_stack">
        <strong className="type-label_1">Radius</strong>
        <div className="ds_inline_stack">
          {radii.map((radius) => (
            <Button key={radius} radius={radius} variant="outline">
              {radius}
            </Button>
          ))}
        </div>
      </section>

      <section className="ds_stack">
        <strong className="type-label_1">Icon States</strong>
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
      </section>
    </div>
  ),
};

export const Variants: Story = {
  render: () => (
    <div className="ds_inline_stack">
      <Button>Filled</Button>
      <Button variant="outline">Outline</Button>
      <Button disabled>Disabled</Button>
      <Button href="/" variant="outline">
        Anchor
      </Button>
    </div>
  )
};

export const ShapesAndSizes: Story = {
  render: () => (
    <div className="ds_stack">
      <div className="ds_inline_stack">
        <Button size="small" radius="square">
          Small
        </Button>
        <Button size="medium" radius="rounded">
          Medium
        </Button>
        <Button size="large" radius="full">
          Large
        </Button>
      </div>
      <div className="ds_inline_stack">
        <Button aria-label="Icon action" iconOnly size="small">
          <span aria-hidden="true" className="btn_icon_mark" />
        </Button>
        <Button aria-label="Icon action" iconOnly size="medium" variant="outline">
          <span aria-hidden="true" className="btn_icon_mark" />
        </Button>
        <Button aria-label="Icon action" iconOnly size="large" radius="full">
          <span aria-hidden="true" className="btn_icon_mark" />
        </Button>
      </div>
    </div>
  ),
};
