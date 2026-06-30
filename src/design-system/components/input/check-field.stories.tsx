import type { Meta, StoryObj } from "@storybook/react";

import { CheckInput } from "./check-field";

const sizes = ["md", "lg"] as const;
const variants = ["withText", "withoutText"] as const;
const roles = [
  "default",
  "autoLogin",
  "agreementAll",
  "selectAll",
  "selectionItem",
  "chevronRow",
] as const;

const meta: Meta = {
  title: "Design System/Components/Input/Check Input",
  parameters: {
    layout: "centered",
  },
  args: {
    checked: true,
    label: "선택 항목",
    role: "default",
    size: "md",
    variant: "withText",
  },
  argTypes: {
    role: { control: "select", options: roles },
    size: { control: "radio", options: sizes },
    variant: { control: "radio", options: variants },
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const RoleOptions: Story = {
  render: () => (
    <div className="ds_stack">
      {roles.map((role) => (
        <CheckInput checked key={role} label={role} role={role} />
      ))}
    </div>
  ),
};

export const SizeAndVariantOptions: Story = {
  render: () => (
    <div className="ds_inline_stack">
      <CheckInput checked label="md withText" size="md" />
      <CheckInput checked label="lg withText" size="lg" />
      <CheckInput ariaLabel="without text" checked variant="withoutText" />
    </div>
  ),
};
