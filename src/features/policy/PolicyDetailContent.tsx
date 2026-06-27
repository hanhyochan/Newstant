"use client";

import { useEffect, useLayoutEffect, useState } from "react";

import { bookmarkApi } from "@/app/_newsroll/api";
import { currentUserId } from "@/app/_newsroll/auth/current-user";
import {
  ChipLabel,
  DateTimeText,
  PaginationButton,
  Icon,
  IconButton,
  Divider,
  PrimaryButton,
  PrimaryButtonGroup,
  getSearchHighlightTargetId,
  scrollSearchHighlightTargetIntoView,
  SearchHighlightText,
} from "@/design-system/components";
import { useShareContent } from "@/design-system/templates";

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
  return `newsroll_motion_enterFromRight${isLeaving ? " is_motionLeaving" : ""}`;
}

export function PolicyDetailContent({
  hideDetailList = false,
  hideDetailToggle = false,
  isLeaving = false,
  item,
  onNextItem,
  onPreviousItem,
  searchQuery,
  searchTargetKey,
}: {
  hideDetailList?: boolean;
  hideDetailToggle?: boolean;
  isLeaving?: boolean;
  item: PolicyDetailContentItem;
  onNextItem?: () => void;
  onPreviousItem?: () => void;
  searchQuery?: string;
  searchTargetKey?: string;
}) {
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [bookmarkId, setBookmarkId] = useState<string | null>(null);
  const policyDate = getPolicyDateDisplay(item);
  const policySearchRootId = `policy-detail-${item.id ?? item.title}`;
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

    scrollSearchHighlightTargetIntoView(
      getSearchHighlightTargetId(policySearchRootId, searchTargetKey),
    );
  }, [policySearchRootId, searchQuery, searchTargetKey]);

  useEffect(() => {
    let ignore = false;

    async function loadBookmarkState() {
      if (!item.id) {
        setIsBookmarked(false);
        setBookmarkId(null);
        return;
      }

      const bookmarks = await bookmarkApi.getBookmarks(currentUserId);
      const bookmark = bookmarks.find(
        (entry) =>
          entry.targetType === "welfarePolicy" && entry.targetId === item.id,
      );

      if (!ignore) {
        setIsBookmarked(Boolean(bookmark));
        setBookmarkId(bookmark?.id ?? null);
      }
    }

    loadBookmarkState().catch(() => {
      if (!ignore) {
        setIsBookmarked(false);
        setBookmarkId(null);
      }
    });

    return () => {
      ignore = true;
    };
  }, [item.id]);

  async function togglePolicyBookmark() {
    if (!item.id) {
      setIsBookmarked((current) => !current);
      return;
    }

    if (isBookmarked && bookmarkId) {
      setIsBookmarked(false);
      setBookmarkId(null);
      await bookmarkApi.removeBookmark(bookmarkId);
      return;
    }

    const bookmark = await bookmarkApi.addBookmark({
      targetId: item.id,
      targetType: "welfarePolicy",
      userId: currentUserId,
    });

    setIsBookmarked(true);
    setBookmarkId(bookmark.id);
  }

  return (
    <div
      className={`newsroll_policy_detail_content ${getEnterFromRightMotionClassName(isLeaving)}`}
    >
      <div className="newsroll_policy_detail_main">
      <div className="newsroll_policy_detail_header">
        <div className="wrapper_contentMeta">
          <div className="newsroll_policy_detail_body">
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
          </div>

          <div className="wrapper_articleMetaActions wrapper_betweenRow newsroll_policy_detail_meta_actions">
            <div className="newsroll_policy_detail_dates">
              <span>
                <strong>{policyDate.label}</strong>
                <DateTimeText>{policyDate.date}</DateTimeText>
              </span>
            </div>

            <div className="wrapper_articleActions wrapper_actionGroup wrapper_actionGroup_style" aria-label="정책 도구" role="group">
              <IconButton
                className="btn_articleTool"
                icon="share"
                label="공유"
                onClick={() => {
                  void sharePolicy();
                }}
              />
              <IconButton
                aria-pressed={isBookmarked}
                className="btn_articleTool"
                icon="bookmark"
                label="북마크"
                onClick={() => {
                  void togglePolicyBookmark();
                }}
              />
            </div>
          </div>
        </div>

        <div className="newsroll_policy_detail_tags">
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

      <Divider className="newsroll_policy_detail_actions_divider" />

      <p className="newsroll_policy_detail_summary">
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
        <dl className="newsroll_policy_detail_list">
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
          className="newsroll_policy_detail_toggle"
          leftIcon={<Icon name="plus" />}
        >
          상세보기
        </PrimaryButton>
      </PrimaryButtonGroup>
      )}
      </div>

      <div
        className="newsroll_policy_detail_pagination wrapper_betweenRow"
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
