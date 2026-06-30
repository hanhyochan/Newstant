import type { Meta, StoryObj } from "@storybook/react";

import { PaginationButton } from "./pagination-button";

const directions = ["previous", "next"] as const;

const meta: Meta<typeof PaginationButton> = {
  title: "Design System/Components/Button/Pagination Button",
  component: PaginationButton,
  parameters: {
    layout: "centered",
  },
  args: {
    direction: "previous",
  },
  argTypes: {
    direction: { control: "radio", options: directions },
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const DirectionOptions: Story = {
  render: () => (
    <div className="ds_inline_stack">
      {directions.map((direction) => (
        <PaginationButton direction={direction} key={direction} />
      ))}
    </div>
  ),
};
