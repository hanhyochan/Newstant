import type { Meta, StoryObj } from "@storybook/react";

import { PrimaryButton } from "./primary-button";
import { PrimaryButtonGroup } from "./primary-button-group";

const columns = [1, 2] as const;

const meta: Meta<typeof PrimaryButtonGroup> = {
  title: "Design System/Components/Button/Primary Button Group",
  component: PrimaryButtonGroup,
  parameters: {
    layout: "centered",
  },
  args: {
    columns: 1,
  },
  argTypes: {
    columns: { control: "radio", options: columns },
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: (args) => (
    <PrimaryButtonGroup {...args}>
      <PrimaryButton tone="neutral">취소</PrimaryButton>
      <PrimaryButton>저장</PrimaryButton>
    </PrimaryButtonGroup>
  ),
};

export const ColumnOptions: Story = {
  render: () => (
    <div className="ds_stack" style={{ width: 360 }}>
      {columns.map((column) => (
        <PrimaryButtonGroup columns={column} key={column}>
          <PrimaryButton tone="neutral">{column}열 보조</PrimaryButton>
          <PrimaryButton>{column}열 주요</PrimaryButton>
        </PrimaryButtonGroup>
      ))}
    </div>
  ),
};
