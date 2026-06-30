import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";

import { NewsViewToggle, type NewsViewMode } from "./news-view-toggle";

const modes: NewsViewMode[] = ["reels", "block"];

const meta: Meta<typeof NewsViewToggle> = {
  title: "Design System/Components/News View Toggle",
  component: NewsViewToggle,
  parameters: {
    layout: "centered",
  },
  args: {
    mode: "reels",
  },
  argTypes: {
    mode: { control: "radio", options: modes },
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: () => {
    const [mode, setMode] = useState<NewsViewMode>("reels");

    return <NewsViewToggle mode={mode} onModeChange={setMode} />;
  },
};

export const ModeOptions: Story = {
  render: () => (
    <div className="ds_inline_stack">
      {modes.map((mode) => (
        <NewsViewToggle key={mode} mode={mode} onModeChange={() => undefined} />
      ))}
    </div>
  ),
};
