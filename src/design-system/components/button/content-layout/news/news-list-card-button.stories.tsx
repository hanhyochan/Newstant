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
      image: "/images/Gemini_Generated_Image_2vvqys2vvqys2vvq.webp",
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
          image: "/images/Gemini_Generated_Image_96baaj96baaj96ba.webp",
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
        item={{ image: "/images/Gemini_Generated_Image_f51g65f51g65f51g.webp", title: "일반 리스트 카드" }}
        onClick={() => undefined}
      />
      <NewsListCardButton
        featured
        item={{ image: "/images/Gemini_Generated_Image_le942ile942ile94.webp", title: "강조 리스트 카드" }}
        onClick={() => undefined}
      />
    </div>
  ),
};
