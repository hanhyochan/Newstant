"use client";

import {
  Fragment,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent,
  type ReactNode,
  type TouchEvent,
} from "react";

import {
  BreakingNewsLink,
  Button,
  ChipLabel,
  CommentComposerInput,
  Icon,
  IconButton,
  NewsViewToggle,
  PillTabMenu,
  ReactionButton,
  Select,
  TextInput,
  Textarea,
  type IconName,
  type PillTabItem,
} from "@/design-system/components";
import {
  NewsRollArticleDetailPanel,
  NewsRollCommonLayout,
  NewsRollDockedControls,
  NewsRollPagePanel,
  NewsRollSummaryHeroTop,
  useDockedPanelScroll,
} from "@/design-system/templates";
import { myInfoFixedDockedPanelProps } from "./_newsroll/my-info-panel-behavior";

type Tab = "home" | "all" | "policy" | "my" | "info";
type View = Tab | "search";
type InfoTab = "notice" | "faq" | "inquiry";
type HomeViewMode = "reels" | "block";
type Reaction = "like" | "dislike" | "neutral" | null;
type ReactionValue = Exclude<Reaction, null>;
type CommentReactionValue = "like" | "dislike";
type CommentSortOrder = "latest" | "popular";
type CommentAction = "delete" | "edit";
type SortOrder = "popular" | "latest";
type GuideKind = "stacked" | "binary";
type CommentScrollTarget = {
  bottomGap?: number;
  id: string;
};

type HomeArticle = {
  category: string;
  date: string;
  image: string;
  imageAlt: string;
  guideKind?: GuideKind;
  title: string;
};

type HomeHeaderControls = {
  isDetailOpen?: boolean;
  isTextLarge: boolean;
  mode: HomeViewMode;
  onCloseDetail?: () => void;
  onModeChange: (mode: HomeViewMode) => void;
  onOpenBreakingNews: () => void;
  onOpenSearch: () => void;
  onToggleTextSize: () => void;
};

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

type CommentItem = {
  author: string;
  body: string;
  choice: string;
  date: string;
  dislikes: number;
  id: number;
  isMine?: boolean;
  likes: number;
  replies: number;
};

const articleImage = "/images/news-apartment.png";
const defaultNewsDateTime = "2026-12-31T08:30:00";
const defaultNewsDateLabel = "2026년 12월 31일 08:30";
const homeSheetDockedGap = 16;
const homeSheetInitialGap = 40;
const homeSheetScrollSelector = ".container_newsFeed, .wrapper_newsGridScroll";
const pagePanelDockedGap = 40;
const pagePanelInitialGap = 40;
const pagePanelInitialTop = 492;
const commentScrollDelayMs = 120;
const nextArticleRevealDelayMs = 260;
const homeDockedScrollSelectors = {
  contentScroller: ".wrapper_articleCardContent",
  panel: ".container_articleCard",
};
const pagePanelContentSelector = ".newsroll_page_panelContent";

function resetNewsRollViewport() {
  if (typeof window === "undefined") {
    return;
  }

  window.requestAnimationFrame(() => {
    const scrollTargets = [
      document.scrollingElement,
      document.documentElement,
      document.body,
      ...document.querySelectorAll<HTMLElement>(
        ".newsroll_phone, .newsroll_policy_screen, .newsroll_my_screen, .newsroll_info_screen",
      ),
    ];

    scrollTargets.forEach((target) => {
      if (!target) {
        return;
      }

      target.scrollTop = 0;
      target.scrollLeft = 0;
    });
  });
}

function NewsCreatedTime({
  children = defaultNewsDateLabel,
  dateTime = defaultNewsDateTime,
}: {
  children?: ReactNode;
  dateTime?: string;
}) {
  return (
    <time className="newsroll_createdTime" dateTime={dateTime}>
      {children}
    </time>
  );
}

const homeArticle: HomeArticle = {
  category: "정치",
  date: "2026년 12월 31일 08:30",
  image: articleImage,
  imageAlt: "아파트 단지 전경",
  title: "용인 수지, 강남·분당 가격 동조화로 15억 시대 진입",
};

const homeArticles: HomeArticle[] = [
  {
    ...homeArticle,
    guideKind: "stacked",
  },
  {
    category: "경제",
    date: "2026년 12월 31일 09:10",
    guideKind: "binary",
    image: articleImage,
    imageAlt: "도심 아파트 단지 전경",
    title: "대출 규제 이후 서울 외곽 거래량 다시 줄었다",
  },
  {
    category: "사회",
    date: "2026년 12월 31일 10:20",
    guideKind: "stacked",
    image: articleImage,
    imageAlt: "아침 햇살이 비치는 주거 단지",
    title: "청년 월세 지원 확대 논의, 지자체별 신청 조건 달라",
  },
  {
    category: "정책",
    date: "2026년 12월 31일 11:35",
    guideKind: "binary",
    image: articleImage,
    imageAlt: "신축 공동주택 단지",
    title: "주택시장 안정 대책 발표 앞두고 실수요자 관망세",
  },
  {
    category: "지역",
    date: "2026년 12월 31일 13:00",
    guideKind: "stacked",
    image: articleImage,
    imageAlt: "수도권 아파트 단지",
    title: "수도권 남부 교통 호재 지역, 매수 문의만 소폭 증가",
  },
  {
    category: "복지",
    date: "2026년 12월 31일 14:25",
    guideKind: "binary",
    image: articleImage,
    imageAlt: "주거지와 상가가 함께 보이는 단지",
    title: "신혼부부 주거비 지원 기준 완화 여부 다음 달 결정",
  },
  {
    category: "문화",
    date: "2026년 12월 31일 15:40",
    guideKind: "stacked",
    image: articleImage,
    imageAlt: "도심 주거 단지와 하늘",
    title: "동네 생활권 문화시설 확충, 주민 체감도 조사 시작",
  },
];

const homeBreakingTitle = "정청래, ‘필버 중단’ 국민의 힘에 “대구/경북 통합 찬반 당론 먼저 정하라”";

const navItems: { icon: IconName; label: string; tab: Tab }[] = [
  { icon: "home", label: "메인화면", tab: "home" },
  { icon: "earth", label: "전체 뉴스", tab: "all" },
  { icon: "loudspeaker", label: "국가정책", tab: "policy" },
  { icon: "user", label: "마이페이지", tab: "my" },
  { icon: "question", label: "인포메이션", tab: "info" },
];

const noticeItems = [
  {
    date: "2026.12.31",
    title: "NewsRoll 맞춤 알림 설정이 개선되었습니다.",
  },
  {
    date: "2026.12.30",
    title: "개인정보 처리방침 개정 안내",
  },
];

const infoTabs: { id: InfoTab; label: string }[] = [
  { id: "notice", label: "공지사항" },
  { id: "faq", label: "FAQ" },
  { id: "inquiry", label: "1:1 문의" },
];

const faqItems = [
  {
    answer: "동아리 활동에 필요한 강사비, 교재비, 재료비 등 운영비 지원 (팀당 약 150만원).",
    question: "어쩌구 저쩌구 궁금합니다?",
  },
  {
    answer: "동아리 활동에 필요한 강사비, 교재비, 재료비 등 운영비 지원 (팀당 약 150만원).",
    question: "어쩌구 저쩌구 궁금합니다?",
  },
  {
    answer: "동아리 활동에 필요한 강사비, 교재비, 재료비 등 운영비 지원 (팀당 약 150만원).",
    question: "어쩌구 저쩌구 궁금합니다?",
  },
  {
    answer: "동아리 활동에 필요한 강사비, 교재비, 재료비 등 운영비 지원 (팀당 약 150만원).",
    question: "어쩌구 저쩌구 궁금합니다?",
  },
  {
    answer: "동아리 활동에 필요한 강사비, 교재비, 재료비 등 운영비 지원 (팀당 약 150만원).",
    question: "어쩌구 저쩌구 궁금합니다?",
  },
  {
    answer: "동아리 활동에 필요한 강사비, 교재비, 재료비 등 운영비 지원 (팀당 약 150만원).",
    question: "어쩌구 저쩌구 궁금합니다?",
  },
  {
    answer: "동아리 활동에 필요한 강사비, 교재비, 재료비 등 운영비 지원 (팀당 약 150만원).",
    question: "어쩌구 저쩌구 궁금합니다?",
  },
  {
    answer: "동아리 활동에 필요한 강사비, 교재비, 재료비 등 운영비 지원 (팀당 약 150만원).",
    question: "어쩌구 저쩌구 궁금합니다?",
  },
];

const inquiryTypes = ["서비스 이용", "뉴스 제보", "계정 문의", "오류 신고"];
const inquiryOptions = inquiryTypes.map((type) => ({ label: type, value: type }));

const searchSuggestions = [
  "예시텍스트",
  "예시텍스트",
  "예시텍스트",
  "예시텍스트",
  "예시텍스트",
  "예시텍스트",
];

const articleBody = `최근 국내 부동산 시장이 다시 한번 변곡점에 서고 있다. 상반기 동안 이어졌던 거래 회복 흐름이 둔화되며, 시장 전반에 신중한 분위기가 확산되는 모습이다.

특히 수도권과 일부 광역시를 중심으로 매수 심리가 빠르게 식고 있다. 한국부동산연구원이 발표한 자료에 따르면, 기준금리 유지에도 불구하고 주택담보대출 심사 강화와 보유세 부담이 실수요자와 투자자 모두에게 압박으로 작용하고 있다.

전문가들은 당분간 가격 급등이나 급락보다는 지역별 양극화가 심화될 가능성에 주목한다. 정책 변화와 금리 방향성이 명확해지기 전까지는 관망세가 이어질 것이며, 안정적인 실거주 중심의 시장 재편이 예상된다.`;

const guideOptions = [
  "어쩌구 저쩌구해서 어케 해야한다.",
  "상황을 더 지켜본 뒤 판단해야 한다.",
  "정책 지원을 먼저 확대해야 한다.",
];

const binaryGuideOptions = ["그렇다", "아니다"];


const reactionItems: { count: number; icon: IconName; label: string; value: ReactionValue }[] = [
  { count: 16, icon: "thumbUp", label: "좋아요", value: "like" },
  { count: 12, icon: "thumbDown", label: "싫어요", value: "dislike" },
  { count: 5, icon: "dots", label: "글쎄요", value: "neutral" },
];


const commentBodies = [
  "예시텍스트예시텍스트예시텍스트예시텍스트예시텍스트예시텍스트예시텍스트예시텍스트예시텍스트예시텍스트예시텍스트예시텍스트예시텍스트예시텍스트...",
  "예시텍스트예시텍스트예시텍스트예시텍스트예시텍스트예시텍스트예시텍스트예시텍스트예시텍스트예시텍스트예시텍스트예시텍스트...",
  "예시텍스트예시텍스트예시텍스트예시텍스트예시텍스트예시텍스트예시텍스트예시텍스트예시텍스트예시텍스트예시텍스트...",
];

const commentTemplates: Omit<CommentItem, "choice">[] = [
  {
    author: "콩콩이",
    body: commentBodies[0],
    date: "2026.12.31 08:30",
    dislikes: 16,
    id: 1,
    likes: 16,
    replies: 13,
  },
  {
    author: "콩콩이",
    body: commentBodies[1],
    date: "2026.12.31 08:30",
    dislikes: 16,
    id: 2,
    likes: 16,
    replies: 13,
  },
  {
    author: "콩콩이",
    body: commentBodies[2],
    date: "2026.12.31 08:30",
    dislikes: 16,
    id: 3,
    likes: 16,
    replies: 13,
  },
];

const commentReplyTemplates = [
  {
    author: "콩콩이",
    body: "예시텍스트예시텍스트예시텍스트예시텍스트예시텍스트예시텍스트예시텍스트예시텍스트예시텍스트예시텍스트예시텍스트~~",
    choice: "아모른직다",
    date: "2026.12.31 08:30",
    dislikes: 16,
    likes: 16,
  },
  {
    author: "콩콩이",
    body: "예시텍스트예시텍스트예시텍스트예시텍스트예시텍스트예시텍스트예시텍스트예시텍스트예시텍스트예시텍스트~~",
    choice: "아모른직다",
    date: "2026.12.31 08:30",
    dislikes: 16,
    likes: 16,
  },
];

