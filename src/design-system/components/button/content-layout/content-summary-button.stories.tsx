import type { Meta, StoryObj } from "@storybook/react";

import { ContentSummaryButton } from "./content-summary-button";

const meta: Meta<typeof ContentSummaryButton> = {
  title: "Design System/Components/Button/Content Layout/Content Summary Button",
  component: ContentSummaryButton,
  parameters: {
    layout: "centered",
  },
  args: {
    children: "요약 보기",
    className: "btn_contentSummary",
    selected: true,
  },
  argTypes: {
    selected: { control: "boolean" },
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const SelectedOptions: Story = {
  render: () => (
    <div className="ds_inline_stack">
      <ContentSummaryButton className="btn_contentSummary">기본</ContentSummaryButton>
      <ContentSummaryButton className="btn_contentSummary" selected>
        선택됨
      </ContentSummaryButton>
    </div>
  ),
};
