import type { Meta, StoryObj } from "@storybook/react";

import { IconButton } from "./icon-button";

const meta: Meta<typeof IconButton> = {
  title: "Design System/Components/Icon Button",
  component: IconButton,
  parameters: {
    layout: "centered",
  },
  args: {
    baseClassName: "newsroll_toolbar_icon",
    icon: "search",
    label: "검색",
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Toolbar: Story = {
  render: () => (
    <div className="ds_inline_stack">
      <IconButton baseClassName="newsroll_toolbar_icon" icon="search" label="검색" />
      <IconButton baseClassName="newsroll_toolbar_icon" icon="alarm" label="알림" />
    </div>
  ),
};

export const ArticleTools: Story = {
  render: () => (
    <div className="wrapper_articleActions" aria-label="기사 도구" role="group">
      <IconButton baseClassName="btn_articleTool" icon="share" label="공유" />
      <IconButton baseClassName="btn_articleTool" icon="bookmark" label="북마크" />
    </div>
  ),
};

export const CommentAction: Story = {
  render: () => <IconButton baseClassName="btn_commentAction" icon="detail" label="댓글 더보기" />,
};
