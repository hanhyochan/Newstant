"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import { welfareApi, type WelfarePolicy } from "@/app/_newsroll/api";
import { getCurrentUserSnapshot } from "@/app/_newsroll/auth/current-user";
import {
  ChipLabel,
  ContentSummaryButton,
  DateTimeText,
  SelectButton,
  PillTabMenu
} from "@/design-system/components";
import {
  NewsRollCommonLayout,
  NewsRollDetailBackButton,
  NewsRollDockedControls,
  NewsRollPagePanel,
  NewsRollSummaryHeroTop,
  newsrollPagePanelContentSelector as pagePanelContentSelector,
  newsrollPagePanelDockedGap as pagePanelDockedGap,
  newsrollPagePanelInitialGap as pagePanelInitialGap,
  newsrollPagePanelInitialTop as pagePanelInitialTop,
  useDetailScrollRestore,
  useEnterFromRightExitMotion,
  useSwipeTabNavigation,
} from "@/design-system/templates";
import { PolicyDetailContent } from "@/features/policy/PolicyDetailContent";
import { DataUnavailableMessage } from "@/features/shared/DataUnavailableMessage";
import { SeparatedList } from "@/features/shared/SeparatedList";
import { DockedAlarmButton, NewsToolbar } from "@/features/shell/NewsRollToolbar";

type SortOrder = "popular" | "latest";

type PolicyDetailItem = {
  label: string;
  value: string;
};

type PolicyItem = {
  details: PolicyDetailItem[];
  id: string;
  registeredAt: string;
  summary: string;
  tags: string[];
  title: string;
  updatedAt: string;
};

type BodySearchSelection =
  | { article: unknown; id: number; kind: "news" }
  | {
      id: number;
      kind: "policy";
      policy: PolicyItem;
      searchQuery?: string;
      searchTargetKey?: string;
    };

function formatHeroCount(count: number) {
  return new Intl.NumberFormat("ko-KR").format(count);
}

const policyAgeTabs = ["전체", "미성년", "청년", "중장년", "노년"];
const policyAgeIdByLabel: Record<string, string> = {
  노년: "senior",
  미성년: "minor",
  전체: "all",
  중장년: "middle",
  청년: "youth",
};

