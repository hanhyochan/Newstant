"use client";

import {
  Fragment,
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

import {
  ChipLabel,
  NewsRollDropdownArrow,
  NewsRollDropdownMenu,
  PillTabMenu,
} from "@/design-system/components";
import {
  NewsRollCommonLayout,
  NewsRollDetailBackButton,
  NewsRollDockedControls,
  NewsRollHeaderTop,
  NewsRollPagePanel,
  NewsRollSummaryHeroTop,
  newsrollPagePanelContentSelector as pagePanelContentSelector,
  newsrollPagePanelDockedGap as pagePanelDockedGap,
  newsrollPagePanelInitialGap as pagePanelInitialGap,
  newsrollPagePanelInitialTop as pagePanelInitialTop,
  useDetailScrollRestore,
  useEnterFromRightExitMotion,
} from "@/design-system/templates";
import { welfareApi, type WelfarePolicy } from "@/app/_newsroll/api";
import { fixedDockedPanelProps } from "@/app/_newsroll/my-info-panel-behavior";
import { PolicyDetailContent } from "@/features/policy/PolicyDetailContent";
import { DockedAlarmButton, NewsToolbar } from "@/features/shell/NewsRollToolbar";

type SortOrder = "popular" | "latest";

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

type BodySearchSelection =
  | { article: unknown; id: number; kind: "news" }
  | { id: number; kind: "policy"; policy: PolicyItem };

function formatHeroCount(count: number) {
  return new Intl.NumberFormat("ko-KR").format(count);
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
        <Fragment key={getKey(item, index)}>
          <div className="wrapper_separatedItem">{renderItem(item, index)}</div>
          {index < items.length - 1 ? (
            <span
              aria-hidden="true"
              className={`newsroll_divider newsroll_divider_horizontal ${dividerClassName}`}
              role="presentation"
            />
          ) : null}
        </Fragment>
      ))}
    </>
  );
}

