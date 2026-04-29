import type { Meta, StoryObj } from "@storybook/react";

import { Select } from "./select";

const options = [
  { label: "Latest", value: "latest" },
  { label: "Popular", value: "popular" },
  { label: "Saved", value: "saved" },
];

const meta: Meta<typeof Select> = {
  title: "Design System/Components/Select",
  component: Select,
  parameters: {
    layout: "centered",
  },
  args: {
    active: false,
    options,
    radius: "rounded",
    size: "medium",
    variant: "outline",
  },
  argTypes: {
    active: { control: "boolean" },
    options: { control: false },
    radius: { control: "select", options: ["square", "rounded", "full"] },
    selectSize: { table: { disable: true } },
    shape: { table: { disable: true } },
    size: { control: "select", options: ["small", "medium", "large"] },
    variant: { control: "select", options: ["filled", "outline"] },
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

const sizes = ["small", "medium", "large"] as const;
const radii = ["square", "rounded", "full"] as const;
const variants = ["filled", "outline"] as const;

export const Playground: Story = {
  render: (args) => (
    <div style={{ width: "var(--size-320)" }}>
      <Select {...args} options={args.options ?? options} />
    </div>
  ),
};

export const Disabled: Story = {
  args: {
    disabled: true,
    options,
  },
};

export const AllOptions: Story = {
  render: () => (
    <div className="ds_stack" style={{ width: "var(--size-640)" }}>
      <section className="ds_stack">
        <strong className="type-label_1">Variants</strong>
        {variants.map((variant) => (
          <Select
            key={variant}
            options={options}
            radius="rounded"
            size="medium"
            variant={variant}
          />
        ))}
      </section>

      <section className="ds_stack">
        <strong className="type-label_1">Sizes</strong>
        {sizes.map((size) => (
          <Select
            key={size}
            options={options}
            radius="rounded"
            size={size}
            variant="outline"
          />
        ))}
      </section>

      <section className="ds_stack">
        <strong className="type-label_1">Radius</strong>
        {radii.map((radius) => (
          <Select
            key={radius}
            options={options}
            radius={radius}
            size="medium"
            variant="outline"
          />
        ))}
      </section>

      <section className="ds_stack">
        <strong className="type-label_1">States</strong>
        <Select options={options} />
        <Select active options={options} />
        <Select disabled options={options} />
      </section>
    </div>
  ),
};
