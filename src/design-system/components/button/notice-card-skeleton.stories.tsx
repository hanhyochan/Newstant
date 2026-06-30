import type { Meta, StoryObj } from "@storybook/react";

import { NoticeCardSkeleton } from "./notice-card-skeleton";

const types = ["breaking", "notificationRead", "notificationUnread"] as const;

const meta: Meta<typeof NoticeCardSkeleton> = {
  title: "Design System/Components/Button/Notice Card Skeleton",
  component: NoticeCardSkeleton,
  parameters: {
    layout: "centered",
  },
  args: {
    isListItem: false,
    type: "breaking",
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
        <NoticeCardSkeleton key={type} type={type} />
      ))}
      <NoticeCardSkeleton isListItem type="notificationUnread" />
    </div>
  ),
};
