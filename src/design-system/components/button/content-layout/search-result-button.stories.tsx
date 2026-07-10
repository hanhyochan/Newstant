import type { Meta, StoryObj } from "@storybook/react";

import { SearchHighlightText } from "../../search-highlight";
import { SearchResultButton } from "./search-result-button";

const meta: Meta<typeof SearchResultButton> = {
  title: "Design System/Components/Button/Content Layout/Search Result Button",
  component: SearchResultButton,
  parameters: {
    layout: "centered",
  },
  args: {
    meta: "뉴스 · 0000년 00월 00일",
    title: "맞춤 정책 뉴스",
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: (args) => (
    <div style={{ width: 420 }}>
      <SearchResultButton
        meta={args.meta ?? "뉴스 · 0000년 00월 00일"}
        onClick={() => undefined}
        snippet={args.snippet}
        title={args.title ?? "맞춤 정책 뉴스"}
      />
    </div>
  ),
};

export const WithSnippet: Story = {
  render: () => (
    <div style={{ width: 420 }}>
      <SearchResultButton
        meta="정책 · 0000년 00월 00일"
        onClick={() => undefined}
        snippet={
          <SearchHighlightText query="청년">
            청년 주거 안정 지원 정책의 신청 조건과 접수 일정을 안내합니다.
          </SearchHighlightText>
        }
        title={<SearchHighlightText query="정책">청년 주거 정책 안내</SearchHighlightText>}
      />
    </div>
  ),
};
