import type { Meta, StoryObj } from "@storybook/react";

import { NoticeCardLink } from "./notice-card-link";

const types = ["breaking", "notificationRead", "notificationUnread"] as const;

const meta: Meta<typeof NoticeCardLink> = {
  title: "Design System/Components/Notice Card Link",
  component: NoticeCardLink,
  parameters: {
    layout: "centered",
  },
  args: {
    href: "#all-breaking-news",
    isListItem: false,
    showIcon: true,
    title: "정청래, ‘필버 중단’ 국민의 힘에 “대구/경북 통합 찬반 당론 먼저 정하라”",
    type: "breaking",
    updatedAt: "2026-06-30T09:30:00",
  },
  argTypes: {
    type: { control: "select", options: types },
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const TypeOptions: Story = {
  render: () => (
    <div className="ds_stack" style={{ width: 420 }}>
      {types.map((type) => (
        <NoticeCardLink
          key={type}
          showIcon={type === "breaking"}
          title={`${type} 공지 카드`}
          type={type}
          updatedAt="2026-06-30T09:30:00"
        />
      ))}
    </div>
  ),
};

export const ListItem: Story = {
  args: {
    isListItem: true,
    showIcon: false,
    title: "앱 업데이트 안내",
    type: "notificationUnread",
  },
};
