import type { Meta, StoryObj } from "@storybook/react";

import { OnoffToggleButton } from "./onoffToggle-button";

const meta: Meta<typeof OnoffToggleButton> = {
  title: "Design System/Components/Button/Onoff Toggle Button",
  component: OnoffToggleButton,
  parameters: {
    layout: "centered",
  },
  args: {
    checked: true,
  },
  argTypes: {
    checked: { control: "boolean" },
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const CheckedOptions: Story = {
  render: () => (
    <div className="ds_inline_stack">
      <OnoffToggleButton checked={false} />
      <OnoffToggleButton checked />
    </div>
  ),
};
