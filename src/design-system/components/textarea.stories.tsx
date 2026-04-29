import type { Meta, StoryObj } from "@storybook/react";

import { Textarea } from "./textarea";

const sizes = ["small", "medium", "large"] as const;
const radii = ["square", "rounded"] as const;
const variants = ["filled", "outline"] as const;

const meta: Meta<typeof Textarea> = {
  title: "Design System/Components/Textarea",
  component: Textarea,
  parameters: {
    layout: "centered",
  },
  args: {
    active: false,
    placeholder: "Enter long text",
    radius: "rounded",
    size: "medium",
    state: "default",
    variant: "outline",
  },
  argTypes: {
    active: { control: "boolean" },
    radius: { control: "select", options: radii },
    shape: { table: { disable: true } },
    state: { control: "select", options: ["default", "error", "view"] },
    textareaSize: { table: { disable: true } },
    size: { control: "select", options: sizes },
    variant: { control: "select", options: variants },
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: (args) => (
    <div style={{ width: "var(--size-320)" }}>
      <Textarea {...args} />
    </div>
  ),
};

export const States: Story = {
  render: () => (
    <div className="ds_stack" style={{ width: "var(--size-320)" }}>
      <Textarea placeholder="Default" />
      <Textarea active placeholder="Active" />
      <Textarea placeholder="Error" state="error" />
      <Textarea placeholder="Disabled" disabled />
      <Textarea defaultValue="Read only" state="view" />
    </div>
  ),
};

export const Variants: Story = {
  render: () => (
    <div className="ds_stack" style={{ width: "var(--size-320)" }}>
      {variants.map((variant) => (
        <Textarea
          key={variant}
          placeholder={variant}
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
        <Textarea
          key={size}
          placeholder={size}
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
        <Textarea
          key={radius}
          placeholder={radius}
          radius={radius}
          size="medium"
          variant="outline"
        />
      ))}
    </div>
  ),
};