const policyAgeTabs = ["전체", "미성년", "청년", "중장년", "노년"];
const policyAgeIdByLabel: Record<string, string> = {
  노년: "senior",
  미성년: "minor",
  전체: "all",
  중장년: "middle",
  청년: "youth",
};
const basePolicyDetails: PolicyDetailItem[] = [
  { label: "지원 대상 연령", value: "19세 ~ 45세" },
  {
    label: "지원 내용",
    value:
      "동아리 활동에 필요한 강사비, 교재비, 재료비 등 운영비 지원 (팀당 약 150만원).",
  },
  { label: "지원 기관", value: "경상남도 하동군 지역활력추진단" },
  { label: "사업 기간", value: "2026-01 ~ 2026-12" },
  { label: "신청 기간", value: "2025-10-01 ~ 2025-10-10" },
  {
    label: "신청 방법",
    value: "양산시 청년 정보 플랫폼 청년카까 온라인 신청.",
  },
  {
    label: "선발 방식",
    value: "지원 자격 충족자 대상 선착순 선정 후 개별 통보.",
  },
  {
    label: "제출 서류",
    value:
      "사업자등록 사실 여부 증명서, 시험 응시 확인 서류, 응시료 결제 영수증, 통장 사본 등.",
  },
];
const policyItemsByAge: Record<string, PolicyItem[]> = {
  전체: [
    {
      title: "청년동아리 활동비 지원사업",
      tags: ["복지문화", "문화활동", "바우처"],
      summary:
        "청년 비율이 50% 이상인 5인 이상의 동아리를 대상으로 활동비를 지원하는 사업.",
      registeredAt: "2026년 12월 31일",
      updatedAt: "2026년 12월 31일",
      details: basePolicyDetails,
    },
    {
      title: "양산시 청년 자격증 응시료 지원",
      tags: ["일자리", "취업", "보조금"],
      summary:
        "취업 준비 청년의 자격증 응시료 부담을 낮추기 위한 지역 지원 정책.",
      registeredAt: "2026년 12월 31일",
      updatedAt: "2027년 1월 3일",
      details: basePolicyDetails,
    },
  ],
  미성년: [
    {
      title: "청소년 문화예술 체험 바우처",
      tags: ["복지문화", "청소년", "바우처"],
      summary:
        "미성년 청소년의 문화예술 관람과 체험 활동 비용을 지원하는 사업.",
      registeredAt: "2026년 12월 20일",
      updatedAt: "2026년 12월 28일",
      details: [
        { label: "지원 대상 연령", value: "13세 ~ 18세" },
        ...basePolicyDetails.slice(1),
      ],
    },
    {
      title: "방과후 학습 돌봄 지원",
      tags: ["교육", "돌봄", "지원금"],
      summary:
        "방과후 학습과 돌봄이 필요한 청소년 가구에 프로그램 이용료를 지원.",
      registeredAt: "2026년 12월 18일",
      updatedAt: "2026년 12월 29일",
      details: [
        { label: "지원 대상 연령", value: "8세 ~ 18세" },
        ...basePolicyDetails.slice(1),
      ],
    },
  ],
  청년: [
    {
      title: "청년동아리 활동비 지원사업",
      tags: ["복지문화", "문화활동", "바우처"],
      summary:
        "청년 비율이 50% 이상인 5인 이상의 동아리를 대상으로 활동비를 지원하는 사업.",
      registeredAt: "2026년 12월 31일",
      updatedAt: "2026년 12월 31일",
      details: basePolicyDetails,
    },
    {
      title: "청년 주거 지원 확대 논의",
      tags: ["주거", "청년", "보조금"],
      summary:
        "청년 주거비 부담을 낮추기 위해 지자체별 신청 조건을 정비하는 정책.",
      registeredAt: "2026년 12월 27일",
      updatedAt: "2026년 12월 30일",
      details: basePolicyDetails,
    },
  ],
  중장년: [
    {
      title: "중장년 재취업 역량 강화 과정",
      tags: ["일자리", "교육", "재취업"],
      summary: "경력 전환을 준비하는 중장년층에게 직무 교육과 상담을 제공.",
      registeredAt: "2026년 12월 24일",
      updatedAt: "2026년 12월 30일",
      details: [
        { label: "지원 대상 연령", value: "40세 ~ 64세" },
        ...basePolicyDetails.slice(1),
      ],
    },
    {
      title: "소상공인 전환 컨설팅 지원",
      tags: ["경제", "창업", "컨설팅"],
      summary:
        "업종 전환과 매장 운영 개선이 필요한 중장년 소상공인 대상 컨설팅 지원.",
      registeredAt: "2026년 12월 21일",
      updatedAt: "2026년 12월 29일",
      details: [
        { label: "지원 대상 연령", value: "35세 ~ 64세" },
        ...basePolicyDetails.slice(1),
      ],
    },
  ],
  노년: [
    {
      title: "노년층 디지털 생활 교육",
      tags: ["교육", "복지", "디지털"],
      summary:
        "스마트폰, 공공앱, 금융앱 사용에 어려움을 겪는 노년층을 위한 교육.",
      registeredAt: "2026년 12월 22일",
      updatedAt: "2026년 12월 30일",
      details: [
        { label: "지원 대상 연령", value: "65세 이상" },
        ...basePolicyDetails.slice(1),
      ],
    },
    {
      title: "어르신 건강 돌봄 방문 서비스",
      tags: ["건강", "복지", "방문지원"],
      summary: "거동이 불편한 노년층에게 정기 건강 확인과 생활 상담을 제공.",
      registeredAt: "2026년 12월 19일",
      updatedAt: "2026년 12월 28일",
      details: [
        { label: "지원 대상 연령", value: "70세 이상" },
        ...basePolicyDetails.slice(1),
      ],
    },
  ],
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
    <button
      aria-pressed={isSelected}
      className={`newsroll_policy_list_item${isSelected ? " is_selected" : ""}`}
      onClick={onSelect}
      type="button"
    >
      <div className="newsroll_policy_list_tags">
        {item.tags.map((tag, index) => (
          <ChipLabel
            kind={index === 2 ? "policyAccent" : "policy"}
            key={`${item.title}-${tag}`}
          >
            {tag}
          </ChipLabel>
        ))}
      </div>
      <div className="wrapper_policyItemContent">
        <h2>{item.title}</h2>
        <p className="text_infoBody text_lineClamp2">{item.summary}</p>
        <div className="newsroll_policy_dates">
          <span>
            <strong>{policyDate.label}</strong>
            {policyDate.date}
          </span>
        </div>
      </div>
    </button>
  );
}

