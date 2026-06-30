import type { Meta, StoryObj } from "@storybook/react";

import { NewsListCardButton } from "./news-list-card-button";

const meta: Meta<typeof NewsListCardButton> = {
  title: "Design System/Components/Button/News/News List Card Button",
  component: NewsListCardButton,
  parameters: {
    layout: "centered",
  },
  args: {
    featured: false,
    item: {
      image: "/images/news-apartment.png",
      title: "맞춤 뉴스 리스트 카드 제목입니다",
    },
  },
  argTypes: {
    featured: { control: "boolean" },
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: (args) => (
    <NewsListCardButton
      featured={args.featured}
      item={
        args.item ?? {
          image: "/images/news-apartment.png",
          title: "맞춤 뉴스 리스트 카드 제목입니다",
        }
      }
      onClick={() => undefined}
    />
  ),
};

export const FeaturedOptions: Story = {
  render: () => (
    <div className="ds_stack" style={{ width: 360 }}>
      <NewsListCardButton
        item={{ image: "/images/news-apartment.png", title: "일반 리스트 카드" }}
        onClick={() => undefined}
      />
      <NewsListCardButton
        featured
        item={{ image: "/images/news-apartment.png", title: "강조 리스트 카드" }}
        onClick={() => undefined}
      />
    </div>
  ),
};