type CommentReplyItem = (typeof commentReplyTemplates)[number] & {
  id: string;
  isMine?: boolean;
};

const commentSortOptions: { label: string; value: CommentSortOrder }[] = [
  { label: "인기순", value: "popular" },
  { label: "최신순", value: "latest" },
];

const commentActionOptions: { label: string; value: CommentAction }[] = [
  { label: "삭제", value: "delete" },
  { label: "수정", value: "edit" },
];

const allNewsAssets = {
  latest: articleImage,
  relayOne: articleImage,
  relayTwo: articleImage,
  relayThree: articleImage,
  relayFour: articleImage,
  relayFive: articleImage,
  thumbnail: articleImage,
};

const allNewsBreaking = [
  "정청래, ‘필버 중단’ 국민의 힘에 “대구/경북 통합 찬반 당론 먼저 정하라”",
  "류지현호, 대만에 4-5 충격패... WVC ‘빨간불’",
  "대통령, 9일 중동 상황 경제/물가 비상 경제점검회의 주재",
  "여야, 민생 법안 처리 일정 두고 원내대표 회동",
  "정부, 수도권 주택 공급 추가 대책 이번 주 발표",
];

const allNewsLatest = [
  { category: "정치", image: allNewsAssets.latest, title: "'APEC, 국익에 도움됐다' 74%… 국힘 지지층도 인정 '50%가 긍정'" },
  { category: "경제", image: allNewsAssets.relayOne, title: "수도권 아파트 거래량 회복세, 실수요 중심으로 재편" },
  { category: "사회", image: allNewsAssets.relayTwo, title: "청년 주거 지원 확대 논의, 지자체별 신청 조건 달라" },
  { category: "국제", image: allNewsAssets.relayThree, title: "중동 긴장 재고조에 원유·물가 변동성 확대 우려" },
  { category: "문화", image: allNewsAssets.relayFour, title: "지역 축제 방문객 증가, 골목상권 매출도 동반 상승" },
];

const allNewsPresses = ["중앙일보", "국민일보", "한겨레"];
const allNewsDockedScrollSelectors = {
  contentScroller: ".newsroll_all_panelContent",
  immediatePanel: ".newsroll_all_latest_panel",
  latestScroller: ".newsroll_all_latest_scroller",
  panel: ".newsroll_all_panel",
};
const allNewsSwipeAxisThresholdPx = 8;
type SwipeAxis = "horizontal" | "vertical";

const allNewsHeadlinesByPress: Record<string, { image: string; title: string }[]> = {
  국민일보: Array.from({ length: 8 }, (_, index) => ({
    image: [allNewsAssets.thumbnail, allNewsAssets.relayOne, allNewsAssets.relayTwo][index % 3],
    title:
      index % 2 === 0
        ? "용인 수지, 강남·분당 가격 동조화로 15억 시대 진입"
        : "대출 규제 강화 이후 실수요자 관망세 뚜렷",
  })),
  중앙일보: Array.from({ length: 8 }, (_, index) => ({
    image: [allNewsAssets.latest, allNewsAssets.relayThree, allNewsAssets.relayFour][index % 3],
    title:
      index % 2 === 0
        ? "'APEC, 국익에 도움됐다' 74%… 국힘 지지층도 인정"
        : "여야, 예산안 세부 쟁점 두고 막판 협상",
  })),
  한겨레: Array.from({ length: 8 }, (_, index) => ({
    image: [allNewsAssets.relayFive, allNewsAssets.relayTwo, allNewsAssets.thumbnail][index % 3],
    title:
      index % 2 === 0
        ? "청년 주거 정책, 신청 문턱 낮춰야 한다는 지적"
        : "지역 의료 공백 해소 위한 공공지원 논의 확대",
  })),
};

const allNewsRelayCategories = ["정치", "경제", "사회", "문화", "국제"];

const allNewsRelayByCategory: Record<string, { image: string; title: string }[]> = Object.fromEntries(
  allNewsRelayCategories.map((category, categoryIndex) => [
    category,
    Array.from({ length: 7 }, (_, index) => ({
      image:
        [
          allNewsAssets.relayOne,
          allNewsAssets.relayTwo,
          allNewsAssets.relayThree,
          allNewsAssets.relayFour,
          allNewsAssets.relayFive,
        ][(index + categoryIndex) % 5],
      title:
        category === "정치"
          ? index % 2 === 0
            ? "용인 수지, 강남·분당 가격 동조화로 15억 시대 진입"
            : "여야, 민생 법안 처리 두고 본회의 일정 조율"
          : `${category} 주요 이슈 ${index + 1}, 오늘의 흐름을 한눈에 정리`,
    })),
  ]),
);

function NewsToolbar({
  isTextLarge,
  onOpenSearch,
  onToggleTextSize,
}: {
  isTextLarge: boolean;
  onOpenSearch: () => void;
  onToggleTextSize: () => void;
}) {
  return (
    <div className="newsroll_toolbar" aria-label="상단 도구">
      <Button
        aria-label="글자 크기"
        aria-pressed={isTextLarge}
        classNameOnly
        className="newsroll_text_size_button"
        onClick={onToggleTextSize}
        size="medium"
        variant="filled"
      >
        <Icon name="sizeIncrease" />
      </Button>
      <IconButton baseClassName="newsroll_toolbar_icon" icon="search" label="검색" onClick={onOpenSearch} />
      <IconButton baseClassName="newsroll_toolbar_icon" icon="menu" label="메뉴" />
    </div>
  );
}

function HomeBlockItem({ article, onClick }: { article: HomeArticle; onClick: () => void }) {
  return (
    <button className="btn_newsBlockItem" onClick={onClick} type="button">
      <strong>{article.title}</strong>
      <span>{article.date}</span>
      <img alt="" src={article.image} />
    </button>
  );
}

function HomeMainHeader({
  isDetailOpen = false,
  isTextLarge,
  mode,
  onCloseDetail,
  onModeChange,
  onOpenBreakingNews,
  onOpenSearch,
  onToggleTextSize,
}: HomeHeaderControls) {
  const [isAlarmOn, setIsAlarmOn] = useState(false);

  return (
    <>
      <NewsRollSummaryHeroTop
        toolbar={(
          <NewsToolbar
            isTextLarge={isTextLarge}
            onOpenSearch={onOpenSearch}
            onToggleTextSize={onToggleTextSize}
          />
        )}
        hero={{
          ariaLabel: "홈 요약",
          caption: "새로운 소식이 있습니다.",
          controls: (
            <NewsRollDockedControls isDetailOpen={isDetailOpen}>
              {isDetailOpen ? (
                <button
                  aria-label="블록형 뉴스 목록으로 돌아가기"
                  className="newsroll_homeDetailBack newsroll_all_detail_back"
                  onClick={onCloseDetail}
                  type="button"
                >
                  <span aria-hidden="true" />
                </button>
              ) : (
                <NewsViewToggle mode={mode} onModeChange={onModeChange} />
              )}
              <Button
                aria-label="알림"
                aria-pressed={isAlarmOn}
                className="newsroll_homeDockedAlarm"
                iconOnly
                onClick={() => setIsAlarmOn((current) => !current)}
                radius="full"
                size="large"
                variant="outline"
              >
                <Icon name="alarm" />
              </Button>
            </NewsRollDockedControls>
          ),
          count: "11,343",
          greeting: <>반갑습니다 <strong>콩콩이</strong>님!</>,
          unit: "개",
        }}
      />

      <div className="wrapper_breakingNews">
        <BreakingNewsLink
          href="#all-breaking-news"
          onClick={(event) => {
            event.preventDefault();
            onOpenBreakingNews();
          }}
          title={homeBreakingTitle}
        />
      </div>
    </>
  );
}

function HomeShell({
  children,
  isDetailOpen = false,
  isTextLarge,
  mode,
  onCloseDetail,
  onModeChange,
  onOpenBreakingNews,
  onOpenSearch,
  onToggleTextSize,
}: HomeHeaderControls & { children: ReactNode }) {
  const screenRef = useRef<HTMLElement>(null);
  const sheetRef = useRef<HTMLDivElement>(null);
  const scrollerRef = useRef<HTMLElement | null>(null);
  const previousModeRef = useRef(mode);
  const dockedPanelScroll = useDockedPanelScroll({
    boundaryDelayMs: nextArticleRevealDelayMs,
    contentScrollerSelector: homeDockedScrollSelectors.contentScroller,
    dockedClassName: "is_homeSheetDocked",
    panelSelector: homeDockedScrollSelectors.panel,
    rootRef: screenRef,
    scrollerRef,
  });

  const handleSheetScroll = () => {
    dockedPanelScroll.storeScrollTop();
  };

  useLayoutEffect(() => {
    const nextScroller = sheetRef.current?.querySelector<HTMLElement>(homeSheetScrollSelector) ?? null;
    const didModeChange = previousModeRef.current !== mode;

    scrollerRef.current = nextScroller;
    if (nextScroller) {
      if (didModeChange) {
        dockedPanelScroll.resetScroll(nextScroller);
      } else if (screenRef.current?.classList.contains("is_homeSheetDocked")) {
        dockedPanelScroll.restoreScrollTop(nextScroller);
      } else {
        nextScroller.scrollTop = 0;
      }
    }
    previousModeRef.current = mode;
  }, [children, mode]);

  return (
    <NewsRollCommonLayout
      aria-label="메인 뉴스"
      className="container_homeScreen"
      dockedClassName="is_homeSheetDocked"
      dockedControlsSelector=".wrapper_homeDockedControls"
      dockedGap={homeSheetDockedGap}
      initialGap={homeSheetInitialGap}
      movingSheet
      onTouchMoveCapture={dockedPanelScroll.handleTouchMove}
      onTouchStartCapture={dockedPanelScroll.handleTouchStart}
      onWheelCapture={dockedPanelScroll.handleWheel}
      ref={screenRef}
      sheetClassName="container_homeSheet"
      sheetNestedScrollResetSelector={homeDockedScrollSelectors.contentScroller}
      sheetProps={{ onScrollCapture: handleSheetScroll }}
      sheetRef={sheetRef}
      sheetScrollSelector={homeSheetScrollSelector}
      top={(
        <HomeMainHeader
          isDetailOpen={isDetailOpen}
          isTextLarge={isTextLarge}
          mode={mode}
          onCloseDetail={onCloseDetail}
          onModeChange={onModeChange}
          onOpenBreakingNews={onOpenBreakingNews}
          onOpenSearch={onOpenSearch}
          onToggleTextSize={onToggleTextSize}
        />
      )}
      topClassName="container_home"
    >
      {children}
    </NewsRollCommonLayout>
  );
}

function ReactionControls({
  className = "",
  reaction,
  onReactionChange,
}: {
  className?: string;
  reaction: Reaction;
  onReactionChange: (reaction: Reaction) => void;
}) {
  return (
    <div className={`wrapper_articleReaction ${className}`.trim()} aria-label="기사 평가" role="group">
      {reactionItems.map((item) => (
        <ReactionButton
          aria-pressed={reaction === item.value}
          icon={item.icon}
          key={item.value}
          onClick={() => onReactionChange(reaction === item.value ? null : item.value)}
          tone={item.value}
          variant="article"
        >
          <strong>
            {item.label} {item.count}
          </strong>
        </ReactionButton>
      ))}
    </div>
  );
}

function getVotePercentages(voteCounts: number[]) {
  const totalVotes = voteCounts.reduce((sum, count) => sum + count, 0);

  if (totalVotes === 0) {
    return voteCounts.map(() => 0);
  }

  const rawPercentages = voteCounts.map((count) => (count / totalVotes) * 100);
  const percentages = rawPercentages.map(Math.floor);
  let remainder = 100 - percentages.reduce((sum, percent) => sum + percent, 0);
  const remainderOrder = rawPercentages
    .map((percent, index) => ({ index, remainder: percent - Math.floor(percent) }))
    .sort((a, b) => b.remainder - a.remainder);

  for (let index = 0; index < remainder; index += 1) {
    percentages[remainderOrder[index % remainderOrder.length].index] += 1;
  }

  return percentages;
}

