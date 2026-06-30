import type { Meta, StoryObj } from "@storybook/react";

import { FieldActionButton } from "./field-action-button";

const tones = ["purple", "white"] as const;

const meta: Meta<typeof FieldActionButton> = {
  title: "Design System/Components/Button/Field Action Button",
  component: FieldActionButton,
  parameters: {
    layout: "centered",
  },
  args: {
    children: "확인",
    tone: "purple",
  },
  argTypes: {
    tone: { control: "radio", options: tones },
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const ToneOptions: Story = {
  render: () => (
    <div className="ds_inline_stack">
      {tones.map((tone) => (
        <FieldActionButton key={tone} tone={tone}>
          {tone}
        </FieldActionButton>
      ))}
    </div>
  ),
};
