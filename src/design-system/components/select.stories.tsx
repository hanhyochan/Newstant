import type { Meta, StoryObj } from "@storybook/react";

import { Select } from "./select";

const options = [
  { label: "Latest", value: "latest" },
  { label: "Popular", value: "popular" },
  { label: "Saved", value: "saved" },
];

const sizes = ["small", "medium", "large"] as const;
const radii = ["square", "rounded", "full"] as const;
const variants = ["filled", "outline"] as const;

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
    radius: { control: "select", options: radii },
    selectSize: { table: { disable: true } },
    shape: { table: { disable: true } },
    size: { control: "select", options: sizes },
    variant: { control: "select", options: variants },
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: (args) => (
    <div style={{ width: "var(--size-320)" }}>
      <Select {...args} options={args.options ?? options} />
    </div>
  ),
};

export const States: Story = {
  render: () => (
    <div className="ds_stack" style={{ width: "var(--size-320)" }}>
      <Select options={options} />
      <Select active options={options} />
      <Select disabled options={options} />
    </div>
  ),
};

export const Variants: Story = {
  render: () => (
    <div className="ds_stack" style={{ width: "var(--size-320)" }}>
      {variants.map((variant) => (
        <Select
          key={variant}
          options={options}
          radius="rounded"
          size="medium"
          variant={variant}
        />
      ))}
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div className="ds_stack" style={{ width: "var(--size-320)" }}>
      {sizes.map((size) => (
        <Select
          key={size}
          options={options}
          radius="rounded"
          size={size}
          variant="outline"
        />
      ))}
    </div>
  ),
};

export const Radius: Story = {
  render: () => (
    <div className="ds_stack" style={{ width: "var(--size-320)" }}>
      {radii.map((radius) => (
        <Select
          key={radius}
          options={options}
          radius={radius}
          size="medium"
          variant="outline"
        />
      ))}
    </div>
  ),
};

