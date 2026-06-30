import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";

import { ContentAccordion } from "./content-accordion";

const meta: Meta<typeof ContentAccordion> = {
  title: "Design System/Components/Accordion/Content Accordion",
  component: ContentAccordion,
  parameters: {
    layout: "centered",
  },
  args: {
    contentId: "storybook-content-accordion-panel",
    isOpen: true,
    title: "자주 묻는 질문",
    triggerId: "storybook-content-accordion-trigger",
  },
  argTypes: {
    isOpen: { control: "boolean" },
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: (args) => (
    <ContentAccordion
      contentId={args.contentId ?? "storybook-content-accordion-panel"}
      isOpen={args.isOpen ?? true}
      onToggle={() => undefined}
      title={args.title ?? "자주 묻는 질문"}
      triggerId={args.triggerId ?? "storybook-content-accordion-trigger"}
    >
      <p className="u_m0">뉴스롤 서비스 이용과 계정 설정에 대한 답변입니다.</p>
    </ContentAccordion>
  ),
};

export const Interactive: Story = {
  render: () => {
    const [isOpen, setIsOpen] = useState(true);

    return (
      <div style={{ width: 420 }}>
        <ContentAccordion
          contentId="storybook-faq-content"
          isOpen={isOpen}
          onToggle={() => setIsOpen((value) => !value)}
          title="알림은 어디에서 설정하나요?"
          triggerId="storybook-faq-trigger"
        >
          <p className="u_m0">마이페이지의 알림 설정에서 관심 뉴스와 정책 알림을 바꿀 수 있습니다.</p>
        </ContentAccordion>
      </div>
    );
  },
};
