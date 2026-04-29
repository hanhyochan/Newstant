import type { Meta, StoryObj } from "@storybook/react";

import { DataTable } from "./data-table";

const meta: Meta<typeof DataTable> = {
  title: "Design System/Components/Table",
  component: DataTable,
  parameters: {
    layout: "padded",
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

export const Default: Story = {};
