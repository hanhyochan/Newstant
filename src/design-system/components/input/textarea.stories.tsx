import type { Meta, StoryObj } from "@storybook/react";

import { Textarea } from "./textarea";

const states = ["default", "error", "view"] as const;
const variants = ["default", "commentEdit", "inquiry"] as const;

const meta: Meta<typeof Textarea> = {
  title: "Design System/Components/Input/Textarea",
  component: Textarea,
  parameters: {
    layout: "centered",
  },
  args: {
    placeholder: "내용을 입력하세요",
    state: "default",
    variant: "default",
  },
  argTypes: {
    state: { control: "select", options: states },
    variant: { control: "select", options: variants },
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const VariantOptions: Story = {
  render: () => (
    <div className="ds_stack" style={{ width: 420 }}>
      {variants.map((variant) => (
        <Textarea
          key={variant}
          defaultValue={variant === "commentEdit" ? "댓글 수정 내용입니다." : undefined}
          placeholder={`${variant} textarea`}
          variant={variant}
        />
      ))}
    </div>
  ),
};

export const StateOptions: Story = {
  render: () => (
    <div className="ds_stack" style={{ width: 420 }}>
      {states.map((state) => (
        <Textarea
          key={state}
          defaultValue={state === "view" ? "접수된 문의 내용입니다." : undefined}
          placeholder={`${state} state`}
          readOnly={state === "view"}
          state={state}
        />
      ))}
    </div>
  ),
};