const policySortLabels: Record<SortOrder, string> = {
  latest: "최신순",
  popular: "인기순",
};
const policySortOptions: { label: string; value: SortOrder }[] = [
  { label: policySortLabels.popular, value: "popular" },
  { label: policySortLabels.latest, value: "latest" },
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

export function getPolicyItemFromWelfarePolicy(policy: WelfarePolicy): PolicyItem {
  return {
    details: [
      { label: "지원 대상 연령", value: policy.targetAge },
      { label: "지원 내용", value: policy.supportContent },
      { label: "지원 기관", value: policy.institution },
      {
        label: "사업 기간",
        value: `${policy.businessStartDate} ~ ${policy.businessEndDate}`,
      },
      {
        label: "신청 기간",
        value: `${policy.applicationStartDate} ~ ${policy.applicationEndDate}`,
      },
      { label: "신청 방법", value: policy.applicationMethod },
      { label: "선발 방식", value: policy.selectionMethod },
      { label: "제출 서류", value: policy.documents },
    ],
    id: policy.id,
    registeredAt: formatPolicyDate(policy.registeredAt),
    summary: policy.summary,
    tags: [policy.category, policy.subcategory, policy.label],
    title: policy.title,
    updatedAt: formatPolicyDate(policy.updatedAt),
  };
}

function getPolicyDateDisplay(item: PolicyItem) {
  const isUpdated = item.registeredAt !== item.updatedAt;

  return {
    date: isUpdated ? item.updatedAt : item.registeredAt,
    label: isUpdated ? "최종수정" : "최초등록",
  };
}

function PolicyListItem({
  isSelected,
  item,
  onSelect,
}: {
  isSelected: boolean;
  item: PolicyItem;
  onSelect: () => void;
}) {
  const policyDate = getPolicyDateDisplay(item);

  return (
    <ContentSummaryButton
      className="newsroll_policy_list_item"
      onClick={onSelect}
      selected={isSelected}
    >
      <div className="wrapper_policyItemContent wrapper_panelContent">
        <div className="wrapper_contentMeta">
          <h2>{item.title}</h2>
          <p className="text_infoBody text_lineClamp2">{item.summary}</p>
          <div className="newsroll_policy_dates">
            <span>
              <strong>{policyDate.label}</strong>
              <DateTimeText>{policyDate.date}</DateTimeText>
            </span>
          </div>
        </div>
        <div className="newsroll_policy_list_tags">
          {item.tags.map((tag) => (
            <ChipLabel key={`${item.title}-${tag}`}>
              {tag}
            </ChipLabel>
          ))}
        </div>
      </div>
    </ContentSummaryButton>
  );
}

export function PolicyView({
  bodySearchSelection,
  isTextLarge,
  onOpenBreakingNews,
  onOpenNotifications,
  onOpenSearch,
  onToggleTextSize,
}: {
  bodySearchSelection?: BodySearchSelection | null;
  isTextLarge: boolean;
  onOpenBreakingNews: () => void;
  onOpenNotifications: () => void;
  onOpenSearch: () => void;
  onToggleTextSize: () => void;
}) {
  const currentUser = getCurrentUserSnapshot();
  const [activeAge, setActiveAge] = useState(policyAgeTabs[0]);
  const [detailItem, setDetailItem] = useState<PolicyItem | null>(
    bodySearchSelection?.kind === "policy" ? bodySearchSelection.policy : null,
  );
  const [policySearchQuery, setPolicySearchQuery] = useState(
    bodySearchSelection?.kind === "policy"
      ? bodySearchSelection.searchQuery
      : undefined,
  );
  const [policySearchTargetKey, setPolicySearchTargetKey] = useState(
    bodySearchSelection?.kind === "policy"
      ? bodySearchSelection.searchTargetKey
      : undefined,
  );
  const [sortOrder, setSortOrder] = useState<SortOrder>("popular");
  const [isPolicySortOpen, setIsPolicySortOpen] = useState(false);
  const [selectedPolicyIndex, setSelectedPolicyIndex] = useState(0);
  const [policyApiItems, setPolicyApiItems] = useState<PolicyItem[]>([]);
  const [policyTotalCount, setPolicyTotalCount] = useState(0);
  const [policyLoadFailed, setPolicyLoadFailed] = useState(false);
  const policyPanelContentRef = useRef<HTMLDivElement>(null);
  const policyListSectionRef = useRef<HTMLDivElement>(null);
  const policyItems = policyApiItems;
  const visiblePolicyItems =
    sortOrder === "latest" ? [...policyItems].reverse() : policyItems;
  const activeAgeIndex = Math.max(0, policyAgeTabs.indexOf(activeAge));
  const {
    swipeMotionClassName: policyAgeSwipeMotionClassName,
    ...policyAgeSwipeHandlers
  } = useSwipeTabNavigation({
    items: policyAgeTabs.map((label) => ({ id: label })),
    onChange: (nextAge) => {
      setActiveAge(nextAge);
      setIsPolicySortOpen(false);
      setSelectedPolicyIndex(0);
    },
    value: activeAge,
  });
  const detailItemIndex = detailItem
    ? visiblePolicyItems.findIndex((item) => item.id === detailItem.id)
    : -1;
  const previousPolicyItem =
    detailItemIndex > 0 ? visiblePolicyItems[detailItemIndex - 1] : null;
  const nextPolicyItem =
    detailItemIndex >= 0 && detailItemIndex < visiblePolicyItems.length - 1
      ? visiblePolicyItems[detailItemIndex + 1]
      : null;
  const isPolicyDetailOpen = detailItem !== null;
  const policyDetailScrollRestore = useDetailScrollRestore({
    isDetailOpen: isPolicyDetailOpen,
    resetKey: detailItem?.id ?? detailItem?.title,
    scrollerRef: policyPanelContentRef,
  });
  const closePolicyDetailImmediately = useCallback(() => {
    policyDetailScrollRestore.requestRestore();
    setDetailItem(null);
  }, [policyDetailScrollRestore]);
  const policyDetailExitMotion = useEnterFromRightExitMotion({
    isOpen: isPolicyDetailOpen,
    onClose: closePolicyDetailImmediately,
  });
  const policySortMenuId = "policy-sort-menu";

  useEffect(() => {
    let ignore = false;

    async function loadPolicies() {
      setPolicyLoadFailed(false);
      const ageGroupId = policyAgeIdByLabel[activeAge] ?? "all";
      const [nextPolicies, allPolicies] = await Promise.all([
        welfareApi.getWelfarePolicyList(ageGroupId),
        welfareApi.getWelfarePolicyList("all"),
      ]);

      if (!ignore) {
        setPolicyApiItems(nextPolicies.map(getPolicyItemFromWelfarePolicy));
        setPolicyTotalCount(allPolicies.length);
        setSelectedPolicyIndex(0);
      }
    }

    loadPolicies().catch(() => {
      if (!ignore) {
        setPolicyApiItems([]);
        setPolicyTotalCount(0);
        setPolicyLoadFailed(true);
      }
    });

    return () => {
      ignore = true;
    };
  }, [activeAge]);

  function openPolicyDetail(item: PolicyItem, index: number) {
    if (!detailItem) {
      policyDetailScrollRestore.captureScroll();
    }

    setPolicySearchQuery(undefined);
    setPolicySearchTargetKey(undefined);
    setSelectedPolicyIndex(index);
    setDetailItem(item);
  }

  useEffect(() => {
    if (bodySearchSelection?.kind !== "policy") {
      return;
    }

    setSelectedPolicyIndex(0);
    setPolicySearchQuery(bodySearchSelection.searchQuery);
    setPolicySearchTargetKey(bodySearchSelection.searchTargetKey);
    setDetailItem(bodySearchSelection.policy);
  }, [bodySearchSelection]);

  const closePolicyDetail = policyDetailExitMotion.closeWithMotion;

  useEffect(() => {
    if (!isPolicySortOpen) {
      return;
    }

    function closePolicySortOnPointerDown(event: globalThis.PointerEvent) {
      const target = event.target;

      if (
        target instanceof Node &&
        policyListSectionRef.current?.contains(target)
      ) {
        return;
      }

      setIsPolicySortOpen(false);
    }

    function closePolicySortOnEscape(event: globalThis.KeyboardEvent) {
      if (event.key === "Escape") {
        setIsPolicySortOpen(false);
      }
    }

    document.addEventListener("pointerdown", closePolicySortOnPointerDown);
    document.addEventListener("keydown", closePolicySortOnEscape);

    return () => {
      document.removeEventListener("pointerdown", closePolicySortOnPointerDown);
      document.removeEventListener("keydown", closePolicySortOnEscape);
    };
  }, [isPolicySortOpen]);

  return (
    <NewsRollCommonLayout
      aria-label="국가정책"
      className="newsroll_sheetFrame newsroll_policy_screen"
      dockedGap={pagePanelDockedGap}
      initialGap={pagePanelInitialGap}
      minInitialTop={pagePanelInitialTop}
      movingSheet
      sheetClassName="newsroll_sheetFrameSheet container_homeSheet newsroll_policy_sheet"
      sheetScrollSelector={pagePanelContentSelector}
      top={
        <NewsRollSummaryHeroTop
          controls={
            <NewsRollDockedControls
              className="newsroll_motion_dockedPop newsroll_allDockedControls newsroll_panelHeaderRow"
              isDetailOpen={isPolicyDetailOpen}
            >
              {isPolicyDetailOpen ? (
                <NewsRollDetailBackButton
                  ariaLabel="국가정책 목록으로 돌아가기"
                  onClick={closePolicyDetail}
                />
              ) : (
                <h1 className="text_panelHeaderTitle">국가정책</h1>
              )}
              <DockedAlarmButton
                isPressed={false}
                onClick={onOpenBreakingNews}
              />
            </NewsRollDockedControls>
          }
          toolbar={
            <NewsToolbar
              isTextLarge={isTextLarge}
              onOpenNotifications={onOpenNotifications}
              onOpenSearch={onOpenSearch}
              onToggleTextSize={onToggleTextSize}
            />
          }
          hero={{
            ariaLabel: "맞춤 정책 요약",
            caption: "국가정책 정보가 있습니다.",
            className: "newsroll_policy_hero",
            count: formatHeroCount(policyTotalCount),
            greeting: `${currentUser.nickname}님을 위한`,
            unit: "개",
          }}
        />
      }
    >
      <NewsRollPagePanel
        ariaLabel="국가정책 콘텐츠 영역"
        contentRef={policyPanelContentRef}
        key={detailItem ? `policy-detail-${detailItem.id}` : "policy-list"}
      >
        {detailItem ? (
          <PolicyDetailContent
            isLeaving={policyDetailExitMotion.isLeaving}
            item={detailItem}
            onNextItem={
              nextPolicyItem
                ? () => openPolicyDetail(nextPolicyItem, detailItemIndex + 1)
                : undefined
            }
            onPreviousItem={
              previousPolicyItem
                ? () => openPolicyDetail(previousPolicyItem, detailItemIndex - 1)
                : undefined
            }
            searchQuery={policySearchQuery}
            searchTargetKey={policySearchTargetKey}
          />
        ) : (
          <div className="newsroll_policy_listContent">
            <PillTabMenu
              ariaLabel="연령 필터"
              className="newsroll_all_category_tabs wrapper_tabScroller newsroll_policy_age_tabs"
              getPanelId={() => "policy-list-panel"}
              getTabId={(age) => `policy-age-tab-${policyAgeTabs.indexOf(age)}`}
              items={policyAgeTabs.map((label) => ({ id: label, label }))}
              onChange={(nextAge) => {
                setActiveAge(nextAge);
                setIsPolicySortOpen(false);
                setSelectedPolicyIndex(0);
              }}
              value={activeAge}
            />

            <div
              aria-labelledby={`policy-age-tab-${activeAgeIndex}`}
              className={`newsroll_policy_listSection ${policyAgeSwipeMotionClassName}`.trim()}
              id="policy-list-panel"
              ref={policyListSectionRef}
              role="tabpanel"
              {...policyAgeSwipeHandlers}
            >
              <SelectButton
                ariaLabel="정책 정렬"
                isOpen={isPolicySortOpen}
                listboxId={policySortMenuId}
                onChange={setSortOrder}
                onOpenChange={setIsPolicySortOpen}
                options={policySortOptions}
                size="small"
                value={sortOrder}
              />
              <div className="newsroll_policy_items wrapper_scrollList">
                {policyLoadFailed ? (
                  <DataUnavailableMessage target="국가정책" />
                ) : (
                  <SeparatedList
                    dividerClassName="newsroll_policy_itemDivider"
                    dividerPlacement="after-wrapped-item"
                    getKey={(item, index) =>
                      `${activeAge}-${sortOrder}-${item.id}-${index}`
                    }
                    items={visiblePolicyItems}
                    renderItem={(item, index) => (
                      <PolicyListItem
                        isSelected={selectedPolicyIndex === index}
                        item={item}
                        onSelect={() => openPolicyDetail(item, index)}
                      />
                    )}
                  />
                )}
              </div>
            </div>
          </div>
        )}
      </NewsRollPagePanel>
    </NewsRollCommonLayout>
  );
}
