import type { Meta, StoryObj } from "@storybook/react";

import { Textarea } from "./textarea";

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
    variant: "outline",
  },
  argTypes: {
    active: { control: "boolean" },
    radius: { control: "select", options: ["square", "rounded"] },
    shape: { table: { disable: true } },
    state: { control: "select", options: ["default", "error", "view"] },
    textareaSize: { table: { disable: true } },
    size: { control: "select", options: ["small", "medium", "large"] },
    variant: { control: "select", options: ["filled", "outline"] },
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

const sizes = ["small", "medium", "large"] as const;
const radii = ["square", "rounded"] as const;
const variants = ["filled", "outline"] as const;

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
      <Textarea defaultValue="Read only" state="view" />
      <Textarea placeholder="Disabled" disabled />
    </div>
  ),
};

export const AllOptions: Story = {
  render: () => (
    <div className="ds_stack" style={{ width: "var(--size-640)" }}>
      <section className="ds_stack">
        <strong className="type-label_1">Variants</strong>
        {variants.map((variant) => (
          <Textarea
            key={variant}
            placeholder={variant}
            radius="rounded"
            size="medium"
            variant={variant}
          />
        ))}
      </section>

      <section className="ds_stack">
        <strong className="type-label_1">Sizes</strong>
        {sizes.map((size) => (
          <Textarea
            key={size}
            placeholder={size}
            radius="rounded"
            size={size}
            variant="outline"
          />
        ))}
      </section>

      <section className="ds_stack">
        <strong className="type-label_1">Radius</strong>
        {radii.map((radius) => (
          <Textarea
            key={radius}
            placeholder={radius}
            radius={radius}
            size="medium"
            variant="outline"
          />
        ))}
      </section>

      <section className="ds_stack">
        <strong className="type-label_1">States</strong>
        <Textarea placeholder="Default" />
        <Textarea active placeholder="Active" />
        <Textarea placeholder="Error" state="error" />
        <Textarea defaultValue="Read only" state="view" />
        <Textarea placeholder="Disabled" disabled />
      </section>
    </div>
  ),
};
