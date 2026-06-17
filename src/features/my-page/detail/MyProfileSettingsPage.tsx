import { Fragment } from "react";

import { NewsRollDivider } from "@/design-system/components";
import { getEnterFromRightMotionClassName } from "@/design-system/templates";
import { MySettingRow } from "@/features/my-page/components/MySettingRow";

type ProfileSettingSection = {
  items: readonly string[];
  title: string;
};

export function MyProfileSettingsPage({
  isLeaving,
  sections,
}: {
  isLeaving: boolean;
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
            <NewsRollDivider className="divider_mySection" />
          ) : null}
          <section
            aria-label={`${section.title} 설정`}
            className="container_mySettingsDetailSection"
          >
            <div className="wrapper_mySettingsList">
              {section.items.map((item) => (
                <MySettingRow
                  key={item}
                  label={item}
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
