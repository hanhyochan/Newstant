import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";

import { PillTabMenu } from "./pill-tab-menu";

const roles = ["group", "radiogroup", "tablist"] as const;
const states = ["active", "default", "selected"] as const;

const items = [
  { id: "all", label: "전체" },
  { id: "first", label: "어쩌구 저쩌구해서 어케 해야한다." },
  { id: "second", label: "상황을 더 지켜본 뒤 판단해야 한다." },
  { id: "third", label: "정책 지원을 먼저 확대해야 한다." },
];

const meta: Meta<typeof PillTabMenu> = {
  title: "Design System/Components/Pill Tab Menu",
  component: PillTabMenu,
  parameters: {
    layout: "centered",
  },
  argTypes: {
    keyboardNavigation: { control: "boolean" },
    role: { control: "radio", options: roles },
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: () => {
    const [value, setValue] = useState("all");

    return (
      <PillTabMenu
        ariaLabel="탭 메뉴"
        className="wrapper_commentTabs"
        items={items}
        onChange={setValue}
        role="tablist"
        value={value}
      />
    );
  },
};

export const RoleOptions: Story = {
  render: () => (
    <div className="ds_stack">
      {roles.map((role) => (
        <PillTabMenu
          ariaLabel={`${role} 탭 메뉴`}
          className="wrapper_commentTabs"
          items={items.slice(0, 3)}
          key={role}
          onChange={() => undefined}
          role={role}
          value="all"
        />
      ))}
    </div>
  ),
};

export const StateOptions: Story = {
  render: () => (
    <PillTabMenu
      ariaLabel="상태 옵션 탭"
      className="wrapper_commentTabs"
      getItemState={(id) =>
        id === "active" ? "active" : id === "selected" ? "selected" : "default"
      }
      items={states.map((state) => ({ id: state, label: state }))}
      onChange={() => undefined}
      role="group"
      value="active"
    />
  ),
};
