import type { Meta, StoryObj } from "@storybook/react";

import { Icon, type IconName } from "./icon";

const icons: IconName[] = [
  "alarm",
  "bookmark",
  "chat",
  "chevronRight",
  "detail",
  "dots",
  "earth",
  "fourSquare",
  "home",
  "list",
  "loudspeaker",
  "menu",
  "question",
  "search",
  "share",
  "sizeIncrease",
  "submit",
  "thumbDown",
  "thumbUp",
  "user",
];

const publicIconFiles = [
  "icon_alarm.svg",
  "icon_alarm_outline.svg",
  "icon_bad.svg",
  "icon_bookmark_fill.svg",
  "icon_bookmark_line.svg",
  "icon_chat_bubble_3dots.svg",
  "icon_chat_bubble_fill.svg",
  "icon_chevron_right.svg",
  "icon_detail.svg",
  "icon_earth_grid.svg",
  "icon_earth_grid_fill.svg",
  "icon_eye.svg",
  "icon_four_square.svg",
  "icon_four_square_outline.svg",
  "icon_good.svg",
  "icon_good_active.svg",
  "icon_home.svg",
  "icon_home_outline.svg",
  "icon_list_bulleted.svg",
  "icon_list_bulleted_outline.svg",
  "icon_loudspeaker_fill.svg",
  "icon_loudspeaker_line.svg",
  "icon_navigation_menu.svg",
  "icon_no.svg",
  "icon_notgood.svg",
  "icon_notgood_active.svg",
  "icon_notood_active.svg",
  "icon_question_circle_fill.svg",
  "icon_question_circle_fill_mask.svg",
  "icon_question_circle_outline.svg",
  "icon_search.svg",
  "icon_search_outline.svg",
  "icon_share_nodes.svg",
  "icon_share_nodes_outline.svg",
  "icon_sizeIncrease.svg",
  "icon_submit.svg",
  "icon_user.svg",
  "icon_user_outline.svg",
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
