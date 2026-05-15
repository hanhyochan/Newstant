import type { Meta, StoryObj } from "@storybook/react";

import { ReactionButton } from "./reaction-button";

const meta: Meta<typeof ReactionButton> = {
  title: "Design System/Components/Reaction Button",
  component: ReactionButton,
  parameters: {
    layout: "centered",
  },
  argTypes: {
    tone: { control: "select", options: ["like", "dislike", "neutral"] },
    variant: { control: "select", options: ["article", "comment"] },
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Article: Story = {
  render: () => (
    <div className="wrapper_articleReaction">
      <ReactionButton icon="thumbUp" tone="like" variant="article">
        <strong>좋아요 16</strong>
      </ReactionButton>
      <ReactionButton icon="thumbDown" tone="dislike" variant="article">
        <strong>싫어요 12</strong>
      </ReactionButton>
      <ReactionButton icon="dots" tone="neutral" variant="article">
        <strong>글쎄요 5</strong>
      </ReactionButton>
    </div>
  ),
};

export const CommentMini: Story = {
  render: () => (
    <div className="ds_inline_stack">
      <ReactionButton icon="thumbUp" tone="like" variant="comment">
        16
      </ReactionButton>
      <ReactionButton icon="thumbDown" tone="dislike" variant="comment">
        16
      </ReactionButton>
    </div>
  ),
};
