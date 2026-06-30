import type { Meta, StoryObj } from "@storybook/react";

import { SettingRowButton } from "./setting-row-button";

const meta: Meta<typeof SettingRowButton> = {
  title: "Design System/Components/Button/Setting Row Button",
  component: SettingRowButton,
  parameters: {
    layout: "centered",
  },
  args: {
    checked: true,
    label: "알림 받기",
    showChevron: false,
  },
  argTypes: {
    checked: { control: "boolean" },
    showChevron: { control: "boolean" },
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const VariantOptions: Story = {
  render: () => (
    <div className="ds_stack" style={{ width: 360 }}>
      <SettingRowButton checked label="알림 받기" />
      <SettingRowButton checked={false} label="마케팅 수신" />
      <SettingRowButton label="프로필 설정" showChevron />
      <SettingRowButton checked label="상세 설정" showChevron />
    </div>
  ),
};
