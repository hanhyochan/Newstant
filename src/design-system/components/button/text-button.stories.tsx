import type { Meta, StoryObj } from "@storybook/react";

import { TextButton } from "./text-button";

const tones = ["default", "danger"] as const;

const meta: Meta<typeof TextButton> = {
  title: "Design System/Components/Button/Text Button",
  component: TextButton,
  parameters: {
    layout: "centered",
  },
  args: {
    children: "수정",
    tone: "default",
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
        <TextButton key={tone} tone={tone}>
          {tone === "danger" ? "삭제" : "수정"}
        </TextButton>
      ))}
    </div>
  ),
};
