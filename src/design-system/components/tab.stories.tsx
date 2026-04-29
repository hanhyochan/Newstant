import type { Meta, StoryObj } from "@storybook/react";

import { Tabs } from "./tab";

const items = [
  { id: "latest", label: "Latest", panel: "Latest news panel" },
  { id: "popular", label: "Popular", panel: "Popular news panel" },
  { id: "saved", label: "Saved", panel: "Saved news panel" },
];

const stateItems = [
  { id: "active", label: "Active", panel: "Active tab panel" },
  { id: "default", label: "Default", panel: "Default tab panel" },
  { disabled: true, id: "disabled", label: "Disabled", panel: "Disabled tab panel" },
];

const meta: Meta<typeof Tabs> = {
  title: "Design System/Components/Tab",
  component: Tabs,
  parameters: {
    layout: "centered",
  },
  args: {
    items,
    radius: "rounded",
    size: "medium",
    variant: "gray_line_outline",
  },
  argTypes: {
    items: { control: false },
    radius: { control: "select", options: ["square", "rounded", "full"] },
    size: { control: "select", options: ["small", "medium", "large"] },
    shape: { table: { disable: true } },
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
        <Tabs items={stateItems} radius="rounded" size="medium" variant="outline" />
      </section>

      <section className="ds_stack">
        <strong className="type-label_1">Variants</strong>
        {variants.map((variant) => (
          <Tabs
            key={variant}
            items={items}
            radius="rounded"
            size="medium"
            variant={variant}
          />
        ))}
      </section>

      <section className="ds_stack">
        <strong className="type-label_1">Sizes</strong>
        {sizes.map((size) => (
          <Tabs
            key={size}
            items={items}
            radius="rounded"
            size={size}
            variant="outline"
          />
        ))}
      </section>

      <section className="ds_stack">
        <strong className="type-label_1">Radius</strong>
        {radii.map((radius) => (
          <Tabs
            key={radius}
            items={items}
            radius={radius}
            size="medium"
            variant="outline"
          />
        ))}
      </section>
    </div>
  ),
};

export const FullRounded: Story = {
  args: {
    radius: "full",
    variant: "filled",
  },
};
