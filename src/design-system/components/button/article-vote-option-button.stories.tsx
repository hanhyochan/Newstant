import type { Meta, StoryObj } from "@storybook/react";

import { ArticleVoteOptionButton } from "./article-vote-option-button";

const states = ["active", "default"] as const;
const variants = ["binary", "stacked"] as const;
const binaryTones = ["no", "yes"] as const;

const meta: Meta<typeof ArticleVoteOptionButton> = {
  title: "Design System/Components/Button/Article Vote Option Button",
  component: ArticleVoteOptionButton,
  parameters: {
    layout: "centered",
  },
  args: {
    binaryTone: "yes",
    iconSrc: "/icons/icon_yes.svg",
    label: "찬성",
    percent: 68,
    showResult: true,
    state: "active",
    variant: "binary",
  },
  argTypes: {
    binaryTone: { control: "radio", options: binaryTones },
    state: { control: "radio", options: states },
    variant: { control: "radio", options: variants },
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const VariantOptions: Story = {
  render: () => (
    <div className="ds_stack" style={{ width: 360 }}>
      <div className="ds_inline_stack">
        <ArticleVoteOptionButton
          binaryTone="yes"
          iconSrc="/icons/icon_yes.svg"
          label="찬성"
          percent={68}
          showResult
          state="active"
          variant="binary"
        />
        <ArticleVoteOptionButton
          binaryTone="no"
          iconSrc="/icons/icon_no.svg"
          label="반대"
          percent={32}
          showResult
          variant="binary"
        />
      </div>
      <ArticleVoteOptionButton label="현행 제도를 유지해야 한다" percent={54} showResult />
      <ArticleVoteOptionButton label="지원 대상을 더 넓혀야 한다" percent={46} />
    </div>
  ),
};
