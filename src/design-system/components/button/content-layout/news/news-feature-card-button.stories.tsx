import type { Meta, StoryObj } from "@storybook/react";

import { NewsFeatureCardButton } from "./news-feature-card-button";

const item = {
  category: "헤드라인",
  image: "/images/Gemini_Generated_Image_le942ile942ile94.webp",
  title: "서울시, 장기전세주택 공급 확대 방안 발표",
};

const meta: Meta<typeof NewsFeatureCardButton> = {
  title: "Design System/Components/Button/News/News Feature Card Button",
  component: NewsFeatureCardButton,
  parameters: {
    layout: "centered",
  },
  args: {
    item,
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: (args) => (
    <NewsFeatureCardButton item={args.item ?? item} onClick={() => undefined} />
  ),
};

export const CategoryOptions: Story = {
  render: () => (
    <div className="ds_stack" style={{ width: 360 }}>
      {["정책", "경제", "사회"].map((category) => (
        <NewsFeatureCardButton
          item={{ ...item, category, title: `${category} 주요 뉴스 카드` }}
          key={category}
          onClick={() => undefined}
        />
      ))}
    </div>
  ),
};