export function PolicyView({
  bodySearchSelection,
  isTextLarge,
  onOpenBreakingNews,
  onOpenMenu,
  onOpenSearch,
  onToggleTextSize,
}: {
  bodySearchSelection?: BodySearchSelection | null;
  isTextLarge: boolean;
  onOpenBreakingNews: () => void;
  onOpenMenu: () => void;
  onOpenSearch: () => void;
  onToggleTextSize: () => void;
}) {
  const [activeAge, setActiveAge] = useState(policyAgeTabs[0]);
  const [detailItem, setDetailItem] = useState<PolicyItem | null>(
    bodySearchSelection?.kind === "policy" ? bodySearchSelection.policy : null,
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
  const detailItemIndex = detailItem
    ? visiblePolicyItems.findIndex((item) => item.title === detailItem.title)
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

    setSelectedPolicyIndex(index);
    setDetailItem(item);
  }

  useEffect(() => {
    if (bodySearchSelection?.kind !== "policy") {
      return;
    }

    setSelectedPolicyIndex(0);
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
              onOpenMenu={onOpenMenu}
              onOpenSearch={onOpenSearch}
              onToggleTextSize={onToggleTextSize}
            />
          }
          hero={{
            ariaLabel: "맞춤 정책 요약",
            caption: "국가정책 정보가 있습니다.",
            className: "newsroll_policy_hero",
            count: formatHeroCount(policyTotalCount),
            greeting: "콩콩이님을 위한",
            unit: "개",
          }}
        />
      }
    >
      <NewsRollPagePanel
        ariaLabel="국가정책 콘텐츠 영역"
        contentRef={policyPanelContentRef}
        key={detailItem ? `policy-detail-${detailItem.title}` : "policy-list"}
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
          />
        ) : (
          <div className="newsroll_policy_listContent">
            <PillTabMenu
              ariaLabel="연령 필터"
              className="newsroll_all_category_tabs newsroll_policy_age_tabs"
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
              className="newsroll_policy_listSection"
              id="policy-list-panel"
              ref={policyListSectionRef}
              role="tabpanel"
            >
              <button
                aria-controls={isPolicySortOpen ? policySortMenuId : undefined}
                aria-expanded={isPolicySortOpen}
                aria-haspopup="listbox"
                aria-label="정책 정렬"
                className="btn_commentDropdown newsroll_policy_sort"
                onClick={() => setIsPolicySortOpen((current) => !current)}
                type="button"
              >
                {policySortLabels[sortOrder]}
                <NewsRollDropdownArrow />
              </button>
              {isPolicySortOpen ? (
                <div
                  className="listbox_commentDropdown newsroll_policy_sortListbox"
                  id={policySortMenuId}
                  role="listbox"
                >
                  {policySortOptions.map((option) => (
                    <button
                      aria-selected={sortOrder === option.value}
                      key={option.value}
                      onClick={() => {
                        setSortOrder(option.value);
                        setIsPolicySortOpen(false);
                      }}
                      role="option"
                      type="button"
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              ) : null}
              <div className="newsroll_policy_items">
                {policyLoadFailed ? (
                  <DataUnavailableMessage target="국가정책" />
                ) : (
                  <SeparatedList
                    dividerClassName="newsroll_policy_itemDivider"
                    getKey={(item, index) =>
                      `${activeAge}-${sortOrder}-${item.title}-${index}`
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
