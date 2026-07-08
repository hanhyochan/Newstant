import type { Meta, StoryObj } from "@storybook/react";

import { PrimaryButton } from "./primary-button";

const tones = ["default", "neutral", "danger"] as const;

const meta: Meta<typeof PrimaryButton> = {
  title: "Design System/Components/Button/Primary Button",
  component: PrimaryButton,
  parameters: {
    layout: "centered",
  },
  args: {
    children: "확인",
    tone: "default",
  },
  argTypes: {
    tone: { control: "select", options: tones },
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const ToneOptions: Story = {
  render: () => (
    <div className="ds_inline_stack">
      {tones.map((tone) => (
        <PrimaryButton key={tone} tone={tone}>
          {tone}
        </PrimaryButton>
      ))}
    </div>
  ),
};
