import type { Meta, StoryObj } from "@storybook/react";

import { IconTextButton } from "./icon-text-button";

const meta: Meta<typeof IconTextButton> = {
  title: "Design System/Components/Icon Text Button",
  component: IconTextButton,
  parameters: {
    layout: "centered",
  },
  argTypes: {
    size: { control: "select", options: ["default", "small"] },
    tone: {
      control: "select",
      options: ["bookmark", "comment", "dislike", "like", "neutral", "vote"],
    },
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

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
