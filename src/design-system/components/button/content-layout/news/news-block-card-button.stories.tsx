import type { Meta, StoryObj } from "@storybook/react";

import { NewsBlockCardButton } from "./news-block-card-button";

const meta: Meta<typeof NewsBlockCardButton> = {
  title: "Design System/Components/Button/News/News Block Card Button",
  component: NewsBlockCardButton,
  parameters: {
    layout: "centered",
  },
  args: {
    categoryLabel: "정책",
    dateLabel: "2026년 6월 30일",
    dateTime: "2026-06-30",
    imageSrc: "/images/Gemini_Generated_Image_7j3t0x7j3t0x7j3t.webp",
    showDate: true,
    title: "청년 주거 지원 정책, 하반기 접수 일정 공개",
  },
  argTypes: {
    ariaPressed: { control: "boolean" },
    showDate: { control: "boolean" },
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: (args) => (
    <NewsBlockCardButton
      categoryLabel={args.categoryLabel}
      dateLabel={args.dateLabel ?? "2026년 6월 30일"}
      dateTime={args.dateTime}
      imageAlt={args.imageAlt}
      imageSrc={args.imageSrc ?? "/images/Gemini_Generated_Image_2vvqys2vvqys2vvq.webp"}
      onClick={() => undefined}
      showDate={args.showDate}
      title={args.title ?? "청년 주거 지원 정책, 하반기 접수 일정 공개"}
    />
  ),
};

export const StateOptions: Story = {
  render: () => (
    <div className="ds_inline_stack" style={{ alignItems: "flex-start" }}>
      <NewsBlockCardButton
        categoryLabel="정책"
        dateLabel="2026년 6월 30일"
        imageSrc="/images/Gemini_Generated_Image_96baaj96baaj96ba.webp"
        onClick={() => undefined}
        title="기본 뉴스 카드"
      />
      <NewsBlockCardButton
        ariaPressed
        categoryLabel="복지"
        dateLabel="2026년 6월 30일"
        imageSrc="/images/Gemini_Generated_Image_f51g65f51g65f51g.webp"
        onClick={() => undefined}
        title="선택된 뉴스 카드"
      />
    </div>
  ),
};
