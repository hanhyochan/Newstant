import { Fragment } from "react";

import { Divider } from "@/design-system/components";
import { getEnterFromRightMotionClassName } from "@/design-system/templates";
import { MySettingRow } from "@/features/my-page/components/MySettingRow";

type ProfileSettingSection = {
  items: readonly string[];
  title: string;
};

export function MyProfileSettingsPage({
  isLeaving,
  onItemSelect,
  sections,
}: {
  isLeaving: boolean;
  onItemSelect: (sectionIndex: number, itemIndex: number) => void;
  sections: readonly ProfileSettingSection[];
}) {
  return (
    <div
      className={`container_mySettingsPage ${getEnterFromRightMotionClassName(isLeaving)}`}
    >
      <h2 className="text_myTimeTitle">설정</h2>
      {sections.map((section, sectionIndex) => (
        <Fragment key={section.title}>
          {sectionIndex > 0 ? (
            <Divider className="divider_mySection" />
          ) : null}
          <section
            aria-label={`${section.title} 설정`}
            className="container_mySettingsDetailSection"
          >
            <div className="wrapper_mySettingsList wrapper_scrollList">
              {section.items.map((item, itemIndex) => (
                <MySettingRow
                  key={item}
                  label={item}
                  onClick={() => onItemSelect(sectionIndex, itemIndex)}
                  showChevron
                />
              ))}
            </div>
          </section>
        </Fragment>
      ))}
    </div>
  );
}
