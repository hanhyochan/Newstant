import type { Meta, StoryObj } from "@storybook/react";

import { Badge } from "./badge";
import { Card } from "./card";

const meta: Meta<typeof Card> = {
  title: "Design System/Components/Card",
  component: Card,
  parameters: {
    layout: "centered",
  },
  args: {
    radius: "rounded",
    variant: "gray_line_outline",
  },
  argTypes: {
    radius: { control: "select", options: ["square", "rounded", "full"] },
    variant: {
      control: "select",
      options: ["filled", "outline", "gray_line_outline"],
    },
  },
};

export default meta;

type Story = StoryObj;

export const Default: Story = {
  args: {
    children: null,
  },
  render: (args) => (
    <Card {...args} style={{ width: "var(--size-320)" }}>
      <div className="ds_stack">
        <Badge>Ready</Badge>
        <h3 className="type-title_2">Card pattern</h3>
        <p className="type-body_2">
          Uses documented padding, line border, radius, background, and shadow.
        </p>
      </div>
    </Card>
  ),
};
