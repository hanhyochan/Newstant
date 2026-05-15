import type { Meta, StoryObj } from "@storybook/react";

import { Icon, type IconName } from "./icon";

const icons: IconName[] = [
  "alarm",
  "bookmark",
  "chat",
  "detail",
  "fourSquare",
  "home",
  "list",
  "menu",
  "search",
  "share",
  "sizeIncrease",
  "submit",
  "thumbDown",
  "thumbUp",
];

const meta: Meta<typeof Icon> = {
  title: "Design System/Components/Icon",
  component: Icon,
  parameters: {
    layout: "centered",
  },
  args: {
    name: "search",
  },
  argTypes: {
    name: { control: "select", options: icons },
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Gallery: Story = {
  render: () => (
    <div className="ds_inline_stack">
      {icons.map((name) => (
        <Icon key={name} name={name} />
      ))}
    </div>
  ),
};
