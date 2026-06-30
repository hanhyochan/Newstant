import type { Meta, StoryObj } from "@storybook/react";

import { DateTimeText } from "./date-time-text";

const meta: Meta<typeof DateTimeText> = {
  title: "Design System/Components/Data Display/Date Time Text",
  component: DateTimeText,
  parameters: {
    layout: "centered",
  },
  args: {
    children: "2026년 6월 30일 09:30",
    dateTime: "2026-06-30T09:30:00",
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const InMetaRow: Story = {
  render: () => (
    <p className="wrapper_newsCardMeta">
      <DateTimeText dateTime="2026-06-30T09:30:00">
        2026년 6월 30일 09:30
      </DateTimeText>
    </p>
  ),
};
