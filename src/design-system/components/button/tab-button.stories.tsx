import type { Meta, StoryObj } from "@storybook/react";

import { TabButton } from "./tab-button";

const states = ["active", "default", "selected"] as const;

const meta: Meta<typeof TabButton> = {
  title: "Design System/Components/Button/Tab Button",
  component: TabButton,
  parameters: {
    layout: "centered",
  },
  args: {
    children: "전체",
    state: "default",
  },
  argTypes: {
    state: { control: "select", options: states },
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const StateOptions: Story = {
  render: () => (
    <div className="ds_inline_stack">
      {states.map((state) => (
        <TabButton key={state} state={state}>
          {state}
        </TabButton>
      ))}
    </div>
  ),
};
