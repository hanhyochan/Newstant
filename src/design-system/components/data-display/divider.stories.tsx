import type { Meta, StoryObj } from "@storybook/react";

import { Divider } from "./divider";

const orientations = ["horizontal", "vertical"] as const;

const meta: Meta<typeof Divider> = {
  title: "Design System/Components/Data Display/Divider",
  component: Divider,
  parameters: {
    layout: "centered",
  },
  args: {
    orientation: "horizontal",
  },
  argTypes: {
    orientation: { control: "radio", options: orientations },
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const OrientationOptions: Story = {
  render: () => (
    <div className="ds_stack" style={{ width: 320 }}>
      <span>뉴스롤 공통 구분선</span>
      <Divider orientation="horizontal" />
      <span className="ds_inline_stack" style={{ height: 40 }}>
        이전글
        <Divider orientation="vertical" />
        다음글
      </span>
    </div>
  ),
};
