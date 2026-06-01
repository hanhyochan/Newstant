import type { Meta, StoryObj } from "@storybook/react";

import { Icon, type IconName } from "./icon";

const icons: IconName[] = [
  "alarm",
  "allNews",
  "bookmark",
  "chat",
  "chevronRight",
  "detail",
  "dots",
  "earth",
  "fourSquare",
  "home",
  "information",
  "list",
  "loudspeaker",
  "menu",
  "myPage",
  "policy",
  "question",
  "search",
  "share",
  "sizeIncrease",
  "submit",
  "thumbDown",
  "thumbUp",
  "user",
  "vote",
];

const publicIconFiles = [
  "icon_alarm_active.svg",
  "icon_alarm_outline.svg",
  "icon_bad.svg",
  "icon_bookmark_active.svg",
  "icon_bookmark_line.svg",
  "icon_chat_bubble_3dots.svg",
  "icon_chat_bubble_active.svg",
  "icon_chevron_right.svg",
  "icon_detail.svg",
  "icon_all_news.svg",
  "icon_all_news_active.svg",
  "icon_eye.svg",
  "icon_four_square_active.svg",
  "icon_four_square_outline.svg",
  "icon_good.svg",
  "icon_good_active.svg",
  "icon_home.svg",
  "icon_home_active.svg",
  "icon_list_bulleted_active.svg",
  "icon_list_bulleted_outline.svg",
  "icon_policy.svg",
  "icon_policy_active.svg",
  "icon_navigation_menu.svg",
  "icon_no.svg",
  "icon_notgood.svg",
  "icon_notgood_active.svg",
  "icon_information.svg",
  "icon_information_active.svg",
  "icon_question_circle_active.svg",
  "icon_search_active.svg",
  "icon_search_outline.svg",
  "icon_share_nodes_active.svg",
  "icon_share_nodes_outline.svg",
  "icon_sizeIncrease.svg",
  "icon_submit.svg",
  "icon_my_page.svg",
  "icon_my_page_active.svg",
  "icon_vote.svg",
  "icon_vote_active.svg",
  "icon_yes.svg",
];

const meta: Meta<typeof Icon> = {
  title: "Design System/Components/Icon",
  component: Icon,
  parameters: {
    layout: "centered",
  },
  args: {
    name: "search",
  },
  argTypes: {
    name: { control: "select", options: icons },
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Gallery: Story = {
  render: () => (
    <div className="ds_inline_stack">
      {icons.map((name) => (
        <Icon key={name} name={name} />
      ))}
    </div>
  ),
};

export const PublicAssetGallery: Story = {
  render: () => (
    <div
      style={{
        display: "grid",
        gap: 16,
        gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
        width: "min(920px, 100vw)",
      }}
    >
      {publicIconFiles.map((fileName) => (
        <figure
          key={fileName}
          style={{
            alignItems: "center",
            border: "1px solid #e5e5e5",
            borderRadius: 8,
            display: "grid",
            gap: 8,
            justifyItems: "center",
            margin: 0,
            padding: 12,
          }}
        >
          <img alt="" src={`/icons/${fileName}`} style={{ height: 24, width: 24 }} />
          <figcaption style={{ fontSize: 12, lineHeight: "16px", overflowWrap: "anywhere", textAlign: "center" }}>
            {fileName}
          </figcaption>
        </figure>
      ))}
    </div>
  ),
};
