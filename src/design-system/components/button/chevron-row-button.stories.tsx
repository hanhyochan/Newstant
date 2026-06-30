import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";

import { ChevronRowButton } from "./chevron-row-button";

const rowTypes = ["default", "checkbox"] as const;
const checkboxSizes = ["md", "lg"] as const;

const meta: Meta = {
  title: "Design System/Components/Button/Chevron Row Button",
  parameters: {
    layout: "centered",
  },
  argTypes: {
    checkboxSize: { control: "radio", options: checkboxSizes },
    rowType: { control: "radio", options: rowTypes },
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

export const DefaultRow: Story = {
  render: () => <ChevronRowButton>내 댓글</ChevronRowButton>,
};

export const CheckboxRow: Story = {
  render: () => {
    const [checked, setChecked] = useState(true);

    return (
      <ChevronRowButton
        checked={checked}
        chevronLabel="약관 상세 보기"
        onChange={(event) => setChecked(event.currentTarget.checked)}
        rowType="checkbox"
      >
        마케팅 정보 수신 동의
      </ChevronRowButton>
    );
  },
};

export const TypeOptions: Story = {
  render: () => (
    <div className="ds_stack" style={{ width: 360 }}>
      <ChevronRowButton>default</ChevronRowButton>
      <ChevronRowButton checked chevronLabel="상세 보기" rowType="checkbox">
        checkbox
      </ChevronRowButton>
    </div>
  ),
};
