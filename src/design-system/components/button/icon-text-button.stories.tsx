import type { Meta, StoryObj } from "@storybook/react";

import { IconTextButton } from "./icon-text-button";

const sizes = ["default", "small"] as const;
const tones = ["bookmark", "comment", "dislike", "like", "neutral", "vote"] as const;

const meta: Meta<typeof IconTextButton> = {
  title: "Design System/Components/Icon Text Button",
  component: IconTextButton,
  parameters: {
    layout: "centered",
  },
  argTypes: {
    size: { control: "radio", options: sizes },
    tone: { control: "select", options: tones },
  },
  args: {
    children: "좋아요 16",
    icon: "thumbUp",
    size: "default",
    tone: "like",
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Default: Story = {
  render: () => (
    <div className="wrapper_articleReaction">
      <IconTextButton icon="thumbUp" tone="like">
        <strong>좋아요 16</strong>
      </IconTextButton>
      <IconTextButton icon="thumbDown" tone="dislike">
        <strong>싫어요 12</strong>
      </IconTextButton>
      <IconTextButton icon="dots" tone="neutral">
        <strong>글쎄요 5</strong>
      </IconTextButton>
    </div>
  ),
};

export const Small: Story = {
  render: () => (
    <div className="ds_inline_stack">
      <IconTextButton icon="thumbUp" size="small" tone="like">
        16
      </IconTextButton>
      <IconTextButton icon="thumbDown" size="small" tone="dislike">
        16
      </IconTextButton>
    </div>
  ),
};

export const ToneOptions: Story = {
  render: () => (
    <div className="ds_inline_stack">
      {tones.map((tone) => (
        <IconTextButton
          icon={
            tone === "bookmark"
              ? "bookmark"
              : tone === "comment"
                ? "chat"
                : tone === "vote"
                  ? "vote"
                  : tone === "dislike"
                    ? "thumbDown"
                    : tone === "like"
                      ? "thumbUp"
                      : "dots"
          }
          key={tone}
          tone={tone}
        >
          {tone}
        </IconTextButton>
      ))}
    </div>
  ),
};
