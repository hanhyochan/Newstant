import type { Meta, StoryObj } from "@storybook/react";

import { ContentActionButton } from "./content-action-button";

const tones = ["dark", "light"] as const;

const meta: Meta = {
  title: "Design System/Components/Button/Content Action Button",
  parameters: {
    layout: "centered",
  },
  args: {
    children: "자세히 보기",
    disabled: false,
    tone: "light",
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
        <ContentActionButton key={tone} tone={tone}>
          {tone}
        </ContentActionButton>
      ))}
    </div>
  ),
};

export const AsLink: Story = {
  args: {
    children: "뉴스 보기",
    href: "#news",
  },
};
