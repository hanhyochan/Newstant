import type { Meta, StoryObj } from "@storybook/react";

import { NewsHeadlineRowButton } from "./news-headline-row-button";

const meta: Meta<typeof NewsHeadlineRowButton> = {
  title: "Design System/Components/Button/News/News Headline Row Button",
  component: NewsHeadlineRowButton,
  parameters: {
    layout: "centered",
  },
  args: {
    item: {
      image: "/images/Gemini_Generated_Image_nil3rwnil3rwnil3.webp",
      title: "정부, 생활밀착형 정책 뉴스 브리핑 진행",
    },
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: (args) => (
    <div style={{ width: 420 }}>
      <NewsHeadlineRowButton
        item={
          args.item ?? {
            image: "/images/Gemini_Generated_Image_qy1qu1qy1qu1qy1q.webp",
            title: "정부, 생활밀착형 정책 뉴스 브리핑 진행",
          }
        }
        onClick={() => undefined}
      />
    </div>
  ),
};

export const List: Story = {
  render: () => (
    <div className="ds_stack" style={{ width: 420 }}>
      {["정책 뉴스", "오늘의 헤드라인", "지역 이슈"].map((title) => (
        <NewsHeadlineRowButton
          item={{ image: "/images/Gemini_Generated_Image_7j3t0x7j3t0x7j3t.webp", title }}
          key={title}
          onClick={() => undefined}
        />
      ))}
    </div>
  ),
};
