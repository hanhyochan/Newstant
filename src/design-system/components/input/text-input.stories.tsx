import type { Meta, StoryObj } from "@storybook/react";

import { FieldActionButton } from "../button/field-action-button";
import { TextInput } from "./text-input";

const states = ["default", "complete", "error", "view"] as const;
const modes = ["light", "dark"] as const;

const meta: Meta<typeof TextInput> = {
  title: "Design System/Components/Input/Text Input",
  component: TextInput,
  parameters: {
    layout: "centered",
  },
  args: {
    mode: "light",
    placeholder: "검색어를 입력하세요",
    state: "default",
    value: "",
  },
  argTypes: {
    mode: { control: "radio", options: modes },
    state: { control: "select", options: states },
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const StateOptions: Story = {
  render: () => (
    <div className="ds_stack" style={{ width: 360 }}>
      {states.map((state) => (
        <TextInput
          key={state}
          aria-label={`${state} 입력`}
          defaultValue={state === "view" ? "읽기 전용 값" : undefined}
          placeholder={`${state} state`}
          readOnly={state === "view"}
          state={state}
        />
      ))}
    </div>
  ),
};

export const WithEndAction: Story = {
  render: () => (
    <TextInput
      aria-label="인증번호"
      hasEndAction
      placeholder="인증번호 입력"
      rightSlot={<FieldActionButton>확인</FieldActionButton>}
    />
  ),
};