function ArticleGuideSection({ kind }: { kind: GuideKind }) {
  const [selectedGuideOption, setSelectedGuideOption] = useState<number | null>(null);
  const options = kind === "binary" ? binaryGuideOptions : guideOptions;
  const [voteCounts, setVoteCounts] = useState(() => options.map(() => 0));
  const totalVotes = voteCounts.reduce((sum, count) => sum + count, 0);
  const percentages = getVotePercentages(voteCounts);
  const hasVoted = totalVotes > 0;

  function vote(index: number) {
    setSelectedGuideOption(index);
    setVoteCounts((currentCounts) =>
      currentCounts.map((count, countIndex) => (countIndex === index ? count + 1 : count)),
    );
  }

  return (
    <section className={`wrapper_articleGuide wrapper_articleGuide_${kind}`} aria-label="안내 문구">
      <h2 className="text_articleGuide">예시텍스트 어쩌구랑 어쩌구랑 비교했을때 어케하는게 좋을까?</h2>
      <div className="wrapper_articleGuideOptions">
        {options.map((option, index) => {
          const percent = percentages[index];
          const isBinary = kind === "binary";
          const fillStyle = isBinary ? { blockSize: `${percent}%` } : { inlineSize: `${percent}%` };

          return (
            <Button
              aria-pressed={selectedGuideOption === index}
              classNameOnly
              className="btn_articleGuideOption"
              key={option}
              onClick={() => vote(index)}
              size="large"
              variant="filled"
            >
              {hasVoted ? (
                <span
                  className="bar_articleGuideResult"
                  style={fillStyle}
                  aria-hidden="true"
                />
              ) : null}
              {!hasVoted && isBinary ? (
                <img
                  alt=""
                  className="img_articleGuideBinaryIcon"
                  src={index === 0 ? "/icons/icon_yes.svg" : "/icons/icon_no.svg"}
                />
              ) : null}
              {hasVoted && isBinary ? <strong className="text_articleGuidePercent">{percent}%</strong> : null}
              <span className="text_articleGuideOption">{option}</span>
              {hasVoted && !isBinary ? <strong className="text_articleGuidePercent">{percent}%</strong> : null}
            </Button>
          );
        })}
      </div>
      <p className="text_articleGuideTotal">
        <strong>{totalVotes}명</strong>이 참여했어요.
      </p>
    </section>
  );
}

