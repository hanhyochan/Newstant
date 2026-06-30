import type { Meta, StoryObj } from "@storybook/react";

import { IconButton } from "./icon-button";

const icons = [
  "alarm",
  "bookmark",
  "close",
  "detail",
  "home",
  "search",
  "setting",
  "share",
] as const;
const tones = ["danger", "neutral", "primary", "translucent"] as const;
const variants = ["articleTool", "plain", "shaped", "bottomNav", "circle"] as const;
const iconSizes = [12, 20] as const;

const meta: Meta<typeof IconButton> = {
  title: "Design System/Components/Icon Button",
  component: IconButton,
  parameters: {
    layout: "centered",
  },
  args: {
    icon: "search",
    iconSize: 20,
    label: "검색",
    tone: "primary",
    variant: "plain",
  },
  argTypes: {
    icon: { control: "select", options: icons },
    iconSize: { control: "radio", options: iconSizes },
    tone: { control: "select", options: tones },
    variant: { control: "select", options: variants },
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Toolbar: Story = {
  render: () => (
    <div className="ds_inline_stack">
      <IconButton icon="search" label="검색" variant="shaped" />
      <IconButton hasUnreadIndicator icon="alarm" label="알림" variant="shaped" />
    </div>
  ),
};

export const ArticleTools: Story = {
  render: () => (
    <div className="wrapper_articleActions" aria-label="기사 도구" role="group">
      <IconButton icon="share" label="공유" variant="articleTool" />
      <IconButton icon="bookmark" label="북마크" variant="articleTool" />
    </div>
  ),
};

export const CommentAction: Story = {
  render: () => <IconButton className="btn_commentAction" icon="detail" label="댓글 더보기" />,
};

export const VariantOptions: Story = {
  render: () => (
    <div className="ds_inline_stack">
      {variants.map((variant) => (
        <IconButton
          icon={variant === "bottomNav" ? "home" : "search"}
          key={variant}
          label={variant}
          variant={variant}
        />
      ))}
    </div>
  ),
};

export const ToneOptions: Story = {
  render: () => (
    <div className="ds_inline_stack">
      {tones.map((tone) => (
        <IconButton icon="bookmark" key={tone} label={tone} tone={tone} variant="shaped" />
      ))}
    </div>
  ),
};
