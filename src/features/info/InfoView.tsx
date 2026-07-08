"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import {
  PillTabMenu,
} from "@/design-system/components";
import {
  NewsRollCommonLayout,
  NewsRollDetailBackButton,
  NewsRollDockedControls,
  NewsRollHeaderTop,
  NewsRollPagePanel,
  newsrollPagePanelContentSelector as pagePanelContentSelector,
  newsrollPagePanelDockedGap as pagePanelDockedGap,
  newsrollPagePanelInitialGap as pagePanelInitialGap,
  newsrollPagePanelInitialTop as pagePanelInitialTop,
  useDetailScrollRestore,
  useEnterFromRightExitMotion,
  useSwipeTabNavigation,
} from "@/design-system/templates";
import {
  infoApi,
  type Faq,
  type InquiryType,
  type Notice,
} from "@/shared/newsroll/api";
import { fixedDockedPanelProps } from "@/shared/newsroll/my-info-panel-behavior";
import {
  InfoFaqSection,
} from "@/features/info/components/InfoFaqSection";
import {
  InfoInquirySection,
} from "@/features/info/components/InfoInquirySection";
import {
  InfoNoticeSection,
  type InfoNoticeItem,
} from "@/features/info/components/InfoNoticeSection";
import { PolicyDetailContent } from "@/features/policy/PolicyDetailContent";
import { DockedAlarmButton, NewsToolbar } from "@/features/shell/NewsRollToolbar";

type InfoTab = "notice" | "faq" | "inquiry";

type PolicyDetailItem = {
  label: string;
  value: string;
};

type PolicyItem = {
  details: PolicyDetailItem[];
  registeredAt: string;
  summary: string;
  tags: string[];
  title: string;
  updatedAt: string;
};

const infoTabs: { id: InfoTab; label: string }[] = [
  { id: "notice", label: "공지사항" },
  { id: "faq", label: "FAQ" },
  { id: "inquiry", label: "1:1 문의" },
];

function formatPolicyDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("ko-KR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

function getNoticeDateLabel(date: string) {
  if (date.includes("T")) {
    return formatPolicyDate(date);
  }

  const [year, month, day] = date.split(".");

  return `${year}년 ${Number(month)}월 ${Number(day)}일`;
}

function getInfoNoticeItem(notice: Notice): InfoNoticeItem {
  return {
    content: notice.content,
    date: getNoticeDateLabel(notice.registeredAt),
    id: notice.id,
    summary: notice.summary,
    title: notice.title,
    updatedAt: getNoticeDateLabel(notice.updatedAt),
  };
}

function getNoticeDetailItem(notice: InfoNoticeItem): PolicyItem {
  return {
    details: [],
    registeredAt: notice.date,
    summary: notice.content || notice.summary,
    tags: ["공지사항", "안내", "업데이트"],
    title: notice.title,
    updatedAt: notice.updatedAt,
  };
}

export function InfoView({
  isTextLarge,
  onOpenBreakingNews,
  onOpenNotifications,
  onOpenSearch,
  onToggleTextSize,
}: {
  isTextLarge: boolean;
  onOpenBreakingNews: () => void;
  onOpenNotifications: () => void;
  onOpenSearch: () => void;
  onToggleTextSize: () => void;
}) {
  const [activeInfoTab, setActiveInfoTab] = useState<InfoTab>("notice");
  const [noticeDetailItem, setNoticeDetailItem] = useState<PolicyItem | null>(
    null,
  );
  const [noticeDetailIndex, setNoticeDetailIndex] = useState<number | null>(
    null,
  );
  const [infoNotices, setInfoNotices] = useState<InfoNoticeItem[]>([]);
  const [infoFaqs, setInfoFaqs] = useState<Faq[]>([]);
  const [infoInquiryTypes, setInfoInquiryTypes] = useState<InquiryType[]>([]);
  const infoPanelContentRef = useRef<HTMLDivElement>(null);
  const isNoticeDetailOpen = noticeDetailItem !== null;
  const previousNotice =
    noticeDetailIndex !== null && noticeDetailIndex > 0
      ? infoNotices[noticeDetailIndex - 1]
      : null;
  const nextNotice =
    noticeDetailIndex !== null && noticeDetailIndex < infoNotices.length - 1
      ? infoNotices[noticeDetailIndex + 1]
      : null;
  const infoDetailScrollRestore = useDetailScrollRestore({
    isDetailOpen: isNoticeDetailOpen,
    resetKey:
      noticeDetailIndex !== null
        ? `notice:${noticeDetailIndex}`
        : noticeDetailItem?.title,
    scrollerRef: infoPanelContentRef,
  });
  const closeNoticeDetailImmediately = useCallback(() => {
    infoDetailScrollRestore.requestRestore();
    setNoticeDetailItem(null);
    setNoticeDetailIndex(null);
  }, [infoDetailScrollRestore]);
  const noticeDetailExitMotion = useEnterFromRightExitMotion({
    isOpen: isNoticeDetailOpen,
    onClose: closeNoticeDetailImmediately,
  });
  const activeInfoTabLabel =
    infoTabs.find((tab) => tab.id === activeInfoTab)?.label ?? "공지사항";
  const {
    swipeMotionClassName: infoTabSwipeMotionClassName,
    ...infoTabSwipeHandlers
  } = useSwipeTabNavigation({
    items: infoTabs,
    onChange: handleInfoTabChange,
    value: activeInfoTab,
  });

  useEffect(() => {
    let ignore = false;

    async function loadInfoData() {
      const [nextNotices, nextFaqs, nextInquiryTypes] = await Promise.all([
        infoApi.getNotices(),
        infoApi.getFaqs(),
        infoApi.getInquiryTypes(),
      ]);

      if (!ignore) {
        setInfoNotices(nextNotices.map(getInfoNoticeItem));
        setInfoFaqs(nextFaqs);
        setInfoInquiryTypes(nextInquiryTypes);
      }
    }

    loadInfoData().catch(() => {
      if (!ignore) {
        setInfoNotices([]);
        setInfoFaqs([]);
        setInfoInquiryTypes([]);
      }
    });

    return () => {
      ignore = true;
    };
  }, []);

  function resetInfoPanelScroll() {
    const scrollToTop = () => {
      infoPanelContentRef.current?.scrollTo({ left: 0, top: 0 });
    };

    scrollToTop();
    window.requestAnimationFrame(scrollToTop);
  }

  function handleInfoTabChange(nextTab: InfoTab) {
    if (nextTab === activeInfoTab) {
      return;
    }

    resetInfoPanelScroll();
    setActiveInfoTab(nextTab);
    setNoticeDetailItem(null);
    setNoticeDetailIndex(null);
  }

  function openNoticeDetail(
    notice: InfoNoticeItem,
    index: number,
  ) {
    infoDetailScrollRestore.captureScroll();
    setNoticeDetailItem(getNoticeDetailItem(notice));
    setNoticeDetailIndex(index);
  }

  function moveNoticeDetail(notice: InfoNoticeItem, index: number) {
    setNoticeDetailItem(getNoticeDetailItem(notice));
    setNoticeDetailIndex(index);
  }

  const closeNoticeDetail = noticeDetailExitMotion.closeWithMotion;

  return (
    <NewsRollCommonLayout
      aria-label="인포메이션"
      className="sheetFrame info_screen"
      dockedGap={pagePanelDockedGap}
      initialGap={pagePanelInitialGap}
      {...fixedDockedPanelProps}
      minInitialTop={pagePanelInitialTop}
      sheetClassName="sheetFrameSheet container_homeSheet info_sheet"
      sheetScrollSelector={pagePanelContentSelector}
      top={
        <NewsRollHeaderTop>
          <NewsToolbar
            isTextLarge={isTextLarge}
            onOpenNotifications={onOpenNotifications}
            onOpenSearch={onOpenSearch}
            onToggleTextSize={onToggleTextSize}
          />
          <NewsRollDockedControls
            className="motion_dockedPop allDockedControls panelHeaderRow"
            isDetailOpen={isNoticeDetailOpen}
          >
            {isNoticeDetailOpen ? (
              <NewsRollDetailBackButton
                ariaLabel="공지사항 목록으로 돌아가기"
                onClick={closeNoticeDetail}
              />
            ) : null}
            {isNoticeDetailOpen ? null : (
              <h1 className="text_panelHeaderTitle">{activeInfoTabLabel}</h1>
            )}
            <DockedAlarmButton
              isPressed={false}
              onClick={onOpenBreakingNews}
            />
          </NewsRollDockedControls>
        </NewsRollHeaderTop>
      }
    >
      <NewsRollPagePanel
        ariaLabel="인포메이션 콘텐츠 영역"
        contentRef={infoPanelContentRef}
      >
        {noticeDetailItem ? (
          <PolicyDetailContent
            hideBookmarkButton
            hideDetailList
            hideDetailToggle
            isLeaving={noticeDetailExitMotion.isLeaving}
            item={noticeDetailItem}
            key={`notice-detail-${noticeDetailIndex ?? "unknown"}`}
            onNextItem={
              nextNotice && noticeDetailIndex !== null
                ? () => moveNoticeDetail(nextNotice, noticeDetailIndex + 1)
                : undefined
            }
            onPreviousItem={
              previousNotice && noticeDetailIndex !== null
                ? () => moveNoticeDetail(previousNotice, noticeDetailIndex - 1)
                : undefined
            }
          />
        ) : (
          <div className="container_infoContent all_panelContentFlush" {...infoTabSwipeHandlers}>
            <div className="all_tabSticky wrapper_stickyHeader wrapper_stickyHeader_style all_category_tabSticky">
              <PillTabMenu
                ariaLabel="인포메이션 메뉴"
                className="all_category_tabs wrapper_tabScroller"
                getPanelId={(id) =>
                  id === activeInfoTab ? `newsroll_info_panel_${id}` : undefined
                }
                getTabId={(id) => `newsroll_info_tab_${id}`}
                items={infoTabs}
                onChange={handleInfoTabChange}
                value={activeInfoTab}
              />
            </div>
            <div
              aria-labelledby={`newsroll_info_tab_${activeInfoTab}`}
              className={`container_infoPanel ${infoTabSwipeMotionClassName}`.trim()}
              id={`newsroll_info_panel_${activeInfoTab}`}
              role="tabpanel"
            >
              {activeInfoTab === "notice" ? (
                <InfoNoticeSection
                  items={infoNotices}
                  onNoticeSelect={openNoticeDetail}
                />
              ) : null}
              {activeInfoTab === "faq" ? <InfoFaqSection items={infoFaqs} /> : null}
              {activeInfoTab === "inquiry" ? (
                <InfoInquirySection items={infoInquiryTypes} />
              ) : null}
            </div>
          </div>
        )}
      </NewsRollPagePanel>
    </NewsRollCommonLayout>
  );
}