function CommentReactionPanel({ guideKind, id }: { guideKind: GuideKind; id?: string }) {
  const guideChoices = guideKind === "binary" ? binaryGuideOptions : guideOptions;
  const panelId = id ?? "home-comment-panel";
  const composerId = `${panelId}-composer`;
  const commentSortMenuId = `${panelId}-sort-menu`;
  const panelRef = useRef<HTMLElement | null>(null);
  const commentTabs = useMemo(
    () => [{ id: "all", label: "전체" }, ...guideChoices.map((choice) => ({ id: choice, label: choice }))],
    [guideChoices],
  );
  const defaultComments = useMemo(
    () =>
      commentTemplates.map((comment, index) => ({
        ...comment,
        choice: guideChoices[index % guideChoices.length],
      })),
    [guideChoices],
  );
  const [activeChoice, setActiveChoice] = useState(commentTabs[0].id);
  const [composerDraft, setComposerDraft] = useState("");
  const [composerMode, setComposerMode] = useState<"comment" | "reply">("comment");
  const [commentReactions, setCommentReactions] = useState<Record<number, CommentReactionValue | null>>({});
  const [deletedCommentIds, setDeletedCommentIds] = useState<number[]>([]);
  const [deletedReplyIds, setDeletedReplyIds] = useState<string[]>([]);
  const [expandedReplyId, setExpandedReplyId] = useState<number | null>(null);
  const [isComposerVisible, setIsComposerVisible] = useState(false);
  const [myCommentsOnly, setMyCommentsOnly] = useState(false);
  const [isCommentSortOpen, setIsCommentSortOpen] = useState(false);
  const [openCommentActionId, setOpenCommentActionId] = useState<number | null>(null);
  const [openReplyActionId, setOpenReplyActionId] = useState<string | null>(null);
  const [replyTargetCommentId, setReplyTargetCommentId] = useState<number | null>(null);
  const [sortOrder, setSortOrder] = useState<CommentSortOrder>("popular");
  const [userComments, setUserComments] = useState<CommentItem[]>([]);
  const [userRepliesByCommentId, setUserRepliesByCommentId] = useState<Record<number, CommentReplyItem[]>>({});
  const [pendingScrollTarget, setPendingScrollTarget] = useState<CommentScrollTarget | null>(null);
  const deletedCommentIdSet = useMemo(() => new Set(deletedCommentIds), [deletedCommentIds]);
  const deletedReplyIdSet = useMemo(() => new Set(deletedReplyIds), [deletedReplyIds]);
  const allComments = useMemo(
    () => [...defaultComments, ...userComments].filter((comment) => !deletedCommentIdSet.has(comment.id)),
    [defaultComments, deletedCommentIdSet, userComments],
  );
  const getCommentReactionCounts = (comment: CommentItem) => {
    const selectedReaction = commentReactions[comment.id] ?? null;

    return {
      dislikes: comment.dislikes + (selectedReaction === "dislike" ? 1 : 0),
      likes: comment.likes + (selectedReaction === "like" ? 1 : 0),
    };
  };
  const getCommentPopularity = (comment: CommentItem) => {
    const { likes } = getCommentReactionCounts(comment);
    const userReplyCount = userRepliesByCommentId[comment.id]?.length ?? 0;

    return likes + comment.replies + userReplyCount;
  };
  const selectedSortLabel = commentSortOptions.find((option) => option.value === sortOrder)?.label;
  const visibleComments = useMemo(
    () =>
      allComments
        .filter((comment) => (myCommentsOnly ? comment.isMine : true))
        .filter((comment) => (activeChoice === "all" ? true : comment.choice === activeChoice))
        .sort((a, b) => {
          if (sortOrder === "latest") {
            return b.id - a.id;
          }

          return getCommentPopularity(b) - getCommentPopularity(a) || b.id - a.id;
        }),
    [activeChoice, allComments, commentReactions, myCommentsOnly, sortOrder, userRepliesByCommentId],
  );

  function scrollArticleTo(articleScroller: HTMLElement, nextScrollTop: number) {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    articleScroller.scrollTop = nextScrollTop;

    if (!prefersReducedMotion && typeof articleScroller.scrollTo === "function") {
      articleScroller.scrollTo({
        behavior: "smooth",
        top: nextScrollTop,
      });
    }
  }

  function scrollElementBottomIntoView(targetId: string, bottomGap = 24) {
    const target = document.getElementById(targetId);
    const articleScroller = panelRef.current?.closest(".wrapper_articleCardContent");

    if (!(articleScroller instanceof HTMLElement) || !target) {
      return;
    }

    const scrollerRect = articleScroller.getBoundingClientRect();
    const targetRect = target.getBoundingClientRect();
    const composerRect = document.getElementById(composerId)?.getBoundingClientRect();
    const visibleBottom = composerRect ? Math.min(scrollerRect.bottom, composerRect.top) : scrollerRect.bottom;
    const targetScrollTop = articleScroller.scrollTop + targetRect.bottom - visibleBottom + bottomGap;
    const nextScrollTop = Math.min(
      Math.max(0, articleScroller.scrollHeight - articleScroller.clientHeight),
      Math.max(0, targetScrollTop),
    );

    scrollArticleTo(articleScroller, nextScrollTop);
  }

  function scrollPanelTopToReadingPosition() {
    const panel = panelRef.current;
    const articleScroller = panel?.closest(".wrapper_articleCardContent");

    if (!(articleScroller instanceof HTMLElement) || !panel) {
      return;
    }

    const scrollerRect = articleScroller.getBoundingClientRect();
    const panelRect = panel.getBoundingClientRect();
    const targetScrollTop = (
      articleScroller.scrollTop + panelRect.top - scrollerRect.top - articleScroller.clientHeight * 0.3
    );
    const nextScrollTop = Math.max(0, targetScrollTop);

    scrollArticleTo(articleScroller, nextScrollTop);
    setIsComposerVisible(true);
  }

  useEffect(() => {
    function closeCommentDropdowns(event: globalThis.PointerEvent) {
      const target = event.target;

      if (!(target instanceof Element)) {
        return;
      }

      if (target.closest(".wrapper_commentDropdown, .wrapper_commentAction")) {
        return;
      }

      setIsCommentSortOpen(false);
      setOpenCommentActionId(null);
      setOpenReplyActionId(null);
    }

    function closeCommentDropdownsWithEscape(event: globalThis.KeyboardEvent) {
      if (event.key !== "Escape") {
        return;
      }

      setIsCommentSortOpen(false);
      setOpenCommentActionId(null);
      setOpenReplyActionId(null);
    }

    document.addEventListener("pointerdown", closeCommentDropdowns);
    document.addEventListener("keydown", closeCommentDropdownsWithEscape);

    return () => {
      document.removeEventListener("pointerdown", closeCommentDropdowns);
      document.removeEventListener("keydown", closeCommentDropdownsWithEscape);
    };
  }, []);

  useEffect(() => {
    const panel = panelRef.current;

    if (!panel) {
      return;
    }

    const scrollRoot = panel.closest(".wrapper_articleCardContent");
    const updateComposerVisibility = () => {
      const panelRect = panel.getBoundingClientRect();
      const rootRect = scrollRoot?.getBoundingClientRect() ?? { top: 0, bottom: window.innerHeight };
      const visibleHeight = Math.min(panelRect.bottom, rootRect.bottom) - Math.max(panelRect.top, rootRect.top);
      const visibleRatio = panelRect.height > 0 ? visibleHeight / panelRect.height : 0;

      setIsComposerVisible(visibleRatio >= 0.05);
    };

    updateComposerVisibility();
    scrollRoot?.addEventListener("scroll", updateComposerVisibility, { passive: true });
    window.addEventListener("resize", updateComposerVisibility);

    return () => {
      scrollRoot?.removeEventListener("scroll", updateComposerVisibility);
      window.removeEventListener("resize", updateComposerVisibility);
    };
  }, []);

  useEffect(() => {
    const panel = panelRef.current;

    if (!panel) {
      return;
    }

    const timeout = window.setTimeout(scrollPanelTopToReadingPosition, commentScrollDelayMs);

    return () => window.clearTimeout(timeout);
  }, []);

  useEffect(() => {
    if (isComposerVisible) {
      return;
    }

    setComposerDraft("");
    setComposerMode("comment");
    setReplyTargetCommentId(null);
  }, [isComposerVisible]);

  useEffect(() => {
    if (!pendingScrollTarget) {
      return;
    }

    const timeout = window.setTimeout(() => {
      scrollElementBottomIntoView(pendingScrollTarget.id, pendingScrollTarget.bottomGap);
      setPendingScrollTarget(null);
    }, commentScrollDelayMs);

    return () => window.clearTimeout(timeout);
  }, [pendingScrollTarget]);

  function resetComposer() {
    setComposerDraft("");
    setComposerMode("comment");
    setReplyTargetCommentId(null);
  }

  function startReplyComposer(commentId: number) {
    if (!isComposerVisible) {
      return;
    }

    setReplyTargetCommentId(commentId);
    setExpandedReplyId(commentId);
    setComposerMode("reply");
    setComposerDraft("");
  }

  function toggleReplyList(commentId: number) {
    const isClosing = expandedReplyId === commentId;

    if (!isClosing) {
      setPendingScrollTarget({ id: `${panelId}-reply-list-${commentId}` });
    }

    setExpandedReplyId(isClosing ? null : commentId);

    if (isClosing && replyTargetCommentId === commentId) {
      resetComposer();
    }
  }

  function submitComposer() {
    const body = composerDraft.trim();

    if (!body) {
      return;
    }

    if (composerMode === "reply") {
      const targetComment = allComments.find((comment) => comment.id === replyTargetCommentId);

      if (!targetComment) {
        resetComposer();
        return;
      }

      const reply: CommentReplyItem = {
        author: "나",
        body,
        choice: activeChoice === "all" ? targetComment.choice : activeChoice,
        date: "방금 전",
        dislikes: 0,
        id: `user-${Date.now()}`,
        isMine: true,
        likes: 0,
      };

      setPendingScrollTarget({ bottomGap: 0, id: `${panelId}-reply-${reply.id}` });
      setUserRepliesByCommentId((currentReplies) => ({
        ...currentReplies,
        [targetComment.id]: [...(currentReplies[targetComment.id] ?? []), reply],
      }));
      setExpandedReplyId(targetComment.id);
      resetComposer();
      return;
    }

    const commentId = Date.now();

    setPendingScrollTarget({ bottomGap: 0, id: `${panelId}-comment-${commentId}` });
    setUserComments((currentComments) => [
      ...currentComments,
      {
        author: "나",
        body,
        choice: activeChoice === "all" ? guideChoices[0] : activeChoice,
        date: "방금 전",
        dislikes: 0,
        id: commentId,
        isMine: true,
        likes: 0,
        replies: 0,
      },
    ]);
    resetComposer();
  }

  function toggleCommentReaction(commentId: number, reaction: CommentReactionValue) {
    setCommentReactions((currentReactions) => ({
      ...currentReactions,
      [commentId]: currentReactions[commentId] === reaction ? null : reaction,
    }));
  }

  function handleCommentAction(commentId: number, action: CommentAction) {
    setOpenCommentActionId(null);
    setOpenReplyActionId(null);

    if (action === "delete") {
      setDeletedCommentIds((currentIds) => (currentIds.includes(commentId) ? currentIds : [...currentIds, commentId]));
      setExpandedReplyId((currentId) => (currentId === commentId ? null : currentId));
      if (replyTargetCommentId === commentId) {
        resetComposer();
      }
      setCommentReactions((currentReactions) => {
        const { [commentId]: _deletedReaction, ...nextReactions } = currentReactions;

        return nextReactions;
      });
    }
  }

  function handleReplyAction(replyId: string, action: CommentAction) {
    setOpenReplyActionId(null);

    if (action === "delete") {
      setDeletedReplyIds((currentIds) => (currentIds.includes(replyId) ? currentIds : [...currentIds, replyId]));
    }
  }

  return (
    <>
    <section className="wrapper_commentPanel" id={id} ref={panelRef} aria-label="댓글 반응">
      <div className="wrapper_commentSummary">
        <span className="text_commentTotal">댓글 {allComments.length}</span>
        <Button
          aria-pressed={myCommentsOnly}
          className="btn_commentMineFilter"
          classNameOnly
          onClick={() => setMyCommentsOnly((current) => !current)}
          type="button"
        >
          나의 댓글
        </Button>
      </div>

      <section className="container_commentGuide" aria-label="안내 선택지별 댓글">
        <div className="wrapper_commentGuideTabs">
        <h3>투표 선택지 별</h3>
        <PillTabMenu
          ariaLabel="안내 선택지별 댓글 필터"
          className="wrapper_commentTabs"
          items={commentTabs}
          onChange={setActiveChoice}
          value={activeChoice}
        />
        </div>

        <div className="wrapper_commentGuideComments">
          <div className="wrapper_commentDropdown wrapper_commentSort">
            <button
              aria-controls={isCommentSortOpen ? commentSortMenuId : undefined}
              aria-expanded={isCommentSortOpen}
              aria-haspopup="listbox"
              aria-label="댓글 정렬"
              className="btn_commentDropdown"
              onClick={() => {
                setOpenCommentActionId(null);
                setOpenReplyActionId(null);
                setIsCommentSortOpen((current) => !current);
              }}
              type="button"
            >
              {selectedSortLabel}
              <span aria-hidden="true" />
            </button>
            {isCommentSortOpen ? (
              <div className="listbox_commentDropdown" id={commentSortMenuId} role="listbox">
                {commentSortOptions.map((option) => (
                  <button
                    aria-selected={sortOrder === option.value}
                    key={option.value}
                    onClick={() => {
                      setSortOrder(option.value);
                      setIsCommentSortOpen(false);
                    }}
                    role="option"
                    type="button"
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            ) : null}
          </div>

      <div className="wrapper_commentList">
        {visibleComments.length > 0 ? (
          visibleComments.map((comment, index) => {
            const selectedReaction = commentReactions[comment.id] ?? null;
            const { dislikes: dislikeCount, likes: likeCount } = getCommentReactionCounts(comment);
            const actionMenuId = `${panelId}-comment-action-${comment.id}`;
            const replyToggleId = `${panelId}-reply-toggle-${comment.id}`;
            const replyListId = `${panelId}-reply-list-${comment.id}`;
            const isReplyListOpen = expandedReplyId === comment.id;
            const templateReplies: CommentReplyItem[] = Array.from({ length: Math.min(comment.replies, 3) }, (_, replyIndex) => ({
              ...commentReplyTemplates[replyIndex % commentReplyTemplates.length],
              id: `${comment.id}-${replyIndex}`,
            })).filter((reply) => !deletedReplyIdSet.has(reply.id));
            const userReplies = (userRepliesByCommentId[comment.id] ?? []).filter(
              (reply) => !deletedReplyIdSet.has(reply.id),
            );
            const commentReplies = [...templateReplies, ...userReplies];

            return (
              <Fragment key={comment.id}>
                {index > 0 ? <span aria-hidden="true" className="divider_commentItem" /> : null}
                <article className="wrapper_commentItem" id={`${panelId}-comment-${comment.id}`}>
                  <header>
                    <span className="wrapper_commentMeta">
                      <strong>{comment.author}</strong>
                      <NewsCreatedTime>{comment.date}</NewsCreatedTime>
                    </span>
                    <span className="wrapper_commentAction">
                      <IconButton
                        aria-label="댓글 더보기"
                        aria-controls={openCommentActionId === comment.id ? actionMenuId : undefined}
                        aria-expanded={openCommentActionId === comment.id}
                        aria-haspopup="menu"
                        baseClassName="btn_commentAction"
                        icon="detail"
                        label="댓글 더보기"
                        onClick={() => {
                          setIsCommentSortOpen(false);
                          setOpenReplyActionId(null);
                          setOpenCommentActionId((current) => (current === comment.id ? null : comment.id));
                        }}
                      />
                      {openCommentActionId === comment.id ? (
                        <div className="listbox_commentDropdown listbox_commentAction" id={actionMenuId} role="menu">
                          {commentActionOptions.map((option) => (
                            <button
                              key={option.value}
                              onClick={() => handleCommentAction(comment.id, option.value)}
                              role="menuitem"
                              type="button"
                            >
                              {option.label}
                            </button>
                          ))}
                        </div>
                      ) : null}
                    </span>
                  </header>
                  <ChipLabel kind="commentChoice">{comment.choice}</ChipLabel>
                  <p>{comment.body}</p>
                  <footer>
                    <button
                      aria-controls={replyListId}
                      aria-expanded={isReplyListOpen}
                      id={replyToggleId}
                      onClick={() => toggleReplyList(comment.id)}
                      type="button"
                    >
                      대댓글 {commentReplies.length}
                    </button>
                    <span>
                      <ReactionButton
                        aria-label="댓글 좋아요"
                        aria-pressed={selectedReaction === "like"}
                        icon="thumbUp"
                        onClick={() => toggleCommentReaction(comment.id, "like")}
                        tone="like"
                        variant="comment"
                      >
                        {likeCount}
                      </ReactionButton>
                      <ReactionButton
                        aria-label="댓글 싫어요"
                        aria-pressed={selectedReaction === "dislike"}
                        icon="thumbDown"
                        onClick={() => toggleCommentReaction(comment.id, "dislike")}
                        tone="dislike"
                        variant="comment"
                      >
                        {dislikeCount}
                      </ReactionButton>
                    </span>
                  </footer>
                  <div
                    aria-hidden={!isReplyListOpen}
                    aria-labelledby={replyToggleId}
                    className={`wrapper_commentReplies${isReplyListOpen ? " is_open" : ""}`}
                    id={replyListId}
                    role="region"
                  >
                    <div className="wrapper_commentRepliesInner">
                      <Button
                        className="btn_originalArticle"
                        classNameOnly
                        aria-controls={composerId}
                        aria-pressed={composerMode === "reply" && replyTargetCommentId === comment.id}
                        onClick={() => startReplyComposer(comment.id)}
                        type="button"
                      >
                        대댓글 달기
                      </Button>
                      {commentReplies.map((reply, replyIndex) => {
                        const replyActionMenuId = `${panelId}-reply-action-${reply.id}`;

                        return (
                        <Fragment key={reply.id}>
                        <article className="wrapper_commentReplyItem" id={`${panelId}-reply-${reply.id}`}>
                          <header>
                            <span className="wrapper_commentMeta">
                              <strong>{reply.author}</strong>
                              <NewsCreatedTime>{reply.date}</NewsCreatedTime>
                            </span>
                            <span className="wrapper_commentAction">
                              <IconButton
                                aria-label="대댓글 더보기"
                                aria-controls={openReplyActionId === reply.id ? replyActionMenuId : undefined}
                                aria-expanded={openReplyActionId === reply.id}
                                aria-haspopup="menu"
                                baseClassName="btn_commentAction"
                                disabled={!isReplyListOpen}
                                icon="detail"
                                label="대댓글 더보기"
                                onClick={() => {
                                  setIsCommentSortOpen(false);
                                  setOpenCommentActionId(null);
                                  setOpenReplyActionId((current) => (current === reply.id ? null : reply.id));
                                }}
                              />
                              {openReplyActionId === reply.id ? (
                                <div className="listbox_commentDropdown listbox_commentAction" id={replyActionMenuId} role="menu">
                                  {commentActionOptions.map((option) => (
                                    <button
                                      key={option.value}
                                      onClick={() => handleReplyAction(reply.id, option.value)}
                                      role="menuitem"
                                      type="button"
                                    >
                                      {option.label}
                                    </button>
                                  ))}
                                </div>
                              ) : null}
                            </span>
                          </header>
                          <ChipLabel kind="commentChoice">{reply.choice}</ChipLabel>
                          <p>{reply.body}</p>
                          <footer>
                            <span>
                              <ReactionButton
                                aria-label="대댓글 좋아요"
                                disabled={!isReplyListOpen}
                                icon="thumbUp"
                                tone="like"
                                variant="comment"
                              >
                                {reply.likes}
                              </ReactionButton>
                              <ReactionButton
                                aria-label="대댓글 싫어요"
                                disabled={!isReplyListOpen}
                                icon="thumbDown"
                                tone="dislike"
                                variant="comment"
                              >
                                {reply.dislikes}
                              </ReactionButton>
                            </span>
                          </footer>
                        </article>
                        {replyIndex < commentReplies.length - 1 ? (
                          <span aria-hidden="true" className="divider_commentItem" />
                        ) : null}
                        </Fragment>
                        );
                      })}
                    </div>
                  </div>
                </article>
              </Fragment>
            );
          })
        ) : (
          <p className="text_commentEmpty">표시할 댓글이 없습니다.</p>
        )}
          </div>
        </div>
      </section>
    </section>
    {isComposerVisible ? (
      <div
        aria-label={composerMode === "reply" ? "대댓글 작성" : "댓글 작성"}
        className="container_commentComposerFixed"
        id={composerId}
        role="region"
      >
        <form
          className="form_commentComposer"
          onSubmit={(event) => {
            event.preventDefault();
            submitComposer();
          }}
        >
          <CommentComposerInput
            label={composerMode === "reply" ? "대댓글 입력" : "댓글 입력"}
            onChange={(event) => setComposerDraft(event.target.value)}
            placeholder={composerMode === "reply" ? "대댓글을 입력해 주세요." : "홍길동님은 어떻게 생각하시나요?"}
            submitLabel={composerMode === "reply" ? "대댓글 등록" : "댓글 등록"}
            value={composerDraft}
          />
        </form>
      </div>
    ) : null}
    </>
  );
}

function HomeReelCard({
  article,
  framed = true,
  headingLevel = "h2",
  index,
}: {
  article: HomeArticle;
  framed?: boolean;
  headingLevel?: "h1" | "h2";
  index: number | string;
}) {
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isCommentPanelOpen, setIsCommentPanelOpen] = useState(false);
  const [isShared, setIsShared] = useState(false);
  const [reaction, setReaction] = useState<Reaction>(null);
  const numericIndex = typeof index === "number" ? index : 0;
  const commentPanelId = `home-comment-panel-${index}`;
  const articleContentId = `home-article-content-${index}`;
  const articleTitleId = `home-article-title-${index}`;
  const ArticleTitle = headingLevel;

  function handleCommentPanelToggle() {
    setIsCommentPanelOpen((current) => !current);
  }

  const articleContent = (
    <div
      aria-labelledby={articleTitleId}
      className={`wrapper_articleCardContent${
        isCommentPanelOpen ? " is_commentComposerSpaceReserved" : ""
      }`}
      id={articleContentId}
      role="region"
      tabIndex={0}
    >
      <div className="wrapper_articleSummary">
        <ChipLabel kind="articleCategory">{article.category}</ChipLabel>
        <ArticleTitle id={articleTitleId}>{article.title}</ArticleTitle>
        <NewsCreatedTime>{article.date}</NewsCreatedTime>
      </div>
      <div className="wrapper_articleActions" aria-label="기사 도구" role="group">
        <IconButton
          aria-pressed={isShared}
          baseClassName="btn_articleTool"
          icon="share"
          label="공유"
          onClick={() => setIsShared((current) => !current)}
        />
        <IconButton
          aria-pressed={isBookmarked}
          baseClassName="btn_articleTool"
          icon="bookmark"
          label="북마크"
          onClick={() => setIsBookmarked((current) => !current)}
        />
      </div>
      <img alt={article.imageAlt} src={article.image} />
      <p className="text_articleBody">{articleBody}</p>

      <div className="wrapper_articleSource">
        <div className="wrapper_articleSourcePublisher">
          <img className="img_articlePublisherLogo" src="/icons/icon_user.svg" alt="" width={32} height={32} />
          <span className="text_articlePublisherName">{numericIndex % 2 === 0 ? "국민일보" : "중앙일보"}</span>
        </div>
        <span className="text_articleReporter">홍길동 기자</span>
      </div>

      <Button
        className="btn_originalArticle"
        classNameOnly
        href="https://example.com/original-news"
        size="medium"
        variant="filled"
      >
        기사 원문 보기
      </Button>

      <ReactionControls reaction={reaction} onReactionChange={setReaction} />

      <ArticleGuideSection kind={article.guideKind ?? "stacked"} />

      <Button
        aria-controls={isCommentPanelOpen ? commentPanelId : undefined}
        aria-expanded={isCommentPanelOpen}
        className="btn_commentPanel"
        classNameOnly
        onClick={handleCommentPanelToggle}
        size="large"
        variant="filled"
      >
        <Icon name="chat" />
        댓글 반응보기
      </Button>
      {isCommentPanelOpen ? (
        <CommentReactionPanel guideKind={article.guideKind ?? "stacked"} id={commentPanelId} />
      ) : null}
    </div>
  );

  if (!framed) {
    return articleContent;
  }

  return (
    <article aria-labelledby={articleTitleId} className="container_articleCard">
      {articleContent}
    </article>
  );
}

function ArticleDetailContent({
  article,
  backLabel,
  onBack,
}: {
  article: HomeArticle;
  backLabel?: string;
  onBack?: () => void;
}) {
  return (
    <NewsRollArticleDetailPanel
      ariaLabel="기사 상세"
      backLabel={backLabel}
      labelledBy="home-article-title-detail"
      onBack={onBack}
    >
      <HomeReelCard article={article} framed={false} headingLevel="h1" index="detail" />
    </NewsRollArticleDetailPanel>
  );
}
function HomeView({
  isTextLarge,
  onOpenBreakingNews,
  onOpenSearch,
  onToggleTextSize,
}: {
  isTextLarge: boolean;
  onOpenBreakingNews: () => void;
  onOpenSearch: () => void;
  onToggleTextSize: () => void;
}) {
  const [homeViewMode, setHomeViewMode] = useState<HomeViewMode>("reels");
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedDetailArticle, setSelectedDetailArticle] = useState<HomeArticle>(homeArticle);

  function openHomeDetail(article: HomeArticle) {
    setSelectedDetailArticle(article);
    setDetailOpen(true);
  }

  return (
    <HomeShell
      isDetailOpen={detailOpen}
      isTextLarge={isTextLarge}
      mode={homeViewMode}
      onCloseDetail={() => setDetailOpen(false)}
      onModeChange={(nextMode) => {
        setDetailOpen(false);
        setHomeViewMode(nextMode);
      }}
      onOpenBreakingNews={onOpenBreakingNews}
      onOpenSearch={onOpenSearch}
      onToggleTextSize={onToggleTextSize}
    >
      {detailOpen ? (
        <ArticleDetailContent
          article={selectedDetailArticle}
        />
      ) : homeViewMode === "reels" ? (
        <section
          className="container_newsFeed"
          id="home-news-reels-panel"
          role="tabpanel"
          aria-labelledby="home-news-view-tab-reels"
        >
          {homeArticles.map((article, index) => (
            <HomeReelCard article={article} index={index} key={`${article.title}-${index}`} />
          ))}
        </section>
      ) : (
        <section
          className="container_newsGrid container_newsGrid_block"
          id="home-news-block-panel"
          role="tabpanel"
          aria-labelledby="home-news-view-tab-block"
        >
          <div className="wrapper_newsGridScroll">
            {homeArticles.map((article) => (
              <HomeBlockItem article={article} key={article.title} onClick={() => openHomeDetail(article)} />
            ))}
          </div>
        </section>
      )}
    </HomeShell>
  );
}

function SearchView({ onClose }: { onClose: () => void }) {
  const [query, setQuery] = useState("");

  return (
    <section className="newsroll_search_page" aria-label="검색">
      <div className="newsroll_search_top">
        <button aria-label="검색 닫기" className="newsroll_search_close" onClick={onClose} type="button">
          <span aria-hidden="true" />
        </button>
      </div>

      <label className="newsroll_search_field">
        <span className="sr_only">검색어</span>
        <input
          onChange={(event) => setQuery(event.target.value)}
          placeholder="홍길동님은 어떻게 생각하시나요?"
          type="search"
          value={query}
        />
        <Icon name="search" />
      </label>

      <ol className="newsroll_search_suggestion_list" aria-label="추천 검색어">
        {searchSuggestions.map((suggestion, index) => (
          <li key={`${suggestion}-${index}`}>
            <button onClick={() => setQuery(suggestion)} type="button">
              {index + 1}. {suggestion}
            </button>
          </li>
        ))}
      </ol>
    </section>
  );
}

function AllNewsMeta({ stacked = false }: { stacked?: boolean }) {
  return (
    <p className={`newsroll_all_meta${stacked ? " newsroll_all_meta_stacked" : ""}`}>
      <NewsCreatedTime />
      <span className="newsroll_all_stats" aria-label="조회수와 반응">
        <span>
          <i className="newsroll_all_stat_icon_eye" aria-hidden="true" />
          132
        </span>
        <span>
          <i className="newsroll_all_stat_icon_comment" aria-hidden="true" />
          132
        </span>
      </span>
    </p>
  );
}

function AllNewsMoreButton({
  ariaLabel,
  expanded = false,
  onClick,
  tone = "light",
}: {
  ariaLabel?: string;
  expanded?: boolean;
  onClick?: () => void;
  tone?: "dark" | "light";
}) {
  return (
    <button
      aria-label={ariaLabel}
      aria-expanded={expanded}
      className={`btn_originalArticle newsroll_all_more newsroll_all_more_${tone}`}
      onClick={onClick}
      type="button"
    >
      <span>{expanded ? "접기" : "더보기"}</span>
      <img className="newsroll_all_more_icon" src="/icons/icon_chevron_right.svg" alt="" aria-hidden="true" />
    </button>
  );
}

function AllNewsPanelContent({ children }: { children: ReactNode }) {
  return <div className="newsroll_all_panelContent">{children}</div>;
}

type AllNewsArticlePreview = {
  category?: string;
  guideKind?: GuideKind;
  image: string;
  title: string;
};

function createAllNewsArticle(preview: AllNewsArticlePreview, fallbackCategory: string, index: number): HomeArticle {
  return {
    category: preview.category ?? fallbackCategory,
    date: homeArticle.date,
    guideKind: preview.guideKind ?? (index % 2 === 0 ? "stacked" : "binary"),
    image: preview.image,
    imageAlt: homeArticle.imageAlt,
    title: preview.title,
  };
}

function AllNewsLatestCard({
  item,
  onClick,
}: {
  item: (typeof allNewsLatest)[number];
  onClick: () => void;
}) {
  return (
    <button
      aria-label={`${item.category} 기사: ${item.title}`}
      className="newsroll_all_latest_card"
      onClick={onClick}
      type="button"
    >
      <span className="newsroll_all_chip">{item.category}</span>
      <img alt="" className="newsroll_all_latest_image" src={item.image} />
      <span className="newsroll_all_latest_body">
        <strong>{item.title}</strong>
        <AllNewsMeta stacked />
      </span>
    </button>
  );
}

function AllNewsHeadlineItem({
  item,
  onClick,
}: {
  item: (typeof allNewsHeadlinesByPress)[string][number];
  onClick: () => void;
}) {
  return (
    <button
      aria-label={`헤드라인 기사: ${item.title}`}
      className="newsroll_all_headline_item"
      onClick={onClick}
      type="button"
    >
      <span className="newsroll_all_headline_body">
        <strong>{item.title}</strong>
        <AllNewsMeta />
      </span>
      <img alt="" className="newsroll_all_headline_image" src={item.image} />
    </button>
  );
}

function AllNewsRelayItem({
  item,
  featured = false,
  onClick,
}: {
  featured?: boolean;
  item: (typeof allNewsRelayByCategory)[string][number];
  onClick: () => void;
}) {
  return (
    <button
      aria-label={`릴레이 뉴스 기사: ${item.title}`}
      className="newsroll_all_relay_item"
      onClick={onClick}
      type="button"
    >
      <strong className={featured ? "newsroll_all_relay_title_large" : undefined}>{item.title}</strong>
      <AllNewsMeta />
      <img alt="" src={item.image} />
    </button>
  );
}

function AllNewsView({
  isTextLarge,
  onOpenSearch,
  onToggleTextSize,
}: {
  isTextLarge: boolean;
  onOpenSearch: () => void;
  onToggleTextSize: () => void;
}) {
  const screenRef = useRef<HTMLElement>(null);
  const feedRef = useRef<HTMLElement>(null);
  const dockedPanelScroll = useDockedPanelScroll({
    boundaryDelayMs: nextArticleRevealDelayMs,
    contentScrollerSelector: allNewsDockedScrollSelectors.contentScroller,
    dockedClassName: "is_newsrollSheetDocked",
    immediatePanelSelector: allNewsDockedScrollSelectors.immediatePanel,
    panelSelector: allNewsDockedScrollSelectors.panel,
    rootRef: screenRef,
    scrollerRef: feedRef,
  });
  const [activePress, setActivePress] = useState(allNewsPresses[0]);
  const [activeRelayCategory, setActiveRelayCategory] = useState(allNewsRelayCategories[0]);
  const latestScrollerRef = useRef<HTMLDivElement>(null);
  const latestDragActiveRef = useRef(false);
  const latestDidDragRef = useRef(false);
  const latestDragStartRef = useRef({ scrollLeft: 0, x: 0 });
  const latestTouchIntentRef = useRef<{
    axis: SwipeAxis | null;
    isFromLatestScroller: boolean;
    x: number;
    y: number;
  } | null>(null);
  const [isLatestDragging, setIsLatestDragging] = useState(false);
  const [detailArticle, setDetailArticle] = useState<HomeArticle | null>(null);
  const [isBreakingAlarmOn, setIsBreakingAlarmOn] = useState(false);
  const [showAllBreaking, setShowAllBreaking] = useState(false);
  const [showAllHeadlines, setShowAllHeadlines] = useState(false);
  const breakingItems = showAllBreaking ? allNewsBreaking : allNewsBreaking.slice(0, 3);
  const relayItems = allNewsRelayByCategory[activeRelayCategory] ?? [];
  const activePressIndex = Math.max(0, allNewsPresses.indexOf(activePress));
  const activeRelayIndex = Math.max(0, allNewsRelayCategories.indexOf(activeRelayCategory));
  const activeHeadlineItems = allNewsHeadlinesByPress[activePress] ?? [];
  const headlineItems = showAllHeadlines ? activeHeadlineItems : activeHeadlineItems.slice(0, 4);

  function isLatestScrollerEventTarget(target: EventTarget | null) {
    return target instanceof Element && target.closest(allNewsDockedScrollSelectors.latestScroller) !== null;
  }

  function handleAllNewsTouchStart(event: TouchEvent<HTMLElement>) {
    const touch = event.touches[0] ?? null;

    if (touch) {
      latestTouchIntentRef.current = {
        axis: null,
        isFromLatestScroller: isLatestScrollerEventTarget(event.target),
        x: touch.clientX,
        y: touch.clientY,
      };
    } else {
      latestTouchIntentRef.current = null;
    }

    dockedPanelScroll.handleTouchStart(event);
  }

  function handleAllNewsTouchMove(event: TouchEvent<HTMLElement>) {
    const touch = event.touches[0] ?? null;
    const latestTouchIntent = latestTouchIntentRef.current;

    if (touch && latestTouchIntent?.isFromLatestScroller) {
      const deltaX = touch.clientX - latestTouchIntent.x;
      const deltaY = touch.clientY - latestTouchIntent.y;
      const absoluteX = Math.abs(deltaX);
      const absoluteY = Math.abs(deltaY);

      if (!latestTouchIntent.axis && Math.max(absoluteX, absoluteY) > allNewsSwipeAxisThresholdPx) {
        latestTouchIntent.axis = absoluteX > absoluteY ? "horizontal" : "vertical";
      }

      if (latestTouchIntent.axis === "horizontal") {
        event.preventDefault();
        event.stopPropagation();
        return;
      }
    }

    dockedPanelScroll.handleTouchMove(event);
  }

  function resetLatestTouchIntent() {
    latestTouchIntentRef.current = null;
  }

  function handleLatestPointerDown(event: PointerEvent<HTMLDivElement>) {
    const node = latestScrollerRef.current;

    if (!node) {
      return;
    }

    latestDragActiveRef.current = true;
    latestDidDragRef.current = false;
    setIsLatestDragging(true);
    latestDragStartRef.current = { scrollLeft: node.scrollLeft, x: event.clientX };
    node.setPointerCapture(event.pointerId);
  }

  function handleLatestPointerMove(event: PointerEvent<HTMLDivElement>) {
    const node = latestScrollerRef.current;

    if (!node || !latestDragActiveRef.current) {
      return;
    }

    const delta = event.clientX - latestDragStartRef.current.x;

    if (Math.abs(delta) > 8) {
      latestDidDragRef.current = true;
    }

    node.scrollLeft = latestDragStartRef.current.scrollLeft - delta;
  }

  function stopLatestDrag(event: PointerEvent<HTMLDivElement>) {
    const node = latestScrollerRef.current;

    latestDragActiveRef.current = false;
    setIsLatestDragging(false);

    if (node?.hasPointerCapture(event.pointerId)) {
      node.releasePointerCapture(event.pointerId);
    }

    if (!node || !latestDidDragRef.current) {
      return;
    }

    const firstCard = node.querySelector<HTMLElement>(".newsroll_all_latest_card");
    const cardStep = firstCard
      ? firstCard.offsetWidth + Number.parseFloat(getComputedStyle(node).columnGap || getComputedStyle(node).gap || "0")
      : 1;
    const targetIndex = Math.round(node.scrollLeft / cardStep);

    node.scrollTo({
      behavior: "smooth",
      left: targetIndex * cardStep,
    });
  }

  function handlePressTabKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const lastIndex = allNewsPresses.length - 1;
    const nextIndexByKey: Record<string, number> = {
      ArrowDown: activePressIndex === lastIndex ? 0 : activePressIndex + 1,
      ArrowLeft: activePressIndex === 0 ? lastIndex : activePressIndex - 1,
      ArrowRight: activePressIndex === lastIndex ? 0 : activePressIndex + 1,
      ArrowUp: activePressIndex === 0 ? lastIndex : activePressIndex - 1,
      End: lastIndex,
      Home: 0,
    };
    const nextIndex = nextIndexByKey[event.key];

    if (nextIndex === undefined) {
      return;
    }

    event.preventDefault();
    setActivePress(allNewsPresses[nextIndex]);
  }

  function openAllNewsDetail(article: HomeArticle) {
    setDetailArticle(article);
  }

  function closeAllNewsDetail() {
    setDetailArticle(null);
  }

  const isDetailOpen = detailArticle !== null;

  return (
    <NewsRollCommonLayout
      aria-label="전체 뉴스"
      className="newsroll_sheetFrame"
      dockedGap={40}
      initialGap={40}
      minInitialTop={492}
      movingSheet
      onTouchCancelCapture={resetLatestTouchIntent}
      onTouchEndCapture={resetLatestTouchIntent}
      onTouchMoveCapture={handleAllNewsTouchMove}
      onTouchStartCapture={handleAllNewsTouchStart}
      onWheelCapture={dockedPanelScroll.handleWheel}
      ref={screenRef}
      sheetClassName="newsroll_sheetFrameSheet container_homeSheet newsroll_all_sheetFrameSheet"
      sheetNestedScrollResetSelector={
        isDetailOpen ? homeDockedScrollSelectors.contentScroller : allNewsDockedScrollSelectors.contentScroller
      }
      sheetScrollSelector={isDetailOpen ? ".container_newsFeed_detail" : ".newsroll_all_feed"}
      top={
        <header className="container_homeToolbar newsroll_all_breakingHeader">
          <NewsToolbar
            isTextLarge={isTextLarge}
            onOpenSearch={onOpenSearch}
            onToggleTextSize={onToggleTextSize}
          />
          <NewsRollDockedControls className="newsroll_allDockedControls" isDetailOpen={isDetailOpen}>
            {isDetailOpen ? (
              <button
                aria-label="전체 뉴스 목록으로 돌아가기"
                className="newsroll_homeDetailBack newsroll_all_detail_back"
                onClick={closeAllNewsDetail}
                type="button"
              >
                <span aria-hidden="true" />
              </button>
            ) : null}
            <Button
              aria-label="속보 알림"
              aria-pressed={isBreakingAlarmOn}
              className="newsroll_homeDockedAlarm"
              iconOnly
              onClick={() => setIsBreakingAlarmOn((current) => !current)}
              radius="full"
              size="large"
              variant="outline"
            >
              <Icon name="alarm" />
            </Button>
          </NewsRollDockedControls>
          <div className="newsroll_all_breaking_label">
            <Icon name="alarm" />
            <span>속보</span>
          </div>
          <div className="newsroll_all_breakingBody">
            <div className="newsroll_all_breaking_stack" id="all-breaking-news">
              {breakingItems.map((item, index) => (
                <button
                  className="newsroll_all_breaking_card"
                  key={item}
                  onClick={() =>
                    openAllNewsDetail(
                      createAllNewsArticle({ image: allNewsAssets.latest, title: item }, homeArticle.category, index),
                    )
                  }
                  type="button"
                >
                  {item}
                </button>
              ))}
            </div>
            <AllNewsMoreButton
              ariaLabel={showAllBreaking ? "속보 접기" : "속보 더보기"}
              expanded={showAllBreaking}
              onClick={() => setShowAllBreaking((current) => !current)}
              tone="dark"
            />
          </div>
        </header>
      }
      topClassName="container_home newsroll_sheetFrameTop"
    >
      {detailArticle ? (
        <ArticleDetailContent article={detailArticle} />
      ) : (
      <section className="container_newsFeed newsroll_all_feed" aria-label="전체 뉴스 콘텐츠 영역" ref={feedRef}>
        <article className="container_articleCard newsroll_all_panel newsroll_all_latest_panel" aria-label="최신 뉴스">
          <AllNewsPanelContent>
            <h1 className="newsroll_all_section_title">
              최신 뉴스 <strong>10</strong>
            </h1>
            <div
              aria-label="최신 뉴스 목록"
              className={`newsroll_all_latest_scroller${isLatestDragging ? " is_dragging" : ""}`}
              onPointerCancel={stopLatestDrag}
              onPointerDown={handleLatestPointerDown}
              onPointerLeave={stopLatestDrag}
              onPointerMove={handleLatestPointerMove}
              onPointerUp={stopLatestDrag}
              ref={latestScrollerRef}
              role="group"
            >
              {allNewsLatest.map((item, index) => (
                <AllNewsLatestCard
                  item={item}
                  key={`${item.title}-${index}`}
                  onClick={() => {
                    if (latestDidDragRef.current) {
                      return;
                    }

                    openAllNewsDetail(createAllNewsArticle(item, item.category, index));
                  }}
                />
              ))}
            </div>
          </AllNewsPanelContent>
        </article>

        <article className="container_articleCard newsroll_all_panel newsroll_all_press_panel" aria-label="언론사별 헤드라인">
          <AllNewsPanelContent>
            <h2 className="newsroll_all_section_title">언론사별 헤드라인</h2>
            <div
              className="newsroll_all_press_tabMenu"
              role="tablist"
              aria-label="언론사 선택"
              onKeyDown={handlePressTabKeyDown}
            >
              {allNewsPresses.map((press, index) => {
                const selected = activePress === press;

                return (
                  <Button
                    aria-controls="all-news-headline-panel"
                    aria-selected={selected}
                    className="newsroll_all_press_tabButton"
                    id={`all-news-press-tab-${index}`}
                    key={press}
                    onClick={() => setActivePress(press)}
                    radius="full"
                    role="tab"
                    size="large"
                    tabIndex={selected ? 0 : -1}
                    type="button"
                    variant={selected ? "filled" : "outline"}
                  >
                    <div className="newsroll_all_press_logo" aria-hidden="true" />
                    <span>{press}</span>
                  </Button>
                );
              })}
            </div>
            <div
              aria-labelledby={`all-news-press-tab-${activePressIndex}`}
              className="newsroll_all_headline_list"
              id="all-news-headline-panel"
              role="tabpanel"
            >
              {headlineItems.map((item, index) => (
                <AllNewsHeadlineItem
                  item={item}
                  key={`${item.title}-${index}`}
                  onClick={() => openAllNewsDetail(createAllNewsArticle(item, activePress, index))}
                />
              ))}
            </div>
            <AllNewsMoreButton
              ariaLabel={showAllHeadlines ? "언론사별 헤드라인 접기" : "언론사별 헤드라인 더보기"}
              expanded={showAllHeadlines}
              onClick={() => setShowAllHeadlines((current) => !current)}
            />
          </AllNewsPanelContent>
        </article>

        <article className="container_articleCard newsroll_all_panel newsroll_all_relay_panel" aria-label="릴레이 뉴스">
          <AllNewsPanelContent>
            <h2 className="newsroll_all_section_title">릴레이 뉴스</h2>
            <PillTabMenu
              ariaLabel="릴레이 뉴스 카테고리"
              className="newsroll_all_category_tabs"
              getPanelId={(category) =>
                category === activeRelayCategory
                  ? `all-news-relay-panel-${allNewsRelayCategories.indexOf(category)}`
                  : undefined
              }
              getTabId={(category) => `all-news-relay-tab-${allNewsRelayCategories.indexOf(category)}`}
              items={allNewsRelayCategories.map((category) => ({ id: category, label: category }))}
              onChange={setActiveRelayCategory}
              value={activeRelayCategory}
            />
            <div
              aria-labelledby={`all-news-relay-tab-${activeRelayIndex}`}
              className="newsroll_all_relay_list"
              id={`all-news-relay-panel-${activeRelayIndex}`}
              role="tabpanel"
            >
              {relayItems.map((item, index) => (
                <AllNewsRelayItem
                  featured={index === 0 || index === 5}
                  item={item}
                  key={`${item.title}-${index}`}
                  onClick={() => openAllNewsDetail(createAllNewsArticle(item, activeRelayCategory, index))}
                />
              ))}
            </div>
          </AllNewsPanelContent>
        </article>
      </section>
      )}
    </NewsRollCommonLayout>
  );
}

