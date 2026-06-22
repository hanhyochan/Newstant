"use client";

import { useEffect, useLayoutEffect, useState } from "react";

import { bookmarkApi } from "@/app/_newsroll/api";
import { currentUserId } from "@/app/_newsroll/auth/current-user";
import {
  ArticleActionButtons,
  ChipLabel,
  DetailPaginationButton,
  Icon,
  NewsRollDivider,
  PrimaryButton,
  PrimaryButtonGroup,
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
}: {
  hideDetailList?: boolean;
  hideDetailToggle?: boolean;
  isLeaving?: boolean;
  item: PolicyDetailContentItem;
  onNextItem?: () => void;
  onPreviousItem?: () => void;
}) {
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [bookmarkId, setBookmarkId] = useState<string | null>(null);
  const policyDate = getPolicyDateDisplay(item);
  const sharePolicy = useShareContent({
    text: item.summary,
    title: item.title,
  });

  useLayoutEffect(() => {
    resetNewsRollViewport();
  }, []);

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
              onBookmark={() => {
                void togglePolicyBookmark();
              }}
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
        <PrimaryButtonGroup>
        <PrimaryButton
          className="newsroll_policy_detail_toggle"
        >
          <Icon name="plus" />
          상세보기
        </PrimaryButton>
      </PrimaryButtonGroup>
      )}
      </div>

      <div
        className="newsroll_policy_detail_pagination"
        role="group"
        aria-label="이전글 다음글"
      >
        <DetailPaginationButton
          direction="previous"
          disabled={!onPreviousItem}
          onClick={onPreviousItem}
        />
        <DetailPaginationButton
          direction="next"
          disabled={!onNextItem}
          onClick={onNextItem}
        />
      </div>
    </div>
  );
}
