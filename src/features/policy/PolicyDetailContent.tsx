"use client";

import { useLayoutEffect, useState } from "react";

import {
  ArticleActionButtons,
  Button,
  ChipLabel,
  Icon,
  NewsRollDivider,
} from "@/design-system/components";
import { useShareContent } from "@/design-system/templates";

type PolicyDetailItem = {
  label: string;
  value: string;
};

export type PolicyDetailContentItem = {
  details: PolicyDetailItem[];
  registeredAt: string;
  summary: string;
  tags: string[];
  title: string;
  updatedAt: string;
};

function resetNewsRollViewport() {
  if (typeof window === "undefined") {
    return;
  }

  const scrollTargets = [
    document.scrollingElement,
    document.documentElement,
    document.body,
  ].filter((target): target is Element => Boolean(target));

  scrollTargets.forEach((target) => {
    target.scrollTo({ top: 0 });
  });
}

function getPolicyDateDisplay(item: PolicyDetailContentItem) {
  const isUpdated = item.registeredAt !== item.updatedAt;

  return {
    date: isUpdated ? item.updatedAt : item.registeredAt,
    label: isUpdated ? "최종수정" : "최초등록",
  };
}

function getEnterFromRightMotionClassName(isLeaving = false) {
  return `newsroll_motion_enterFromRight${isLeaving ? " is_motionLeaving" : ""}`;
}

export function PolicyDetailContent({
  hideDetailList = false,
  hideDetailToggle = false,
  isLeaving = false,
  item,
  onNextItem,
  onPreviousItem,
}: {
  hideDetailList?: boolean;
  hideDetailToggle?: boolean;
  isLeaving?: boolean;
  item: PolicyDetailContentItem;
  onNextItem?: () => void;
  onPreviousItem?: () => void;
}) {
  const [isBookmarked, setIsBookmarked] = useState(false);
  const policyDate = getPolicyDateDisplay(item);
  const sharePolicy = useShareContent({
    text: item.summary,
    title: item.title,
  });

  useLayoutEffect(() => {
    resetNewsRollViewport();
  }, []);

  return (
    <div
      className={`newsroll_policy_detail_content ${getEnterFromRightMotionClassName(isLeaving)}`}
    >
      <div className="newsroll_policy_detail_main">
      <div className="newsroll_policy_detail_header">
        <div className="newsroll_policy_detail_titleMeta">
          <div className="newsroll_policy_detail_body">
            <h1>{item.title}</h1>
          </div>

          <div className="wrapper_articleMetaActions newsroll_policy_detail_meta_actions">
            <div className="newsroll_policy_detail_dates">
              <span>
                <strong>{policyDate.label}</strong>
                {policyDate.date}
              </span>
            </div>

            <ArticleActionButtons
              ariaLabel="정책 도구"
              isBookmarked={isBookmarked}
              onBookmark={() => setIsBookmarked((current) => !current)}
              onShare={() => {
                void sharePolicy();
              }}
            />
          </div>
        </div>

        <div className="newsroll_policy_detail_tags">
          {item.tags.map((tag, index) => (
            <ChipLabel
              kind={index === item.tags.length - 1 ? "policyAccent" : "policy"}
              key={`${item.title}-${tag}`}
            >
              {tag}
            </ChipLabel>
          ))}
        </div>
      </div>

      <NewsRollDivider className="newsroll_policy_detail_actions_divider" />

      <p className="newsroll_policy_detail_summary">{item.summary}</p>

      {hideDetailList ? null : (
        <dl className="newsroll_policy_detail_list">
          {item.details.map((detail) => (
            <div key={`${item.title}-${detail.label}`}>
              <dt>{detail.label}</dt>
              <dd>{detail.value}</dd>
            </div>
          ))}
        </dl>
      )}

      {hideDetailToggle ? null : (
        <Button
          className="newsroll_policy_detail_toggle"
          size="large"
          variant="filled"
        >
          <Icon name="plus" />
          상세보기
        </Button>
      )}
      </div>

      <div
        className="newsroll_policy_detail_pagination"
        role="group"
        aria-label="이전글 다음글"
      >
        <Button
          className="btn_originalArticle newsroll_policy_detail_page_button"
          classNameOnly
          disabled={!onPreviousItem}
          onClick={onPreviousItem}
          type="button"
        >
          <Icon name="arrow" />
          이전글
        </Button>
        <Button
          className="btn_originalArticle newsroll_policy_detail_page_button"
          classNameOnly
          disabled={!onNextItem}
          onClick={onNextItem}
          type="button"
        >
          다음글
          <Icon name="arrow" />
        </Button>
      </div>
    </div>
  );
}
