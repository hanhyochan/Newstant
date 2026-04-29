import type { Meta, StoryObj } from "@storybook/react";

import { TextInput } from "./text-input";

const meta: Meta<typeof TextInput> = {
  title: "Design System/Components/Text Input",
  component: TextInput,
  parameters: {
    layout: "centered",
  },
  args: {
    active: false,
    placeholder: "Enter text",
    radius: "rounded",
    size: "medium",
    state: "default",
    variant: "outline",
  },
  argTypes: {
    active: { control: "boolean" },
    inputSize: { table: { disable: true } },
    radius: { control: "select", options: ["square", "rounded", "full"] },
    shape: { table: { disable: true } },
    size: { control: "select", options: ["small", "medium", "large", "xlarge"] },
    state: { control: "select", options: ["default", "complete", "error", "view"] },
    variant: { control: "select", options: ["filled", "outline"] },
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

const sizes = ["small", "medium", "large", "xlarge"] as const;
const radii = ["square", "rounded", "full"] as const;
const variants = ["filled", "outline"] as const;

export const Playground: Story = {
  render: (args) => (
    <div style={{ width: "var(--size-320)" }}>
      <TextInput {...args} />
    </div>
  ),
};

export const States: Story = {
  render: () => (
    <div className="ds_stack" style={{ width: "var(--size-320)" }}>
      <TextInput placeholder="Default" />
      <TextInput active placeholder="Active" />
      <TextInput placeholder="Complete" state="complete" />
      <TextInput placeholder="Error" state="error" />
      <TextInput placeholder="Disabled" disabled />
      <TextInput defaultValue="Read only" state="view" />
    </div>
  ),
};

export const AllOptions: Story = {
  render: () => (
    <div className="ds_stack" style={{ width: "var(--size-640)" }}>
      <section className="ds_stack">
        <strong className="type-label_1">Variants</strong>
        {variants.map((variant) => (
          <TextInput
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
          <TextInput
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
          <TextInput
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
        <TextInput placeholder="Default" />
        <TextInput active placeholder="Active" />
        <TextInput placeholder="Complete" state="complete" />
        <TextInput placeholder="Error" state="error" />
        <TextInput placeholder="Disabled" disabled />
        <TextInput defaultValue="Read only" state="view" />
      </section>
    </div>
  ),
};