const policyAgeTabs = ["전체", "미성년", "청년", "중장년", "노년"];
const basePolicyDetails: PolicyDetailItem[] = [
  { label: "지원 대상 연령", value: "19세 ~ 45세" },
  { label: "지원 내용", value: "동아리 활동에 필요한 강사비, 교재비, 재료비 등 운영비 지원 (팀당 약 150만원)." },
  { label: "지원 기관", value: "경상남도 하동군 지역활력추진단" },
  { label: "사업 기간", value: "2026-01 ~ 2026-12" },
  { label: "신청 기간", value: "2025-10-01 ~ 2025-10-10" },
  { label: "신청 방법", value: "양산시 청년 정보 플랫폼 청년카까 온라인 신청." },
  { label: "선발 방식", value: "지원 자격 충족자 대상 선착순 선정 후 개별 통보." },
  { label: "제출 서류", value: "사업자등록 사실 여부 증명서, 시험 응시 확인 서류, 응시료 결제 영수증, 통장 사본 등." },
];
const policyItemsByAge: Record<string, PolicyItem[]> = {
  전체: [
    {
      title: "청년동아리 활동비 지원사업",
      tags: ["복지문화", "문화활동", "바우처"],
      summary: "청년 비율이 50% 이상인 5인 이상의 동아리를 대상으로 활동비를 지원하는 사업.",
      registeredAt: "2026년 12월 31일",
      updatedAt: "2026년 12월 31일",
      details: basePolicyDetails,
    },
    {
      title: "양산시 청년 자격증 응시료 지원",
      tags: ["일자리", "취업", "보조금"],
      summary: "취업 준비 청년의 자격증 응시료 부담을 낮추기 위한 지역 지원 정책.",
      registeredAt: "2026년 12월 31일",
      updatedAt: "2026년 12월 31일",
      details: basePolicyDetails,
    },
  ],
  미성년: [
    {
      title: "청소년 문화예술 체험 바우처",
      tags: ["복지문화", "청소년", "바우처"],
      summary: "미성년 청소년의 문화예술 관람과 체험 활동 비용을 지원하는 사업.",
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
      summary: "방과후 학습과 돌봄이 필요한 청소년 가구에 프로그램 이용료를 지원.",
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
      summary: "청년 비율이 50% 이상인 5인 이상의 동아리를 대상으로 활동비를 지원하는 사업.",
      registeredAt: "2026년 12월 31일",
      updatedAt: "2026년 12월 31일",
      details: basePolicyDetails,
    },
    {
      title: "청년 주거 지원 확대 논의",
      tags: ["주거", "청년", "보조금"],
      summary: "청년 주거비 부담을 낮추기 위해 지자체별 신청 조건을 정비하는 정책.",
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
      summary: "업종 전환과 매장 운영 개선이 필요한 중장년 소상공인 대상 컨설팅 지원.",
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
      summary: "스마트폰, 공공앱, 금융앱 사용에 어려움을 겪는 노년층을 위한 교육.",
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
const policyListTargetCount = 10;

function fillPolicyListItems(items: PolicyItem[]) {
  if (items.length === 0 || items.length >= policyListTargetCount) {
    return items;
  }

  return Array.from({ length: policyListTargetCount }, (_, index) => items[index % items.length]);
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
  return (
    <button
      aria-pressed={isSelected}
      className={`newsroll_policy_list_item${isSelected ? " is_selected" : ""}`}
      onClick={onSelect}
      type="button"
    >
      <div className="newsroll_policy_list_tags">
        {item.tags.map((tag, index) => (
          <span className={index === 2 ? "is_accent" : undefined} key={`${item.title}-${tag}`}>
            {tag}
          </span>
        ))}
      </div>
      <h2>{item.title}</h2>
      <div className="newsroll_policy_dates">
        <span>
          <strong>등록</strong> {item.registeredAt}
        </span>
        <span>
          <strong>수정</strong> {item.updatedAt}
        </span>
      </div>
      <div className="newsroll_policy_stats" aria-label="조회수와 댓글">
        <span>
          <i className="newsroll_all_stat_icon_eye" aria-hidden="true" />
          132
        </span>
        <span>
          <i className="newsroll_all_stat_icon_comment" aria-hidden="true" />
          132
        </span>
      </div>
    </button>
  );
}

function PolicyDetailContent({
  item,
  onBack,
}: {
  item: PolicyItem;
  onBack: () => void;
}) {
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isShared, setIsShared] = useState(false);

  useLayoutEffect(() => {
    resetNewsRollViewport();
  }, []);

  return (
    <>
        <button aria-label="국가정책 목록으로 돌아가기" className="newsroll_all_detail_back" onClick={onBack} type="button">
          <span aria-hidden="true" />
        </button>
        <div className="newsroll_policy_detail_tags">
          {item.tags.map((tag, index) => (
            <span className={index === item.tags.length - 1 ? "is_accent" : undefined} key={`${item.title}-${tag}`}>
              {tag}
            </span>
          ))}
        </div>

        <h1>{item.title}</h1>
        <p className="newsroll_policy_detail_summary">{item.summary}</p>

        <div className="newsroll_policy_detail_dates">
          <span>
            <strong>등록</strong> {item.registeredAt}
          </span>
          <span>
            <strong>수정</strong> {item.updatedAt}
          </span>
        </div>

        <div className="newsroll_policy_detail_actions" aria-label="정책 도구">
          <button
            aria-label="공유"
            aria-pressed={isShared}
            className="newsroll_icon_button"
            onClick={() => setIsShared((current) => !current)}
            type="button"
          >
            <Icon name="share" />
          </button>
          <button
            aria-label="북마크"
            aria-pressed={isBookmarked}
            className="newsroll_icon_button"
            onClick={() => setIsBookmarked((current) => !current)}
            type="button"
          >
            <Icon name="bookmark" />
          </button>
        </div>

        <dl className="newsroll_policy_detail_list">
          {item.details.map((detail) => (
            <div key={`${item.title}-${detail.label}`}>
              <dt>{detail.label}</dt>
              <dd>{detail.value}</dd>
            </div>
          ))}
        </dl>

        {isExpanded ? (
          <div className="newsroll_policy_detail_more">
            <strong>상세 안내</strong>
            <p>신청 전 모집 공고와 제출 서류를 다시 확인하고, 접수 기간 안에 온라인 신청을 완료해주세요.</p>
          </div>
        ) : null}

        <button
          aria-expanded={isExpanded}
          className="newsroll_policy_detail_more_button"
          onClick={() => setIsExpanded((current) => !current)}
          type="button"
        >
          <span aria-hidden="true">{isExpanded ? "-" : "+"}</span>
          {isExpanded ? "접기" : "상세보기"}
        </button>
    </>
  );
}

function PolicyView({
  isTextLarge,
  onOpenSearch,
  onToggleTextSize,
}: {
  isTextLarge: boolean;
  onOpenSearch: () => void;
  onToggleTextSize: () => void;
}) {
  const [activeAge, setActiveAge] = useState(policyAgeTabs[0]);
  const [detailItem, setDetailItem] = useState<PolicyItem | null>(null);
  const [sortOrder, setSortOrder] = useState<SortOrder>("popular");
  const [selectedPolicyIndex, setSelectedPolicyIndex] = useState(0);
  const policyItems = fillPolicyListItems(policyItemsByAge[activeAge] ?? policyItemsByAge.전체);
  const visiblePolicyItems =
    sortOrder === "latest" ? [...policyItems].reverse() : policyItems;

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
      top={(
        <NewsRollSummaryHeroTop
          toolbar={(
            <NewsToolbar
              isTextLarge={isTextLarge}
              onOpenSearch={onOpenSearch}
              onToggleTextSize={onToggleTextSize}
            />
          )}
          hero={{
            ariaLabel: "맞춤 정책 요약",
            caption: "국가정책 정보가 있습니다.",
            className: "newsroll_policy_hero",
            count: "11,343",
            greeting: "콩콩이님을 위한",
            unit: "개",
          }}
        />
      )}
      topClassName="container_home newsroll_sheetFrameTop"
    >
      <NewsRollPagePanel ariaLabel="국가정책 콘텐츠 영역">
        {detailItem ? (
          <PolicyDetailContent item={detailItem} onBack={() => setDetailItem(null)} />
        ) : (
          <>
            <PillTabMenu
              ariaLabel="연령 필터"
              className="newsroll_policy_age_tabs"
              items={policyAgeTabs.map((label) => ({ id: label, label }))}
              onChange={(nextAge) => {
                setActiveAge(nextAge);
                setSelectedPolicyIndex(0);
              }}
              value={activeAge}
            />

            <button
              aria-label={`정렬: ${policySortLabels[sortOrder]}`}
              className="newsroll_policy_sort"
              onClick={() => setSortOrder((current) => (current === "popular" ? "latest" : "popular"))}
              type="button"
            >
              {policySortLabels[sortOrder]} <span aria-hidden="true" />
            </button>

            <div className="newsroll_policy_list">
              {visiblePolicyItems.map((item, index) => (
                <PolicyListItem
                  isSelected={selectedPolicyIndex === index}
                  item={item}
                  key={`${activeAge}-${sortOrder}-${item.title}-${index}`}
                  onSelect={() => {
                    setSelectedPolicyIndex(index);
                    setDetailItem(item);
                  }}
                />
              ))}
            </div>
          </>
        )}
      </NewsRollPagePanel>
    </NewsRollCommonLayout>
  );
}
const myRecentNews = Array.from({ length: 4 }, (_, index) => ({
  dateTime: defaultNewsDateTime,
  image: articleImage,
  time: defaultNewsDateLabel,
  title: index % 2 === 0 ? "용인 수지, 강남·분당 가격 동조화로..." : "용인 수지, 강남·분당 가격 동조화로...",
}));

const myCategoryGroups = [
  {
    items: ["정치", "경제", "사회", "문화", "국제", "지역", "스포츠", "IT과학"],
    title: "나의 관심 카테고리 설정",
    active: new Set(["정치", "사회", "지역", "스포츠"]),
  },
  {
    items: ["미성년", "청년", "중장년", "노년"],
    title: "나의 연령대 설정",
    active: new Set(["청년"]),
  },
  {
    items: ["중앙일보", "국민일보", "중앙일보"],
    title: "관심 언론사 설정",
    active: new Set(["국민일보"]),
  },
];

function MyPageView({
  isTextLarge,
  onOpenSearch,
  onToggleTextSize,
}: {
  isTextLarge: boolean;
  onOpenSearch: () => void;
  onToggleTextSize: () => void;
}) {
  const [activeSummary, setActiveSummary] = useState<"bookmark" | "vote" | "comment" | null>(null);
  const [activeChipGroups, setActiveChipGroups] = useState(() =>
    myCategoryGroups.map((group) => new Set(group.active)),
  );
  const [isRecentExpanded, setIsRecentExpanded] = useState(false);
  const [isProfileEditing, setIsProfileEditing] = useState(false);
  const [notificationSettings, setNotificationSettings] = useState<Record<string, boolean>>({
    "내 댓글에 좋아요, 답글": true,
    공지사항: true,
    속보: true,
  });
  const [preferredNewsType, setPreferredNewsType] = useState<HomeViewMode>("reels");
  const [selectedRecentIndex, setSelectedRecentIndex] = useState<number | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const recentItems = isRecentExpanded ? [...myRecentNews, ...myRecentNews] : myRecentNews;

  function toggleChip(groupIndex: number, item: string) {
    setActiveChipGroups((currentGroups) =>
      currentGroups.map((group, index) => {
        if (index !== groupIndex) {
          return group;
        }

        const next = new Set(group);

        if (next.has(item)) {
          next.delete(item);
        } else {
          next.add(item);
        }

        return next;
      }),
    );
  }

  return (
    <NewsRollCommonLayout
      aria-label="마이페이지"
      className="newsroll_sheetFrame newsroll_my_screen"
      dockedGap={pagePanelDockedGap}
      initialGap={pagePanelInitialGap}
      {...myInfoFixedDockedPanelProps}
      minInitialTop={pagePanelInitialTop}
      sheetClassName="newsroll_sheetFrameSheet container_homeSheet newsroll_my_sheet"
      sheetScrollSelector={pagePanelContentSelector}
      top={(
        <header className="container_homeToolbar newsroll_my_header">
          <NewsToolbar
            isTextLarge={isTextLarge}
            onOpenSearch={onOpenSearch}
            onToggleTextSize={onToggleTextSize}
          />
          <h1>마이페이지</h1>
        </header>
      )}
      topClassName="container_home newsroll_sheetFrameTop"
    >
      <NewsRollPagePanel ariaLabel="마이페이지 콘텐츠 영역">
        <section className="newsroll_my_profile" aria-label="프로필">
          <strong>콩콩이님</strong>
          <button
            aria-pressed={isProfileEditing}
            onClick={() => setIsProfileEditing((current) => !current)}
            type="button"
          >
            {isProfileEditing ? "수정 닫기" : "개인정보 수정"}
          </button>
          {isProfileEditing ? <p className="newsroll_my_profile_hint">닉네임과 알림 정보를 수정할 수 있어요.</p> : null}
        </section>

        <div className="newsroll_my_summary" aria-label="활동 통계">
          <button
            aria-pressed={activeSummary === "bookmark"}
            onClick={() => setActiveSummary((current) => (current === "bookmark" ? null : "bookmark"))}
            type="button"
          >
            <span className="newsroll_my_summary_icon newsroll_my_summary_bookmark" aria-hidden="true" />
            <span>북마크</span>
            <strong>56</strong>
          </button>
          <button
            aria-pressed={activeSummary === "vote"}
            onClick={() => setActiveSummary((current) => (current === "vote" ? null : "vote"))}
            type="button"
          >
            <span className="newsroll_my_summary_icon newsroll_my_summary_vote" aria-hidden="true" />
            <span>투표</span>
            <strong>54</strong>
          </button>
          <button
            aria-pressed={activeSummary === "comment"}
            onClick={() => setActiveSummary((current) => (current === "comment" ? null : "comment"))}
            type="button"
          >
            <span className="newsroll_my_summary_icon newsroll_my_summary_comment" aria-hidden="true" />
            <span>댓글</span>
            <strong>15</strong>
          </button>
        </div>

        <section className="newsroll_my_recent" aria-label="최근 본 뉴스">
          <h2>최근 본 뉴스</h2>
          <div className="newsroll_my_recent_scroller">
            {recentItems.map((item, index) => (
              <button
                aria-pressed={selectedRecentIndex === index}
                className="newsroll_my_recent_item"
                key={`${item.title}-${index}`}
                onClick={() => setSelectedRecentIndex((current) => (current === index ? null : index))}
                type="button"
              >
                <img alt="" src={item.image} />
                <strong>{item.title}</strong>
                <NewsCreatedTime dateTime={item.dateTime}>{item.time}</NewsCreatedTime>
              </button>
            ))}
          </div>
          <button
            aria-expanded={isRecentExpanded}
            className="newsroll_my_full_button"
            onClick={() => setIsRecentExpanded((current) => !current)}
            type="button"
          >
            {isRecentExpanded ? "접기" : "전체 보기"}
          </button>
        </section>

        {myCategoryGroups.map((group, groupIndex) => (
          <section className="newsroll_my_chip_group" key={group.title} aria-label={group.title}>
            <h2>{group.title}</h2>
            <div>
              {group.items.map((item, index) => (
                <button
                  aria-pressed={activeChipGroups[groupIndex].has(item)}
                  className={activeChipGroups[groupIndex].has(item) ? "is_active" : undefined}
                  key={`${group.title}-${item}-${index}`}
                  onClick={() => toggleChip(groupIndex, item)}
                  type="button"
                >
                  {item}
                </button>
              ))}
            </div>
          </section>
        ))}

        <section className="newsroll_my_setting_group" aria-label="알림 설정">
          <h2>알림 설정</h2>
          {["속보", "내 댓글에 좋아요, 답글", "공지사항"].map((label) => (
            <button
              aria-pressed={notificationSettings[label]}
              className="newsroll_my_setting_row"
              key={label}
              onClick={() =>
                setNotificationSettings((current) => ({
                  ...current,
                  [label]: !current[label],
                }))
              }
              type="button"
            >
              <span>{label}</span>
              <span className={`newsroll_my_switch${notificationSettings[label] ? " is_on" : ""}`} aria-hidden="true" />
            </button>
          ))}
          <button
            aria-pressed={preferredNewsType === "block"}
            className="newsroll_my_setting_row"
            onClick={() => setPreferredNewsType((current) => (current === "reels" ? "block" : "reels"))}
            type="button"
          >
            <span>뉴스 보기 타입</span>
            <strong>{preferredNewsType === "reels" ? "릴스형" : "블록형"}</strong>
            <span className="newsroll_my_chevron" aria-hidden="true" />
          </button>
        </section>

        <section className="newsroll_my_setting_group newsroll_my_display_group" aria-label="디스플레이 설정">
          <h2>디스플레이 설정</h2>
          <button
            aria-pressed={isDarkMode}
            className="newsroll_my_setting_row"
            onClick={() => setIsDarkMode((current) => !current)}
            type="button"
          >
            <span>다크모드</span>
            <span className={`newsroll_my_switch${isDarkMode ? " is_on" : ""}`} aria-hidden="true" />
          </button>
        </section>
      </NewsRollPagePanel>
    </NewsRollCommonLayout>
  );
}
function InfoNoticePanel() {
  const [activeNoticeIndex, setActiveNoticeIndex] = useState<number | null>(null);

  return (
    <section className="newsroll_info_list" aria-label="공지사항">
      {noticeItems.map((notice, index) => (
        <button
          aria-pressed={activeNoticeIndex === index}
          className="newsroll_info_notice_item"
          key={notice.title}
          onClick={() => setActiveNoticeIndex((current) => (current === index ? null : index))}
          type="button"
        >
          <span>{notice.date}</span>
          <strong>{notice.title}</strong>
          <p>
            {activeNoticeIndex === index
              ? "선택한 공지의 상세 내용을 확인 중입니다."
              : "더 나은 뉴스 경험을 위해 서비스 화면과 알림 기능을 정리했습니다."}
          </p>
        </button>
      ))}
    </section>
  );
}

function InfoFaqPanel() {
  const [openFaqIndexes, setOpenFaqIndexes] = useState(() => new Set([0]));

  return (
    <section className="newsroll_info_list" aria-label="FAQ">
      {faqItems.map((item, index) => (
        <details
          className="newsroll_info_faq_item"
          key={`${item.question}-${index}`}
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
          <summary>
            <strong>Q. {item.question}</strong>
            <span className="newsroll_info_faq_chevron" aria-hidden="true" />
          </summary>
          <p>{item.answer}</p>
        </details>
      ))}
    </section>
  );
}

function InfoInquiryPanel() {
  return (
    <form
      className="newsroll_info_inquiry"
      aria-label="1:1 문의"
      onSubmit={(event) => event.preventDefault()}
    >
      <label>
        <span>문의 유형</span>
        <Select
          aria-label="문의 유형"
          defaultValue={inquiryTypes[0]}
          options={inquiryOptions}
          radius="rounded"
          selectSize="large"
        />
      </label>
      <div className="newsroll_info_field">
        <span>제목</span>
        <TextInput
          aria-label="문의 제목"
          inputSize="large"
          placeholder="문의 제목을 입력해주세요."
          radius="rounded"
          type="text"
        />
      </div>
      <div className="newsroll_info_field">
        <span>내용</span>
        <Textarea
          aria-label="문의 내용"
          placeholder="문의 내용을 자세히 작성해주세요."
          radius="rounded"
          rows={7}
          textareaSize="large"
        />
      </div>
      <Button className="newsroll_info_submit" radius="rounded" size="large" type="submit">
        문의하기
      </Button>
    </form>
  );
}

function InfoView({
  isTextLarge,
  onOpenSearch,
  onToggleTextSize,
}: {
  isTextLarge: boolean;
  onOpenSearch: () => void;
  onToggleTextSize: () => void;
}) {
  const [activeInfoTab, setActiveInfoTab] = useState<InfoTab>("faq");
  const activeInfoTabLabel = infoTabs.find((tab) => tab.id === activeInfoTab)?.label ?? "FAQ";

  return (
    <NewsRollCommonLayout
      aria-label="인포메이션"
      className="newsroll_sheetFrame newsroll_info_screen"
      dockedGap={pagePanelDockedGap}
      initialGap={pagePanelInitialGap}
      {...myInfoFixedDockedPanelProps}
      minInitialTop={pagePanelInitialTop}
      sheetClassName="newsroll_sheetFrameSheet container_homeSheet newsroll_info_sheet"
      sheetScrollSelector={pagePanelContentSelector}
      top={(
        <header className="container_homeToolbar newsroll_info_header">
          <NewsToolbar
            isTextLarge={isTextLarge}
            onOpenSearch={onOpenSearch}
            onToggleTextSize={onToggleTextSize}
          />
          <h1>{activeInfoTabLabel}</h1>
        </header>
      )}
      topClassName="container_home newsroll_sheetFrameTop"
    >
      <NewsRollPagePanel ariaLabel="인포메이션 콘텐츠 영역">
        <PillTabMenu
          ariaLabel="인포메이션 메뉴"
          className="newsroll_info_tabs"
          getPanelId={(id) => (id === activeInfoTab ? `newsroll_info_panel_${id}` : undefined)}
          getTabId={(id) => `newsroll_info_tab_${id}`}
          items={infoTabs}
          onChange={setActiveInfoTab}
          value={activeInfoTab}
        />

        <div
          aria-labelledby={`newsroll_info_tab_${activeInfoTab}`}
          id={`newsroll_info_panel_${activeInfoTab}`}
          role="tabpanel"
        >
          {activeInfoTab === "notice" ? <InfoNoticePanel /> : null}
          {activeInfoTab === "faq" ? <InfoFaqPanel /> : null}
          {activeInfoTab === "inquiry" ? <InfoInquiryPanel /> : null}
        </div>
      </NewsRollPagePanel>
    </NewsRollCommonLayout>
  );
}

function ActiveView({
  isTextLarge,
  onCloseSearch,
  onOpenAllNews,
  onOpenSearch,
  onToggleTextSize,
  view,
}: {
  isTextLarge: boolean;
  onCloseSearch: () => void;
  onOpenAllNews: () => void;
  onOpenSearch: () => void;
  onToggleTextSize: () => void;
  view: View;
}) {
  if (view === "search") {
    return <SearchView onClose={onCloseSearch} />;
  }

  if (view === "all") {
    return <AllNewsView isTextLarge={isTextLarge} onOpenSearch={onOpenSearch} onToggleTextSize={onToggleTextSize} />;
  }

  if (view === "policy") {
    return <PolicyView isTextLarge={isTextLarge} onOpenSearch={onOpenSearch} onToggleTextSize={onToggleTextSize} />;
  }

  if (view === "my") {
    return <MyPageView isTextLarge={isTextLarge} onOpenSearch={onOpenSearch} onToggleTextSize={onToggleTextSize} />;
  }

  if (view === "info") {
    return <InfoView isTextLarge={isTextLarge} onOpenSearch={onOpenSearch} onToggleTextSize={onToggleTextSize} />;
  }

  return (
    <HomeView
      isTextLarge={isTextLarge}
      onOpenBreakingNews={onOpenAllNews}
      onOpenSearch={onOpenSearch}
      onToggleTextSize={onToggleTextSize}
    />
  );
}

export function NewsHomeScreen() {
  const [activeView, setActiveView] = useState<View>("home");
  const [searchBackView, setSearchBackView] = useState<Tab>("home");
  const [isTextLarge, setIsTextLarge] = useState(false);
  const isPanelView = activeView === "policy" || activeView === "my" || activeView === "info";

  useLayoutEffect(() => {
    resetNewsRollViewport();
  }, [activeView]);

  function openSearch() {
    if (activeView !== "search") {
      setSearchBackView(activeView);
    }

    setActiveView("search");
  }

  return (
    <main
      className={`newsroll_screen${activeView === "home" ? " newsroll_screen_home" : ""}${
        activeView === "all" ? " newsroll_screen_all" : ""
      }${
        isPanelView ? " newsroll_screen_panel" : ""
      }${
        isTextLarge ? " newsroll_text_large" : ""
      }`}
    >
      <div className="newsroll_phone" aria-label="NewsRoll">
        <ActiveView
          isTextLarge={isTextLarge}
          onCloseSearch={() => setActiveView(searchBackView)}
          onOpenAllNews={() => setActiveView("all")}
          onOpenSearch={openSearch}
          onToggleTextSize={() => setIsTextLarge((current) => !current)}
          view={activeView}
        />
      </div>

      {activeView !== "search" ? (
        <nav className="newsroll_bottom_nav" aria-label="하단 탐색">
          {navItems.map((item) => (
            <IconButton
              aria-current={activeView === item.tab ? "page" : undefined}
              baseClassName="newsroll_nav_item"
              icon={item.icon}
              key={item.label}
              label={item.label}
              onClick={() => setActiveView(item.tab)}
            />
          ))}
        </nav>
      ) : null}
    </main>
  );
}
