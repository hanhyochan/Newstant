import type { Meta, StoryObj } from "@storybook/react";

import { SearchResultSkeleton } from "./search-result-skeleton";

const meta: Meta<typeof SearchResultSkeleton> = {
  title: "Design System/Components/Button/Content Layout/Search Result Skeleton",
  component: SearchResultSkeleton,
  parameters: {
    layout: "centered",
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <div style={{ width: 420 }}>
      <SearchResultSkeleton />
    </div>
  ),
};
