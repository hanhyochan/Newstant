import type { Meta, StoryObj } from "@storybook/react";

import { FloatingMenuItem, FloatingMenuPanel } from "./floating-menu";

const aligns = ["start", "end"] as const;
const sizes = ["default", "small"] as const;

const meta: Meta<typeof FloatingMenuPanel> = {
  title: "Design System/Components/Button/Floating Menu",
  component: FloatingMenuPanel,
  parameters: {
    layout: "centered",
  },
  args: {
    align: "start",
    size: "small",
  },
  argTypes: {
    align: { control: "radio", options: aligns },
    size: { control: "radio", options: sizes },
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: (args) => (
    <FloatingMenuPanel {...args} role="menu">
      <FloatingMenuItem role="menuitem">수정</FloatingMenuItem>
      <FloatingMenuItem role="menuitem">삭제</FloatingMenuItem>
    </FloatingMenuPanel>
  ),
};

export const TypeOptions: Story = {
  render: () => (
    <div className="ds_inline_stack" style={{ alignItems: "flex-start", gap: 80 }}>
      {aligns.map((align) => (
        <FloatingMenuPanel align={align} key={align} role="menu" size="small">
          <FloatingMenuItem role="menuitem">{align}</FloatingMenuItem>
          <FloatingMenuItem role="menuitem">메뉴 항목</FloatingMenuItem>
        </FloatingMenuPanel>
      ))}
      {sizes.map((size) => (
        <FloatingMenuPanel key={size} role="listbox" size={size}>
          <FloatingMenuItem role="option">{size}</FloatingMenuItem>
          <FloatingMenuItem role="option">선택 항목</FloatingMenuItem>
        </FloatingMenuPanel>
      ))}
    </div>
  ),
};
