import type { Meta, StoryObj } from "@storybook/react";

import { Icon } from "../icon/icon";
import { Button } from "./button";

const meta: Meta<typeof Button> = {
  title: "Design System/Components/Button",
  component: Button,
  parameters: {
    layout: "centered",
  },
};

export default meta;

type Story = StoryObj;

export const OriginalArticle: Story = {
  render: () => (
    <Button
      className="btn_originalArticle"
      classNameOnly
      href="https://example.com/original-news"
      size="medium"
      variant="filled"
    >
      기사 원문 보기
    </Button>
  ),
};

export const PrimaryCommentPanel: Story = {
  render: () => (
    <Button className="btn_commentPanel" classNameOnly size="large" variant="filled">
      <Icon name="chat" />
      댓글 반응보기
    </Button>
  ),
};

export const HomeDockedAlarm: Story = {
  render: () => (
    <Button
      aria-label="알림"
      aria-pressed="false"
      className="newsroll_homeDockedAlarm"
      iconOnly
      radius="full"
      size="large"
      variant="outline"
    >
      <Icon name="alarm" />
    </Button>
  ),
};

export const CommentMineFilter: Story = {
  render: () => (
    <Button aria-pressed="false" className="btn_commentMineFilter" classNameOnly type="button">
      나의 댓글
    </Button>
  ),
};
