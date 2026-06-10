"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";

import {
  Button,
  Icon,
  NewsRollDropdownArrow,
  PillTabMenu,
  TextInput,
  Textarea,
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
} from "@/design-system/templates";
import {
  infoApi,
  inquiryApi,
  type Faq,
  type InquiryType,
  type Notice,
} from "@/app/_newsroll/api";
import { currentUserId } from "@/app/_newsroll/auth/current-user";
import { fixedDockedPanelProps } from "@/app/_newsroll/my-info-panel-behavior";
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

type InfoNoticeItem = {
  content: string;
  date: string;
  id: string;
  summary: string;
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

function getDataUnavailableMessage(target: string, particle = "을") {
  return `${target}${particle} 불러오지 못했습니다.`;
}

function DataUnavailableMessage({
  particle = "을",
  target,
}: {
  particle?: string;
  target: string;
}) {
  return <p className="text_commentEmpty">{getDataUnavailableMessage(target, particle)}</p>;
}

type SeparatedListProps<T> = {
  dividerClassName?: string;
  getKey: (item: T, index: number) => string;
  items: T[];
  renderItem: (item: T, index: number) => ReactNode;
};

function SeparatedList<T>({
  dividerClassName = "newsroll_divider_horizontal",
  getKey,
  items,
  renderItem,
}: SeparatedListProps<T>) {
  return (
    <>
      {items.map((item, index) => (
        <div className="wrapper_separatedItem" key={getKey(item, index)}>
          {renderItem(item, index)}
          {index < items.length - 1 ? (
            <span
              aria-hidden="true"
              className={`newsroll_divider newsroll_divider_horizontal ${dividerClassName}`}
              role="presentation"
            />
          ) : null}
        </div>
      ))}
    </>
  );
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

function InfoNoticeSection({
  items,
  onNoticeSelect,
}: {
  items: InfoNoticeItem[];
  onNoticeSelect: (notice: InfoNoticeItem, index: number) => void;
}) {
  return (
    <section className="container_infoList" aria-label="공지사항">
      {items.length === 0 ? (
        <DataUnavailableMessage target="공지사항" />
      ) : (
        <SeparatedList
          dividerClassName="divider_infoSection"
          getKey={(notice, index) => `${notice.title}-${notice.date}-${index}`}
          items={items}
          renderItem={(notice, index) => (
            <button
              className="btn_infoNoticeItem"
              onClick={() => onNoticeSelect(notice, index)}
              type="button"
            >
              <div className="wrapper_infoNoticeContent">
                <span className="text_infoItemTitle">{notice.title}</span>
                <p className="text_infoBody text_lineClamp2">
                  {notice.summary}
                </p>
                <span className="text_infoMeta">{notice.date}</span>
              </div>
            </button>
          )}
        />
      )}
    </section>
  );
}

function InfoFaqSection({ items }: { items: Faq[] }) {
  const [openFaqIndexes, setOpenFaqIndexes] = useState<Set<number>>(
    () => new Set(),
  );

  return (
    <section className="container_infoList" aria-label="FAQ">
      {items.length === 0 ? (
        <DataUnavailableMessage target="FAQ" />
      ) : (
        <SeparatedList
          dividerClassName="divider_infoSection"
          getKey={(item, index) => `${item.question}-${index}`}
          items={items}
          renderItem={(item, index) => (
            <details
              className="container_infoFaqItem"
              onToggle={(event) => {
                const isOpen = event.currentTarget.open;

                setOpenFaqIndexes((current) => {
                  const next = new Set(current);

                  if (isOpen) {
                    next.add(index);
                  } else {
                    next.delete(index);
                  }

                  return next;
                });
              }}
              open={openFaqIndexes.has(index)}
            >
              <summary className="btn_infoFaqSummary">
                <span className="text_infoItemTitle">Q. {item.question}</span>
                <span className="icon_infoChevron" aria-hidden="true" />
              </summary>
              <p className="text_infoBody text_infoFaqBody">{item.answer}</p>
            </details>
          )}
        />
      )}
    </section>
  );
}

function InfoInquirySection({ items }: { items: InquiryType[] }) {
  const [selectedInquiryType, setSelectedInquiryType] = useState(
    items[0]?.label ?? "",
  );
  const [inquiryTitle, setInquiryTitle] = useState("");
  const [inquiryContent, setInquiryContent] = useState("");
  const [inquiryStatus, setInquiryStatus] = useState<"error" | "sent" | "sending" | null>(
    null,
  );
  const [isInquiryTypeOpen, setIsInquiryTypeOpen] = useState(false);
  const inquiryTypeMenuId = "info-inquiry-type-menu";

  useEffect(() => {
    if (items.length > 0 && !items.some((item) => item.label === selectedInquiryType)) {
      setSelectedInquiryType(items[0].label);
    }
  }, [items, selectedInquiryType]);

  if (items.length === 0) {
    return (
      <section className="container_infoList" aria-label="1:1 문의">
        <DataUnavailableMessage target="문의 유형" />
      </section>
    );
  }

  return (
    <form
      className="wrapper_infoInquiry"
      aria-label="1:1 문의"
      onSubmit={(event) => {
        event.preventDefault();

        const selectedType = items.find((item) => item.label === selectedInquiryType);

        if (!selectedType || !inquiryTitle.trim() || !inquiryContent.trim()) {
          setInquiryStatus("error");
          return;
        }

        setInquiryStatus("sending");
        inquiryApi
          .createInquiry({
            content: inquiryContent.trim(),
            title: inquiryTitle.trim(),
            typeId: selectedType.id,
            userId: currentUserId,
          })
          .then(() => {
            setInquiryTitle("");
            setInquiryContent("");
            setInquiryStatus("sent");
          })
          .catch(() => {
            setInquiryStatus("error");
          });
      }}
    >
      <label className="wrapper_infoField">
        <span className="text_infoFieldLabel">문의 유형</span>
        <div className="wrapper_infoSelectControl">
          <button
            aria-controls={isInquiryTypeOpen ? inquiryTypeMenuId : undefined}
            aria-expanded={isInquiryTypeOpen}
            aria-haspopup="listbox"
            aria-label="문의 유형"
            className="btn_commentDropdown select_infoField"
            onClick={() => setIsInquiryTypeOpen((current) => !current)}
            type="button"
          >
            {selectedInquiryType}
            <NewsRollDropdownArrow />
          </button>
          {isInquiryTypeOpen ? (
            <div
              className="listbox_commentDropdown listbox_infoInquiryType"
              id={inquiryTypeMenuId}
              role="listbox"
            >
              {items.map((type) => (
                <button
                  aria-selected={selectedInquiryType === type.label}
                  key={type.id}
                  onClick={() => {
                    setSelectedInquiryType(type.label);
                    setIsInquiryTypeOpen(false);
                  }}
                  role="option"
                  type="button"
                >
                  {type.label}
                </button>
              ))}
            </div>
          ) : null}
        </div>
      </label>
      <div className="wrapper_infoField">
        <span className="text_infoFieldLabel">제목</span>
        <TextInput
          aria-label="문의 제목"
          onChange={(event) => setInquiryTitle(event.target.value)}
          placeholder="문의 제목을 입력해주세요."
          inputSize="large"
          radius="rounded"
          type="text"
          value={inquiryTitle}
          variant="outline"
          wrapperClassName="input_commentComposer"
        />
      </div>
      <div className="wrapper_infoField">
        <span className="text_infoFieldLabel">내용</span>
        <Textarea
          aria-label="문의 내용"
          className="textarea_infoComposer"
          onChange={(event) => setInquiryContent(event.target.value)}
          placeholder="문의 내용을 자세히 작성해주세요."
          radius="rounded"
          rows={7}
          textareaSize="large"
          value={inquiryContent}
        />
      </div>
      {inquiryStatus === "sent" ? (
        <p className="text_infoSubmitStatus" role="status">
          문의가 접수되었습니다.
        </p>
      ) : null}
      {inquiryStatus === "error" ? (
        <p className="text_infoSubmitStatus is_error" role="alert">
          문의 내용을 확인해주세요.
        </p>
      ) : null}
      <Button
        className="btn_infoSubmit"
        disabled={inquiryStatus === "sending"}
        radius="rounded"
        size="large"
        type="submit"
      >
        <Icon name="submit" />
        {inquiryStatus === "sending" ? "보내는 중" : "문의하기"}
      </Button>
    </form>
  );
}

export function InfoView({
  isTextLarge,
  onOpenBreakingNews,
  onOpenMenu,
  onOpenSearch,
  onToggleTextSize,
}: {
  isTextLarge: boolean;
  onOpenBreakingNews: () => void;
  onOpenMenu: () => void;
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

  function handleInfoTabChange(nextTab: InfoTab) {
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
      className="newsroll_sheetFrame newsroll_info_screen"
      dockedGap={pagePanelDockedGap}
      initialGap={pagePanelInitialGap}
      {...fixedDockedPanelProps}
      minInitialTop={pagePanelInitialTop}
      sheetClassName="newsroll_sheetFrameSheet container_homeSheet newsroll_info_sheet"
      sheetScrollSelector={pagePanelContentSelector}
      top={
        <NewsRollHeaderTop>
          <NewsToolbar
            isTextLarge={isTextLarge}
            onOpenMenu={onOpenMenu}
            onOpenSearch={onOpenSearch}
            onToggleTextSize={onToggleTextSize}
          />
          <NewsRollDockedControls
            className="newsroll_motion_dockedPop newsroll_allDockedControls newsroll_panelHeaderRow"
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
          <div className="container_infoContent">
            <PillTabMenu
              ariaLabel="인포메이션 메뉴"
              className="tab_myCategoryMenu"
              getPanelId={(id) =>
                id === activeInfoTab ? `newsroll_info_panel_${id}` : undefined
              }
              getTabId={(id) => `newsroll_info_tab_${id}`}
              items={infoTabs}
              onChange={handleInfoTabChange}
              value={activeInfoTab}
            />
            <div
              aria-labelledby={`newsroll_info_tab_${activeInfoTab}`}
              className="container_infoPanel"
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

