"use client";

import { useRef, useState, type KeyboardEvent, type PointerEvent, type ReactNode } from "react";

import { Button, Select, TextInput, Textarea } from "@/design-system/components";

type IconName =
  | "alarm"
  | "bookmark"
  | "chevronRight"
  | "chat"
  | "dots"
  | "earth"
  | "fourSquare"
  | "home"
  | "list"
  | "loudspeaker"
  | "menu"
  | "question"
  | "search"
  | "share"
  | "sizeIncrease"
  | "thumbDown"
  | "thumbUp"
  | "user";

type Tab = "home" | "all" | "policy" | "my" | "info";
type View = Tab | "search";
type InfoTab = "notice" | "faq" | "inquiry";
type HomeViewMode = "reels" | "block";
type Reaction = "like" | "dislike" | "neutral" | null;
type ReactionValue = Exclude<Reaction, null>;
type CommentReactionValue = "like" | "dislike";
type CommentSortOrder = "latest" | "popular";
type SortOrder = "popular" | "latest";
type GuideKind = "stacked" | "binary";

type HomeArticle = {
  category: string;
  date: string;
  image: string;
  imageAlt: string;
  guideKind?: GuideKind;
  title: string;
};

type HomeHeaderControls = {
  isTextLarge: boolean;
  mode: HomeViewMode;
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

type PillTabItem<T extends string> = {
  id: T;
  label: string;
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

const homeArticle: HomeArticle = {
  category: "정치",
  date: "2026년 12월 31일 08:30",
  image: articleImage,
  imageAlt: "아파트 단지 전경",
  title: "용인 수지, 강남·분당 가격 동조화로 15억 시대 진입",
};

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

const homeReelArticles: HomeArticle[] = [
  { ...homeArticle, guideKind: "stacked" },
  { ...homeArticle, guideKind: "binary" },
];

const reactionItems: { count: number; icon: IconName; label: string; value: ReactionValue }[] = [
  { count: 16, icon: "thumbUp", label: "좋아요", value: "like" },
  { count: 12, icon: "thumbDown", label: "싫어요", value: "dislike" },
  { count: 5, icon: "dots", label: "글쎄요", value: "neutral" },
];

const commentAgeStats = [
  { age: "10대", value: 24 },
  { age: "20대", value: 36 },
  { age: "30대", value: 64 },
  { age: "40대", value: 36 },
  { age: "50대", value: 25 },
  { age: "60대↑", value: 16 },
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

const allNewsAssets = {
  comment: "https://www.figma.com/api/mcp/asset/3f35cfa2-0bc7-4d2a-9328-60390c1622a1",
  eye: "https://www.figma.com/api/mcp/asset/7c832f0b-f9d8-4bdc-a3df-8602d289353e",
  latest: "https://www.figma.com/api/mcp/asset/e19fd2c5-0cdc-49f3-b038-98f397c30d89",
  relayOne: "https://www.figma.com/api/mcp/asset/1a59a503-73ff-4503-8685-d29d170dbdf5",
  relayTwo: "https://www.figma.com/api/mcp/asset/1e86871e-c835-4bdc-b822-dc9d837e6dd2",
  relayThree: "https://www.figma.com/api/mcp/asset/51809d7f-3c59-4ce6-a2af-54b3350504af",
  relayFour: "https://www.figma.com/api/mcp/asset/530565e8-22ee-49ff-bc51-969b92bb5ee5",
  relayFive: "https://www.figma.com/api/mcp/asset/100ceedd-8afb-44a1-b9d1-1cf93a4c3cb9",
  thumbnail: "https://www.figma.com/api/mcp/asset/1a59a503-73ff-4503-8685-d29d170dbdf5",
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

function Icon({ name }: { name: IconName }) {
  return <span aria-hidden="true" className={`newsroll_icon newsroll_icon_${name}`} />;
}

function PillTabMenu<T extends string>({
  ariaLabel,
  className,
  getPanelId,
  getTabId,
  items,
  onChange,
  value,
}: {
  ariaLabel: string;
  className: string;
  getPanelId?: (id: T) => string;
  getTabId?: (id: T) => string;
  items: PillTabItem<T>[];
  onChange: (id: T) => void;
  value: T;
}) {
  const activeIndex = Math.max(
    0,
    items.findIndex((item) => item.id === value),
  );

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const lastIndex = items.length - 1;
    const nextIndexByKey: Record<string, number> = {
      ArrowDown: activeIndex === lastIndex ? 0 : activeIndex + 1,
      ArrowLeft: activeIndex === 0 ? lastIndex : activeIndex - 1,
      ArrowRight: activeIndex === lastIndex ? 0 : activeIndex + 1,
      ArrowUp: activeIndex === 0 ? lastIndex : activeIndex - 1,
      End: lastIndex,
      Home: 0,
    };
    const nextIndex = nextIndexByKey[event.key];

    if (nextIndex === undefined) {
      return;
    }

    event.preventDefault();
    onChange(items[nextIndex].id);
  }

  return (
    <div className={className} role="tablist" aria-label={ariaLabel} onKeyDown={handleKeyDown}>
      {items.map((item) => {
        const selected = value === item.id;

        return (
          <button
            aria-controls={getPanelId?.(item.id)}
            aria-selected={selected}
            className={selected ? "is_active" : undefined}
            id={getTabId?.(item.id)}
            key={item.id}
            onClick={() => onChange(item.id)}
            role="tab"
            tabIndex={selected ? 0 : -1}
            type="button"
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
}

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
        className="newsroll_text_size_button"
        onClick={onToggleTextSize}
        size="medium"
        variant="filled"
      >
        <Icon name="sizeIncrease" />
      </Button>
      <button
        aria-label="검색"
        className="newsroll_icon_button newsroll_toolbar_icon"
        onClick={onOpenSearch}
        type="button"
      >
        <Icon name="search" />
      </button>
      <button aria-label="메뉴" className="newsroll_icon_button newsroll_toolbar_icon" type="button">
        <Icon name="menu" />
      </button>
    </div>
  );
}

function HomeBlockItem({ onClick }: { onClick: () => void }) {
  return (
    <button className="btn_newsBlockItem" onClick={onClick} type="button">
      <strong>{homeArticle.title}</strong>
      <span>1시간 전</span>
      <img alt={homeArticle.imageAlt} src={homeArticle.image} />
    </button>
  );
}

function HomeViewToggle({
  mode,
  onModeChange,
}: {
  mode: HomeViewMode;
  onModeChange: (mode: HomeViewMode) => void;
}) {
  const tabIds = {
    reels: "home-news-view-tab-reels",
    block: "home-news-view-tab-block",
  };
  const panelIds = {
    reels: "home-news-reels-panel",
    block: "home-news-block-panel",
  };

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const nextModeByKey: Partial<Record<string, HomeViewMode>> = {
      ArrowLeft: mode === "reels" ? "block" : "reels",
      ArrowRight: mode === "reels" ? "block" : "reels",
      ArrowUp: mode === "reels" ? "block" : "reels",
      ArrowDown: mode === "reels" ? "block" : "reels",
      Home: "reels",
      End: "block",
    };
    const nextMode = nextModeByKey[event.key];

    if (!nextMode) {
      return;
    }

    event.preventDefault();
    onModeChange(nextMode);
  }

  return (
    <div className="wrapper_newsViewToggle" role="tablist" aria-label="뉴스 보기 방식" onKeyDown={handleKeyDown}>
      <button
        aria-controls={panelIds.reels}
        aria-label="릴스형"
        aria-selected={mode === "reels"}
        className={`btn_newsViewOption${mode === "reels" ? " is_active" : ""}`}
        id={tabIds.reels}
        onClick={() => onModeChange("reels")}
        role="tab"
        tabIndex={mode === "reels" ? 0 : -1}
        type="button"
      >
        <Icon name="list" />
      </button>
      <button
        aria-controls={panelIds.block}
        aria-label="블록형"
        aria-selected={mode === "block"}
        className={`btn_newsViewOption${mode === "block" ? " is_active" : ""}`}
        id={tabIds.block}
        onClick={() => onModeChange("block")}
        role="tab"
        tabIndex={mode === "block" ? 0 : -1}
        type="button"
      >
        <Icon name="fourSquare" />
      </button>
    </div>
  );
}

function HomeMainHeader({
  isTextLarge,
  mode,
  onModeChange,
  onOpenBreakingNews,
  onOpenSearch,
  onToggleTextSize,
}: HomeHeaderControls) {
  return (
    <>
      <header className="container_homeToolbar">
        <NewsToolbar
          isTextLarge={isTextLarge}
          onOpenSearch={onOpenSearch}
          onToggleTextSize={onToggleTextSize}
        />
      </header>

      <section className="container_hero" aria-label="홈 요약">
        <p className="text_greeting">
          반갑습니다 <strong>콩콩이</strong>님!
        </p>
        <p className="wrapper_hero">
          <strong>
            11,343<span className="text_heroUnit">개</span>
          </strong>
          <span className="text_heroCaption">새로운 소식이 있습니다.</span>
        </p>
        <HomeViewToggle mode={mode} onModeChange={onModeChange} />
      </section>

      <div className="wrapper_breakingNews">
        <a
          className="btn_link_breakingNews"
          href="#all-breaking-news"
          onClick={(event) => {
            event.preventDefault();
            onOpenBreakingNews();
          }}
        >
          <Icon name="alarm" />
          <span className="text_breakingNewsTitle">{homeBreakingTitle}</span>
        </a>
      </div>
    </>
  );
}

function HomeShell({
  children,
  isTextLarge,
  mode,
  onModeChange,
  onOpenBreakingNews,
  onOpenSearch,
  onToggleTextSize,
}: HomeHeaderControls & { children: ReactNode }) {
  return (
    <div className="container_homeScreen">
      <div className="container_home">
        <HomeMainHeader
          isTextLarge={isTextLarge}
          mode={mode}
          onModeChange={onModeChange}
          onOpenBreakingNews={onOpenBreakingNews}
          onOpenSearch={onOpenSearch}
          onToggleTextSize={onToggleTextSize}
        />
      </div>

      {children}
    </div>
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
        <button
          aria-pressed={reaction === item.value}
          className={`btn_articleReaction btn_articleReaction_${item.value}`}
          key={item.value}
          onClick={() => onReactionChange(reaction === item.value ? null : item.value)}
          type="button"
        >
          <Icon name={item.icon} />
          <strong>
            {item.label} {item.count}
          </strong>
        </button>
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
  const commentTabs = [
    { id: "all", label: "전체" },
    ...guideChoices.map((choice) => ({ id: choice, label: choice })),
  ];
  const defaultComments = commentTemplates.map((comment, index) => ({
    ...comment,
    choice: guideChoices[index % guideChoices.length],
  }));
  const [activeChoice, setActiveChoice] = useState(commentTabs[0].id);
  const [commentDraft, setCommentDraft] = useState("");
  const [commentMenuId, setCommentMenuId] = useState<number | null>(null);
  const [commentReactions, setCommentReactions] = useState<Record<number, CommentReactionValue | null>>({});
  const [expandedReplyId, setExpandedReplyId] = useState<number | null>(null);
  const [myCommentsOnly, setMyCommentsOnly] = useState(false);
  const [sortOrder, setSortOrder] = useState<CommentSortOrder>("popular");
  const [userComments, setUserComments] = useState<CommentItem[]>([]);
  const allComments = [...userComments, ...defaultComments];
  const visibleComments = allComments
    .filter((comment) => (myCommentsOnly ? comment.isMine : true))
    .filter((comment) => (activeChoice === "all" ? true : comment.choice === activeChoice))
    .sort((a, b) => {
      if (sortOrder === "latest") {
        return b.id - a.id;
      }

      return b.likes + b.replies - (a.likes + a.replies);
    });

  function submitComment() {
    const body = commentDraft.trim();

    if (!body) {
      return;
    }

    setUserComments((currentComments) => [
      {
        author: "나",
        body,
        choice: activeChoice === "all" ? guideChoices[0] : activeChoice,
        date: "방금 전",
        dislikes: 0,
        id: Date.now(),
        isMine: true,
        likes: 0,
        replies: 0,
      },
      ...currentComments,
    ]);
    setCommentDraft("");
  }

  function toggleCommentReaction(commentId: number, reaction: CommentReactionValue) {
    setCommentReactions((currentReactions) => ({
      ...currentReactions,
      [commentId]: currentReactions[commentId] === reaction ? null : reaction,
    }));
  }

  return (
    <section className="wrapper_commentPanel" id={id} aria-label="댓글 반응">
      <form
        className="form_commentComposer"
        onSubmit={(event) => {
          event.preventDefault();
          submitComment();
        }}
      >
        <input
          aria-label="댓글 입력"
          onChange={(event) => setCommentDraft(event.target.value)}
          placeholder="홍길동님은 어떻게 생각하시나요?"
          type="text"
          value={commentDraft}
        />
        <button aria-label="댓글 등록" type="submit">
          <span aria-hidden="true" />
        </button>
      </form>

      <div className="wrapper_commentSummary">
        <span>댓글 {allComments.length}</span>
        <button
          aria-pressed={myCommentsOnly}
          onClick={() => setMyCommentsOnly((current) => !current)}
          type="button"
        >
          나의 댓글
        </button>
      </div>

      <section className="wrapper_commentAgeStats" aria-label="연령대별 댓글">
        <strong>
          <span>30대</span> 댓글이 가장 많이 달렸어요!
        </strong>
        <div className="wrapper_commentAgeChart" aria-hidden="true">
          {commentAgeStats.map((item) => (
            <span className={item.age === "30대" ? "is_peak" : undefined} key={item.age}>
              <i style={{ blockSize: `${item.value}px` }} />
              <em>{item.age}</em>
            </span>
          ))}
        </div>
      </section>

      <section className="wrapper_commentByGuide" aria-label="안내 선택지별 댓글">
        <h3>안내 선택지 별</h3>
        <PillTabMenu
          ariaLabel="안내 선택지별 댓글 필터"
          className="wrapper_commentTabs"
          items={commentTabs}
          onChange={setActiveChoice}
          value={activeChoice}
        />
      </section>

      <button
        aria-label={`정렬: ${sortOrder === "popular" ? "인기순" : "최신순"}`}
        className="btn_commentSort"
        onClick={() => setSortOrder((current) => (current === "popular" ? "latest" : "popular"))}
        type="button"
      >
        {sortOrder === "popular" ? "인기순" : "최신순"}
        <span aria-hidden="true" />
      </button>

      <div className="wrapper_commentList">
        {visibleComments.length > 0 ? (
          visibleComments.map((comment) => {
            const selectedReaction = commentReactions[comment.id] ?? null;
            const likeCount = comment.likes + (selectedReaction === "like" ? 1 : 0);
            const dislikeCount = comment.dislikes + (selectedReaction === "dislike" ? 1 : 0);

            return (
              <article className="wrapper_commentItem" key={comment.id}>
                <header>
                  <strong>{comment.author}</strong>
                  <time>{comment.date}</time>
                  <button
                    aria-expanded={commentMenuId === comment.id}
                    aria-label="댓글 더보기"
                    onClick={() => setCommentMenuId((current) => (current === comment.id ? null : comment.id))}
                    type="button"
                  >
                    ...
                  </button>
                </header>
                {commentMenuId === comment.id ? (
                  <div className="wrapper_commentMenu" role="status">
                    댓글 옵션이 열렸습니다.
                  </div>
                ) : null}
                <span className="badge_commentChoice">{comment.choice}</span>
                <p>{comment.body}</p>
                <footer>
                  <button
                    aria-expanded={expandedReplyId === comment.id}
                    onClick={() => setExpandedReplyId((current) => (current === comment.id ? null : comment.id))}
                    type="button"
                  >
                    답글달기 {comment.replies}
                  </button>
                  <span>
                    <button
                      aria-label="댓글 좋아요"
                      aria-pressed={selectedReaction === "like"}
                      className="btn_commentReaction_like"
                      onClick={() => toggleCommentReaction(comment.id, "like")}
                      type="button"
                    >
                      <Icon name="thumbUp" />
                      {likeCount}
                    </button>
                    <button
                      aria-label="댓글 싫어요"
                      aria-pressed={selectedReaction === "dislike"}
                      className="btn_commentReaction_dislike"
                      onClick={() => toggleCommentReaction(comment.id, "dislike")}
                      type="button"
                    >
                      <Icon name="thumbDown" />
                      {dislikeCount}
                    </button>
                  </span>
                </footer>
                {expandedReplyId === comment.id ? <p className="text_commentReplyHint">답글 입력 영역이 열렸습니다.</p> : null}
              </article>
            );
          })
        ) : (
          <p className="text_commentEmpty">표시할 댓글이 없습니다.</p>
        )}
      </div>
    </section>
  );
}

function HomeReelCard({ article, index }: { article: HomeArticle; index: number }) {
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isCommentPanelOpen, setIsCommentPanelOpen] = useState(false);
  const [isShared, setIsShared] = useState(false);
  const [reaction, setReaction] = useState<Reaction>(null);
  const commentPanelId = `home-comment-panel-${index}`;

  return (
    <article className="container_articleCard">
      <div className="wrapper_articleSummary">
        <span className="chip_articleCategory">{article.category}</span>
        <h1>{article.title}</h1>
        <time dateTime="2026-12-31T08:30:00">{article.date}</time>
      </div>
      <div className="wrapper_articleActions" aria-label="기사 도구" role="group">
        <button
          aria-label="공유"
          aria-pressed={isShared}
          className="btn_articleTool"
          onClick={() => setIsShared((current) => !current)}
          type="button"
        >
          <Icon name="share" />
        </button>
        <button
          aria-label="북마크"
          aria-pressed={isBookmarked}
          className="btn_articleTool"
          onClick={() => setIsBookmarked((current) => !current)}
          type="button"
        >
          <Icon name="bookmark" />
        </button>
      </div>
      <img alt={article.imageAlt} src={article.image} />
      <p className="text_articleBody">{articleBody}</p>

      <div className="wrapper_articleSource">
        <div className="wrapper_articleSourcePublisher">
          <img className="img_articlePublisherLogo" src="/icons/icon_user.svg" alt="" width={32} height={32} />
          <span className="text_articlePublisherName">{index % 2 === 0 ? "국민일보" : "중앙일보"}</span>
        </div>
        <span className="text_articleReporter">홍길동 기자</span>
      </div>

      <Button
        className="btn_originalArticle"
        href="https://example.com/original-news"
        size="medium"
        variant="filled"
      >
        기사 원문 보기
      </Button>

      <ReactionControls reaction={reaction} onReactionChange={setReaction} />

      <ArticleGuideSection kind={article.guideKind ?? "stacked"} />

      <Button
        aria-controls={commentPanelId}
        aria-expanded={isCommentPanelOpen}
        className="btn_commentPanel"
        onClick={() => setIsCommentPanelOpen((current) => !current)}
        size="large"
        variant="filled"
      >
        <Icon name="chat" />
        댓글 반응보기
      </Button>
      {isCommentPanelOpen ? (
        <CommentReactionPanel guideKind={article.guideKind ?? "stacked"} id={commentPanelId} />
      ) : null}
    </article>
  );
}

function HomeReelsView({
  isTextLarge,
  mode,
  onModeChange,
  onOpenBreakingNews,
  onOpenSearch,
  onToggleTextSize,
}: HomeHeaderControls) {
  return (
    <HomeShell
      isTextLarge={isTextLarge}
      mode={mode}
      onModeChange={onModeChange}
      onOpenBreakingNews={onOpenBreakingNews}
      onOpenSearch={onOpenSearch}
      onToggleTextSize={onToggleTextSize}
    >
      <section
        className="container_newsFeed"
        id="home-news-reels-panel"
        role="tabpanel"
        aria-labelledby="home-news-view-tab-reels"
      >
        {homeReelArticles.map((article, index) => (
          <HomeReelCard article={article} index={index} key={`${article.title}-${index}`} />
        ))}
      </section>
    </HomeShell>
  );
}

function HomeBlockView({
  isTextLarge,
  mode,
  onModeChange,
  onOpenBreakingNews,
  onOpenSearch,
  onToggleTextSize,
  onOpenDetail,
}: HomeHeaderControls & {
  onOpenDetail: () => void;
}) {
  return (
    <HomeShell
      isTextLarge={isTextLarge}
      mode={mode}
      onModeChange={onModeChange}
      onOpenBreakingNews={onOpenBreakingNews}
      onOpenSearch={onOpenSearch}
      onToggleTextSize={onToggleTextSize}
    >
      <section
        className="container_newsGrid container_newsGrid_block"
        id="home-news-block-panel"
        role="tabpanel"
        aria-labelledby="home-news-view-tab-block"
      >
        {Array.from({ length: 12 }, (_, index) => (
          <HomeBlockItem key={index} onClick={onOpenDetail} />
        ))}
      </section>
    </HomeShell>
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

  if (detailOpen) {
    return <AllNewsArticleDetail onBack={() => setDetailOpen(false)} onOpenSearch={onOpenSearch} />;
  }

  return homeViewMode === "reels" ? (
    <HomeReelsView
      isTextLarge={isTextLarge}
      mode={homeViewMode}
      onModeChange={setHomeViewMode}
      onOpenBreakingNews={onOpenBreakingNews}
      onOpenSearch={onOpenSearch}
      onToggleTextSize={onToggleTextSize}
    />
  ) : (
    <HomeBlockView
      isTextLarge={isTextLarge}
      mode={homeViewMode}
      onModeChange={setHomeViewMode}
      onOpenBreakingNews={onOpenBreakingNews}
      onOpenDetail={() => setDetailOpen(true)}
      onOpenSearch={onOpenSearch}
      onToggleTextSize={onToggleTextSize}
    />
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

function AllNewsMeta() {
  return (
    <p className="newsroll_all_meta">
      <span>1시간 전</span>
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
  expanded = false,
  onClick,
  tone = "light",
}: {
  expanded?: boolean;
  onClick?: () => void;
  tone?: "dark" | "light";
}) {
  return (
    <button
      aria-expanded={expanded}
      className={`newsroll_all_more newsroll_all_more_${tone}`}
      onClick={onClick}
      type="button"
    >
      <span>{expanded ? "접기" : "더보기"}</span>
      <span className="newsroll_all_more_chevron" aria-hidden="true" />
    </button>
  );
}

function AllNewsLatestCard({
  item,
  onClick,
  selected,
}: {
  item: (typeof allNewsLatest)[number];
  onClick: () => void;
  selected: boolean;
}) {
  return (
    <button aria-pressed={selected} className="newsroll_all_latest_card" onClick={onClick} type="button">
      <span className="newsroll_all_chip">{item.category}</span>
      <img alt="" className="newsroll_all_latest_image" src={item.image} />
      <span className="newsroll_all_latest_body">
        <strong>{item.title}</strong>
        <AllNewsMeta />
      </span>
    </button>
  );
}

function AllNewsHeadlineItem({
  item,
  onClick,
  selected,
}: {
  item: (typeof allNewsHeadlinesByPress)[string][number];
  onClick: () => void;
  selected: boolean;
}) {
  return (
    <button aria-pressed={selected} className="newsroll_all_headline_item" onClick={onClick} type="button">
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
  selected,
}: {
  featured?: boolean;
  item: (typeof allNewsRelayByCategory)[string][number];
  onClick: () => void;
  selected: boolean;
}) {
  return (
    <button aria-pressed={selected} className="newsroll_all_relay_item" onClick={onClick} type="button">
      <strong className={featured ? "newsroll_all_relay_title_large" : undefined}>{item.title}</strong>
      <AllNewsMeta />
      <img alt="" src={item.image} />
    </button>
  );
}

function AllNewsArticleDetail({
  onBack,
  onOpenSearch,
}: {
  onBack: () => void;
  onOpenSearch: () => void;
}) {
  const [isAlarmOn, setIsAlarmOn] = useState(false);

  return (
    <section className="newsroll_all_detail" aria-label="뉴스 상세">
      <header className="newsroll_all_detail_top">
        <div className="newsroll_all_detail_toolbar">
          <button aria-label="전체뉴스로 돌아가기" className="newsroll_all_detail_back" onClick={onBack} type="button">
            <span aria-hidden="true" />
          </button>
          <NewsToolbar isTextLarge={false} onOpenSearch={onOpenSearch} onToggleTextSize={() => undefined} />
          <button
            aria-label="알림"
            aria-pressed={isAlarmOn}
            className="newsroll_home_alarm"
            onClick={() => setIsAlarmOn((current) => !current)}
            type="button"
          >
            <Icon name="alarm" />
          </button>
        </div>
      </header>
      <div className="newsroll_all_detail_body">
        <HomeReelCard article={homeArticle} index={0} />
      </div>
    </section>
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
  const [activePress, setActivePress] = useState(allNewsPresses[0]);
  const [activeRelayCategory, setActiveRelayCategory] = useState(allNewsRelayCategories[0]);
  const [detailOpen, setDetailOpen] = useState(false);
  const latestScrollerRef = useRef<HTMLDivElement>(null);
  const latestDragActiveRef = useRef(false);
  const latestDidDragRef = useRef(false);
  const latestDragStartRef = useRef({ scrollLeft: 0, x: 0 });
  const [isLatestDragging, setIsLatestDragging] = useState(false);
  const [selectedBreakingIndex, setSelectedBreakingIndex] = useState<number | null>(null);
  const [selectedHeadlineIndex, setSelectedHeadlineIndex] = useState<number | null>(null);
  const [selectedLatestIndex, setSelectedLatestIndex] = useState<number | null>(null);
  const [selectedRelayIndex, setSelectedRelayIndex] = useState<number | null>(null);
  const [showAllHeadlines, setShowAllHeadlines] = useState(false);
  const [showAllBreaking, setShowAllBreaking] = useState(false);
  const relayItems = allNewsRelayByCategory[activeRelayCategory] ?? [];
  const pressHeadlines = allNewsHeadlinesByPress[activePress] ?? [];
  const headlineItems = showAllHeadlines ? pressHeadlines : pressHeadlines.slice(0, 4);

  function openDetail() {
    setDetailOpen(true);
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

  if (detailOpen) {
    return <AllNewsArticleDetail onBack={() => setDetailOpen(false)} onOpenSearch={onOpenSearch} />;
  }

  return (
    <section className="newsroll_all_news" aria-label="전체뉴스">
      <div className="newsroll_all_top">
        <NewsToolbar
          isTextLarge={isTextLarge}
          onOpenSearch={onOpenSearch}
          onToggleTextSize={onToggleTextSize}
        />

        <div className="newsroll_all_breaking_label">
          <Icon name="alarm" />
          <span>속보</span>
        </div>

        <div className="newsroll_all_breaking_stack" id="all-breaking-news">
          {(showAllBreaking ? allNewsBreaking : allNewsBreaking.slice(0, 3)).map((item, index) => (
            <button
              aria-pressed={selectedBreakingIndex === index}
              className="newsroll_all_breaking_card"
              key={item}
              onClick={() => {
                setSelectedBreakingIndex((current) => (current === index ? null : index));
                openDetail();
              }}
              type="button"
            >
              {item}
            </button>
          ))}
        </div>

        <AllNewsMoreButton expanded={showAllBreaking} onClick={() => setShowAllBreaking((current) => !current)} tone="dark" />
      </div>

      <div className="newsroll_all_sections">
        <section className="newsroll_all_panel newsroll_all_latest_panel" aria-label="최신 뉴스">
          <h1 className="newsroll_all_section_title">
            최신 뉴스 <strong>10</strong>
          </h1>
          <div
            className={`newsroll_all_latest_scroller${isLatestDragging ? " is_dragging" : ""}`}
            onPointerCancel={stopLatestDrag}
            onPointerDown={handleLatestPointerDown}
            onPointerLeave={stopLatestDrag}
            onPointerMove={handleLatestPointerMove}
            onPointerUp={stopLatestDrag}
            ref={latestScrollerRef}
          >
            {allNewsLatest.map((item, index) => (
              <AllNewsLatestCard
                item={item}
                key={`${item.title}-${index}`}
                onClick={() => {
                  if (latestDidDragRef.current) {
                    return;
                  }

                  setSelectedLatestIndex((current) => (current === index ? null : index));
                  openDetail();
                }}
                selected={selectedLatestIndex === index}
              />
            ))}
          </div>
        </section>

        <section className="newsroll_all_panel newsroll_all_press_panel" aria-label="언론사별 헤드라인">
          <h2 className="newsroll_all_section_title">언론사별 헤드라인</h2>
          <PillTabMenu
            ariaLabel="언론사 선택"
            className="newsroll_all_press_tabs"
            items={allNewsPresses.map((press) => ({ id: press, label: press }))}
            onChange={(press) => {
              setActivePress(press);
              setSelectedHeadlineIndex(null);
            }}
            value={activePress}
          />
          <div className="newsroll_all_headline_list">
            {headlineItems.map((item, index) => (
              <AllNewsHeadlineItem
                item={{ ...item, title: activePress === "중앙일보" ? item.title : "'APEC, 국익에 도움됐다' 74%… 국힘 지지층도 인정" }}
                key={`${item.title}-${index}`}
                onClick={() => {
                  setSelectedHeadlineIndex((current) => (current === index ? null : index));
                  openDetail();
                }}
                selected={selectedHeadlineIndex === index}
              />
            ))}
          </div>
          <AllNewsMoreButton expanded={showAllHeadlines} onClick={() => setShowAllHeadlines((current) => !current)} />
        </section>

        <section className="newsroll_all_panel newsroll_all_relay_panel" aria-label="릴레이 뉴스">
          <h2 className="newsroll_all_section_title">릴레이 뉴스</h2>
          <PillTabMenu
            ariaLabel="릴레이 뉴스 카테고리"
            className="newsroll_all_category_tabs"
            items={allNewsRelayCategories.map((category) => ({ id: category, label: category }))}
            onChange={setActiveRelayCategory}
            value={activeRelayCategory}
          />
          <div className="newsroll_all_relay_list">
            {relayItems.map((item, index) => (
              <AllNewsRelayItem
                featured={index === 0 || index === 5}
                item={item}
                key={`${item.title}-${index}`}
                onClick={() => {
                  setSelectedRelayIndex((current) => (current === index ? null : index));
                  openDetail();
                }}
                selected={selectedRelayIndex === index}
              />
            ))}
          </div>
        </section>
      </div>
    </section>
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

function PolicyDetailView({
  isTextLarge,
  item,
  onBack,
  onOpenSearch,
  onToggleTextSize,
}: {
  isTextLarge: boolean;
  item: PolicyItem;
  onBack: () => void;
  onOpenSearch: () => void;
  onToggleTextSize: () => void;
}) {
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isShared, setIsShared] = useState(false);

  return (
    <section className="newsroll_policy_detail" aria-label="국가정책 상세">
      <header className="newsroll_policy_detail_top">
        <NewsToolbar
          isTextLarge={isTextLarge}
          onOpenSearch={onOpenSearch}
          onToggleTextSize={onToggleTextSize}
        />
        <button aria-label="국가정책 목록으로 돌아가기" className="newsroll_all_detail_back" onClick={onBack} type="button">
          <span aria-hidden="true" />
        </button>
      </header>

      <article className="newsroll_policy_detail_sheet">
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
      </article>
    </section>
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
  const policyItems = policyItemsByAge[activeAge] ?? policyItemsByAge.전체;
  const visiblePolicyItems =
    sortOrder === "latest" ? [...policyItems].reverse() : policyItems;

  if (detailItem) {
    return (
      <PolicyDetailView
        isTextLarge={isTextLarge}
        item={detailItem}
        onBack={() => setDetailItem(null)}
        onOpenSearch={onOpenSearch}
        onToggleTextSize={onToggleTextSize}
      />
    );
  }

  return (
    <section className="newsroll_policy_screen" aria-label="국가정책">
      <div className="newsroll_policy_top">
        <NewsToolbar
          isTextLarge={isTextLarge}
          onOpenSearch={onOpenSearch}
          onToggleTextSize={onToggleTextSize}
        />

        <section className="newsroll_policy_hero" aria-label="맞춤 정책 요약">
          <span>콩콩이님을 위한</span>
          <strong>
            11,343<span>개</span>
          </strong>
          <span>국가정책 정보가 있습니다.</span>
        </section>
      </div>

      <div className="newsroll_policy_sheet">
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
      </div>
    </section>
  );
}
const myRecentNews = Array.from({ length: 4 }, (_, index) => ({
  image: articleImage,
  time: "1시간 전",
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
    <section className="newsroll_my_screen" aria-label="마이페이지">
      <div className="newsroll_my_top">
        <NewsToolbar
          isTextLarge={isTextLarge}
          onOpenSearch={onOpenSearch}
          onToggleTextSize={onToggleTextSize}
        />
        <h1>마이페이지</h1>
      </div>

      <div className="newsroll_my_sheet">
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
                <span>{item.time}</span>
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
      </div>
    </section>
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
    <section className="newsroll_info_screen" aria-label="인포메이션">
      <div className="newsroll_info_top">
        <NewsToolbar
          isTextLarge={isTextLarge}
          onOpenSearch={onOpenSearch}
          onToggleTextSize={onToggleTextSize}
        />
        <h1>{activeInfoTabLabel}</h1>
      </div>

      <div className="newsroll_info_sheet">
        <PillTabMenu
          ariaLabel="인포메이션 메뉴"
          className="newsroll_info_tabs"
          getPanelId={(id) => `newsroll_info_panel_${id}`}
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
      </div>
    </section>
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

  function openSearch() {
    if (activeView !== "search") {
      setSearchBackView(activeView);
    }

    setActiveView("search");
  }

  return (
    <main
      className={`newsroll_screen${activeView === "all" ? " newsroll_screen_all" : ""}${
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
            <button
              aria-current={activeView === item.tab ? "page" : undefined}
              aria-label={item.label}
              className="newsroll_nav_item"
              key={item.label}
              onClick={() => setActiveView(item.tab)}
              type="button"
            >
              <Icon name={item.icon} />
            </button>
          ))}
        </nav>
      ) : null}
    </main>
  );
}
