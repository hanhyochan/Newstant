"use client";

import { useEffect, useLayoutEffect } from "react";

import {
  ChipLabel,
  DateTimeText,
  PaginationButton,
  IconButton,
  Divider,
  PrimaryButton,
  PrimaryButtonGroup,
  getSearchHighlightTargetId,
  scrollSearchHighlightTargetIntoView,
  SearchHighlightText,
} from "@/design-system/components";
import { useShareContent } from "@/design-system/templates";
import { useBookmarkTarget } from "@/features/shared/use-bookmark-target";

type PolicyDetailItem = {
  label: string;
  value: string;
};

export type PolicyDetailContentItem = {
  details: PolicyDetailItem[];
  id?: string;
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
  return `motion_enterFromRight${isLeaving ? " is_motionLeaving" : ""}`;
}

export function PolicyDetailContent({
  hideBookmarkButton = false,
  hideDetailList = false,
  hideDetailToggle = false,
  isLeaving = false,
  item,
  onNextItem,
  onPreviousItem,
  searchQuery,
  searchTargetKey,
}: {
  hideBookmarkButton?: boolean;
  hideDetailList?: boolean;
  hideDetailToggle?: boolean;
  isLeaving?: boolean;
  item: PolicyDetailContentItem;
  onNextItem?: () => void;
  onPreviousItem?: () => void;
  searchQuery?: string;
  searchTargetKey?: string;
}) {
  const { isBookmarked, toggleBookmark: togglePolicyBookmark } = useBookmarkTarget({
    enabled: !hideBookmarkButton,
    targetId: item.id,
    targetType: "welfarePolicy",
  });
  const policyDate = getPolicyDateDisplay(item);
  const policySearchRootId = `policy-detail-${item.id ?? item.title}`;
  const policySearchTargetId = getSearchHighlightTargetId(
    policySearchRootId,
    searchTargetKey,
  );
  const sharePolicy = useShareContent({
    text: item.summary,
    title: item.title,
  });

  useLayoutEffect(() => {
    resetNewsRollViewport();
  }, []);

  useEffect(() => {
    if (!searchTargetKey || !searchQuery?.trim()) {
      return;
    }

    const retryDelays = [0, 180, 360];
    const timeoutIds = retryDelays.map((delay) =>
      window.setTimeout(() => {
        scrollSearchHighlightTargetIntoView(policySearchTargetId);
      }, delay),
    );

    return () => {
      timeoutIds.forEach((timeoutId) => window.clearTimeout(timeoutId));
    };
  }, [policySearchTargetId, searchQuery, searchTargetKey]);


  return (
    <div
      className={`wrapper_detailContent ${getEnterFromRightMotionClassName(isLeaving)}`}
    >
      <div className="wrapper_detailMain">
      <div className="wrapper_detailHeader">
        <div className="wrapper_contentMeta u_gap8">
          <h1>
              <SearchHighlightText
                query={searchTargetKey === "title" ? searchQuery : ""}
                targetId={
                  searchTargetKey === "title"
                    ? getSearchHighlightTargetId(policySearchRootId, "title")
                    : undefined
                }
              >
                {item.title}
              </SearchHighlightText>
          </h1>

          <div className="wrapper_articleMetaActions wrapper_betweenRow wrapper_detailMetaActions">
            <div className="wrapper_detailDateGroup u_flexWrap">
              <span>
                <strong>{policyDate.label}</strong>
                <DateTimeText>{policyDate.date}</DateTimeText>
              </span>
            </div>

            <div className="wrapper_articleActions wrapper_actionGroup u_itemsCenter" aria-label="정책 도구" role="group">
              <IconButton
                icon="share"
                label="공유"
                onClick={() => {
                  void sharePolicy();
                }}
                variant="articleTool"
              />
              {hideBookmarkButton ? null : (
                <IconButton
                  aria-pressed={isBookmarked}
                  icon="bookmark"
                  label="북마크"
                  onClick={() => {
                    void togglePolicyBookmark();
                  }}
                  variant="articleTool"
                />
              )}
            </div>
          </div>
        </div>

        <div className="wrapper_detailTagGroup u_gap8">
          {item.tags.map((tag) => (
            <ChipLabel key={`${item.title}-${tag}`}>
              <SearchHighlightText
                query={searchTargetKey === "tags" ? searchQuery : ""}
                targetId={
                  searchTargetKey === "tags"
                    ? getSearchHighlightTargetId(policySearchRootId, "tags")
                    : undefined
                }
              >
                {tag}
              </SearchHighlightText>
            </ChipLabel>
          ))}
        </div>
      </div>

      <Divider className="divider_detailActions" />

      <p className="text_detailSummary">
        <SearchHighlightText
          query={searchTargetKey === "summary" ? searchQuery : ""}
          targetId={
            searchTargetKey === "summary"
              ? getSearchHighlightTargetId(policySearchRootId, "summary")
              : undefined
          }
        >
          {item.summary}
        </SearchHighlightText>
      </p>

      {hideDetailList ? null : (
        <dl className="list_detailDefinition">
          {item.details.map((detail, index) => (
            <div key={`${item.title}-${detail.label}`}>
              <dt>
                <SearchHighlightText
                  query={
                    searchTargetKey === `detail-${index}-label`
                      ? searchQuery
                      : ""
                  }
                  targetId={
                    searchTargetKey === `detail-${index}-label`
                      ? getSearchHighlightTargetId(
                          policySearchRootId,
                          `detail-${index}-label`,
                        )
                      : undefined
                  }
                >
                  {detail.label}
                </SearchHighlightText>
              </dt>
              <dd>
                <SearchHighlightText
                  query={
                    searchTargetKey === `detail-${index}-value`
                      ? searchQuery
                      : ""
                  }
                  targetId={
                    searchTargetKey === `detail-${index}-value`
                      ? getSearchHighlightTargetId(
                          policySearchRootId,
                          `detail-${index}-value`,
                        )
                      : undefined
                  }
                >
                  {detail.value}
                </SearchHighlightText>
              </dd>
            </div>
          ))}
        </dl>
      )}

      {hideDetailToggle ? null : (
        <PrimaryButtonGroup>
        <PrimaryButton
          className="btn_detailToggle"
        >
          알아보기
        </PrimaryButton>
      </PrimaryButtonGroup>
      )}
      </div>

      <div
        className="wrapper_detailPagination wrapper_betweenRow"
        role="group"
        aria-label="이전글 다음글"
      >
        <PaginationButton
          direction="previous"
          disabled={!onPreviousItem}
          onClick={onPreviousItem}
        />
        <PaginationButton
          direction="next"
          disabled={!onNextItem}
          onClick={onNextItem}
        />
      </div>
    </div>
  );
}
