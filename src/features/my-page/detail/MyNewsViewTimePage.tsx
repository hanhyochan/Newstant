import { Fragment } from "react";

import {
  NewsRollDivider,
  NewsRollSwitch,
} from "@/design-system/components";
import { getEnterFromRightMotionClassName } from "@/design-system/templates";

type NewsViewTimeSection = {
  label: string;
  times: readonly string[];
};

export function MyNewsViewTimePage({
  isLeaving,
  onToggleTime,
  sections,
  selectedTimes,
}: {
  isLeaving: boolean;
  onToggleTime: (time: string) => void;
  sections: readonly NewsViewTimeSection[];
  selectedTimes: Set<string>;
}) {
  return (
    <div
      className={`container_myTimePage ${getEnterFromRightMotionClassName(isLeaving)}`}
    >
      <h2 className="text_myTimeTitle">뉴스 보기 시간</h2>
      {sections.map((section, sectionIndex) => (
        <Fragment key={section.label}>
          {sectionIndex > 0 ? (
            <NewsRollDivider className="divider_mySection" />
          ) : null}
          <section
            aria-label={`${section.label} 시간 설정`}
            className="container_myTimeSection"
          >
            <h3 className="text_myTimeSectionLabel">{section.label}</h3>
            <div className="wrapper_myTimeRows">
              {section.times.map((time) => {
                const isSelected = selectedTimes.has(time);

                return (
                  <button
                    aria-pressed={isSelected}
                    className="btn_myTimeRow"
                    key={time}
                    onClick={() => onToggleTime(time)}
                    type="button"
                  >
                    <span className="text_myTimeValue">{time}</span>
                    <NewsRollSwitch checked={isSelected} />
                  </button>
                );
              })}
            </div>
          </section>
        </Fragment>
      ))}
    </div>
  );
}
