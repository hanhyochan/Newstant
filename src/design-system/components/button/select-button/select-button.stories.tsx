import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";

import { SelectButton } from "./select-button";

const sizes = ["default", "small"] as const;
const options = [
  { label: "최신순", value: "latest" },
  { label: "인기순", value: "popular" },
  { label: "댓글순", value: "comments" },
] as const;

const meta: Meta<typeof SelectButton> = {
  title: "Design System/Components/Button/Select Button",
  component: SelectButton,
  parameters: {
    layout: "centered",
  },
  argTypes: {
    size: { control: "radio", options: sizes },
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: (args) => {
    const [value, setValue] = useState<(typeof options)[number]["value"]>("latest");
    const [isOpen, setIsOpen] = useState(true);

    return (
      <SelectButton
        {...args}
        ariaLabel="정렬 선택"
        isOpen={isOpen}
        listboxId="storybook-select-listbox"
        onChange={setValue}
        onOpenChange={setIsOpen}
        options={[...options]}
        size={args.size ?? "small"}
        value={value}
      />
    );
  },
};

export const SizeOptions: Story = {
  render: () => (
    <div className="ds_inline_stack" style={{ alignItems: "flex-start" }}>
      {sizes.map((size) => (
        <SelectButton
          ariaLabel={`${size} 정렬`}
          isOpen
          key={size}
          listboxId={`storybook-select-${size}`}
          onChange={() => undefined}
          onOpenChange={() => undefined}
          options={[...options]}
          size={size}
          value="latest"
        />
      ))}
    </div>
  ),
};
