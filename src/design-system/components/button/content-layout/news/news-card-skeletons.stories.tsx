import type { Meta, StoryObj } from "@storybook/react";

import {
  NewsBlockCardSkeleton,
  NewsFeatureCardSkeleton,
  NewsHeadlineRowSkeleton,
  NewsListCardSkeleton,
  NewsReelCardSkeleton,
} from "./news-card-skeletons";

const meta: Meta = {
  title: "Design System/Components/Button/News/News Card Skeletons",
  parameters: {
    layout: "padded",
  },
};

export default meta;

type Story = StoryObj;

export const All: Story = {
  render: () => (
    <div className="ds_stack" style={{ maxWidth: 720 }}>
      <NewsBlockCardSkeleton />
      <NewsFeatureCardSkeleton />
      <NewsHeadlineRowSkeleton />
      <NewsListCardSkeleton />
      <NewsReelCardSkeleton />
    </div>
  ),
};
