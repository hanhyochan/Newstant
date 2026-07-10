"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import { welfareApi } from "@/shared/newstant/api";
import { getCurrentUserSnapshot } from "@/shared/newstant/auth/current-user";
import {
  ChipLabel,
  ContentSummaryButton,
  DateTimeText,
  SelectButton,
  PillTabMenu
} from "@/design-system/components";
import {
  CommonLayout,
  DetailBackButton,
  DockedControls,
  PagePanel,
  SummaryHeroTop,
  pagePanelContentSelector as pagePanelContentSelector,
  pagePanelDockedGap as pagePanelDockedGap,
  pagePanelInitialGap as pagePanelInitialGap,
  pagePanelInitialTop as pagePanelInitialTop,
  useDetailScrollRestore,
  useEnterFromRightExitMotion,
  useSwipeTabNavigation,
} from "@/design-system/templates";
import { PolicyDetailContent } from "@/features/policy/PolicyDetailContent";
import { DataUnavailableMessage } from "@/features/shared/DataUnavailableMessage";
import { SeparatedList } from "@/features/shared/SeparatedList";
import { DockedAlarmButton, NewsToolbar } from "@/features/shell/app-toolbar";
import type { BodySearchSelection } from "@/features/search/model";
import {
  formatHeroCount,
  getPolicyItemFromWelfarePolicy,
  policyAgeIdByLabel,
  policyAgeTabs,
  policySortOptions,
  type PolicyItem,
} from "@/features/policy/model";

type SortOrder = "popular" | "latest";

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
      className="btn_contentListItem"
      onClick={onSelect}
      selected={isSelected}
    >
      <div className="wrapper_contentMeta wrapper_panelContent u_gap24">
        <div className="wrapper_contentMeta u_gap8">
          <h2>{item.title}</h2>
          <p className="text_infoBody text_lineClamp2">{item.summary}</p>
          <div className="wrapper_contentDateGroup">
            <span>
              <strong>{policyDate.label}</strong>
              <DateTimeText>{policyDate.date}</DateTimeText>
            </span>
          </div>
        </div>
        <div className="wrapper_contentTagGroup u_gap8">
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
  const isBodySearchDetail =
    bodySearchSelection?.kind === "policy" &&
    detailItem != null &&
    (bodySearchSelection.policy.id ?? bodySearchSelection.policy.title) ===
      (detailItem.id ?? detailItem.title);
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
      const allPolicies = await welfareApi.getWelfarePolicyList("all");
      const nextPolicies =
        ageGroupId === "all"
          ? allPolicies
          : allPolicies.filter((policy) =>
              policy.ageGroupIds.includes(ageGroupId),
            );

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
    <CommonLayout
      aria-label="국가정책"
      className="sheetFrame policy_screen"
      dockedGap={pagePanelDockedGap}
      initialGap={pagePanelInitialGap}
      initiallyDocked={isBodySearchDetail}
      lockSheetPosition={isBodySearchDetail}
      minInitialTop={pagePanelInitialTop}
      movingSheet
      sheetClassName="sheetFrameSheet container_homeSheet policy_sheet"
      sheetScrollSelector={pagePanelContentSelector}
      top={
        <SummaryHeroTop
          controls={
            <DockedControls
              className="motion_dockedPop allDockedControls panelHeaderRow"
              isDetailOpen={isPolicyDetailOpen}
            >
              {isPolicyDetailOpen ? (
                <DetailBackButton
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
            </DockedControls>
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
            className: "policy_hero",
            count: formatHeroCount(policyTotalCount),
            greeting: `${currentUser.nickname}님을 위한`,
            unit: "개",
          }}
        />
      }
    >
      <PagePanel
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
          <div className="policy_listContent">
            <PillTabMenu
              ariaLabel="연령 필터"
              className="all_category_tabs wrapper_tabScroller policy_age_tabs"
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
              className={`policy_listSection ${policyAgeSwipeMotionClassName}`.trim()}
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
              <div className="policy_items wrapper_scrollList">
                {policyLoadFailed ? (
                  <DataUnavailableMessage target="국가정책" />
                ) : (
                  <SeparatedList
                    dividerClassName="divider_listItem"
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
      </PagePanel>
    </CommonLayout>
  );
}
