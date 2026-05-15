import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";

import { CommentComposerInput } from "./comment-composer-input";

const meta: Meta<typeof CommentComposerInput> = {
  title: "Design System/Components/Text Input",
  component: CommentComposerInput,
  parameters: {
    layout: "centered",
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: () => {
    const [value, setValue] = useState("");

    return (
      <form
        className="form_commentComposer"
        style={{ width: 360 }}
        onSubmit={(event) => event.preventDefault()}
      >
        <CommentComposerInput
          label="댓글 입력"
          onChange={(event) => setValue(event.target.value)}
          placeholder="홍길동님은 어떻게 생각하시나요?"
          submitLabel="댓글 등록"
          value={value}
        />
      </form>
    );
  },
};
