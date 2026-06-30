import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";

import { ActionMenu } from "./action-menu";

const aligns = ["start", "end"] as const;
const options = [
  { label: "수정", value: "edit" },
  { label: "삭제", value: "delete" },
] as const;

const meta: Meta<typeof ActionMenu> = {
  title: "Design System/Components/Button/Action Menu",
  component: ActionMenu,
  parameters: {
    layout: "centered",
  },
  argTypes: {
    align: { control: "radio", options: aligns },
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: (args) => {
    const [isOpen, setIsOpen] = useState(true);

    return (
      <ActionMenu
        {...args}
        buttonLabel="댓글 메뉴"
        isOpen={isOpen}
        menuId="storybook-action-menu"
        onOpenChange={setIsOpen}
        onSelect={() => undefined}
        options={[...options]}
      />
    );
  },
};

export const AlignOptions: Story = {
  render: () => (
    <div className="ds_inline_stack" style={{ gap: 80 }}>
      {aligns.map((align) => (
        <ActionMenu
          align={align}
          buttonLabel={`${align} 메뉴`}
          isOpen
          key={align}
          menuId={`storybook-action-menu-${align}`}
          onOpenChange={() => undefined}
          onSelect={() => undefined}
          options={[...options]}
        />
      ))}
    </div>
  ),
};
