import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";

import { NewsViewToggle, type NewsViewMode } from "./news-view-toggle";

const meta: Meta<typeof NewsViewToggle> = {
  title: "Design System/Components/News View Toggle",
  component: NewsViewToggle,
  parameters: {
    layout: "centered",
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
